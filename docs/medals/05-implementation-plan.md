# Implementation Plan — Medallas

Roadmap tecnico ordenado por fases. Cada fase lista archivos nuevos con path exacto, archivos existentes a modificar con cambios concretos, dependencias y riesgos.

## Overview de fases

| # | Fase                  | Scope                                                 | Duracion estimada |
|---|-----------------------|-------------------------------------------------------|-------------------|
| 1 | Schema                | Migracion SQL + RLS                                   | 15 min            |
| 2 | Lib layer             | Catalogo + evaluator + tipos                          | 2-3 h             |
| 3 | Server actions        | `evaluateAndAwardMedals`, `getUserMedals`             | 1-2 h             |
| 4 | Hook integration      | `saveSession` retorna `newMedals`                     | 30 min            |
| 5 | UI                    | `MedalsScreen` + `MedalCard` + toast + block          | 4-6 h             |
| 6 | Wire-up               | Phase nueva + botones en `StartScreen`/`ResultsScreen`| 1-2 h             |
| 7 | Backfill              | Script one-shot para usuarios existentes              | 1 h               |
| 8 | Smoke test            | Checklist manual                                      | 30 min            |

Total: ~10-16 horas. La feature se puede cortar por fases 1-4 (backend completo) y despues 5-8 (frontend + wire) si se quiere iterar.

---

## Fase 1 — Schema

### Objetivo
Crear `trivia_user_medals` con indices y RLS.

### Archivos nuevos

- **`supabase/migrations/<timestamp>_create_trivia_user_medals.sql`**
  - Create table con los campos definidos en `02-data-model.md`.
  - Indices `user_id` y `(user_id, earned_at desc)`.
  - Unique constraint `(user_id, medal_id)`.
  - RLS enable + policy select public.

### Archivos modificados
Ninguno.

### Dependencias
Ninguna.

### Riesgos
- **Colision de `medal_id`** si se typea mal un slug. Mitigacion: `medal_id text not null` sin FK, pero la validacion real viene del type-check de TypeScript en el server action.
- Si el proyecto usa otra herramienta de migracion distinta a supabase cli, adaptar el path.

---

## Fase 2 — Lib layer

### Objetivo
Crear el catalogo estatico, los tipos y el evaluator puro (sin DB).

### Archivos nuevos

- **`src/lib/medals/types.ts`**
  - `MedalId` (string union derivado del catalogo).
  - `MedalTier = 'bronze' | 'silver' | 'gold' | 'platinum'`.
  - `MedalCategory = 'performance' | 'streaks' | 'speed' | 'persistence' | 'milestones' | 'ranking'`.
  - `MedalDefinition` (metadata estatica de una medalla).
  - `UserStats` (shape del input al evaluator).
  - `UserMedal` (fila de DB).
  - `MedalView` (catalogo + estado unlocked, para la UI).

- **`src/lib/medals/catalog.ts`**
  - `export const MEDAL_CATALOG: readonly MedalDefinition[]` con las 13 medallas.
  - Cada entrada: `{ id, name, description, shortCriterion, tier, category, iconName, themeColor }`.
  - `iconName` es un string que la UI mapea a un componente de lucide-react (ver fase 5).
  - `export type MedalId = typeof MEDAL_CATALOG[number]['id']` ← **type-safety automatica**.
  - Export helper `getMedalById(id: MedalId): MedalDefinition`.

- **`src/lib/medals/evaluator.ts`**
  - Funcion pura `evaluateMedals(stats: UserStats, alreadyUnlocked: Set<MedalId>): MedalId[]`.
  - Helper `hasConsecutiveRun(weeks: number[], length: number): boolean`.
  - Helper `getMedalProgress(stats: UserStats, medalId: MedalId): number` (0-1) para la UI.
  - Funcion `buildUserStats(params)` que acepta filas crudas y devuelve `UserStats`.

- **`src/lib/medals/queries.ts`**
  - `fetchUserStats(supabase, userId, currentSession): Promise<Omit<UserStats, 'rankingPositions'>>`
    - Ejecuta la query agregada del doc 02.
  - `fetchRankingPositions(supabase, userId, weeks: number[]): Promise<Record<number, number>>`
    - Ejecuta la query con `row_number()`.
  - `fetchUnlockedMedalIds(supabase, userId): Promise<Set<MedalId>>`.

### Archivos modificados
Ninguno.

### Dependencias
- Fase 1 (schema) para las queries.

