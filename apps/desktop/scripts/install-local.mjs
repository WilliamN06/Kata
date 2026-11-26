// `pnpm install-app` (in apps/desktop): builds the Kata installer and installs it on this PC.
// Closes a running Kata, installs silently (per-user, no admin prompt), makes sure the Start menu
// and desktop shortcuts exist, then starts the installed app. From then on it updates itself
// from the GitHub Releases that CI publishes (see .github/workflows/release.yml).
import { execFileSync, execSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.platform !== 'win32') {
  console.error('install-app is Windows-only.');
  process.exit(1);
}

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const tauriDir = join(appDir, 'src-tauri');

if (!process.argv.includes('--no-build')) {
  execSync('pnpm tauri build', { cwd: appDir, stdio: 'inherit' });
}

const { version } = JSON.parse(readFileSync(join(tauriDir, 'tauri.conf.json'), 'utf8'));
const nsisDir = join(tauriDir, 'target', 'release', 'bundle', 'nsis');
const setupName = existsSync(nsisDir)
  ? readdirSync(nsisDir).find((f) => f.startsWith(`Kata_${version}_`) && f.endsWith('-setup.exe'))
  : undefined;
if (!setupName) {
  console.error(`No Kata ${version} installer in ${nsisDir}`);
  process.exit(1);
}
const setup = join(nsisDir, setupName);

try {
  execFileSync('taskkill', ['/IM', 'kata.exe', '/F'], { stdio: 'ignore' });
} catch {
  /* not running */
}

const ps = (cmd) => execFileSync('powershell', ['-NoProfile', '-Command', cmd]).toString().trim();

// Run the installer through WMI rather than as a child process. When this script runs inside a
// packaged (MSIX) app, such as a terminal in the Claude desktop app, a child installer would be
// sandboxed into that app's private AppData and Windows would never see Kata as installed.
console.log(`Installing Kata ${version}...`);
ps(
  `$p = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = '"${setup}" /S' };` +
    `if ($p.ReturnValue -ne 0) { throw 'installer failed to start' };` +
    `while (Get-Process -Id $p.ProcessId -ErrorAction SilentlyContinue) { Start-Sleep -Milliseconds 300 }`
);

const exe = join(process.env.LOCALAPPDATA ?? '', 'Kata', 'kata.exe');
if (!existsSync(exe)) {
  console.log('Installed. Start it from the Start menu: Kata.');
  process.exit(0);
}

// The silent installer skips the "create desktop shortcut" checkbox, so add the shortcuts here.
const desktop = ps("[Environment]::GetFolderPath('Desktop')");
const startMenu = join(process.env.APPDATA ?? '', 'Microsoft', 'Windows', 'Start Menu', 'Programs');
for (const lnk of [join(desktop, 'Kata.lnk'), join(startMenu, 'Kata.lnk')]) {
  if (existsSync(lnk)) continue;
  ps(
    `$s=(New-Object -ComObject WScript.Shell).CreateShortcut('${lnk}');` +
      `$s.TargetPath='${exe}';$s.WorkingDirectory='${dirname(exe)}';$s.IconLocation='${exe},0';$s.Save()`
  );
  console.log(`Shortcut: ${lnk}`);
}

// Start it through Explorer, like a Start menu click (also outside any app sandbox).
spawn('explorer.exe', [exe], { detached: true, stdio: 'ignore' }).unref();
console.log(`Installed and started: ${exe}`);
