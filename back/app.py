from pathlib import Path
from flask import Flask, request, jsonify

from services.planilhas import read_excel

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent

UPLOAD_FOLDER = BASE_DIR / "uploads"

UPLOAD_FOLDER.mkdir(
    parents=True,
    exist_ok=True
)


@app.post("/api/upload")
def upload_excel():

    file = request.files.get("file")

    if not file:

        return jsonify({
            "success": False,
            "message": "Nenhum arquivo enviado"
        }), 400

    extension = Path(file.filename).suffix.lower()

    allowed = [
        ".xlsx",
        ".xls"
    ]

    if extension not in allowed:

        return jsonify({
            "success": False,
            "message": "Formato inválido"
        }), 400

    save_path = UPLOAD_FOLDER / file.filename

    file.save(save_path)

    preview = read_excel(str(save_path))

    return jsonify({
        "success": True,
        "preview": preview
    })
    

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )