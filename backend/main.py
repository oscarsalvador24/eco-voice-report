from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import re

app = FastAPI()

# Permitir acceso desde frontend (Netlify, local, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar CSV con parámetros clínicos y modelo TXT
CSV_PATH = "CSV con disfunción diastólica añadida.csv"
df_parametros = pd.read_csv(CSV_PATH)

with open("ejemplo modelo ecocardiograma.txt", "r", encoding="utf-8") as f:
    modelo_informe = f.read()

# Modelo de datos para recibir texto dictado
class InputTexto(BaseModel):
    texto: str

@app.post("/generar_informe")
def generar_informe(data: InputTexto):
    texto = data.texto
    valores_detectados = extraer_valores(texto)
    clasificacion = clasificar_con_csv(valores_detectados)
    informe = generar_informe_desde_modelo(clasificacion)
    return {"informe": informe}

# Extraer cualquier parámetro clínico definido en el CSV
def extraer_valores(texto):
    resultados = {}
    siglas = df_parametros["sigla"].dropna().unique()
    for sigla in siglas:
        patron = rf"{sigla}\s*[:=]?\s*(\d+\.?\d*)"
        match = re.search(patron, texto, re.IGNORECASE)
        if match:
            try:
                valor = float(match.group(1))
                resultados[sigla] = valor
            except ValueError:
                continue
    return resultados

# Clasificar valores detectados comparando con el CSV
def clasificar_con_csv(valores):
    descripciones = {}
    for sigla, valor in valores.items():
        sub_df = df_parametros[df_parametros["sigla"] == sigla]
        if sub_df.empty:
            continue
        for _, fila in sub_df.iterrows():
            try:
                if pd.notna(fila["max_normal"]) and valor <= fila["max_normal"]:
                    descripciones[sigla] = f"{sigla} {valor}: Normal"
                    break
                elif pd.notna(fila["max_leve"]) and valor <= fila["max_leve"]:
                    descripciones[sigla] = f"{sigla} {valor}: Levemente alterado"
                    break
                elif pd.notna(fila["max_moderado"]) and valor <= fila["max_moderado"]:
                    descripciones[sigla] = f"{sigla} {valor}: Moderadamente alterado"
                    break
                elif pd.notna(fila["max_severo"]) and valor <= fila["max_severo"]:
                    descripciones[sigla] = f"{sigla} {valor}: Severamente alterado"
                    break
                else:
                    descripciones[sigla] = f"{sigla} {valor}: Fuera de rango evaluable"
            except Exception:
                descripciones[sigla] = f"{sigla} {valor}: Error en evaluación"
    return descripciones

# Generar informe final añadiendo descripciones al modelo TXT
def generar_informe_desde_modelo(clasificaciones):
    informe = modelo_informe
    for sigla, descripcion in clasificaciones.items():
        informe += f"\n{descripcion}"
    return informe
