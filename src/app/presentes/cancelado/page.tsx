"use client";

import { useRouter } from "next/navigation";

export default function Cancelado() {
  const router = useRouter();

  return (
    <section
      className="w-full min-h-screen flex flex-col items-center justify-center bg-[#f9f6f2] px-6 py-16"
      style={{ fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">😔</div>
        <h1 className="text-3xl font-serif italic text-[#3e503c] mb-2">
          Pagamento cancelado
        </h1>
        <p className="text-[#3e503c] font-sans mb-6">
          Tudo bem! Nenhum valor foi cobrado. Você ainda pode reservar os presentes por Pix ou avisar pelo WhatsApp. 💚
        </p>
        <button
          onClick={() => router.push("/presentes")}
          className="w-full px-6 py-3 bg-[#3e503c] text-white rounded-lg hover:bg-[#2c3b2a] transition-colors text-lg font-semibold font-sans"
        >
          Voltar aos presentes
        </button>
      </div>
    </section>
  );
}
