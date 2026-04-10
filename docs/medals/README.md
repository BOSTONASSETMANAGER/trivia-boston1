# Medallas — Indice de Documentacion

Feature de sistema de medallas/logros para **Trivia Boston**. Esta carpeta contiene el diseño completo end-to-end para que otra persona (o un futuro yo) implemente la feature sin ambiguedad.

## Resumen ejecutivo (5 lineas)

1. **13 medallas** en 6 categorias (performance, streaks, speed, persistence, milestones, ranking) con 4 tiers (bronze/silver/gold/platinum), todas verificables contra `trivia_sessions` existente.
2. **Una sola tabla nueva** `trivia_user_medals` (user_id, medal_id, earned_at, session_id). El catalogo vive como constante TypeScript en `src/lib/medals/catalog.ts` para garantizar type-safety.
3. **Evaluacion sincrona en server action post-partida**: `saveSession` se extiende para correr el evaluator y devolver `newMedals` al cliente en el mismo roundtrip.
4. **UI nueva**: `MedalsScreen` con grid 2/3-col, `MedalCard` con estados locked/unlocked y tilt 3d, `MedalUnlockToast` con auto-dismiss, `NewMedalsBlock` dentro de `ResultsScreen`, todo en estetica Stadium Noir reutilizando `glass-card-elevated`, `confetti-burst` y `divider-glow`.
5. **Implementacion en 8 fases** estimadas en 10-16 horas totales, divisibles en 3 PRs (backend / UI / backfill) para iterar con seguridad.

---

## Tabla de contenidos

| # | Documento | Contenido |
|---|-----------|-----------|
| 1 | [`01-medal-catalog.md`](./01-medal-catalog.md) | Las 13 medallas: id, nombre, descripcion, tier, criterio, icono, color. Convenciones de tiers y resumen cuantitativo. |
| 2 | [`02-data-model.md`](./02-data-model.md) | Schema Supabase (`trivia_user_medals`), RLS, queries de referencia, **estrategia de evaluacion elegida** con justificacion vs otras alternativas. |
| 3 | [`03-unlock-logic.md`](./03-unlock-logic.md) | Pseudocodigo del evaluator para las 13 medallas, agrupadas por categoria. Input/output del evaluator y edge cases. |
| 4 | [`04-ui-design.md`](./04-ui-design.md) | Layout y animaciones de `MedalsScreen`, `MedalCard`, `MedalUnlockToast` y `NewMedalsBlock`. Paleta, tipografia, accesibilidad, estados locked/unlocked. |
| 5 | [`05-implementation-plan.md`](./05-implementation-plan.md) | Roadmap tecnico en 8 fases con paths exactos de archivos nuevos, archivos a modificar, dependencias, riesgos y checklist de smoke test. |

---

## Como usar esta documentacion

- **Para entender la feature**: leer primero este README y despues `01-medal-catalog.md`.
- **Para implementar**: seguir `05-implementation-plan.md` en orden, consultando los otros docs segun la fase (`02` para schema, `03` para el evaluator, `04` para UI).
- **Para agregar una medalla nueva**: editar `01-medal-catalog.md`, agregar la regla en `03-unlock-logic.md`, y despues reflejar los cambios en `src/lib/medals/catalog.ts` y `src/lib/medals/evaluator.ts`. No requiere migracion de DB.
- **Para cambiar la estrategia de evaluacion**: revisar la tabla comparativa en `02-data-model.md` seccion "Estrategia de evaluacion" antes de proponer un cambio.

---

## Decisiones clave (resumen)

1. **Catalogo en codigo, no en DB** — type-safety y cero round-trips para metadata estatica.
2. **Evaluacion sincrona en `saveSession`** — single source of truth, toast inmediato, idempotencia garantizada por el unique constraint.
3. **Una query agregada para 11/13 medallas** — la query de ranking solo se ejecuta si el usuario aun no tiene las medallas de ranking.
4. **`king-of-the-week` solo cuenta semanas cerradas** — previene flapping durante la semana en curso.
5. **Medallas nunca se revocan** — simplifica el modelo mental y evita bugs en edge cases.
6. **Backfill como fase separada** — deployeable despues, con `--dry-run` para validar.

---

## Archivos del proyecto referenciados

Archivos existentes que la implementacion tocara (paths absolutos desde el root del repo):

- `src/app/actions/sessions.ts` — extender return con `newMedals`.
- `src/components/ResultsScreen.tsx` — agregar bloque y toast.
- `src/components/StartScreen.tsx` — agregar boton "Mis medallas".
- `src/components/TriviaGame.tsx` — manejar phase `'medals'`.
- `src/hooks/useGameState.ts` — agregar `showMedals()` y `highlightedMedalIds`.
- `src/types/game.ts` — extender `GamePhase` y `GameState`.
- `src/app/globals.css` — agregar 4 utility classes de glow por tier.

Archivos nuevos que la implementacion creara:

- `src/lib/medals/types.ts`
- `src/lib/medals/catalog.ts`
- `src/lib/medals/evaluator.ts`
- `src/lib/medals/queries.ts`
- `src/app/actions/medals.ts`
- `src/components/MedalsScreen.tsx`
- `src/components/MedalCard.tsx`
- `src/components/MedalUnlockToast.tsx`
- `src/components/NewMedalsBlock.tsx`
- `supabase/migrations/<timestamp>_create_trivia_user_medals.sql`
- `scripts/backfill-medals.ts`
