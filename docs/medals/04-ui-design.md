# UI Design — Medallas

Diseño visual de la feature manteniendo la estetica **Stadium Noir** del resto del juego. Todo el layout reutiliza clases CSS existentes de `src/app/globals.css` cuando es posible.

## Inventario de componentes nuevos

| Componente             | Path                                            | Rol                                                      |
|------------------------|-------------------------------------------------|----------------------------------------------------------|
| `MedalsScreen.tsx`     | `src/components/MedalsScreen.tsx`              | Pantalla full-screen con grid de todas las medallas     |
| `MedalCard.tsx`        | `src/components/MedalCard.tsx`                  | Card individual (locked/unlocked)                        |
| `MedalUnlockToast.tsx` | `src/components/MedalUnlockToast.tsx`           | Toast animado sobre `ResultsScreen`                      |
| `NewMedalsBlock.tsx`   | `src/components/NewMedalsBlock.tsx`             | Bloque "Nuevas medallas" dentro de `ResultsScreen`       |

Todos los componentes son `'use client'` y usan `motion/react` para animaciones.

---

## 1. `MedalsScreen` — pantalla principal

### Layout

```
┌──────────────────────────────────────────┐
│   ← Volver    Medallas    3/13          │  ← header sticky
│   ──────── divider-glow ────────         │
│                                          │
│  ┌───────────┐  ┌───────────┐           │
│  │   ICON    │  │   ICON    │           │  ← grid 2-col mobile
│  │           │  │   🔒      │           │
│  │ Nombre    │  │ Nombre    │           │
│  │ [bronze]  │  │ [silver]  │           │
│  │ hace 2d   │  │ Bloqueada │           │
│  └───────────┘  └───────────┘           │
│                                          │
│  ┌───────────┐  ┌───────────┐           │
│  │ ...       │  │ ...       │           │
│  └───────────┘  └───────────┘           │
│                                          │
│          BOSTON ASSET MANAGER SA         │  ← footer
└──────────────────────────────────────────┘
```

### Estructura

- **Wrapper**: `<motion.div>` con la misma signature de entrada/salida que `StartScreen` (`initial: opacity 0`, `animate: opacity 1`, `exit: opacity 0 scale 0.95`, `duration 0.4`).
- **Container**: `relative z-10 flex min-h-[100dvh] flex-col px-6 py-10`
- **Header sticky**:
  - `sticky top-0 z-20 backdrop-blur-md` con `glass-panel`
  - Boton volver (izq): `<ChevronLeft>` + texto "Volver" en `text-outline` con hover a `primary`
  - Titulo (centro): `font-headline text-xl font-bold text-on-surface`
  - Contador (der): `font-mono text-xs text-primary/70` → formato `{unlocked}/{total}`
  - Abajo del header: `divider-glow w-full` (mismo que `StartScreen`)
- **Grid**:
  - Mobile: `grid grid-cols-2 gap-4`
  - Tablet/desktop (`sm:`): `grid-cols-3 gap-5`
  - Max width: `max-w-2xl mx-auto` (para no estirar en desktop)
- **Footer**: texto "BOSTON ASSET MANAGER SA" igual que otras pantallas.

### Orden del grid

Las medallas se ordenan asi:
1. Primero las **desbloqueadas** (mas recientes arriba, por `earned_at desc`).
2. Despues las **bloqueadas** ordenadas por tier (bronze → silver → gold → platinum) y dentro de cada tier por la "cercania" al unlock (las que tienen mas progreso primero).

Esto premia al usuario: ve sus logros primero y las proximas a desbloquear arriba en la cola.

### Data flow

```
MedalsScreen mount
  ↓
useEffect: getUserMedals(userId) → { unlocked: UserMedal[] }
  ↓
combine con MEDAL_CATALOG → MedalView[] con { medal, unlocked: UserMedal | null, progress: 0-1 }
  ↓
render grid
```

Mientras carga: 13 skeletons (cards con `bg-surface-variant/20 animate-pulse`).

---

## 2. `MedalCard` — tarjeta individual

### Estados visuales

**Unlocked**:
- Background: `glass-card-elevated` con un **glow tematico** segun categoria y tier.
- Icono: color saturado (el del catalogo, ej. `text-secondary` para performance).
- Nombre: `font-headline text-sm font-semibold text-on-surface`.
- Tier ribbon: pill pequeña en la esquina sup-der, color del tier.
- Fecha: `text-[10px] text-outline/70` → formato relativo ("hace 2d", "hoy", "hace 3 semanas").
- Hover: `whileHover={{ y: -4, rotateX: 6, rotateY: -6 }}` con `transformStyle: preserve-3d` (tilt sutil, no gimmicky).
- Tap: `whileTap={{ scale: 0.97 }}`.

