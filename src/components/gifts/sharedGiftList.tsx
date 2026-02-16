"use client";

import { SelectedGift } from "@/types/selectedGiftInterface";

interface SharedGiftListProps {
  selectedGifts: SelectedGift[];
  onRemove: (furnitureId: string, giftId: string) => void;
  onClear: () => void;
  onReserve: () => void;
  onPixAndReserve?: () => void;
  userName?: string;
}

export default function SharedGiftList({
  selectedGifts,
  onRemove,
  onClear,
  onReserve,
  onPixAndReserve,
  userName
}: SharedGiftListProps) {
  if (selectedGifts.length === 0) {
    return (
      <div className="w-full max-w-5xl text-center py-8 text-[#3e503c]">
        <div className="mb-4 text-4xl">🎁</div>
        <p className="text-lg font-sans mb-2">Sua lista de reserva está vazia</p>
        <p className="text-sm text-[#3e503c] font-sans">
          Clique nos itens para ver opções e adicionar presentes
        </p>
      </div>
    );
  }

  const getReservationValue = (gift: SelectedGift) => {
    if (!gift.option.isQuotaEligible) return gift.option.estimatedValue;
    if (gift.quotaSelectionType === "full") return gift.option.estimatedValue;

    const quotaValue = gift.option.quotaValue || Number((gift.option.estimatedValue / (gift.option.quotasTotal || 10)).toFixed(2));
    return Number((quotaValue * (gift.quotasSelected || 1)).toFixed(2));
  };

  const totalValue = selectedGifts.reduce((total, gift) => total + getReservationValue(gift), 0);

  return (
    <div className="mt-8 w-full max-w-5xl bg-[#f9f6f2] border-2 border-[#3e503c] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-2xl font-serif italic text-[#3e503c]">
            Sua Lista de Reserva 🎁
          </h4>
          <p className="text-[#3e503c] text-sm font-sans mt-1">
            {selectedGifts.length} {selectedGifts.length === 1 ? "item selecionado" : "itens selecionados"}
          </p>
        </div>

        <button
          onClick={onClear}
          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-sans"
        >
          Limpar tudo
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {selectedGifts.map((gift) => (
          <div
            key={`${gift.furnitureId}-${gift.option.id}`}
            className="border border-[#d6d1c4] rounded-lg p-4 bg-white flex justify-between items-start"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-[#3e503c]"></div>
                <div>
                  <p className="font-semibold text-[#2c3b2a] font-sans">
                    {gift.option.name}
                  </p>
                  <p className="text-sm text-[#3e503c] font-sans">
                    {gift.furnitureName}
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#3e503c] italic font-sans">
                {gift.option.description}
              </p>
              {gift.option.isQuotaEligible && (
                <p className="text-xs text-[#3e503c] mt-1 font-sans">
                  {gift.option.quotasRemaining !== undefined
                    ? `${gift.option.quotasRemaining} cotas restantes`
                    : "Presente por cotas"}
                </p>
              )}

              <div className="flex items-center gap-4 mt-3">
                <span className="font-semibold text-[#3e503c] font-sans">
                  {gift.option.isQuotaEligible
                    ? gift.quotaSelectionType === "full"
                      ? `Presente inteiro: R$ ${gift.option.estimatedValue.toFixed(2).replace(".", ",")}`
                      : `${gift.quotasSelected || 1} cota(s): R$ ${getReservationValue(gift).toFixed(2).replace(".", ",")}`
                    : `R$ ${gift.option.estimatedValue.toFixed(2).replace(".", ",")}`}
                </span>

                {gift.option.storeLink && (
                  <a
                    href={gift.option.storeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline font-sans"
                  >
                    Ver na loja →
                  </a>
                )}
              </div>
            </div>

            <button
              onClick={() => onRemove(gift.furnitureId, gift.option.id)}
              className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors font-sans"
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-[#d6d1c4] pt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <p className="text-lg font-semibold text-[#3e503c] font-sans">
              Resumo da sua escolha:
            </p>
            <p className="text-[#3e503c] font-sans">
              Valor total estimado: <span className="font-bold text-xl">R$ {totalValue.toFixed(2).replace(".", ",")}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {onPixAndReserve && (
              <button
                onClick={onPixAndReserve}
                className="px-6 py-3 bg-[#3e503c] text-white rounded-lg hover:bg-[#2c3b2a] transition-colors text-lg font-semibold font-sans flex items-center gap-2"
              >
                <span>💳</span>
                Ver Pix e Continuar
              </button>
            )}
            <button
              onClick={onReserve}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold font-sans flex items-center gap-2"
            >
              <span>📱</span>
              {userName ? "Reservar via WhatsApp" : "Completar Reserva"}
            </button>
          </div>
        </div>

        <p className="text-sm text-[#3e503c] text-center font-sans">
          {userName
            ? "Sua reserva será registrada e enviaremos um WhatsApp para confirmação"
            : "Precisaremos do seu nome e telefone para finalizar a reserva"}
        </p>
      </div>
    </div>
  );
}