### Riesgos
- **Drift entre catalog y evaluator**: si agrego una medalla al catalogo y olvido la regla. Mitigacion: el evaluator tiene un `switch` exhaustivo sobre `MedalId` con `never` en el default, TypeScript rompe el build si falta una rama.
- Edge case de semanas vacias en `weeksWon`: manejar `undefined` / arrays nulos al construir `UserStats`.

---

## Fase 3 — Server actions

### Objetivo
Exponer los puntos de acceso a la feature desde `'use server'`.

### Archivos nuevos

- **`src/app/actions/medals.ts`**
  ```
  'use server'

  evaluateAndAwardMedals(userId, sessionContext) → Promise<{ newMedals: MedalDefinition[] }>
    1. fetch alreadyUnlocked
    2. fetch stats (via queries.ts)
    3. fetch ranking positions (condicional)
    4. run evaluator
    5. insert bulk on conflict do nothing
    6. return newMedals (con metadata del catalogo hidratada)

  getUserMedals(userId) → Promise<MedalView[]>
    1. fetch unlocked medals del usuario
    2. merge con MEDAL_CATALOG
    3. calcular progreso de las bloqueadas
    4. return ordered array

  getMedalStats(userId) → Promise<{ unlocked: number; total: number }>
    (helper barato para mostrar en StartScreen como badge)
  ```

### Archivos modificados
Ninguno (esta fase es self-contained).

