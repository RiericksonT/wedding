"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Presentes() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedComodo, setSelectedComodo] = useState("");

  // Pega o nome do sessionStorage (ou coloca um padrão)
  useEffect(() => {
    const storedName = sessionStorage.getItem("name");
    if (storedName) setName(storedName);
  }, []);

  const comodos = [
    "Sala",
    "Cozinha",
    "Quarto Casal",
    "Quarto Infantil",
    "Banheiro",
    "Escritório",
    "Varanda",
  ];

  const handleComodoClick = (comodo: string) => {
    setSelectedComodo(comodo); // <-- marca o cômodo selecionado
    sessionStorage.setItem("comodoSelecionado", comodo);
    // Não redireciona ainda, só mostra o SVG
  };

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-start bg-[#f9f6f2] px-6 md:px-12 py-16">
      {/* Botão de voltar */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 flex items-center gap-3 text-[#3e503c] font-semibold text-2xl hover:opacity-80 transition-opacity cursor-pointer"
      >
        ← Voltar
      </button>

      {/* Saudação personalizada */}
      <h2 className="text-4xl md:text-5xl lg:text-6xl italic text-[#3e503c] mb-6 text-center">
        Oi, {name || "convidado"}! 👋
      </h2>
      <p className="text-[#3e503c] italic leading-relaxed text-lg md:text-xl font-serif text-center max-w-3xl mb-12">
        Escolha o cômodo que você quer explorar ou presentear!
      </p>

      {/* Linha de botões de cômodos */}
      <div className="flex flex-wrap justify-center gap-6 mb-12">
        {comodos.map((comodo) => (
          <button
            key={comodo}
            onClick={() => handleComodoClick(comodo)}
            className={`bg-[#3e503c] text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-[#2c3b2a] transition-colors ${
              selectedComodo === comodo ? "ring-4 ring-[#3e503c]" : ""
            }`}
          >
            {comodo}
          </button>
        ))}
      </div>

      {/* SVG Interativo */}
      {selectedComodo && (
        <div className="w-full max-w-4xl border-4 border-[#3e503c] rounded-lg p-4 bg-white">
          <h3 className="text-2xl font-serif italic text-[#3e503c] mb-4">
            {selectedComodo}
          </h3>

          {selectedComodo === "Sala" && <SalaSVG />}
          {selectedComodo === "Cozinha" && <CozinhaSVG />}
          {/* Adicione outros cômodos aqui */}
        </div>
      )}
    </section>
  );
}

// Exemplo de SVG de Sala
function SalaSVG() {
  const [hovered, setHovered] = useState<string | null>(null);

  const moveis = ["Sofá", "Mesa", "Cadeira", "Estante"];

  return (
    <svg viewBox="0 0 600 400" className="w-full h-80">
      {moveis.map((m, i) => (
        <rect
          key={m}
          x={50 + i * 120}
          y={100}
          width={100}
          height={60}
          fill={hovered === m ? "#facc15" : "#a3a3a3"}
          stroke="#3e503c"
          strokeWidth={2}
          rx={8}
          ry={8}
          onMouseEnter={() => setHovered(m)}
          onMouseLeave={() => setHovered(null)}
        >
          <title>{m}</title>
        </rect>
      ))}
    </svg>
  );
}

// Exemplo de SVG de Cozinha (mais simples)
function CozinhaSVG() {
  return (
    <svg viewBox="0 0 600 400" className="w-full h-80">
      <rect x={50} y={100} width={150} height={80} fill="#a3a3a3" stroke="#3e503c" strokeWidth={2} rx={8} ry={8}>
        <title>Geladeira</title>
      </rect>
      <rect x={250} y={100} width={200} height={80} fill="#a3a3a3" stroke="#3e503c" strokeWidth={2} rx={8} ry={8}>
        <title>Balcão</title>
      </rect>
    </svg>
  );
}
