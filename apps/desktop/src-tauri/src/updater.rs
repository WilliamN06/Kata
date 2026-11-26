//! Installed builds update themselves from the GitHub Releases that CI publishes on every push to
//! main (see .github/workflows/release.yml).
//!
//! On launch Kata checks for a newer release and downloads it in the background. Nothing
//! interrupts a drill: the update installs when you close the window (so the next launch is the
//! new version), or straight away if you click "Restart to update" in the banner.

use std::fs::{create_dir_all, OpenOptions};
use std::io::Write;
use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, WindowEvent};
use tauri_plugin_updater::{Update, UpdaterExt};

/// A downloaded update waiting to be installed.
pub struct Pending(Mutex<Option<(Update, Vec<u8>)>>);

#[derive(Clone, Serialize)]
struct Ready {
    version: String,
}

fn log(app: &AppHandle, msg: impl AsRef<str>) {
    let Ok(dir) = app.path().app_log_dir() else { return };
    let _ = create_dir_all(&dir);
    if let Ok(mut f) = OpenOptions::new().create(true).append(true).open(dir.join("updater.log")) {
        let secs = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0);
        let _ = writeln!(f, "{secs} {}", msg.as_ref());
    }
}

pub fn init(app: &AppHandle) {
    app.manage(Pending(Mutex::new(None)));

    // `pnpm dev:desktop` never updates itself.
    if cfg!(debug_assertions) {
        return;
    }

    let handle = app.clone();
    tauri::async_runtime::spawn(async move {
        log(&handle, format!("started {}", handle.package_info().version));
        if let Err(e) = check_and_download(&handle).await {
            log(&handle, format!("error: {e}"));
        }
    });
}

async fn check_and_download(app: &AppHandle) -> tauri_plugin_updater::Result<()> {
    let Some(update) = app.updater()?.check().await? else {
        log(app, "up to date");
        return Ok(());
    };
    log(app, format!("downloading {}", update.version));
    let bytes = update.download(|_, _| {}, || {}).await?;
    let version = update.version.clone();
    *app.state::<Pending>().0.lock().unwrap() = Some((update, bytes));
    log(app, format!("ready {version}"));
    let _ = app.emit("kata://update-ready", Ready { version });
    Ok(())
}

/// Installs the downloaded update, if any. The installer replaces the app and Kata exits.
fn install(app: &AppHandle, restart: bool) -> bool {
    let Some((update, bytes)) = app.state::<Pending>().0.lock().unwrap().take() else {
        return false;
    };
    log(app, format!("installing {} (restart: {restart})", update.version));
    let update = update.restart_after_install(restart);
    if let Err(e) = update.install(bytes) {
        log(app, format!("install failed: {e}"));
        return false;
    }
    true
}

/// Wired to the main window: closing it applies a waiting update without reopening Kata.
pub fn on_window_event(window: &tauri::Window, event: &WindowEvent) {
    if let WindowEvent::CloseRequested { .. } = event {
        let app = window.app_handle();
        if app.state::<Pending>().0.lock().unwrap().is_some() {
            let _ = window.hide();
            install(app, false);
        }
    }
}

/// "Restart to update" in the banner: install now and reopen Kata on the new version.
#[tauri::command]
pub fn install_update_now(app: AppHandle) -> bool {
    install(&app, true)
}
