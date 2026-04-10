# Data Model — Medallas

Diseño del schema Supabase para la feature de medallas. **Todas las tablas usan el prefijo `trivia_`** para mantener el aislamiento del schema publico compartido.

## Decision clave: catalogo estatico en codigo

El catalogo de medallas (los 13 items definidos en `01-medal-catalog.md`) vive como **constante TypeScript** en `src/lib/medals/catalog.ts`, **no** en una tabla. Razones:

1. **Es codigo, no data**: los criterios de unlock son funciones TypeScript, no filas. Tener el catalogo en codigo garantiza que el `MedalId` siempre este en sync con el evaluator.
2. **Type-safety**: `MedalId` es un union type derivado del catalogo, y el compilador nos avisa si olvidamos evaluar alguna.
3. **Sin round-trip**: la pantalla `MedalsScreen` renderiza 13 tarjetas. No tiene sentido una query para obtener metadata estatica.
4. **Evolucion con migraciones**: agregar una medalla es un PR al codigo (y una migracion opcional para backfill). Igual de simple que editar una tabla seed.

Por lo tanto **solo existe una tabla nueva**: `trivia_user_medals` (que medallas tiene cada usuario).

> Si en el futuro quisieramos admin UI para crear medallas dinamicamente, recien entonces se justifica una tabla `trivia_medals`. Por ahora, overkill.

---

## Tabla nueva: `trivia_user_medals`

```sql
-- ═══════════════════════════════════════════
-- SQL de referencia — NO ejecutar desde docs.
-- Usar migracion en /supabase/migrations/ cuando corresponda.
-- ═══════════════════════════════════════════

create table if not exists public.trivia_user_medals (
  id            bigserial primary key,
  user_id       uuid not null references public.trivia_users(id) on delete cascade,
  medal_id      text not null,                      -- slug del catalogo, ej. 'perfect-game'
  earned_at     timestamptz not null default now(),
  session_id    bigint references public.trivia_sessions(id) on delete set null,
                                                    -- sesion que gatillo el unlock (opcional)
  week_number   integer,                            -- semana en la que se desbloqueo (opcional, util para ranking medals)

  -- Una medalla por usuario — no se re-unlockea
  constraint trivia_user_medals_unique unique (user_id, medal_id)
);

-- Indices
create index if not exists trivia_user_medals_user_idx
  on public.trivia_user_medals(user_id);

create index if not exists trivia_user_medals_earned_idx
  on public.trivia_user_medals(user_id, earned_at desc);
```

### Campos

| Campo         | Tipo          | Nullable | Notas                                                         |
|---------------|---------------|:--------:|---------------------------------------------------------------|
| `id`          | `bigserial`   |    no    | PK sintetica                                                  |
| `user_id`     | `uuid`        |    no    | FK a `trivia_users.id`, cascade delete                        |
| `medal_id`    | `text`        |    no    | Slug del catalogo (ej. `perfect-game`)                        |
| `earned_at`   | `timestamptz` |    no    | Cuando se otorgo (default `now()`)                            |
| `session_id`  | `bigint`      |    si    | Sesion que disparo el unlock (null si viene de un backfill)   |
| `week_number` | `integer`     |    si    | Solo se llena para ranking medals                             |

### Por que unique (`user_id`, `medal_id`)

Impide duplicados en caso de race condition o doble-evaluacion. El evaluator usa `insert ... on conflict do nothing` y confia en el constraint para idempotencia.

### Por que `session_id` es nullable

- Cuando una medalla se gana por la sesion X, guardamos `session_id = X` para poder mostrar "Desbloqueada en [partida]".
- Cuando una medalla se gana por acumulacion (ej. `veteran-50` al llegar a 50 partidas), guardamos la sesion que causo el cruce del umbral.
- Cuando una medalla viene de un backfill manual o de ranking semanal cerrado, puede quedar en `null`.

---

## RLS policies

Asumiendo que el proyecto ya usa RLS en `trivia_sessions` (habitual en Supabase con service role en el backend):

```sql
alter table public.trivia_user_medals enable row level security;

-- Lectura publica: cualquier usuario puede ver las medallas de cualquier usuario
-- (necesario para mostrar medallas ajenas en el leaderboard en el futuro)
create policy "trivia_user_medals_select_public"
  on public.trivia_user_medals
  for select
  using (true);

-- Insert/update/delete: solo service role (server actions)
-- No hay policy de insert → solo la service key puede escribir
```

**Regla de oro**: todas las mutaciones pasan por server actions (`src/app/actions/medals.ts`) usando `createSupabaseServerClient()`, que ya usa la service key. El cliente **nunca** escribe directamente.

---

## Queries de referencia

### 1. Medallas de un usuario (con metadata del catalogo joinada en codigo)

```sql
select medal_id, earned_at, session_id, week_number
from public.trivia_user_medals
where user_id = $1
order by earned_at desc;
```

Despues en TypeScript se hace el join con el catalogo estatico:

```ts
// Pseudocodigo
const unlocked = await getUserUnlockedMedals(userId);
const catalog = MEDAL_CATALOG; // constante
const view = catalog.map((m) => ({
  ...m,
  unlocked: unlocked.find((u) => u.medalId === m.id) ?? null,
}));
```

