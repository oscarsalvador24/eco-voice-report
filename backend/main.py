from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

app = FastAPI()

# Permitir acceso desde cualquier frontend (Netlify/Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMPLATE_PATH = "modelo.txt"

class InputTexto(BaseModel):
    texto: str

@app.post("/generar_informe")
def generar_informe(data: InputTexto):
    if not os.path.exists(TEMPLATE_PATH):
        return {"error": "No se encontró el archivo modelo.txt"}

    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        plantilla = f.read()

    # Aquí usarías parsing más complejo si quieres mapear variables específicas
    informe = plantilla.replace("{{texto}}", data.texto)

    return {"informe": informe}

@app.post("/subir_modelo")
def subir_modelo(file: UploadFile):
    with open(TEMPLATE_PATH, "wb") as f:
        f.write(file.file.read())
    return {"status": "Modelo actualizado"}