### Dependencias
- Fase 1 (schema).
- Fase 2 (lib/medals/*).

### Riesgos
- **Latencia en `evaluateAndAwardMedals`**: si la query de stats se hace lenta con muchos usuarios/sesiones, agregar indice `(user_id, week_number)` en `trivia_sessions` si todavia no existe.
- **Race condition con dos partidas simultaneas**: el `on conflict do nothing` lo resuelve.

---

## Fase 4 — Hook integration

### Objetivo
Que `saveSession` (la server action existente) dispare la evaluacion y devuelva las medallas nuevas al cliente.

### Archivos modificados

- **`src/app/actions/sessions.ts`**
  - Cambiar el return type:
    ```
    type SaveSessionResult =
      | { ok: true; newMedals: MedalDefinition[] }
      | { ok: false; error: string }
    ```
  - Despues del `insert` exitoso, capturar el `id` retornado (`select('id').single()`).
  - Llamar `evaluateAndAwardMedals(userId, { sessionId, score, totalTimeMs, weekNumber })`.
  - Retornar `{ ok: true, newMedals }`.
  - Manejo de errores: si la evaluacion falla, **no** fallar la sesion. Loguear y retornar `{ ok: true, newMedals: [] }`. La partida guardada es lo critico.

- **`src/components/ResultsScreen.tsx`**
  - Guardar el resultado del `saveSession` en state:
    ```
    const [newMedals, setNewMedals] = useState<MedalDefinition[]>([])
    ```
  - En el `useEffect` del save, capturar el return y `setNewMedals(result.newMedals ?? [])`.
  - Pasar `newMedals` a `NewMedalsBlock` y `MedalUnlockToast` (renderizados condicionalmente).
  - Si `newMedals.length > 0`, mostrar el boton extra "Ver medallas" (ver fase 6).

### Dependencias
- Fase 3 (server actions de medals).

### Riesgos
- **Mutacion del contract publico de `saveSession`**: cualquier consumidor de esta action necesita actualizarse. Actualmente solo `ResultsScreen` la llama, verificar con grep antes del PR.
- **Backward compat del error silencioso existente**: hoy `saveSession` falla silenciosamente. Mantener el comportamiento — el evaluador no debe bloquear la pantalla de resultados.

---

## Fase 5 — UI

### Objetivo
Implementar todos los componentes visuales descritos en `04-ui-design.md`.

### Archivos nuevos

- **`src/components/MedalsScreen.tsx`**
  - Props: `userId`, `highlightedMedalIds: MedalId[]`, `onBack()`.
  - `useEffect` llama `getUserMedals(userId)` al mount.
  - Estado loading → 13 skeletons.
  - Render del header sticky + grid + footer.
  - Ordena segun regla del doc 04 (unlocked primero, luego por tier y progreso).

- **`src/components/MedalCard.tsx`**
  - Props: `view: MedalView`, `highlighted: boolean`.
  - Renderiza locked o unlocked segun `view.unlocked !== null`.
  - Mapeo interno `iconName: string → LucideIcon` con un objeto `ICON_MAP` (`Trophy`, `Flame`, `Crown`, `Zap`, `Star`, `Target`, `Clock`, `Award`, `Medal`).
  - Si `highlighted`, aplica el reveal + confetti al mount.
  - Tilt 3d solo si unlocked.

- **`src/components/MedalUnlockToast.tsx`**
  - Props: `medals: MedalDefinition[]`, `onDismiss(medalId)`, `onViewAll()`.
  - Renderiza un stack vertical, cada toast con `AnimatePresence` y auto-dismiss a los 4s.
  - Click en un toast → `onViewAll()`.

- **`src/components/NewMedalsBlock.tsx`**
  - Props: `medals: MedalDefinition[]`, `onViewAll()`.
  - Renderiza el bloque verde descrito en doc 04.

- **`src/lib/medals/icons.ts`** (opcional — puede vivir dentro de `MedalCard` si es chico)
  - `export const ICON_MAP: Record<string, LucideIcon>`.

### Archivos modificados

- **`src/app/globals.css`**
  - Agregar las 4 clases nuevas:
    ```
    .glow-bronze { box-shadow: ...; }
    .glow-silver { box-shadow: ...; }
    .glow-gold { box-shadow: ...; }
    .glow-platinum { box-shadow: ...; }
    ```
  - Agregar reglas de `prefers-reduced-motion` para deshabilitar el tilt y el confetti en los cards de medallas.

### Dependencias
- Fase 3 (para `getUserMedals`).
- Fase 2 (para tipos y catalogo).

### Riesgos
- **Performance del grid con 13+ cards animadas**: limitar animaciones a `initial`/`animate` y evitar re-renders. Memoizar `MedalCard` con `React.memo`.
- **Mobile touch**: verificar que el tilt 3d no interfiera con el scroll del grid. Si molesta, remover en mobile y dejar solo en `sm:` hover.

---

## Fase 6 — Wire-up

### Objetivo
Conectar la phase `'medals'` al state machine y agregar los botones de navegacion.

### Archivos modificados

- **`src/types/game.ts`**
  - Agregar `'medals'` al `GamePhase`:
    ```
    export type GamePhase =
      | 'auth' | 'start' | 'playing' | 'revealing'
      | 'finished' | 'leaderboard' | 'medals'
    ```
  - Agregar campo opcional en `GameState`:
    ```
    highlightedMedalIds?: string[]   // MedalId[]
    ```

- **`src/hooks/useGameState.ts`**
  - Agregar callback `showMedals(highlightIds?: string[])`:
    ```
    const showMedals = useCallback((highlightIds: string[] = []) => {
      setState((prev) => ({
        ...prev,
        phase: 'medals',
        highlightedMedalIds: highlightIds,
      }))
    }, [])
    ```
  - Exportar `showMedals` desde el hook.
  - `backToStart` ya resetea bien, pero limpiar `highlightedMedalIds` explicitamente.

- **`src/components/TriviaGame.tsx`**
  - Destructurar `showMedals` del hook.
  - Pasar `showMedals` a `StartScreen` y `ResultsScreen`.
  - Agregar el branch `{state.phase === 'medals' && user && <MedalsScreen ... />}` dentro del `AnimatePresence`.

- **`src/components/StartScreen.tsx`**
  - Agregar prop `onShowMedals(): void`.
  - Agregar el tercer boton debajo de "Ver ranking" con `Medal` icon y delay `0.8`.
  - Opcional: mostrar badge con `unlocked count` si se pre-fetcha en `StartScreen`. Si no, ceder por simplicidad.

- **`src/components/ResultsScreen.tsx`**
  - Agregar prop `onShowMedals(highlightIds?: string[]): void`.
  - Si `newMedals.length > 0`, renderizar el boton "Ver medallas" encima de "Ver ranking" con `onClick={() => onShowMedals(newMedals.map(m => m.id))}`.
  - Renderizar `<NewMedalsBlock medals={newMedals} onViewAll={...} />` encima de la lista de preguntas.
  - Renderizar `<MedalUnlockToast medals={newMedals} ... />` una vez.

### Dependencias
- Fase 5 (componentes).
- Fase 4 (para que `ResultsScreen` tenga `newMedals`).

### Riesgos
- **Key collisions en `AnimatePresence`**: asegurar que cada phase tiene una `key` distinta al render.
- **Loop con `showMedals` desde distintos origenes**: el reset de `highlightedMedalIds` en `backToStart` y en `showMedals()` (sin args) debe ser explicito.

---

## Fase 7 — Backfill

### Objetivo
Otorgar medallas a los usuarios que ya jugaron antes del deploy.

### Archivos nuevos

- **`scripts/backfill-medals.ts`**
  - Usa el client server de Supabase con service key.
  - Lista todos los usuarios con al menos una sesion.
  - Para cada usuario:
    1. Construye `UserStats` con una query unica (la misma de `fetchUserStats`).
    2. Corre `evaluateMedals(stats, new Set())`.
    3. Bulk insert en `trivia_user_medals` con `session_id = null`.
  - Loguea por consola `{ userId, awardedCount }`.
  - Flag `--dry-run` que hace todo menos el insert.

### Archivos modificados
Ninguno.

### Dependencias
- Fases 1, 2.

### Riesgos
- **Memoria con muchos usuarios**: procesar en batches de 100 usuarios con `for await` paginado.
- **Timezones**: `earned_at` queda en el momento del backfill, no en la fecha real del logro. Documentar el comportamiento en el script.

---

## Fase 8 — Smoke test checklist

Tests manuales a ejecutar antes del merge. No requieren automatizacion formal (el proyecto hoy no tiene test suite).

### Casos de regresion (nada se rompe)

- [ ] Flujo existente auth → start → playing → finished → leaderboard funciona igual.
- [ ] `saveSession` sigue guardando la partida aunque el evaluator falle.
- [ ] Leaderboard ordena y muestra bien sin cambios visibles.
- [ ] Repetir una partida la misma semana no da error.

### Casos de feature

- [ ] **First-time user**: crear usuario nuevo, jugar una partida 0/3 → desbloquea `first-blood` y nada mas.
- [ ] **Perfect game**: jugar una partida 3/3 en <30s → desbloquea `perfect-game` y `first-blood`.
- [ ] **Speedrun**: jugar una partida (cualquier score) eligiendo rapido → si `total_time_ms < 15000`, desbloquea `speedrun`.
- [ ] **Doble unlock en una partida**: jugar una partida perfect y rapida → toast muestra 2 medallas apiladas.
- [ ] **Idempotencia**: jugar una segunda partida perfect → `newMedals` esta vacio, no hay duplicados en `trivia_user_medals`.
- [ ] **MedalsScreen locked**: nuevo usuario ve 13 cards grises con criterios.
- [ ] **Progreso en locked**: usuario con 3 partidas totales ve "3/10" en `decimo-jugador`.
- [ ] **MedalsScreen unlocked**: orden correcto (unlocked primero por fecha, luego locked por progreso).
- [ ] **Reveal animation**: abrir `MedalsScreen` desde el boton post-partida (con `highlightedMedalIds`) → las nuevas tienen flip + confetti.
- [ ] **Toast auto-dismiss**: toast desaparece a los ~4s.
- [ ] **Toast click → MedalsScreen**: click lleva al MedalsScreen con la medalla resaltada.
- [ ] **Back button**: `onBack` desde `MedalsScreen` vuelve a `start`.
- [ ] **Week streak**: jugar sesiones en semanas 14, 15, 16 → desbloquea `week-streak-3` al completar la 16.
- [ ] **Mobile layout**: en un viewport 375px ancho, grid 2-col, cards legibles.
- [ ] **Tablet layout**: en un viewport 768px+, grid 3-col.
- [ ] **Accessibility**: tab navega por las cards, focus ring visible.
- [ ] **Reduced motion**: con el sistema en `prefers-reduced-motion: reduce`, no hay tilt 3d ni confetti.

### Edge cases

- [ ] **Ranking condicional**: usuario con `podium` y `king-of-the-week` ya desbloqueados no dispara la query extra.
- [ ] **Medalla retirada**: si alguien tiene en DB un `medal_id` que ya no esta en el catalogo, la UI no crashea (la ignora).
- [ ] **Backfill dry-run**: corre, loguea, y no inserta.
- [ ] **Backfill real**: despues de correr, los usuarios historicos ven sus medallas al entrar a `MedalsScreen`.

---

## Orden de merges sugerido

1. PR 1: Fases 1+2+3+4 (backend completo, sin UI). Puede mergearse con la feature oculta.
2. PR 2: Fases 5+6 (UI + wire). Activa la feature end-to-end.
3. PR 3 (opcional, post-deploy): Fase 7 (backfill), con `--dry-run` primero.

Esto permite iterar/rollbackear la UI sin tocar el schema.
