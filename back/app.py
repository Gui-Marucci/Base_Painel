from pathlib import Path
from flask import(Flask,
                   jsonify,
                     request,
                       render_template
                       )

from flask_cors import CORS 
from flask import send_from_directory


from services.planilhas import read_excel
# ==================================================
# CONFIGURAÇÃO
# ==================================================
BASE_DIR = Path(__file__).resolve().parent

PROJECT_DIR = BASE_DIR.parent

COMPONENTS_DIR = (
    PROJECT_DIR / 
    "components" #adiciona o diretorio components para reincluir a sidebar 
)
TEMPLATES_DIR = PROJECT_DIR / "templates"

STATIC_DIR = PROJECT_DIR / "static"

UPLOAD_FOLDER = BASE_DIR / "uploads"

UPLOAD_FOLDER.mkdir(
parents=True,
exist_ok=True
)

# ==================================================
# APP
# ==================================================+

app = Flask(
    __name__,
    template_folder=str(TEMPLATES_DIR),
    static_folder=str(STATIC_DIR)
    )
CORS(  # ---Manter enquanto houver camadas externas
    app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://127.0.0.1:5500"
                ]
            }
        }) 
# ==================================================
# ROTAS HTML
# ==================================================
@app.get("/components/<path:filename>")
def components(filename):
    return send_from_directory(
        COMPONENTS_DIR, 
        filename

    )
@app.get("/")
def home():
    """
    Página inicial do ERP.
    """
    return render_template("index.html")

""" incluir rotas quando for iterando mais paginas 
@app.get("/orcamentos")
def orcamentos():
    return render_template ("orcamentos.html")

@app.get("/recibos")
def recibos():
    return render_template ("recibos.html")
"""

# ==================================================
# API
# ==================================================

@app.post("/api/upload")
def upload_excel():

    file = request.files.get("file")

    if not file:

        return jsonify({
            "success": False,
            "message": "Nenhum arquivo enviado"
        }), 400

    extension = Path(file.filename).suffix.lower()
    """
    
    """
    if extension not in [
        ".xlsx",
        ".xls"
    ]:

        return jsonify({
            "success": False,
            "message": "Formato inválido"
        }), 400

    save_path = (UPLOAD_FOLDER / file.filename)

    file.save(save_path)



    preview = read_excel(str(save_path))
    print("=" * 50)
    print("PREVIEW RETORNADO", preview)
    print("=" * 50)
    

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