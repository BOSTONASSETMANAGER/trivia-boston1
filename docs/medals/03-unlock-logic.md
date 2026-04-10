# Unlock Logic — Pseudocodigo de Evaluacion

Logica de desbloqueo para las 13 medallas del catalogo. Todo el evaluator trabaja sobre un objeto `UserStats` obtenido con **una query agregada** (ver `02-data-model.md` seccion "Stats agregadas").

## Shape del input del evaluator

```
UserStats {
  userId: string
  totalGames: number
  perfectGames: number               // count de sesiones con score 3
  perfectWeeks: number               // count DISTINCT week_number con score 3
  bestTimeMs: number | null
  bestPerfectTimeMs: number | null
  lastWeekPlayed: number | null
  weeksPlayed: number[]              // ordenado asc, distinct
  weeksWon: number[]                 // ordenado asc, distinct (score 3)
  gamesPerWeek: Record<number, number>  // week_number → count
  currentSessionScore: number        // score de la sesion recien guardada
  currentSessionTimeMs: number
  currentSessionWeek: number
  // Ranking (fetch condicional):
  rankingPositions: Record<number, number>  // week_number → posicion (1-based) en leaderboard
}
```

## Flujo general del evaluator

```
evaluateMedals(userStats, alreadyUnlocked: Set<MedalId>) → MedalId[]:
  newlyUnlocked = []
  for each rule in RULES:
    if rule.id in alreadyUnlocked: continue
    if rule.check(userStats) === true:
      newlyUnlocked.push(rule.id)
  return newlyUnlocked
```

El evaluator es **puro** (no toca la DB). El caller (`src/app/actions/medals.ts`) se encarga de:
1. Fetch `alreadyUnlocked` desde `trivia_user_medals`.
2. Fetch stats.
3. Llamar `evaluateMedals`.
4. Insert bulk de los nuevos ids.

---

## 1. Performance

### `perfect-game`
```
check(stats):
  return stats.perfectGames >= 1
```
Trivial: basta con un 3/3 en toda la historia del usuario.

### `perfect-trio`
```
check(stats):
  return stats.perfectWeeks >= 3
```
3 semanas distintas donde el usuario saco al menos un 3/3. No requieren ser consecutivas.

### `flawless-decade`
```
check(stats):
  return stats.perfectGames >= 10
```
10 partidas con score 3 en total (pueden ser todas la misma semana).

---

## 2. Streaks

### `week-streak-3`
```
check(stats):
  if stats.weeksPlayed.length < 3: return false
  return hasConsecutiveRun(stats.weeksPlayed, length=3)

hasConsecutiveRun(weeks, length):
  // weeks viene ordenado asc, distinct
  run = 1
  for i in 1..weeks.length-1:
    if weeks[i] === weeks[i-1] + 1:
      run += 1
      if run >= length: return true
    else:
      run = 1
  return false
```

### `week-streak-win-3`
```
check(stats):
  if stats.weeksWon.length < 3: return false
  return hasConsecutiveRun(stats.weeksWon, length=3)
```
Mismo helper, pero sobre `weeksWon` (semanas con al menos un 3/3).

---

## 3. Speed

### `speedrun`
```
check(stats):
  return stats.bestTimeMs !== null && stats.bestTimeMs < 15000
```
15 segundos o menos en cualquier partida, score libre.

### `perfect-speedrun`
```
check(stats):
  return stats.bestPerfectTimeMs !== null && stats.bestPerfectTimeMs < 12000
```
Combo: score 3 Y tiempo < 12 segundos.

---

## 4. Persistence

### `try-harder`
```
check(stats):
  // Al menos una semana con 5+ partidas
  for [week, count] in stats.gamesPerWeek:
    if count >= 5: return true
  return false
```

### `veteran-50`
```
check(stats):
  return stats.totalGames >= 50
```

---

## 5. Milestones

### `first-blood`
```
check(stats):
  return stats.totalGames >= 1
```
Se desbloquea automaticamente con la primera sesion guardada. Para el usuario que llega a la feature ya con partidas jugadas, el backfill se encarga.

### `decimo-jugador`
```
check(stats):
  return stats.totalGames >= 10
```

---

## 6. Ranking

Estas dos medallas requieren una query extra contra `trivia_leaderboard` porque no salen del agregado de sesiones.

### `podium`
```
check(stats):
  // Al menos una semana donde el usuario quedo top 3
  for [week, position] in stats.rankingPositions:
    if position <= 3: return true
  return false
```

La query para poblar `rankingPositions` solo considera las semanas jugadas por el usuario:

