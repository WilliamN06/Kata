import { useEffect, useState } from 'react';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

/**
 * Shown once a newer Kata has downloaded in the background (see src-tauri/src/updater.rs).
 * Ignoring it is fine: the update installs when the window is closed.
 */
export function UpdateBanner() {
  const [version, setVersion] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!isTauri()) return;
    const off = listen<{ version: string }>('kata://update-ready', (e) => setVersion(e.payload.version));
    return () => {
      off.then((f) => f());
    };
  }, []);

  if (!version || hidden) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-white/10 bg-neutral-900/95 px-4 py-3 text-sm shadow-lg">
      <span>Kata {version} is ready. It installs when you close Kata.</span>
      <button
        className="rounded-md bg-[#4a9eff] px-3 py-1 font-medium text-white hover:bg-[#3a8ef0]"
        onClick={() => void invoke('install_update_now')}
      >
        Restart now
      </button>
      <button className="text-neutral-400 hover:text-neutral-200" onClick={() => setHidden(true)} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
