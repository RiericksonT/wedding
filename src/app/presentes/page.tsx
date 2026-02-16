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
import { GiftOption } from "@/types/giftOptionInterface";

// Configuração das fontes
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const getDynamicQuotaValue = (gift: SelectedGift) =>
  Number((gift.option.estimatedValue / (gift.option.quotasTotal || 10)).toFixed(2));

const getGiftReservationValue = (gift: SelectedGift) => {
  if (!gift.option.isQuotaEligible) return gift.option.estimatedValue;
  if (gift.quotaSelectionType === "full") return gift.option.estimatedValue;

  const quotaValue = gift.option.quotaValue || getDynamicQuotaValue(gift);
  const quotas = gift.quotasSelected || 1;
  return Number((quotaValue * quotas).toFixed(2));
};

const getGiftReservationLabel = (gift: SelectedGift) => {
  if (!gift.option.isQuotaEligible) {
    return `Valor: R$ ${gift.option.estimatedValue.toFixed(2).replace(".", ",")}`;
  }

  if (gift.quotaSelectionType === "full") {
    return `Presente inteiro: R$ ${gift.option.estimatedValue.toFixed(2).replace(".", ",")}`;
  }

  const quotaValue = gift.option.quotaValue || getDynamicQuotaValue(gift);
  const quotasTotal = gift.option.quotasTotal || 10;
  const quotasSelected = gift.quotasSelected || 1;
  return `${quotasSelected} cota(s) de R$ ${quotaValue.toFixed(2).replace(".", ",")} (${quotasTotal}x cotas)`;
};

