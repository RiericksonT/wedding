"use client"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Welcome() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    toast.success("Dados salvos com sucesso!");
    // Aqui você pode guardar no cache/sessionStorage/localStorage
    sessionStorage.setItem("name", name);
    sessionStorage.setItem("email", email);

      router.push("/presentes"); // redireciona para próxima página
  };

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center bg-[#f9f6f2] px-6 md:px-12 py-16 relative">
        <button
        onClick={() => router.back()}
        className="absolute text-2xl top-6 left-6 flex items-center gap-3  text-[#3e503c] font-semibold text-lg hover:opacity-80 transition-opacity cursor-pointer"
      >
        ← Voltar
      </button>
      {/* Título */}
      <h2 className="text-4xl md:text-6xl lg:text-7xl italic text-[#3e503c] mb-10 text-center">
        Bem-vindo ao Nosso Casamento
      </h2>

      {/* Texto explicativo */}
      <p className="text-[#3e503c] italic leading-relaxed text-base md:text-lg font-serif text-center max-w-3xl mb-12">
        Para prosseguir e escolher seu presente, por favor preencha seu nome e e-mail abaixo. Suas informações serão armazenadas com segurança e usadas para registrar sua participação.
      </p>

      {/* Formulário */}
      <form
        className="flex flex-col gap-6 w-full max-w-md bg-white p-8 rounded-lg shadow-md"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e503c] text-2xl"
        />
        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e503c] text-2xl"
        />
        <button
          type="submit"
          className="bg-[#3e503c] text-white py-3 rounded-lg text-lg font-semibold hover:bg-[#2c3b2a] transition-colors"
        >
          Salvar e Prosseguir
        </button>
      </form>
    </section>
  );
}
