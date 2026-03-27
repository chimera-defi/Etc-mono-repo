use std::process::Child;
use std::sync::Mutex;
use tauri::Manager;

/// Holds references to sidecar child processes so they can be killed on shutdown.
struct Sidecars {
    children: Vec<Child>,
}

impl Sidecars {
    fn new() -> Self {
        Self {
            children: Vec::new(),
        }
    }

    fn add(&mut self, child: Child) {
        self.children.push(child);
    }

    fn kill_all(&mut self) {
        for child in self.children.iter_mut() {
            let _ = child.kill();
            let _ = child.wait();
        }
        self.children.clear();
    }
}

impl Drop for Sidecars {
    fn drop(&mut self) {
        self.kill_all();
    }
}

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

/// Build a PATH string that includes common Node/bun install locations so
/// subprocesses can find `bun` and `node` even when launched from a macOS
/// .app bundle (which strips the user's shell PATH).
fn extended_path() -> String {
    let home = std::env::var("HOME").unwrap_or_default();
    let existing = std::env::var("PATH").unwrap_or_default();

    // Locations where bun / node are commonly installed
    let extra = [
        format!("{home}/.bun/bin"),
        format!("{home}/.nvm/versions/node/v20.19.0/bin"), // nvm active version
        "/opt/homebrew/bin".to_string(),
        "/usr/local/bin".to_string(),
    ];

    let mut parts: Vec<String> = extra.into_iter().collect();
    if !existing.is_empty() {
        parts.push(existing);
    }
    parts.join(":")
}

/// Spawn a service with `sh -l -c <cmd>` so the login shell profile
/// (which initialises nvm, bun, etc.) is loaded before exec.
fn spawn_service(cmd: &str, dir: &std::path::Path, label: &str) -> Option<Child> {
    match std::process::Command::new("/bin/sh")
        .args(["-c", cmd])
        .current_dir(dir)
        .env("PATH", extended_path())
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .spawn()
    {
        Ok(child) => {
            eprintln!("[specforge] started {label} (pid {})", child.id());
            Some(child)
        }
        Err(e) => {
            eprintln!("[specforge] failed to start {label}: {e}");
            None
        }
    }
}

/// Spawn sidecar processes for the web app and collab server.
/// Returns the child processes so they can be managed.
fn spawn_sidecars() -> Vec<Child> {
    let mut children = Vec::new();

    // Determine project root — two levels up from src-tauri in dev,
    // or relative to the exe in a packaged .app.
    let manifest_dir = std::env::var("CARGO_MANIFEST_DIR")
        .map(std::path::PathBuf::from)
        .ok();

    let base = manifest_dir
        .as_ref()
        .and_then(|d| d.parent().map(|p| p.to_path_buf()))
        .or_else(|| {
            std::env::current_exe()
                .ok()
                .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        })
        .unwrap_or_else(|| std::path::PathBuf::from("."));

    let web_dir = base.join("../web");
    let collab_dir = base.join("../collab-server");

    // Start collab server — `node src/index.js` (no bun needed at runtime)
    if collab_dir.exists() {
        if let Some(child) = spawn_service("node src/index.js", &collab_dir, "collab-server") {
            children.push(child);
        }
    } else {
        eprintln!("[specforge] collab-server dir not found: {}", collab_dir.display());
    }

    // Start web app — `bun run start` requires a prior `bun run build`
    if web_dir.exists() {
        if let Some(child) = spawn_service("bun run start", &web_dir, "web") {
            children.push(child);
        }
    } else {
        eprintln!("[specforge] web dir not found: {}", web_dir.display());
    }

    children
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_health])
        .setup(|app| {
            // Spawn sidecar processes
            let spawned = spawn_sidecars();
            let mut sidecars = Sidecars::new();
            for child in spawned {
                sidecars.add(child);
            }
            app.manage(Mutex::new(sidecars));

            let win = app.get_webview_window("main").unwrap();
            win.set_title("SpecForge").unwrap();

            // Clean up sidecars when the main window closes
            let app_handle = app.handle().clone();
            win.on_window_event(move |event| {
                if let tauri::WindowEvent::Destroyed = event {
                    if let Some(state) = app_handle.try_state::<Mutex<Sidecars>>() {
                        if let Ok(mut s) = state.lock() {
                            s.kill_all();
                        }
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
