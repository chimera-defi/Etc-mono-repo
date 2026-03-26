use tauri::Manager;

#[tauri::command]
async fn get_health() -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();

    let web_ok = client
        .get("http://localhost:3000/api/health")
        .timeout(std::time::Duration::from_secs(3))
        .send()
        .await
        .map(|r| r.status().is_success())
        .unwrap_or(false);

    let collab_ok = client
        .get("http://127.0.0.1:4322/health")
        .timeout(std::time::Duration::from_secs(3))
        .send()
        .await
        .map(|r| r.status().is_success())
        .unwrap_or(false);

    Ok(serde_json::json!({
        "web": web_ok,
        "collab": collab_ok,
        "ready": web_ok && collab_ok
    }))
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_health])
        .setup(|app| {
            let win = app.get_webview_window("main").unwrap();
            win.set_title("SpecForge").unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
