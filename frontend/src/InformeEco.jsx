import { useState } from "react";

export default function InformeEco() {
  const [texto, setTexto] = useState("");
  const [informe, setInforme] = useState("");
  const [loading, setLoading] = useState(false);

  const generarInforme = async () => {
    setLoading(true);
    setInforme("");
    try {
      const response = await fetch("https://TU_BACKEND.onrender.com/generar_informe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      const data = await response.json();
      setInforme(data.informe || "No se pudo generar el informe.");
    } catch (err) {
      setInforme("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Informe de Ecocardiograma por Voz</h1>

      <textarea
        className="w-full border border-gray-300 rounded p-2 mb-4"
        rows="6"
        placeholder="Pega aquí el texto dictado desde el móvil..."
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
  );
}