### 2. Medallas nuevas desbloqueadas por una sesion puntual

```sql
select medal_id
from public.trivia_user_medals
where user_id = $1 and session_id = $2;
```

Esto sirve para el toast post-partida: "Desbloqueaste: X, Y, Z".

### 3. Progreso hacia medallas no desbloqueadas (acumuladas)

El progreso (ej. "35/50 partidas para Veterano") se **calcula en codigo**, no en SQL. El evaluator expone una funcion `getMedalProgress(userId, medalId)` que corre las queries necesarias:

```sql
-- Progreso para 'veteran-50'
select count(*) as total
from public.trivia_sessions
where user_id = $1;
-- → progress = min(total / 50, 1.0)

-- Progreso para 'perfect-trio'
select count(distinct week_number) as perfect_weeks
from public.trivia_sessions
where user_id = $1 and score = 3;
-- → progress = min(perfect_weeks / 3, 1.0)
```

Para medallas booleanas (ej. `first-blood`, `speedrun`) el progreso es `0` o `1`, no hay estado intermedio mostrable.

### 4. Stats agregadas de un usuario (una sola query para el evaluator)

Para evitar N queries al evaluar, el evaluator hace **una sola llamada** que trae todas las stats que necesita:

```sql
select
  count(*)                                      as total_games,
  count(*) filter (where score = 3)             as perfect_games,
  count(distinct week_number) filter
    (where score = 3)                           as perfect_weeks,
  min(total_time_ms)                            as best_time_ms,
  min(total_time_ms) filter (where score = 3)   as best_perfect_time_ms,
  max(week_number)                              as last_week_played,
  array_agg(distinct week_number order by week_number)
                                                as weeks_played,
  array_agg(distinct week_number order by week_number)
    filter (where score = 3)                    as weeks_won
from public.trivia_sessions
where user_id = $1;
```

Una sola query cubre todos los criterios salvo ranking. Para ranking se hace una segunda query contra `trivia_leaderboard`.

---

## Estrategia de evaluacion

**Decision: evaluacion en server action post-partida, sincrona.**

### Opciones consideradas

| Opcion                      | Pro                                       | Contra                                                                 |
|-----------------------------|-------------------------------------------|------------------------------------------------------------------------|
| A. Cliente (React)          | Sin latencia extra                        | Logica duplicada, no confiable, cliente puede mentir                   |
| **B. Server action (elegida)** | Single source of truth, type-safe, simple | +1 roundtrip (pero ya hacemos `saveSession`)                        |
| C. Trigger SQL              | Atomico con el insert                     | Logica en SQL es fragil, dificil de testear, ranking medals son feas  |
| D. Cron / background job    | No bloquea la partida                     | Latencia grande, necesita infra extra, toast post-partida no funciona |

### Por que server action

1. **Ya tenemos un punto natural**: `saveSession` se llama una sola vez al terminar la partida. Extendemos esa funcion para que devuelva las medallas nuevas.
2. **Single source of truth**: el catalogo y el evaluator viven en `src/lib/medals/`. Mismo codigo evalua en tests, scripts de backfill y produccion.
3. **TypeScript**: criterios complejos (rachas, arrays de semanas, comparaciones con leaderboard) son 10x mas claros en TS que en SQL/PLpgSQL.
4. **Toast inmediato**: el cliente recibe la respuesta de `saveSession` con las medallas nuevas y dispara el unlock toast sin una segunda llamada.
5. **Idempotente**: el unique constraint (`user_id`, `medal_id`) protege contra dobles unlock si la evaluacion corre dos veces.

### Flujo resultante

```
Usuario termina partida
  ↓
ResultsScreen mount → saveSession(userId, week, score, time)
  ↓
Server action:
  1. insert en trivia_sessions
  2. fetch stats agregadas del usuario (1 query)
  3. fetch ranking del usuario si hace falta (1 query condicional)
  4. run evaluator → lista de medal_ids nuevas
  5. insert en trivia_user_medals con on conflict do nothing
  6. return { ok: true, newMedals: [...] }
  ↓
Cliente recibe newMedals → muestra toast + bloque en ResultsScreen
```

### Costo por partida

- `insert` en `trivia_sessions`: 1 roundtrip (ya existe)
- `select` stats agregadas: 1 roundtrip
- `select` ranking (solo si hay chance de `podium`/`king-of-the-week`): 0-1 roundtrip
- `insert` bulk en `trivia_user_medals`: 1 roundtrip (solo si hay medallas nuevas)

**Total: 2-4 roundtrips** en el peor caso. Aceptable porque el usuario ya esta en la pantalla de resultados viendo animaciones (no percibe la latencia).

### Edge case: backfill

Para usuarios existentes que ya jugaron antes de la feature, hacemos un **backfill one-shot**: un script `scripts/backfill-medals.ts` que recorre todos los usuarios, corre el evaluator sobre sus sesiones historicas, e inserta las medallas correspondientes con `session_id = null`. Se ejecuta una vez post-deploy.
