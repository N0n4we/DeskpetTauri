use base64::Engine;
use std::path::PathBuf;
use std::io::Cursor;

#[tauri::command]
async fn play_audio_wav(data: Vec<u8>) -> Result<(), String> {
    std::thread::spawn(move || -> Result<(), String> {
        let (_stream, handle) = rodio::OutputStream::try_default().map_err(|e| e.to_string())?;
        let sink = rodio::Sink::try_new(&handle).map_err(|e| e.to_string())?;
        let cursor = Cursor::new(data);
        let source = rodio::Decoder::new(cursor).map_err(|e| e.to_string())?;
        sink.append(source);
        sink.sleep_until_end();
        Ok(())
    })
    .join()
    .map_err(|_| "audio thread panicked".to_string())?
}

#[tauri::command]
async fn read_image_base64(path: String) -> Result<String, String> {
    let path = PathBuf::from(&path);
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("png")
        .to_lowercase();
    let mime = match ext.as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "gif" => "image/gif",
        "webp" => "image/webp",
        _ => "image/png",
    };
    let bytes = std::fs::read(&path).map_err(|e| e.to_string())?;
    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:{};base64,{}", mime, b64))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![read_image_base64, play_audio_wav])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
