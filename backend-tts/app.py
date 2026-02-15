import io
import os
import tempfile

import genie_tts as genie
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DEFAULT_CHARACTER = "mika"

genie.load_predefined_character(DEFAULT_CHARACTER)

@app.route("/api/tts", methods=["POST"])
def tts():
    data = request.get_json(silent=True)
    if not data or not data.get("text"):
        return jsonify({"error": "text is required"}), 400

    text = data["text"]
    print("text:", text)
    character = data.get("character", DEFAULT_CHARACTER)

    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name

        genie.tts(
            character_name=character,
            text=text,
            play=False,
            save_path=tmp_path,
        )

        buf = io.BytesIO()
        with open(tmp_path, "rb") as f:
            buf.write(f.read())
        os.unlink(tmp_path)
        buf.seek(0)

        return send_file(buf, mimetype="audio/wav", download_name="speech.wav")

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
