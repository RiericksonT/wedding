"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Inter, Playfair_Display } from 'next/font/google';
import QuartoSVG from "@/components/roooms/bedroom_couple/bedroom";
import LivingRoomSVG from "@/components/roooms/livingroom/livingroom";
import KitchenSVG from "@/components/roooms/kitchen/kitchen";
import BathroomSVG from "@/components/roooms/bathroom/bathroom";
import SharedGiftList from "@/components/gifts/sharedGiftList";
import { SelectedGift } from "@/types/selectedGiftInterface";

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
  const [phone, setPhone] = useState("");
  const [selectedComodo, setSelectedComodo] = useState("");
  const [selectedGifts, setSelectedGifts] = useState<SelectedGift[]>([]);

  useEffect(() => {
    const storedName = sessionStorage.getItem("name");
    const storedPhone = sessionStorage.getItem("phone");
    const storedSelectedGifts = sessionStorage.getItem("selectedGifts");
    if (storedName) setName(storedName);
    if (storedPhone) setPhone(storedPhone);
    if (storedSelectedGifts) {
      try {
        setSelectedGifts(JSON.parse(storedSelectedGifts));
      } catch (error) {
        console.error("Erro ao ler lista de presentes salva:", error);
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("selectedGifts", JSON.stringify(selectedGifts));
  }, [selectedGifts]);

  const comodos = [
    "Sala",
    "Cozinha",
    "Quarto Casal",
    "Banheiro",
    "Varanda",
  ];

  const handleComodoClick = (comodo: string) => {
    setSelectedComodo(comodo);
    sessionStorage.setItem("comodoSelecionado", comodo);
  };

  const handleAddGift = (gift: SelectedGift) => {
    setSelectedGifts((prev) => {
      const alreadyExists = prev.some(
        (currentGift) =>
          currentGift.furnitureId === gift.furnitureId &&
          currentGift.option.id === gift.option.id
      );

      if (alreadyExists) return prev;
      return [...prev, gift];
    });
  };

  const handleRemoveGift = (furnitureId: string, giftId: string) => {
    setSelectedGifts((prev) =>
      prev.filter(
        (gift) => !(gift.furnitureId === furnitureId && gift.option.id === giftId)
      )
    );
  };

  const handleReserveViaWhatsApp = async () => {
    if (selectedGifts.length === 0) {
      alert("Selecione pelo menos uma opção para reservar!");
      return;
    }

    let currentName = name;
    let currentPhone = phone;

    if (!currentName) {
      const inputName = window.prompt("Digite seu nome para continuar:")?.trim();
      if (!inputName) return;
      currentName = inputName;
      setName(inputName);
      sessionStorage.setItem("name", inputName);
    }

    if (!currentPhone) {
      const inputPhone = window.prompt("Digite seu telefone para continuar:")?.trim();
      if (!inputPhone) return;
      currentPhone = inputPhone;
      setPhone(inputPhone);
      sessionStorage.setItem("phone", inputPhone);
    }

    const reservationResults = await Promise.all(
      selectedGifts.map(async (gift) => {
        try {
          const response = await fetch('/api/gifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              giftId: gift.option.id,
              reservedBy: currentName,
              phone: currentPhone,
              additionalInfo: `Reserva via site: ${gift.furnitureName} - ${gift.option.name}`
            }),
          });

          if (!response.ok) return { success: false, gift: gift.option.name };
          return { success: true, gift: gift.option.name };
        } catch (error) {
          console.error(`Erro ao reservar ${gift.option.name}:`, error);
          return { success: false, gift: gift.option.name };
        }
      })
    );

    const successfulReservations = reservationResults.filter((result) => result.success).length;
    if (successfulReservations === 0) {
      alert("Não foi possível reservar nenhum dos itens selecionados. Eles podem já estar reservados.");
      return;
    }

    const successfulGifts = selectedGifts.filter((_, index) => reservationResults[index].success);
    const totalValue = successfulGifts.reduce((total, gift) => total + gift.option.estimatedValue, 0);
    const itemsText = successfulGifts
      .map((gift) => `• ${gift.furnitureName} - ${gift.option.name}\n  Valor: R$ ${gift.option.estimatedValue.toFixed(2).replace(".", ",")}`)
      .join("\n\n");

    let whatsappMessage = `Olá! Gostaria de reservar os seguintes presentes:\n\n${itemsText}\n\n💰 Valor total estimado: R$ ${totalValue.toFixed(2).replace(".", ",")}\n\nMeu nome: ${currentName}\nMeu telefone: ${currentPhone}\n\nPor favor, confirmem a reserva!`;

    if (successfulReservations < selectedGifts.length) {
      const failedGifts = selectedGifts.filter((_, index) => !reservationResults[index].success);
      whatsappMessage += `\n\n⚠️ Atenção: Os seguintes itens podem já estar reservados:\n${failedGifts.map((gift) => `• ${gift.option.name}`).join("\n")}`;
    }

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, "_blank");

    setSelectedGifts((prev) => prev.filter((_, index) => !reservationResults[index].success));
  };

  const handlePixAndReserve = () => {
    const pixUrl = process.env.NEXT_PUBLIC_PIX_URL;

    if (!pixUrl) {
      alert("Link do Pix não configurado. Defina NEXT_PUBLIC_PIX_URL no ambiente.");
      return;
    }

    window.open(pixUrl, "_blank");

    const shouldContinue = window.confirm(
      "Abrimos o Pix em outra aba. Depois de visualizar/pagar, clique em OK para continuar e enviar no WhatsApp."
    );

    if (!shouldContinue) return;
    handleReserveViaWhatsApp();
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
          <QuartoSVG
            onAddGift={handleAddGift}
            sharedSelectedGifts={selectedGifts}
            hideLocalList
          />
        </div>
      )}
      {selectedComodo === "Sala" && (
        <div className="w-full max-w-6xl bg-white border-4 border-[#3e503c] rounded-lg p-6">
          <h3 className="text-2xl font-serif italic text-[#3e503c] mb-6">
            Sala
          </h3>
          <LivingRoomSVG
            onAddGift={handleAddGift}
            sharedSelectedGifts={selectedGifts}
            hideLocalList
          />
        </div>
      )}
      {selectedComodo === "Cozinha" && (
        <div className="w-full max-w-6xl bg-white border-4 border-[#3e503c] rounded-lg p-6">
          <h3 className="text-2xl font-serif italic text-[#3e503c] mb-6">
            Cozinha
          </h3>
          <KitchenSVG
            onAddGift={handleAddGift}
            sharedSelectedGifts={selectedGifts}
            hideLocalList
          />
        </div>
      )}
      {selectedComodo === "Banheiro" && (
        <div className="w-full max-w-6xl bg-white border-4 border-[#3e503c] rounded-lg p-6">
          <h3 className="text-2xl font-serif italic text-[#3e503c] mb-6">
            Banheiro
          </h3>
          <BathroomSVG
            onAddGift={handleAddGift}
            sharedSelectedGifts={selectedGifts}
            hideLocalList
          />
        </div>
      )}

      <SharedGiftList
        selectedGifts={selectedGifts}
        onRemove={handleRemoveGift}
        onClear={() => setSelectedGifts([])}
        onReserve={handleReserveViaWhatsApp}
        onPixAndReserve={handlePixAndReserve}
        userName={name}
      />
    </section>
  );
}
