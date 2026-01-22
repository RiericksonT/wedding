"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Inter, Playfair_Display } from 'next/font/google';
import QuartoSVG from "@/components/roooms/bedroom_couple/bedroom";
import LivingRoomSVG from "@/components/roooms/livingroom/livingroom";

// Configuração das fontes
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export default function Presentes() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedComodo, setSelectedComodo] = useState("");

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
    setSelectedComodo(comodo);
    sessionStorage.setItem("comodoSelecionado", comodo);
  };

  return (
    <section className={`${inter.variable} ${playfair.variable} w-full min-h-screen flex flex-col items-center bg-[#f9f6f2] px-6 md:px-12 py-16 relative`}>
      {/* Voltar */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 text-[#3e503c] font-semibold text-2xl hover:opacity-80 font-sans"
      >
        ← Voltar
      </button>

      {/* Saudação */}
      <h2 className="text-4xl md:text-5xl italic text-[#3e503c] mb-4 text-center font-serif">
        Oi, {name || "convidado"}! 👋
      </h2>

      <p className="text-[#3e503c] italic text-lg md:text-xl text-center max-w-3xl mb-6 font-sans">
        Escolha o que você gostaria de presentear
      </p>
      
      <p className="text-[#3e503c] text-center max-w-3xl mb-10 font-sans">
        <span className="font-semibold">Como funciona:</span> Clique nos móveis para ver opções, 
        escolha uma e adicione à sua lista. Depois reserve pelo WhatsApp!
      </p>

      {/* Botões */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {comodos.map((comodo) => (
          <button
            key={comodo}
            onClick={() => handleComodoClick(comodo)}
            className={`py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-300 font-sans
              ${
                selectedComodo === comodo
                  ? "bg-[#2c3b2a] text-white ring-4 ring-[#3e503c] scale-110"
                  : "bg-[#3e503c] text-white hover:bg-[#2c3b2a] hover:scale-105"
              }`}
          >
            {comodo}
          </button>
        ))}
      </div>

      {/* Área do SVG */}
      {selectedComodo === "Quarto Casal" && (
        <div className="w-full max-w-6xl bg-white border-4 border-[#3e503c] rounded-lg p-6">
          <h3 className="text-2xl font-serif italic text-[#3e503c] mb-6">
            Quarto Casal
          </h3>
          <QuartoSVG />
        </div>
      )}
      {selectedComodo === "Sala" && (
        <div className="w-full max-w-6xl bg-white border-4 border-[#3e503c] rounded-lg p-6">
          <h3 className="text-2xl font-serif italic text-[#3e503c] mb-6">
            Sala
          </h3>
          <LivingRoomSVG />
        </div>
      )}
    </section>
  );
}


