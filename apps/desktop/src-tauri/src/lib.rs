mod db;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(db::DbState(std::sync::Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            db::db_init,
            db::db_query,
            db::db_exec,
            db::db_close,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}