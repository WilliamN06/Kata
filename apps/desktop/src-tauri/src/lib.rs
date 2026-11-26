mod db;
mod updater;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(db::DbState(std::sync::Mutex::new(None)))
        .setup(|app| {
            updater::init(app.handle());
            Ok(())
        })
        .on_window_event(updater::on_window_event)
        .invoke_handler(tauri::generate_handler![
            db::db_init,
            db::db_query,
            db::db_exec,
            db::db_close,
            updater::install_update_now,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
