# Catalogo de Medallas — Trivia Boston

Catalogo inicial de **13 medallas** organizadas en 6 categorias. Todas las medallas son verificables unicamente a partir de `trivia_sessions` (no requieren tablas nuevas de tracking).

## Convenciones de tiers

| Tier       | Color hex  | Rareza estimada | Criterio general                                    |
|------------|------------|-----------------|-----------------------------------------------------|
| `bronze`   | `#cd7f32`  | ~70% usuarios   | Acciones basicas (jugar, primer intento)            |
| `silver`   | `#c0c0c0`  | ~30% usuarios   | Logros de habilidad unica (1 perfect, buen tiempo)  |
| `gold`     | `#ffd700`  | ~10% usuarios   | Consistencia / multiples perfect games              |
| `platinum` | `#e5e4e2`  | <2% usuarios    | Rachas largas, #1 global, combos extremos           |

Los tiers multiplican el peso visual en la pantalla `MedalsScreen` (glow intensity, ribbon), no dan puntos extra.

## Colores tematicos por categoria

Las medallas usan tokens del theme existente:

- **Performance** → `secondary` (`#3fff8b`, verde success)
- **Streaks** → `tertiary` (`#ff7076`, rojo fuego)
- **Speed** → `primary` (`#8eabff`, azul velocidad)
- **Persistence** → `outline` / `primary-dim` (azul profundo `#156aff`)
- **Milestones** → `primary` (`#8eabff`)
- **Ranking** → color del tier (bronze/silver/gold)

---

## 1. Performance (3 medallas)

### `perfect-game`
- **Nombre**: Partida Perfecta
- **Descripcion**: Contesta las 3 preguntas de la semana sin errar.
- **Tier**: `silver`
- **Criterio**: Existe al menos una fila en `trivia_sessions` con `user_id = X AND score = 3`.
- **Icono**: `Trophy`
- **Color**: `secondary` (`#3fff8b`)

### `perfect-trio`
- **Nombre**: Triple Perfecto
- **Descripcion**: 3 partidas perfectas en semanas distintas.
- **Tier**: `gold`
- **Criterio**: `COUNT(DISTINCT week_number) >= 3` filtrando por `user_id = X AND score = 3`.
- **Icono**: `Award`
- **Color**: `secondary`

### `flawless-decade`
- **Nombre**: Decada Impecable
- **Descripcion**: 10 partidas perfectas en total (cualquier semana).
- **Tier**: `platinum`
- **Criterio**: `COUNT(*) >= 10` en `trivia_sessions` con `user_id = X AND score = 3`.
- **Icono**: `Crown`
- **Color**: `secondary` con glow platinum

---

## 2. Streaks (2 medallas)

### `week-streak-3`
- **Nombre**: Racha de Fuego
- **Descripcion**: Jugaste 3 semanas consecutivas (sin saltar ninguna).
- **Tier**: `silver`
- **Criterio**: Existen sesiones para 3 valores consecutivos de `week_number` (ej. 14, 15, 16) del mismo usuario. No exige ganar.
- **Icono**: `Flame`
- **Color**: `tertiary` (`#ff7076`)

### `week-streak-win-3`
- **Nombre**: Racha Invicta
- **Descripcion**: Ganaste (score 3) 3 semanas consecutivas.
- **Tier**: `gold`
- **Criterio**: Para 3 valores consecutivos de `week_number`, el `MAX(score) = 3` en cada uno.
- **Icono**: `Flame`
- **Color**: `tertiary` con glow gold

---

## 3. Speed (2 medallas)

### `speedrun`
- **Nombre**: Velocista
- **Descripcion**: Completa una partida (cualquier score) en menos de 15 segundos.
- **Tier**: `silver`
- **Criterio**: Existe sesion con `total_time_ms < 15000` (3 preguntas x 8 seg = 24 seg maximo).
- **Icono**: `Zap`
- **Color**: `primary` (`#8eabff`)

### `perfect-speedrun`
- **Nombre**: Rayo Perfecto
- **Descripcion**: Partida perfecta (3/3) en menos de 12 segundos.
- **Tier**: `platinum`
- **Criterio**: Existe sesion con `score = 3 AND total_time_ms < 12000`.
- **Icono**: `Zap`
- **Color**: `primary` con glow platinum

---

## 4. Persistence (2 medallas)

### `try-harder`
- **Nombre**: Insistente
- **Descripcion**: Jugaste 5 veces la misma semana.
- **Tier**: `bronze`
- **Criterio**: Existe un `week_number` donde `COUNT(*) >= 5` para el usuario.
- **Icono**: `Target`
- **Color**: `primary-dim` (`#156aff`)

### `veteran-50`
- **Nombre**: Veterano
- **Descripcion**: 50 partidas jugadas en total.
- **Tier**: `gold`
- **Criterio**: `COUNT(*) >= 50` en `trivia_sessions` para el usuario.
- **Icono**: `Medal`
- **Color**: `primary-dim`

---

## 5. Milestones (2 medallas)

### `first-blood`
- **Nombre**: Primera Sangre
- **Descripcion**: Completaste tu primera partida.
- **Tier**: `bronze`
- **Criterio**: `COUNT(*) >= 1` en `trivia_sessions` para el usuario.
- **Icono**: `Star`
- **Color**: `primary`

### `decimo-jugador`
- **Nombre**: Decimo Jugador
- **Descripcion**: 10 partidas completadas.
- **Tier**: `silver`
- **Criterio**: `COUNT(*) >= 10` en `trivia_sessions` para el usuario.
- **Icono**: `Star`
- **Color**: `primary`

---

## 6. Ranking (2 medallas)

### `podium`
- **Nombre**: En el Podio
- **Descripcion**: Terminaste en el top 3 del leaderboard semanal.
- **Tier**: `gold`
- **Criterio**: El usuario aparece con `row_number <= 3` en `trivia_leaderboard` (ordenado por `score DESC, total_time_ms ASC`) para algun `week_number`.
- **Icono**: `Trophy`
- **Color**: tier gold (`#ffd700`)

### `king-of-the-week`
- **Nombre**: Rey de la Semana
- **Descripcion**: Fuiste #1 del leaderboard una semana completa.
- **Tier**: `platinum`
- **Criterio**: El usuario es la primer fila de `trivia_leaderboard` para un `week_number` ya cerrado (semana pasada).
- **Icono**: `Crown`
- **Color**: tier platinum (`#e5e4e2`)
- **Nota**: Esta medalla se evalua solo contra semanas ya finalizadas (`week_number < getCurrentWeek()`) para que no haga flapping durante la semana en curso.

---

## Resumen cuantitativo

| Categoria    | Bronze | Silver | Gold | Platinum | Total |
|--------------|:------:|:------:|:----:|:--------:|:-----:|
| Performance  |   0    |   1    |  1   |    1     |   3   |
| Streaks      |   0    |   1    |  1   |    0     |   2   |
| Speed        |   0    |   1    |  0   |    1     |   2   |
| Persistence  |   1    |   0    |  1   |    0     |   2   |
| Milestones   |   1    |   1    |  0   |    0     |   2   |
| Ranking      |   0    |   0    |  1   |    1     |   2   |
| **Total**    | **2**  | **4**  | **4**|   **3**  | **13**|

Distribucion: 15% bronze / 31% silver / 31% gold / 23% platinum. Deliberadamente top-heavy porque el juego tiene solo 3 preguntas/semana y queremos que el unlock se sienta valioso.
