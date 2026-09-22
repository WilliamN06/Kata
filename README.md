# KATA

Perceptual skill trainer. Trains one subskill at a time by drilling its individual variables with adaptive difficulty.

**Download:** grab `Kata.exe` from the repo root and double-click it. Runs on Windows 10/11. No installation, no dependencies.

---

## Build from source

### Requirements

- Node.js 20+ — https://nodejs.org
- pnpm 8+ — install with `npm install -g pnpm`
- Rust 1.75+ — https://rustup.rs
- Visual Studio Build Tools with C++ — Windows only, for Rust compilation
- WebView2 — Windows 10 only, usually pre-installed on Windows 11

Verify:

```
node --version       # v20.x or higher
pnpm --version       # 8.x or higher
rustc --version      # 1.75 or higher
```

### Install and build

```
cd "C:\Users\Willi\Documents\Personal programming\Kata\Kata"
pnpm install
pnpm build:desktop
Copy-Item "apps\desktop\src-tauri\target\release\kata.exe" "Kata.exe" -Force
```

`Kata.exe` lands at the repo root. Double-click to run.

First build takes 5–15 minutes. Later builds take about 3 minutes.

### Development

```
pnpm dev:desktop     # Run desktop app with hot reload
pnpm dev:web         # Run web app at http://localhost:5174
pnpm typecheck       # Type-check every package
pnpm build:web       # Build static web app
```

### Rebuild after code changes

```
pnpm build:desktop
Copy-Item "apps\desktop\src-tauri\target\release\kata.exe" "Kata.exe" -Force
```

### Where the build outputs go

```
apps/desktop/src-tauri/target/release/kata.exe                    Portable — double-click to run
apps/desktop/src-tauri/target/release/bundle/nsis/*.exe           Installer
apps/desktop/src-tauri/target/release/bundle/msi/*.msi            MSI installer
```

The portable `kata.exe` is the whole app in one file. Copy it anywhere.

---

## What it trains

### Drawing

| Layer | Subskills |
|-------|-----------|
| Perception | P1 Angle, P2 Proportion, P3 Value, P4 Colour, P5 Edge, P6 Shape |
| Representation | (future) |

### Music

| Layer | Subskills |
|-------|-----------|
| Perception | P1 Pitch, P2 Dynamic, P3 Timbral, P4 Rhythmic, P5 Spatial |
| Representation | (future) |

---

## First use

1. **Calibrate the screen.** The app opens on calibration the first time. Follow the prompts. Do not skip this — value drills are meaningless without it.
2. **Pick a drill.** From Home: Today's Session (auto-selected), Drawing, Music, or Free Play (manual pick).
3. **Answer.** The drill shows a stimulus, asks a question, waits for your answer.
4. **Read feedback.** The correct answer appears in the drill's own units (ΔL*, degrees, dB, cents, Hz).
5. **Adjust settings.** Open the ⚙ in the drill header to change variable, stimulus, or task parameters. Settings save per drill.

---

## Drill settings

Every drill has three categories of settings.

### Variable parameters

What the drill actually tests. The exact list depends on the drill.

Examples:

- **P1 V1 Vertical (Angle):** tilt range, tilt direction, reference guide, line length
- **P3 V1 JND (Value):** base luminance range, starting difference, chip shape
- **P4 V1 Hue (Colour):** hue range, reference hue, saturation, lightness, display mode
- **Music P1 V1 Interval:** interval set, direction, register, waveform, note duration

Changing these changes what the drill focuses on. Settings save per drill.

### Stimulus parameters

How the stimulus looks or sounds. Texture, colour, background, lighting, timbre, reverb, noise floor, etc.

These default to app-wide values but can be overridden per drill.

### Task parameters

How the task runs:

- Timed or untimed
- Fixed trial count or endless
- Auto-continue or wait for Continue button
- Feedback delay and type
- Tolerance
- Distraction, fatigue, complexity, and other conditions

Reset to global defaults any time from the settings panel.

---

## Practice guidance

- **10–15 minutes per session.** Longer sessions have diminishing returns.
- **Practice daily.** Spaced repetition works; cramming does not.
- **One variable at a time.** Isolation drills train a single variable.
- **Read the numbers.** Feedback tells you not just right/wrong but the exact error.
- **Lower difficulty when stuck.** If accuracy drops below 60%, the drill is too hard.
- **Raise difficulty when comfortable.** If accuracy stays above 90% for many sessions, it's too easy.

---

## Structure

