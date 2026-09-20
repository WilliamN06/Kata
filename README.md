# Kata

Perceptual training through isolated variable drills.

Kata is a desktop (and web) application that trains perceptual skills by isolating individual variables and drilling them to mastery. The primary target is drawing value perception (P3), with architecture ready for all 16 drawing subskills and 35 music subskills.

## What It Trains

- **P3 Value** — 12 isolable variables (JND, range, contrast, adaptation, constancy, Mach bands, ordering, matching, context, memory, background, colour-to-value)
- Each variable has a dedicated drill with adaptive difficulty
- Progression through 3 levels: Variable Control → Condition Variation → Full Execution
- Automaticity drills after mastery

## Quick Start

### Prerequisites

- **Node.js** 20+
- **pnpm** 8+
- **Rust** 1.75+ (for desktop)
- **Visual Studio Build Tools** with C++ workload (Windows only)
- **WebView2** (Windows, usually pre-installed)

### Install

```bash
git clone <your-repo>
cd kata
pnpm install
```

The `postinstall` script automatically copies `sql-wasm.wasm` to `apps/web/public/`.

### Run Desktop

```bash
pnpm dev:desktop
```

First build takes 2–5 minutes (Rust compilation). Subsequent runs are fast.

### Run Web

```bash
pnpm dev:web
```

Open `http://localhost:5174` in Chrome or Edge (best support for OPFS persistence).

### Build for Distribution

```bash
pnpm build:desktop    # → .exe / .dmg / .deb
pnpm build:web        # → static site in apps/web/dist/
```

## Architecture

```
kata/
├── apps/
│   ├── desktop/          Tauri shell (Rust backend + WebView)
│   └── web/              Vite app (browser)
├── packages/
│   ├── core/             Pure TypeScript: staircase, progression, settings
│   ├── db/               Database adapter (Tauri native / sql.js WASM)
│   ├── rendering/        Canvas-based pixel-exact L* rendering
│   ├── ui/               Shared UI primitives (Button, Card, etc.)
│   ├── app/              Shared React app (routes, registry)
│   └── drawing/          Drawing subskills (P3 Value with 12 drills)
└── scripts/
    └── copy-wasm.js      Copies sql-wasm.wasm to web public/
```

### The Adapter Pattern

Every platform-specific concern has an adapter:

- **`TauriDatabaseAdapter`** — calls Rust via `invoke()` for native SQLite
- **`WebDatabaseAdapter`** — uses sql.js (WASM) with OPFS persistence

The app picks the right adapter at runtime:

```typescript
const isTauri = '__TAURI_INTERNALS__' in window;
```

**The app code is identical on both platforms.**

## Calibration

**Non-negotiable.** Value drills require a calibrated screen. The app guides you through:

1. Set brightness to 50%, disable Night Shift / True Tone
2. Black level test (tap darkest visible patch)
3. White level test (tap lightest visible patch)
4. Stored calibration applied to every rendered value

Without calibration, all measurements are invalid.

## Mastery System

| Level | Focus | Criterion |
|-------|-------|-----------|
| 1A | Variable Isolation | 90% accuracy per variable |
| 1B | Variable Integration | 85% per group |
| 2A | Task Conditions | 85% across conditions |
| 2B | Background Conditions | 85% across conditions |
| 3A | Full Execution | Transfer to real work |
| Auto | Automaticity | 85% under distraction |

## Settings

Three-tier cascade: **Per-Drill > Per-Subskill > Global**

Nine user-controlled settings (when Manual mode is active):

1. Range
2. Tolerance
3. Speed
4. Complexity
5. Interaction
6. Variability
7. Conditions
8. Task Condition
9. Background Condition

Plus session length and Auto/Manual mode.

## Verification

After installing, verify the L* conversion is exact:

```bash
node scripts/verify-lstar.js
```

Expected: `L* 50 → sRGB 118`. If not, something is wrong.

## Development

```bash
pnpm typecheck       # Type check all packages
pnpm format          # Format with Prettier
```

## License

Internal project.