**Locked**:
- Background: `glass-card` (menos elevado que unlocked).
- Icono: mismo icono pero con `text-outline/30 grayscale` y un `<Lock>` overlay en la esquina inf-der.
- Nombre: `text-outline/60`.
- Tier ribbon: pill gris `text-outline/40`.
- Descripcion: `text-[10px] text-outline/50` mostrando el **criterio** en texto corto (ej. "3 semanas consecutivas").
- Progreso (solo si aplica): barra horizontal `h-1 bg-surface-variant/30` con fill `bg-primary/40` de 0-100%. Debajo, texto `"35/50"` en `text-[9px] font-mono text-outline/60`.
- Hover: apenas `whileHover={{ y: -2 }}` (no tilt, esta bloqueada).

### Layout interno del card

```
┌─────────────────┐
│      [tier]     │  ← ribbon (absolute top-2 right-2)
│                 │
│      ICON       │  ← h-14 w-14 mx-auto, con glow si unlocked
│                 │
│   Nombre med    │  ← font-headline text-sm, max 2 lineas
│   descripcion   │  ← text-[10px] text-outline, max 2 lineas
│                 │
│ [progress bar]  │  ← solo locked con progreso acumulado
│   fecha/estado  │  ← text-[10px]
└─────────────────┘
```

Medidas: `rounded-xl p-4 aspect-[3/4]` (un poco mas alto que ancho, deja aire al icono).

### Glow por tier (unlocked)

Clases inline dinamicas. Los valores son aproximados, ajustar en implementacion:

```
bronze:   box-shadow: 0 0 20px rgba(205, 127, 50, 0.25), 0 0 50px rgba(205, 127, 50, 0.1)
silver:   box-shadow: 0 0 20px rgba(192, 192, 192, 0.25), 0 0 50px rgba(192, 192, 192, 0.1)
gold:     box-shadow: 0 0 24px rgba(255, 215, 0, 0.35), 0 0 60px rgba(255, 215, 0, 0.15)
platinum: box-shadow: 0 0 28px rgba(229, 228, 226, 0.4), 0 0 80px rgba(229, 228, 226, 0.2)
```

Estas se pueden convertir en utility classes (`.glow-bronze`, `.glow-silver`, etc.) en `globals.css` para mantener limpio el JSX.

### Animacion de reveal (solo primera vez)

Cuando el usuario abre `MedalsScreen` desde la pantalla de resultados **y hay una medalla recien desbloqueada**, esa card especifica hace:

1. Entrada: `initial={{ scale: 0, rotateY: 180 }}` → `animate={{ scale: [0, 1.1, 1], rotateY: [180, 0, 0] }}` con duracion 1s (flip reveal).
2. Despues del reveal: dispara el efecto `confetti-burst` (clase ya existente en `globals.css`) por 1s.
3. Glow pulsante por 2s extra antes de asentarse en el glow estatico.

Para saber que card "es la nueva", se pasa un prop `highlightedIds: Set<MedalId>` al grid.

---

## 3. `MedalUnlockToast` — toast post-partida

### Cuando aparece

Dentro de `ResultsScreen`: despues de que `saveSession` retorna con `newMedals.length > 0`, se dispara un toast por cada medalla nueva (stackeados verticalmente si hay varios).

### Layout

```
┌────────────────────────────────┐
│  ⭐  Desbloqueaste!            │  ← titulo
│      Partida Perfecta          │  ← nombre medalla
│      [silver]                   │  ← tier pill
└────────────────────────────────┘
```

- Posicion: `fixed top-6 left-1/2 -translate-x-1/2 z-50` (arriba, centrado).
- Width: `w-[min(360px,90vw)]`.
- Background: `glass-card-elevated` con glow del color tematico de la medalla.
- Icono: el de la medalla en `h-10 w-10` (izquierda), con `confetti-burst` overlay en el mount.
- Texto: "Desbloqueaste!" en `text-[10px] uppercase tracking-wider text-primary/70`, y el nombre debajo en `font-headline text-base font-semibold text-on-surface`.
- Pill tier: pequeña, misma logica que en `MedalCard`.

### Animacion

```
entrada:  initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}

salida:   exit={{ opacity: 0, y: -30, scale: 0.95 }} después de 4s (setTimeout)

extra:    al mount, play de un sonido corto (opcional, placeholder por ahora).
```

Si hay multiples medallas: se apilan con un delay de 400ms entre cada una. La primera aparece a los 800ms de haber llegado a `ResultsScreen` (despues de que el score termino de animarse).

### Click en el toast

Click → navega al `MedalsScreen` con esa medalla resaltada. Esto permite al usuario ver su nueva coleccion sin esperar al boton del footer.

---

## 4. `NewMedalsBlock` — bloque dentro de `ResultsScreen`

Cuando una partida desbloquea medallas, aparece un bloque **encima de la lista de preguntas** en `ResultsScreen`, siempre (aunque el toast ya lo haya mostrado, para que quede persistente mientras el usuario revisa).

### Layout

```
┌────────────────────────────────┐
│  ✨ NUEVAS MEDALLAS             │  ← label pequeño, uppercase
│                                │
│  [icon] Partida Perfecta       │  ← row por medalla
│  [icon] Velocista              │
│                                │
│  [ Ver todas →  ]              │  ← link al MedalsScreen
└────────────────────────────────┘
```