export default function Presentes() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedComodo, setSelectedComodo] = useState("");
  const [selectedGifts, setSelectedGifts] = useState<SelectedGift[]>([]);
  const [showPixConfirmationModal, setShowPixConfirmationModal] = useState(false);
  const [isFinalizingPix, setIsFinalizingPix] = useState(false);
  const [showQuotaSelectionModal, setShowQuotaSelectionModal] = useState(false);
  const [pendingQuotaGift, setPendingQuotaGift] = useState<SelectedGift | null>(null);
  const [selectedQuotaCount, setSelectedQuotaCount] = useState(1);
  const [otherGifts, setOtherGifts] = useState<GiftOption[]>([]);
  const [loadingOtherGifts, setLoadingOtherGifts] = useState(false);

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

  useEffect(() => {
    if (selectedComodo !== "Outros") return;

    const loadOtherGifts = async () => {
      try {
        setLoadingOtherGifts(true);
        const response = await fetch("/api/gifts");
        if (!response.ok) throw new Error("Erro ao carregar presentes de outros");

        const allGifts: GiftOption[] = await response.json();
        const normalized = allGifts
          .filter((gift) => gift.category?.toLowerCase() === "outros")
          .map((gift) => ({
            ...gift,
            id: gift.id || `outros-${gift.name.toLowerCase().replace(/\s+/g, "-")}`,
            estimatedValue: gift.estimatedValue || 0,
            image: gift.image || "",
          }));

        setOtherGifts(normalized);
      } catch (error) {
        console.error("Erro ao carregar categoria Outros:", error);
        setOtherGifts([]);
      } finally {
        setLoadingOtherGifts(false);
      }
    };

    loadOtherGifts();
  }, [selectedComodo]);

  const comodos = [
    "Sala",
    "Cozinha",
    "Quarto Casal",
    "Banheiro",
    "Outros",
  ];

  const handleComodoClick = (comodo: string) => {
    setSelectedComodo(comodo);
    sessionStorage.setItem("comodoSelecionado", comodo);
  };

  const addOrUpdateSelectedGift = (nextGift: SelectedGift) => {
    setSelectedGifts((prev) => {
      const existingIndex = prev.findIndex(
        (currentGift) =>
          currentGift.furnitureId === nextGift.furnitureId &&
          currentGift.option.id === nextGift.option.id
      );

      if (existingIndex === -1) return [...prev, nextGift];

      const updated = [...prev];
      updated[existingIndex] = nextGift;
      return updated;
    });
  };

  const closeQuotaSelectionModal = () => {
    setShowQuotaSelectionModal(false);
    setPendingQuotaGift(null);
    setSelectedQuotaCount(1);
  };

  const handleAddGift = (gift: SelectedGift) => {
    if (!gift.option.isQuotaEligible) {
      addOrUpdateSelectedGift(gift);
      return;
    }

    setPendingQuotaGift(gift);
    setSelectedQuotaCount(1);
    setShowQuotaSelectionModal(true);
  };

  const handleSelectFullGift = () => {
    if (!pendingQuotaGift) return;
    const quotasRemaining = Math.max(1, pendingQuotaGift.option.quotasRemaining || pendingQuotaGift.option.quotasTotal || 10);

    addOrUpdateSelectedGift({
      ...pendingQuotaGift,
      quotaSelectionType: "full",
      quotasSelected: quotasRemaining,
    });
    closeQuotaSelectionModal();
  };

  const handleSelectQuotasGift = () => {
    if (!pendingQuotaGift) return;
    const quotasRemaining = Math.max(1, pendingQuotaGift.option.quotasRemaining || pendingQuotaGift.option.quotasTotal || 10);
    const quotasSelected = Math.min(Math.max(1, selectedQuotaCount), quotasRemaining);

    addOrUpdateSelectedGift({
      ...pendingQuotaGift,
      quotaSelectionType: "quotas",
      quotasSelected,
    });
    closeQuotaSelectionModal();
  };

  const handleRemoveGift = (furnitureId: string, giftId: string) => {
    setSelectedGifts((prev) =>
      prev.filter(
        (gift) => !(gift.furnitureId === furnitureId && gift.option.id === giftId)
      )
    );
  };

  const reserveSelectedGifts = async ({
    status,
    requirePhone,
    whatsappPrefix
  }: {
    status: "reserved" | "purchased";
    requirePhone: boolean;
    whatsappPrefix: string;
  }) => {
    if (selectedGifts.length === 0) {
      alert("Selecione pelo menos uma opção para reservar!");
      return { success: false };
    }

    let currentName = name?.trim() || "Convidado";
    let currentPhone = phone?.trim() || "";

    if (!name?.trim()) {
      const inputName = window.prompt("Digite seu nome para continuar:")?.trim();
      if (!inputName) return { success: false };
      currentName = inputName;
      setName(inputName);
      sessionStorage.setItem("name", inputName);
    }

    if (requirePhone && !currentPhone) {
      const inputPhone = window.prompt("Digite seu telefone para continuar:")?.trim();
      if (!inputPhone) return { success: false };
      currentPhone = inputPhone;
      setPhone(inputPhone);
      sessionStorage.setItem("phone", inputPhone);
    }

    const phoneForApi = currentPhone || "nao-informado";

    const reservationResults = await Promise.all(
      selectedGifts.map(async (gift) => {
        try {
          const response = await fetch('/api/gifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              giftId: gift.option.id,
              reservedBy: currentName,
              phone: phoneForApi,
              status,
              reserveWhole: gift.option.isQuotaEligible && gift.quotaSelectionType === "full",
              quotasToReserve: gift.option.isQuotaEligible
                ? (gift.quotaSelectionType === "full" ? undefined : (gift.quotasSelected || 1))
                : undefined,
              additionalInfo: `Reserva via site: ${gift.furnitureName} - ${gift.option.name} (${getGiftReservationLabel(gift)})`
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
      return { success: false };
    }

    const successfulGifts = selectedGifts.filter((_, index) => reservationResults[index].success);
    const totalValue = successfulGifts.reduce((total, gift) => total + getGiftReservationValue(gift), 0);
    const itemsText = successfulGifts
      .map((gift) => `• ${gift.furnitureName} - ${gift.option.name}\n  ${getGiftReservationLabel(gift)}`)
      .join("\n\n");

    let whatsappMessage = `${whatsappPrefix}\n\n${itemsText}\n\n💰 Valor total estimado: R$ ${totalValue.toFixed(2).replace(".", ",")}\n\nNome: ${currentName}`;
    if (currentPhone) {
      whatsappMessage += `\nTelefone: ${currentPhone}`;
    }
    whatsappMessage += "\n\nPor favor, confirmem.";

    if (successfulReservations < selectedGifts.length) {
      const failedGifts = selectedGifts.filter((_, index) => !reservationResults[index].success);
      whatsappMessage += `\n\n⚠️ Atenção: Os seguintes itens podem já estar reservados:\n${failedGifts.map((gift) => `• ${gift.option.name}`).join("\n")}`;
    }

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, "_blank");

    setSelectedGifts((prev) => prev.filter((_, index) => !reservationResults[index].success));
    return { success: true };
  };

  const handleReserveViaWhatsApp = async () => {
    await reserveSelectedGifts({
      status: "reserved",
      requirePhone: true,
      whatsappPrefix: "Olá! Gostaria de reservar os seguintes presentes:"
    });
  };

  const handlePixAndReserve = async () => {
    const pixUrl = process.env.NEXT_PUBLIC_PIX_URL;

    if (!pixUrl) {
      alert("Link do Pix não configurado. Defina NEXT_PUBLIC_PIX_URL no ambiente.");
      return;
    }

    window.open(pixUrl, "_blank", "noopener,noreferrer");
    setShowPixConfirmationModal(true);
  };

  const handleConfirmPixPayment = async () => {
    setIsFinalizingPix(true);
    const result = await reserveSelectedGifts({
      status: "purchased",
      requirePhone: false,
      whatsappPrefix: "Olá! Pagamento via Pix realizado. Itens comprados:"
    });
    if (result.success) {
      setShowPixConfirmationModal(false);
    }
    setIsFinalizingPix(false);
  };

  const pendingQuotasRemaining = pendingQuotaGift
    ? Math.max(1, pendingQuotaGift.option.quotasRemaining || pendingQuotaGift.option.quotasTotal || 10)
    : 1;

  const pendingQuotaValue = pendingQuotaGift
    ? (pendingQuotaGift.option.quotaValue || getDynamicQuotaValue(pendingQuotaGift))
    : 0;

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
      {selectedComodo === "Outros" && (
        <div className="w-full max-w-6xl bg-white border-4 border-[#3e503c] rounded-lg p-6">
          <h3 className="text-2xl font-serif italic text-[#3e503c] mb-2">
            Outros
          </h3>
          <p className="text-[#3e503c] text-sm font-sans mb-6">
            Presentes diferentes e divertidos, direto da planilha.
          </p>

          {loadingOtherGifts ? (
            <p className="text-[#3e503c] font-sans">Carregando presentes...</p>
          ) : otherGifts.length === 0 ? (
            <p className="text-[#3e503c] font-sans">Nenhum presente encontrado na categoria "outros".</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherGifts.map((option) => {
                const isReserved = option.status === "reserved" || option.status === "purchased";
                const quotaValue = option.quotaValue || Number((option.estimatedValue / (option.quotasTotal || 10)).toFixed(2));
                const quotasRemaining = option.quotasRemaining ?? option.quotasTotal ?? 10;

                return (
                  <div
                    key={option.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      isReserved
                        ? "border-gray-300 bg-gray-50"
                        : "border-[#d6d1c4] hover:border-[#3e503c]"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-[#2c3b2a] font-sans">
                        {option.name}
                      </h4>
                      {isReserved && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded font-sans">
                          Reservado
                        </span>
                      )}
                    </div>

                    <p className="text-[#3e503c] text-sm font-sans">
                      {option.description}
                    </p>

                    {option.isQuotaEligible && (
                      <p className="text-sm text-[#2c3b2a] mt-2 font-sans font-semibold bg-[#eef4ed] border border-[#c9d8c6] rounded px-2 py-1 inline-block">
                        {isReserved
                          ? "Cotas esgotadas"
                          : `${quotasRemaining} cota(s) restantes • ${option.quotasTotal || 10}x de R$ ${quotaValue.toFixed(2).replace(".", ",")}`}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-xl font-bold text-[#3e503c] font-sans">
                        R$ {option.estimatedValue.toFixed(2).replace(".", ",")}
                      </span>

                      <button
                        onClick={() =>
                          !isReserved &&
                          handleAddGift({
                            furnitureId: "OutrosCategoria",
                            furnitureName: "Outros",
                            option,
                          })
                        }
                        disabled={isReserved}
                        className={`px-3 py-1 text-sm rounded transition-colors font-sans ${
                          isReserved
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-[#3e503c] text-white hover:bg-[#2c3b2a]"
                        }`}
                      >
                        {isReserved ? "Indisponível" : "Escolher este"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

      {showPixConfirmationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
            <h3 className="text-2xl font-serif text-[#3e503c] mb-3">
              Confirmar pagamento Pix
            </h3>
            <p className="text-[#3e503c] font-sans mb-6">
              Depois de finalizar o Pix, clique em <span className="font-semibold">Já fiz o Pix</span>.
              Vamos salvar na planilha e abrir o WhatsApp com a mensagem pronta.
            </p>

            <div className="flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => setShowPixConfirmationModal(false)}
                disabled={isFinalizingPix}
                className="px-4 py-2 rounded-lg border border-[#3e503c] text-[#3e503c] hover:bg-[#f3efe9] transition-colors font-sans disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPixPayment}
                disabled={isFinalizingPix}
                className="px-5 py-2 rounded-lg bg-[#3e503c] text-white hover:bg-[#2c3b2a] transition-colors font-sans disabled:opacity-60"
              >
                {isFinalizingPix ? "Salvando..." : "Já fiz o Pix"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuotaSelectionModal && pendingQuotaGift && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
            <h3 className="text-2xl font-serif text-[#3e503c] mb-2">
              Como você quer presentear?
            </h3>
            <p className="text-[#3e503c] font-sans mb-1">
              <span className="font-semibold">{pendingQuotaGift.option.name}</span>
            </p>
            <p className="text-sm text-[#3e503c] font-sans mb-6">
              <span className="text-base font-semibold text-[#2c3b2a] bg-[#eef4ed] border border-[#c9d8c6] rounded px-2 py-1 inline-block">
                {pendingQuotasRemaining} cotas disponíveis • R$ {pendingQuotaValue.toFixed(2).replace(".", ",")} por cota
              </span>
            </p>

            <div className="space-y-4">
              <button
                onClick={handleSelectFullGift}
                className="w-full px-4 py-3 rounded-lg bg-[#3e503c] text-white hover:bg-[#2c3b2a] transition-colors font-sans font-semibold"
              >
                Presentear tudo
              </button>

              <div className="border border-[#d6d1c4] rounded-lg p-4">
                <label className="block text-sm text-[#3e503c] font-sans mb-2">
                  Escolher quantidade de cotas
                </label>
                <select
                  value={selectedQuotaCount}
                  onChange={(e) => setSelectedQuotaCount(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-lg border border-[#d6d1c4] text-[#3e503c] font-sans"
                >
                  {Array.from({ length: pendingQuotasRemaining }, (_, index) => {
                    const count = index + 1;
                    const total = Number((pendingQuotaValue * count).toFixed(2));
                    return (
                      <option key={count} value={count}>
                        {count}x cota - R$ {total.toFixed(2).replace(".", ",")}
                      </option>
                    );
                  })}
                </select>
                <button
                  onClick={handleSelectQuotasGift}
                  className="w-full mt-3 px-4 py-2 rounded-lg border border-[#3e503c] text-[#3e503c] hover:bg-[#f3efe9] transition-colors font-sans font-semibold"
                >
                  Adicionar cotas
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={closeQuotaSelectionModal}
                className="px-4 py-2 rounded-lg text-[#3e503c] hover:bg-[#f3efe9] transition-colors font-sans"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
