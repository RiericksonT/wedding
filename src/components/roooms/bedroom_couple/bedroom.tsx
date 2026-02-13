"use client";

import { useState, useEffect } from "react";
import Bedroom from "@/assets/bedroom.svg";
import { furnitureItems } from "@/types/furnitureItensRecord";
import { GiftOption } from "@/types/giftOptionInterface";
import { SelectedGift } from "@/types/selectedGiftInterface";

// Mapeamento entre IDs do SVG e categorias do Google Sheets
const svgToCategoryMap: Record<string, string> = {
  Bed: "cama",
  Wardrobe: "guarda-roupa",
  Nigthstand: "criado-mudo",
  Decorations: "decoração",
  Rug: "tapete",
  Window: "persiana",
  TV: "televisão",
  Eletronics: "eletrônicos",
  Chair: "poltrona",
  Desk: "escrivaninha",
  Bookshelf: "estante-livros",
  Shelving: "estante",
};

interface FurnitureData {
  name: string;
  description: string;
  options: GiftOption[];
}

interface RoomGiftSelectionProps {
  onAddGift?: (gift: SelectedGift) => void;
  sharedSelectedGifts?: SelectedGift[];
  hideLocalList?: boolean;
}

export default function QuartoSVG({
  onAddGift,
  sharedSelectedGifts = [],
  hideLocalList = false
}: RoomGiftSelectionProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);
  const [selectedGifts, setSelectedGifts] = useState<SelectedGift[]>([]);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [furnitureOptions, setFurnitureOptions] = useState<Record<string, FurnitureData>>({});
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");

  // Buscar dados do Google Sheets quando o componente montar
  useEffect(() => {
    fetchFurnitureData();
    
    // Recuperar dados do usuário do sessionStorage
    const storedName = sessionStorage.getItem("name") || "";
    const storedPhone = sessionStorage.getItem("phone") || "";
    setUserName(storedName);
    setUserPhone(storedPhone);
  }, []);

  const fetchFurnitureData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gifts');
      if (!response.ok) throw new Error('Erro ao buscar dados');
      
      const allGifts: GiftOption[] = await response.json();
      
      // Organizar dados por categoria
      const organizedData: Record<string, FurnitureData> = {};
      
      Object.entries(svgToCategoryMap).forEach(([svgId, category]) => {
        const categoryGifts = allGifts.filter(gift => 
          gift.category?.toLowerCase() === category.toLowerCase()
        );
        
        if (categoryGifts.length > 0) {
          // Buscar o primeiro item da categoria para pegar descrição geral
          const firstGift = categoryGifts[0];
          organizedData[svgId] = {
            name: furnitureItems[svgId] || category,
            description: getCategoryDescription(category),
            options: categoryGifts.map(gift => ({
              ...gift,
              // Garantir que o ID seja único
              id: gift.id || `${category}-${gift.name.toLowerCase().replace(/\s+/g, '-')}`,
              estimatedValue: gift.estimatedValue || 0,
              image: gift.image || "",
              storeLink: gift.storeLink,
            }))
          };
        }
      });
      
      setFurnitureOptions(organizedData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      // Usar dados de fallback se a API falhar
      setFurnitureOptions(getFallbackData());
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDescription = (category: string): string => {
    const descriptions: Record<string, string> = {
      "cama": "Para nosso descanso e conforto",
      "guarda-roupa": "Para organizar nossas roupas",
      "Criado-mudo": "Para nossos momentos de leitura",
      "decoração": "Toques especiais para nosso cantinho",
      "tapete": "Conforto para nossos pés",
      "persiana": "Privacidade e controle de luz",
      "televisão": "Para nosso entretenimento",
      "eletrônicos": "Tecnologia para nosso conforto",
      "poltrona": "Para relaxar e ler",
      "escrivaninha": "Espaço para trabalho",
      "estante-livros": "Para organizar nossos livros",
      "estante": "Para organização e armazenamento",
    };
    
    return descriptions[category.toLowerCase()] || "Item especial para nosso lar";
  };

  const getFallbackData = (): Record<string, FurnitureData> => {
    // Dados de fallback caso a API falhe
    return {
      Bed: {
        name: "Cama",
        description: "Para nosso descanso e conforto",
        options: [
          {
            id: "bed-1",
            name: "Cama Queen Size Casal",
            description: "Cama em madeira maciça com cabeceira estofada",
            estimatedValue: 1899.90,
            image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            storeLink: "https://www.mobly.com.br/cama-queen-size-casal-madeira-macica"
          },
        ]
      },
      // Adicione outros dados de fallback conforme necessário
    };
  };

  const handleMouseOver = (e: React.MouseEvent, itemId: string) => {
    if (!itemId || itemId === "Else") return;
    setHoveredItem(itemId);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseOut = () => {
    setHoveredItem(null);
  };

  const handleFurnitureClick = (itemId: string) => {
    if (!itemId || itemId === "Else") return;
    
    // Verificar se há opções disponíveis para esta categoria
    if (furnitureOptions[itemId] && furnitureOptions[itemId].options.length > 0) {
      setSelectedFurniture(itemId);
    } else {
      alert(`Desculpe, não há opções disponíveis para ${furnitureItems[itemId]} no momento.`);
    }
  };

  const handleSelectOption = (option: GiftOption) => {
    if (!selectedFurniture) return;
    
    const furnitureName = furnitureItems[selectedFurniture];
    const selectedGift: SelectedGift = {
      furnitureId: selectedFurniture,
      furnitureName,
      option
    };
    const giftsToCheck = sharedSelectedGifts.length > 0 ? sharedSelectedGifts : selectedGifts;
    
    // Verifica se já existe esta opção selecionada
    const existingIndex = giftsToCheck.findIndex(
      gift => gift.furnitureId === selectedFurniture && gift.option.id === option.id
    );
    
    if (existingIndex === -1) {
      // Adiciona nova opção
      setSelectedGifts(prev => [
        ...prev,
        selectedGift
      ]);
      onAddGift?.(selectedGift);
    }
    
    setSelectedFurniture(null); // Fecha o modal
  };

  const handleRemoveGift = (giftId: string) => {
    setSelectedGifts(prev => prev.filter(gift => gift.option.id !== giftId));
  };

  const handleReserveViaWhatsApp = async () => {
    if (selectedGifts.length === 0) {
      alert("Selecione pelo menos uma opção para reservar!");
      return;
    }

    // Verificar se temos dados do usuário
    if (!userName || !userPhone) {
      setShowReservationModal(true);
      return;
    }

    // Primeiro, tentar reservar no Google Sheets
    const reservationResults = await Promise.all(
      selectedGifts.map(async (gift) => {
        try {
          const response = await fetch('/api/gifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              giftId: gift.option.id,
              reservedBy: userName,
              phone: userPhone,
              additionalInfo: `Reserva via site: ${gift.furnitureName} - ${gift.option.name}`
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            console.error(`Erro ao reservar ${gift.option.name}:`, error);
            return { success: false, gift: gift.option.name };
          }

          return { success: true, gift: gift.option.name };
        } catch (error) {
          console.error(`Erro ao reservar ${gift.option.name}:`, error);
          return { success: false, gift: gift.option.name };
        }
      })
    );

    // Verificar quantas reservas foram bem-sucedidas
    const successfulReservations = reservationResults.filter(r => r.success).length;
    
    if (successfulReservations > 0) {
      // Preparar mensagem para WhatsApp apenas com os itens reservados com sucesso
      const successfulGifts = selectedGifts.filter((_, index) => reservationResults[index].success);
      
      const itemsText = successfulGifts.map(gift => {
        return `• ${gift.furnitureName} - ${gift.option.name}\n  Valor: R$ ${gift.option.estimatedValue.toFixed(2).replace('.', ',')}`;
      }).join('\n\n');
      
      const totalValue = successfulGifts.reduce((total, gift) => total + gift.option.estimatedValue, 0);
      
      let whatsappMessage = `Olá! Gostaria de reservar os seguintes presentes:\n\n${itemsText}\n\n💰 Valor total estimado: R$ ${totalValue.toFixed(2).replace('.', ',')}\n\nMeu nome: ${userName}\nMeu telefone: ${userPhone}`;
      
      if (successfulReservations < selectedGifts.length) {
        const failedGifts = selectedGifts.filter((_, index) => !reservationResults[index].success);
        whatsappMessage += `\n\n⚠️ Atenção: Os seguintes itens podem já estar reservados:\n${failedGifts.map(g => `• ${g.option.name}`).join('\n')}`;
      }
      
      whatsappMessage += `\n\nPor favor, confirmem a reserva!`;
      
      const encodedMessage = encodeURIComponent(whatsappMessage);
      
      // Substitua pelo seu número de WhatsApp
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999";
      window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
      
      // Atualizar dados após reserva
      fetchFurnitureData();
      
      // Limpar lista apenas dos itens reservados com sucesso
      setSelectedGifts(prev => prev.filter((_, index) => !reservationResults[index].success));
    } else {
      alert("Não foi possível reservar nenhum dos itens selecionados. Eles podem já ter sido reservados por outra pessoa.");
    }
  };

  const handleSaveUserInfo = (name: string, phone: string) => {
    setUserName(name);
    setUserPhone(phone);
    
    // Salvar no sessionStorage
    sessionStorage.setItem("name", name);
    sessionStorage.setItem("phone", phone);
    
    setShowReservationModal(false);
    
    // Continuar com a reserva
    setTimeout(() => handleReserveViaWhatsApp(), 100);
  };

  const currentFurniture = selectedFurniture ? furnitureOptions[selectedFurniture] : null;

  return (
    <div className="relative">
      {/* Tooltip flutuante */}
      {hoveredItem && furnitureOptions[hoveredItem] && (
        <div 
          className="fixed z-20 px-4 py-2 bg-[#f3efe9] border-2 border-[#3e503c] rounded-lg shadow-lg pointer-events-none animate-fadeIn"
          style={{
            left: `${tooltipPosition.x + 500}px`,
            top: `${tooltipPosition.y - 10}px`,
          }}
        >
          <p className="text-[#3e503c] font-semibold font-sans text-sm">
            {furnitureItems[hoveredItem]}
          </p>
          <p className="text-[#2c3b2a] text-xs font-sans">
            {furnitureOptions[hoveredItem].description}
          </p>
          <p className="text-xs text-[#3e503c] italic mt-1 font-sans">
            Clique para ver opções
          </p>
        </div>
      )}

      {/* SVG Container */}
      <div className="relative w-full flex justify-center mb-8">
        <div className="relative w-full max-w-3xl">
          <Bedroom
            className="w-full h-auto bedroom-svg"
            onMouseOver={(e: React.MouseEvent) => {
              const target = e.target as HTMLElement;
              const g = target.closest("g");
              const id = g?.id || "";
              handleMouseOver(e, id);
            }}
            onMouseOut={handleMouseOut}
            onClick={(e: React.MouseEvent) => {
              const target = e.target as HTMLElement;
              const g = target.closest("g");
              const id = g?.id || "";
              handleFurnitureClick(id);
            }}
          />
        </div>
      </div>

      {/* Instruções */}
      <div className="text-center mb-8 p-4 bg-[#f3efe9] rounded-lg border border-[#d6d1c4]">
        <p className="text-[#3e503c] font-sans mb-2">
          <span className="font-semibold">Como presentear:</span> Passe o mouse sobre os móveis e clique para ver opções
        </p>
        <p className="text-[#3e503c] text-sm font-sans">
          Escolha uma opção de presente e adicione à sua lista de reserva
        </p>
        {loading && (
          <p className="text-sm text-[#3e503c] mt-2 font-sans">
            Carregando opções disponíveis...
          </p>
        )}
      </div>

      {/* Modal de Opções */}
      {selectedFurniture && currentFurniture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-serif text-[#3e503c]">
                  {currentFurniture.name}
                </h3>
                <p className="text-[#3e503c] font-sans mt-1">
                  {currentFurniture.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedFurniture(null)}
                className="text-[#3e503c] hover:text-[#2c3b2a] text-2xl"
              >
                ×
              </button>
            </div>

            {currentFurniture.options.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#3e503c] font-sans">
                  Todas as opções desta categoria já foram reservadas.
                </p>
                <p className="text-sm text-[#3e503c] mt-2 font-sans">
                  Por favor, escolha outro item para presentear.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentFurniture.options.map((option) => {
                  const isReserved = option.status === 'reserved' || option.status === 'purchased';
                  
                  return (
                    <div
                      key={option.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        isReserved 
                          ? 'border-gray-300 bg-gray-50' 
                          : 'border-[#d6d1c4] hover:border-[#3e503c]'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Imagem do produto */}
                        <div className="md:w-1/3">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            {option.image ? (
                              <img 
                                src={option.image} 
                                alt={option.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <div className="text-center p-4">
                                  <div className="w-full h-32 bg-gray-200 rounded mb-2"></div>
                                  <span className="text-xs">{option.name}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Detalhes do produto */}
                        <div className="md:w-2/3">
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-semibold text-[#2c3b2a] font-sans">
                              {option.name}
                            </h4>
                            {isReserved && (
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded font-sans">
                                Reservado
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[#3e503c] text-sm mt-2 font-sans">
                            {option.description}
                          </p>
                          
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-xl font-bold text-[#3e503c] font-sans">
                              R$ {option.estimatedValue.toFixed(2).replace('.', ',')}
                            </span>
                            
                            <div className="flex gap-2">
                              {/* Botão para ver na loja (se tiver link) */}
                              {option.storeLink && !isReserved && (
                                <a
                                  href={option.storeLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 text-sm border border-[#3e503c] text-[#3e503c] rounded hover:bg-[#f3efe9] transition-colors font-sans"
                                >
                                  Ver na loja
                                </a>
                              )}
                              
                              {/* Botão para adicionar à lista */}
                              <button
                                onClick={() => !isReserved && handleSelectOption(option)}
                                disabled={isReserved}
                                className={`px-3 py-1 text-sm rounded transition-colors font-sans ${
                                  isReserved
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#3e503c] text-white hover:bg-[#2c3b2a]'
                                }`}
                              >
                                {isReserved ? 'Indisponível' : 'Escolher este'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para dados do usuário */}
      {!hideLocalList && showReservationModal && (
        <UserInfoModal
          userName={userName}
          userPhone={userPhone}
          onClose={() => setShowReservationModal(false)}
          onSave={handleSaveUserInfo}
        />
      )}

      {/* Lista de Presentes Selecionados */}
      {!hideLocalList && (
        <GiftList 
          selectedGifts={selectedGifts}
          onRemove={handleRemoveGift}
          onReserve={handleReserveViaWhatsApp}
          userName={userName}
        />
      )}

      {/* CSS DO SVG */}
      <style jsx global>{`
        .bedroom-svg {
          position: relative;
          z-index: 1;
        }
        
        .bedroom-svg g {
          opacity: 1;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .bedroom-svg g:hover {
          filter: drop-shadow(0 0 12px rgba(62, 80, 60, 0.4)) 
                  brightness(1.05);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

// Componente para a lista de presentes
function GiftList({ 
  selectedGifts, 
  onRemove, 
  onReserve,
  userName 
}: { 
  selectedGifts: SelectedGift[];
  onRemove: (id: string) => void;
  onReserve: () => void;
  userName?: string;
}) {
  if (selectedGifts.length === 0) {
    return (
      <div className="text-center py-8 text-[#3e503c]">
        <div className="mb-4 text-4xl">🎁</div>
        <p className="text-lg font-sans mb-2">Sua lista de reserva está vazia</p>
        <p className="text-sm text-[#3e503c] font-sans">
          Clique nos móveis para ver opções e adicionar presentes
        </p>
      </div>
    );
  }

  const totalValue = selectedGifts.reduce((total, gift) => total + gift.option.estimatedValue, 0);

  return (
    <div className="mt-8 w-full max-w-5xl bg-[#f9f6f2] border-2 border-[#3e503c] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-2xl font-serif italic text-[#3e503c]">
            Sua Lista de Reserva 🎁
          </h4>
          <p className="text-[#3e503c] text-sm font-sans mt-1">
            {selectedGifts.length} {selectedGifts.length === 1 ? 'item selecionado' : 'itens selecionados'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => selectedGifts.forEach(g => onRemove(g.option.id))}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-sans"
          >
            Limpar tudo
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {selectedGifts.map((gift) => (
          <div
            key={gift.option.id}
            className="border border-[#d6d1c4] rounded-lg p-4 bg-white flex justify-between items-start"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-[#3e503c]"></div>
                <div>
                  <p className="font-semibold text-[#2c3b2a] font-sans">
                    {gift.furnitureName}
                  </p>
                  <p className="text-sm text-[#3e503c] font-sans">
                    {gift.option.name}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-[#3e503c] italic font-sans">
                {gift.option.description}
              </p>
              
              <div className="flex items-center gap-4 mt-3">
                <span className="font-semibold text-[#3e503c] font-sans">
                  R$ {gift.option.estimatedValue.toFixed(2).replace('.', ',')}
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
              onClick={() => onRemove(gift.option.id)}
              className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors font-sans"
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      {/* Resumo e botão de reserva */}
      <div className="border-t border-[#d6d1c4] pt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <p className="text-lg font-semibold text-[#3e503c] font-sans">
              Resumo da sua escolha:
            </p>
            <p className="text-[#3e503c] font-sans">
              Valor total estimado: <span className="font-bold text-xl">R$ {
                totalValue.toFixed(2).replace('.', ',')
              }</span>
            </p>
          </div>
          
          <button
            onClick={onReserve}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold font-sans flex items-center gap-2"
          >
            <span>📱</span>
            {userName ? 'Reservar via WhatsApp' : 'Completar Reserva'}
          </button>
        </div>
        
        <p className="text-sm text-[#3e503c] text-center font-sans">
          {userName 
            ? 'Sua reserva será registrada e enviaremos um WhatsApp para confirmação'
            : 'Precisaremos do seu nome e telefone para finalizar a reserva'
          }
        </p>
      </div>
    </div>
  );
}

// Componente para o modal de dados do usuário
interface UserInfoModalProps {
  userName: string;
  userPhone: string;
  onClose: () => void;
  onSave: (name: string, phone: string) => void;
}

function UserInfoModal({ userName, userPhone, onClose, onSave }: UserInfoModalProps) {
  const [name, setName] = useState(userName);
  const [phone, setPhone] = useState(userPhone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone) {
      onSave(name, phone);
    } else {
      alert("Por favor, preencha seu nome e telefone.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-serif text-[#3e503c]">
            Seus dados para reserva
          </h3>
          <button
            onClick={onClose}
            className="text-[#3e503c] hover:text-[#2c3b2a] text-2xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#3e503c] mb-1 font-sans">
              Nome completo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-[#d6d1c4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e503c] font-sans"
              placeholder="Seu nome completo"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#3e503c] mb-1 font-sans">
              WhatsApp *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-[#d6d1c4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e503c] font-sans"
              placeholder="(11) 99999-9999"
            />
            <p className="text-xs text-gray-500 mt-1 font-sans">
              Usaremos para confirmar sua reserva
            </p>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#d6d1c4] text-[#3e503c] rounded-lg hover:bg-[#f9f6f2] transition-colors font-sans"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#3e503c] text-white rounded-lg hover:bg-[#2c3b2a] transition-colors font-sans"
            >
              Salvar e Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