- Wrapper: `rounded-xl border border-secondary/20 bg-secondary/5 p-4` (verde sutil para distinguirlo del resto).
- Title: `text-[10px] font-semibold uppercase tracking-wider text-secondary` con emoji sparkles o `Sparkles` icon de lucide.
- Cada row: flex con icono (`h-5 w-5`) + nombre en `text-sm font-semibold text-on-surface`.
- Boton "Ver todas": link text con flecha, `text-xs text-secondary/80 hover:text-secondary`.

Se inserta en `ResultsScreen` entre el divider del score y la seccion de preguntas (`mb-4` arriba y abajo).

### Animacion de entrada

```
initial={{ opacity: 0, scale: 0.95, y: 10 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
transition={{ delay: 0.85, duration: 0.4 }}
```

Se muestra **despues** del score y las estrellas, antes del time pill.

---

## 5. Entry points

### `StartScreen`

Se agrega un tercer boton debajo de "Ver ranking":

```
[ Jugar ]             ← primary existente
[ Ver ranking ]       ← secondary existente
[ Mis medallas ]      ← NUEVO, mismo estilo que "Ver ranking"
```

- Mismo patron de `whileHover/whileTap` que el boton existente.
- Icono: `<Medal className="h-4 w-4" />`.
- Delay de animacion: `0.8` (el de ranking es `0.75`).
- Click → `onShowMedals()` → nueva phase `'medals'` en el state machine.
- Opcional polish: si el usuario tiene medallas desbloqueadas recientemente, mostrar un badge con el contador de nuevas (`!unreadCount`) en la esquina del boton.

### `ResultsScreen`

Ademas del `NewMedalsBlock`, el boton "Ver ranking" se duplica a un boton extra "Ver medallas" **solo si** hubo medallas nuevas en esta partida. Se ubica encima de "Ver ranking".

---

## 6. Nueva phase en `useGameState`

Se agrega `'medals'` al union type `GamePhase`:

```
type GamePhase =
  | 'auth'
  | 'start'
  | 'playing'
  | 'revealing'
  | 'finished'
  | 'leaderboard'
  | 'medals'         // ← NUEVO
```

Y dos transiciones nuevas:

```
showMedals():  cualquier phase donde tenga sentido → 'medals'
backToStart(): ya existe, maneja el retorno desde medals
```

Sobre los entry points:
- Desde `StartScreen` → `showMedals()` sin parametros.
- Desde `ResultsScreen` → `showMedals({ highlightIds: newMedals })` para que `MedalsScreen` reciba el set y anime las nuevas.

El state para `highlightIds` vive en `useGameState` (nuevo campo `highlightedMedalIds: MedalId[]`) y se limpia cuando el usuario sale del `MedalsScreen`.

---

## 7. Paleta y tokens reutilizados

| Elemento              | Clase/Token                                         |
|-----------------------|-----------------------------------------------------|
| Card base             | `glass-card` / `glass-card-elevated`                |
| Header bar            | `glass-panel`                                       |
| Divider               | `divider-glow`                                      |
| Boton primario        | `btn-shine` + `bg-primary`                          |
| Confetti en unlock    | `confetti-burst`                                    |
| Glow success (toast)  | `glow-success` (para medallas de Performance)       |
| Glow primary          | `glow-primary` (para medallas de Speed / Milestones)|
| Text outline          | `text-outline`, `text-outline/70`, `text-outline/50`|
| Text on-surface       | `text-on-surface`, `text-on-surface/80`             |

### Nuevas utility classes a agregar a `globals.css`

Solo 4 clases nuevas, siguiendo el patron existente:

```
.glow-bronze   { box-shadow: ...rgba(205,127,50,...); }
.glow-silver   { box-shadow: ...rgba(192,192,192,...); }
.glow-gold     { box-shadow: ...rgba(255,215,0,...); }
.glow-platinum { box-shadow: ...rgba(229,228,226,...); }
```

---

## 8. Accesibilidad y mobile

- Todos los botones tienen `touch-manipulation` como el resto del proyecto.
- El tilt 3d se **deshabilita** con `prefers-reduced-motion`: `@media (prefers-reduced-motion: reduce)` reset a `transform: none`.
- Aria labels en los botones del header (`aria-label="Volver al inicio"`).
- Cards locked tienen `aria-label="Medalla bloqueada: {nombre}"` con la descripcion del criterio.
- El grid es accesible con teclado (cada card es `<button>` con `focus-visible:ring-2 ring-primary/50`).

---

## 9. Mockup de jerarquia visual final

Orden de impacto visual en `MedalsScreen`:

1. **Medalla recien desbloqueada** (reveal flip + confetti + glow pulsante) — dominante.
2. **Medallas desbloqueadas** (color saturado, glow estatico del tier).
3. **Medallas bloqueadas con progreso** (grayscale, barra de progreso visible).
4. **Medallas bloqueadas sin progreso** (grayscale, sin barra).

El usuario escanea de arriba-izquierda y ve: sus logros (gratificante) → proximos objetivos (motivador) → desafios lejanos (aspiracional).