```
kata/
├── apps/
│   ├── desktop/         Tauri shell (Rust + WebView)
│   └── web/             Vite browser app
├── packages/
│   ├── core/            Domain-agnostic engine (staircase, progression, settings, types)
│   ├── rendering/       Canvas-based L* rendering
│   ├── audio/           Web Audio primitives
│   ├── visualisation/   Spectrum, waveform, spectrogram, meter
│   ├── music-shared/    Pitch, rhythm, spatial, timbre math
│   ├── db/              SQLite adapters (native + WASM)
│   ├── ui/              Shared UI components
│   ├── app/             React screens, routes, registry
│   ├── drawing/         Drawing subskills and drills
│   └── music/           Music subskills and drills
├── docs/                Documentation
└── scripts/             Utilities
```

---

## Adding a subskill

1. Create `packages/<domain>/src/skills/<id>/`
2. Add `variables.ts` (variable definitions)
3. Add `drills/` (one file per variable)
4. Add `integration/` (integration group drills)
5. Add `index.ts` (exports the `Subskill` object)
6. Register it in `packages/<domain>/src/index.ts`
7. Register it in `packages/app/src/registry.ts`

No changes to the app shell, database, or engine needed.

Each drill is a React component that accepts `DrillProps`:

```typescript
export interface DrillProps {
  variable: Variable;
  delta: number;
  onAnswer: (correct: boolean, responseTimeMs: number) => void;
  calibratedLStar: (target: number) => number;
  variableParams: Record<string, string | number>;
  stimulus: StimulusParameters;
  task: TaskParameters;
}
```

The drill renders a stimulus, captures an answer, decides correctness internally, and reports via `onAnswer(correct, responseTimeMs)`. The engine handles the rest.

---

## Data

Progress is stored in a local SQLite file.

**Desktop:**

```
%APPDATA%\com.kata.Kata\data\kata.db
```

**Web:** OPFS inside the browser.

Back up by copying the file. Reset by deleting it. The app creates a fresh one on next launch.

---

## Troubleshooting

### `pnpm: command not found`

```
npm install -g pnpm
```

### `error: linker 'link.exe' not found`

Missing Visual Studio C++ Build Tools.

```
winget install Microsoft.VisualStudio.2022.BuildTools
```

During installation, select **Desktop development with C++**. Restart PowerShell after.

### `icons/icon.ico not found`

Generate icons:

```powershell
cd apps/desktop
pnpm tauri icon src-tauri/icon-source.png
cd ../..
```

If you have no source PNG, create a placeholder:

```powershell
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 1024, 1024
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.Clear([System.Drawing.Color]::FromArgb(26, 26, 26))
$font = New-Object System.Drawing.Font("Arial", 500, [System.Drawing.FontStyle]::Bold)
$graphics.DrawString("K", $font, [System.Drawing.Brushes]::White, 200, 100)
$graphics.Dispose()
$bmp.Save("$PWD\icon-source.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
```

Then run `pnpm tauri icon src-tauri/icon-source.png`.

### Value chips appear black

Open Settings → Calibration. If calibration data is corrupted, reset it. If still broken, check the app's DevTools console (F12) for warnings.

### Web audio doesn't play

Browsers require a user gesture before audio can play. Click anywhere in the page first.

### Settings don't save

Check the database file has write permissions. On desktop:

```
%APPDATA%\com.kata.Kata\data\kata.db
```

---

## Documentation

- `docs/USAGE.md` — day-to-day use
- `docs/SETTINGS.md` — every setting
- `docs/DEVELOPMENT.md` — for contributors
- `docs/TROUBLESHOOTING.md` — when things break

---

## Verify the L* conversion

The L* to sRGB conversion must be exact for value drills to work.

```
node scripts/verify-lstar.js
```

Expected: `L* 50 → sRGB 118`.

---

## Git

### First commit

```
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/kata.git
git push -u origin main
```

### Commit `.gitignore` recommendations

```
node_modules/
dist/
target/
apps/desktop/src-tauri/target/
apps/desktop/dist/
apps/web/dist/
.env
.env.local
.DS_Store
```

If you want to exclude the built binary from git:

```
Kata.exe
```

Otherwise commit it — GitHub allows files up to 100 MB.

### Rebuild and push

```
pnpm build:desktop
Copy-Item "apps\desktop\src-tauri\target\release\kata.exe" "Kata.exe" -Force
git add Kata.exe
git commit -m "Update build"
git push
```

---

## License

Internal project.