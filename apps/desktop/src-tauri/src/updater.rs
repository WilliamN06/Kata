//! Installed builds update themselves from the GitHub Releases that CI publishes on every push to
//! main (see .github/workflows/release.yml). No signing key or secret is involved: the installer is
//! fetched over HTTPS from this repository's own latest release.
//!
//! On launch Kata asks GitHub for the latest release. If its version is newer, the installer is
//! downloaded in the background. It runs (silently) when you close Kata, or straight away if you
//! click "Restart now" in the banner. Log: %LOCALAPPDATA%\com.kata.app\logs\updater.log.

use std::fs::{create_dir_all, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, WindowEvent};

const LATEST: &str = "https://api.github.com/repos/WilliamN06/Kata/releases/latest";

/// A downloaded installer waiting to run.
pub struct Pending(Mutex<Option<PathBuf>>);

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

/// "v1.0.12" or "1.0.12" -> [1, 0, 12].
fn parse(v: &str) -> Vec<u64> {
    v.trim_start_matches('v').split('.').map(|p| p.parse().unwrap_or(0)).collect()
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

async fn check_and_download(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::builder().user_agent("kata-updater").build()?;
    let release: serde_json::Value = client.get(LATEST).send().await?.error_for_status()?.json().await?;
    let tag = release["tag_name"].as_str().unwrap_or_default().to_string();
    let current = app.package_info().version.to_string();
    if parse(&tag) <= parse(&current) {
        log(app, format!("up to date ({current}, latest {tag})"));
        return Ok(());
    }
    let url = release["assets"]
        .as_array()
        .and_then(|a| {
            a.iter().find_map(|x| {
                let name = x["name"].as_str()?;
                name.ends_with("-setup.exe").then(|| x["browser_download_url"].as_str())?
            })
        })
        .ok_or("release has no installer")?
        .to_string();
    log(app, format!("downloading {tag}"));
    let bytes = client.get(&url).send().await?.error_for_status()?.bytes().await?;
    let path = std::env::temp_dir().join(format!("Kata_{}_setup.exe", tag.trim_start_matches('v')));
    std::fs::write(&path, &bytes)?;
    *app.state::<Pending>().0.lock().unwrap() = Some(path);
    log(app, format!("ready {tag}"));
    let _ = app.emit("kata://update-ready", Ready { version: tag.trim_start_matches('v').to_string() });
    Ok(())
}

/// Runs the downloaded installer silently once Kata has exited, then (if asked) reopens Kata.
fn install(app: &AppHandle, restart: bool) -> bool {
    let Some(setup) = app.state::<Pending>().0.lock().unwrap().take() else {
        return false;
    };
    let exe = std::env::current_exe().unwrap_or_default();
    log(app, format!("installing {} (restart: {restart})", setup.display()));
    let mut script = format!(
        "Start-Sleep -Seconds 2; Start-Process -Wait -FilePath '{}' -ArgumentList '/S'",
        setup.display()
    );
    if restart {
        script.push_str(&format!("; Start-Process -FilePath '{}'", exe.display()));
    }
    let mut cmd = std::process::Command::new("powershell");
    cmd.args(["-NoProfile", "-WindowStyle", "Hidden", "-Command", &script]);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x0800_0000); // CREATE_NO_WINDOW
    }
    if let Err(e) = cmd.spawn() {
        log(app, format!("install failed: {e}"));
        return false;
    }
    app.exit(0);
    true
}

/// Wired to the main window: closing it applies a waiting update without reopening Kata.
pub fn on_window_event(window: &tauri::Window, event: &WindowEvent) {
    if let WindowEvent::CloseRequested { .. } = event {
        let app = window.app_handle();
        if app.state::<Pending>().0.lock().unwrap().is_some() {
            install(app, false);
        }
    }
}

/// "Restart now" in the banner: install now and reopen Kata on the new version.
#[tauri::command]
pub fn install_update_now(app: AppHandle) -> bool {
    install(&app, true)
}