```sql
with ranked as (
  select
    week_number,
    user_id,
    row_number() over (
      partition by week_number
      order by score desc, total_time_ms asc
    ) as position
  from public.trivia_leaderboard
  where week_number = any($1)  -- stats.weeksPlayed
)
select week_number, position
from ranked
where user_id = $2;
```

### `king-of-the-week`
```
check(stats):
  currentWeek = getCurrentWeek()
  for [week, position] in stats.rankingPositions:
    if position === 1 AND week < currentWeek:
      return true
  return false
```

Solo cuenta semanas **ya cerradas** (`week < currentWeek`). Esto previene flapping: durante la semana en curso el #1 puede cambiar varias veces; no queremos otorgar y revocar la medalla.

> **Nota sobre revocar**: el diseño nunca revoca medallas. Si un usuario es #1 en la semana 14 y alguien lo pasa en la semana 14 durante la misma semana, la medalla solo se otorga una vez que la semana 14 haya cerrado (cuando `getCurrentWeek()` retorne 15+). Para esto el evaluator de `king-of-the-week` tambien se ejecuta al hacer `saveSession` en la semana siguiente: la primer partida del usuario en la semana 15 dispara una re-evaluacion que puede desbloquear la medalla por haber sido #1 en la 14.

---

## Agrupacion por fuente de datos

Para minimizar queries, el evaluator agrupa reglas por su fuente:

| Fuente                          | Reglas                                                                                            |
|---------------------------------|---------------------------------------------------------------------------------------------------|
| Stats agregadas (1 query SQL)   | `perfect-game`, `perfect-trio`, `flawless-decade`, `week-streak-3`, `week-streak-win-3`, `speedrun`, `perfect-speedrun`, `try-harder`, `veteran-50`, `first-blood`, `decimo-jugador` (11 reglas) |
| Leaderboard (1 query condicional)| `podium`, `king-of-the-week` (2 reglas)                                                          |

La query de ranking solo se ejecuta si **alguna** de las 2 medallas de ranking no esta ya desbloqueada para el usuario. Usuarios que ya las tienen ambas no pagan el costo.

---

## Pseudocodigo consolidado del caller

```
async evaluateAndAwardMedals(userId, sessionId):
  // 1. Medallas que ya tiene
  alreadyUnlocked = await db.query(`
    select medal_id from trivia_user_medals where user_id = $1
  `, [userId]) → Set<MedalId>

  // 2. Stats base (1 query)
  stats = await fetchUserStats(userId)
  stats.currentSessionScore = ... (la sesion recien guardada)
  stats.currentSessionTimeMs = ...
  stats.currentSessionWeek = ...

  // 3. Ranking condicional
  needsRanking =
    !alreadyUnlocked.has('podium') ||
    !alreadyUnlocked.has('king-of-the-week')
  if needsRanking:
    stats.rankingPositions = await fetchRankingPositions(userId, stats.weeksPlayed)
  else:
    stats.rankingPositions = {}

  // 4. Evaluar
  newlyUnlocked = evaluateMedals(stats, alreadyUnlocked)

  // 5. Insert
  if newlyUnlocked.length > 0:
    await db.query(`
      insert into trivia_user_medals (user_id, medal_id, session_id, week_number)
      values ${values}
      on conflict (user_id, medal_id) do nothing
    `, flatValues)

  return newlyUnlocked
```

El `on conflict do nothing` es defensa en profundidad: aunque `alreadyUnlocked` haga el filtrado, puede haber un race condition si el usuario dispara dos partidas simultaneas desde distintas pestañas.

---

## Edge cases manejados

1. **Usuario sin historial previo** (primera sesion): todas las stats son 0 salvo `totalGames = 1`. Solo `first-blood` se puede activar (y cualquier otra de 1 partida si aplica, ej. `perfect-game` si saco 3/3, o `speedrun` si lo hizo rapido).
2. **Usuario que repite la misma semana**: `weeksPlayed` tiene una sola entrada, no se cuenta como racha pero si puede acumular `try-harder`.
3. **Usuario con solo timeouts**: `bestTimeMs` es el timestamp de la partida mas rapida (que puede ser un 0/3 rapidisimo). `speedrun` se puede ganar incluso con 0 aciertos, lo cual es deliberado (es un premio de velocidad de completado, no de accuracy).
4. **Backfill de medallas existentes**: el script de backfill corre `evaluateMedals` con `alreadyUnlocked = new Set()` contra stats historicas. Importante: `session_id` se queda en `null` en este caso.
5. **Medalla removida del catalogo**: si en el futuro borramos una medalla del `MEDAL_CATALOG`, las filas existentes en `trivia_user_medals` con ese `medal_id` quedan huerfanas. La UI las ignora (no matchean con el catalogo). No las borramos automaticamente por compliance/historia.
