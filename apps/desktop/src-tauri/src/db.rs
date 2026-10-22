use rusqlite::{Connection, Result as SqlResult};
use serde_json::Value;
use std::sync::Mutex;

pub struct DbState(pub Mutex<Option<Connection>>);

const SCHEMA: &str = include_str!("../../../../packages/db/src/schema.sql");

#[tauri::command]
pub fn db_init(state: tauri::State<DbState>) -> Result<(), String> {
    let dirs = directories::ProjectDirs::from("com", "kata", "Kata")
        .ok_or_else(|| "Could not determine app data directory".to_string())?;
    std::fs::create_dir_all(dirs.data_dir()).map_err(|e| e.to_string())?;
    let db_path = dirs.data_dir().join("kata.db");

    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;
    conn.execute_batch(SCHEMA).map_err(|e| e.to_string())?;

    // Lightweight migration: ensure newly-added columns exist on existing DBs
    // (CREATE TABLE IF NOT EXISTS will not add columns to an existing table).
    let _ = conn.execute(
        "ALTER TABLE drill_configurations ADD COLUMN task_streak_threshold INTEGER",
        [],
    );

    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    *guard = Some(conn);
    Ok(())
}

#[tauri::command]
pub fn db_query(
    sql: String,
    params: Vec<Value>,
    state: tauri::State<DbState>,
) -> Result<Vec<Value>, String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Database not initialized")?;

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let column_names: Vec<String> = stmt
        .column_names()
        .iter()
        .map(|s| s.to_string())
        .collect();
    let column_count = column_names.len();

    let params_ref: Vec<Box<dyn rusqlite::ToSql>> = params
        .iter()
        .map(|v| -> Box<dyn rusqlite::ToSql> {
            match v {
                Value::Null => Box::new(rusqlite::types::Null),
                Value::Bool(b) => Box::new(*b),
                Value::Number(n) => {
                    if let Some(i) = n.as_i64() {
                        Box::new(i)
                    } else {
                        Box::new(n.as_f64().unwrap_or(0.0))
                    }
                }
                Value::String(s) => Box::new(s.clone()),
                _ => Box::new(rusqlite::types::Null),
            }
        })
        .collect();

    let params_dyn: Vec<&dyn rusqlite::ToSql> =
        params_ref.iter().map(|b| b.as_ref()).collect();

    let rows = stmt
        .query_map(params_dyn.as_slice(), |row| {
            let mut obj = serde_json::Map::new();
            for i in 0..column_count {
                let val: Value = match row.get_ref(i)? {
                    rusqlite::types::ValueRef::Null => Value::Null,
                    rusqlite::types::ValueRef::Integer(n) => Value::Number(n.into()),
                    rusqlite::types::ValueRef::Real(f) => {
                        Value::Number(serde_json::Number::from_f64(f).unwrap_or(0.into()))
                    }
                    rusqlite::types::ValueRef::Text(s) => {
                        Value::String(String::from_utf8_lossy(s).to_string())
                    }
                    rusqlite::types::ValueRef::Blob(_) => Value::Null,
                };
                obj.insert(column_names[i].clone(), val);
            }
            Ok(Value::Object(obj))
        })
        .map_err(|e| e.to_string())?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row.map_err(|e| e.to_string())?);
    }
    Ok(result)
}

#[tauri::command]
pub fn db_exec(
    sql: String,
    params: Vec<Value>,
    state: tauri::State<DbState>,
) -> Result<(), String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Database not initialized")?;

    let params_ref: Vec<Box<dyn rusqlite::ToSql>> = params
        .iter()
        .map(|v| -> Box<dyn rusqlite::ToSql> {
            match v {
                Value::Null => Box::new(rusqlite::types::Null),
                Value::Bool(b) => Box::new(*b),
                Value::Number(n) => {
                    if let Some(i) = n.as_i64() {
                        Box::new(i)
                    } else {
                        Box::new(n.as_f64().unwrap_or(0.0))
                    }
                }
                Value::String(s) => Box::new(s.clone()),
                _ => Box::new(rusqlite::types::Null),
            }
        })
        .collect();

    let params_dyn: Vec<&dyn rusqlite::ToSql> =
        params_ref.iter().map(|b| b.as_ref()).collect();

    conn.execute(&sql, params_dyn.as_slice())
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn db_close(state: tauri::State<DbState>) -> Result<(), String> {
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    *guard = None;
    Ok(())
}