import { useState, useEffect } from "react";

export default function InformeEco() { const [texto, setTexto] = useState(""); const [informe, setInforme] = useState(""); const [loading, setLoading] = useState(false); const [recognition, setRecognition] = useState(null); let manualStop = false;

useEffect(() => { if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) { const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; const recog = new SpeechRecognition(); recog.lang = "es-ES"; recog.continuous = true; recog.interimResults = false;

recog.onresult = (event) => {
    let finalTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    setTexto((prev) => prev + " " + finalTranscript);
  };

  recog.onend = () => {
    if (!manualStop) recog.start();
  };

  setRecognition(recog);

  return () => {
    manualStop = true;
    recog.stop();
  };
} else {
  alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.");
}

}, []);

const empezarDictado = () => { manualStop = false; recognition && recognition.start(); };

const detenerDictado = () => { manualStop = true; recognition && recognition.stop(); };

const generarInforme = async () => { setLoading(true); setInforme(""); try { const response = await fetch("https://TU_BACKEND.onrender.com/generar_informe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texto }), }); const data = await response.json(); setInforme(data.informe || "No se pudo generar el informe."); } catch (err) { setInforme("Error al conectar con el servidor."); } finally { setLoading(false); } };

return ( <div className="max-w-3xl mx-auto p-4 text-gray-800"> <h1 className="text-2xl font-bold mb-4">Informe de Ecocardiograma por Voz</h1>

<div className="flex gap-4 mb-4">
    <button
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      onClick={empezarDictado}
    >
      🎙️ Empezar dictado
    </button>
    <button
      className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
      onClick={detenerDictado}
    >
      ✋ Detener dictado
    </button>
  </div>

  <textarea
    className="w-full border border-gray-300 rounded p-2 mb-4"
    rows="6"
    placeholder="Pega aquí el texto dictado o usa el micrófono..."
    value={texto}
    onChange={(e) => setTexto(e.target.value)}
  />

  <button
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
    onClick={generarInforme}
    disabled={loading || !texto}
  >
    {loading ? "Generando..." : "Generar Informe"}
  </button>

  {informe && (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Informe generado:</h2>
      <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{informe}</pre>
    </div>
  )}
</div>

); }

