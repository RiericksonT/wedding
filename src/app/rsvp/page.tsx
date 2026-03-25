"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface RSVPGuest {
  name: string;
  maxCompanions: number;
}

export default function RSVPPage() {
  const router = useRouter();
  const [guests, setGuests] = useState<RSVPGuest[]>([]);
  const [search, setSearch] = useState("");
  const [selectedGuestName, setSelectedGuestName] = useState("");
  const [companions, setCompanions] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingGuests, setIsLoadingGuests] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const loadGuests = async () => {
      try {
        setIsLoadingGuests(true);
        const response = await fetch("/api/rsvp");
        if (!response.ok) throw new Error("Erro ao carregar convidados");

        const data = await response.json();
        const nextGuests = (data.guests || []) as RSVPGuest[];
        setGuests(nextGuests);
      } catch (error) {
        console.error("Erro ao carregar convidados do RSVP:", error);
        setFeedback("Não foi possível carregar a lista de convidados.");
      } finally {
        setIsLoadingGuests(false);
      }
    };

    loadGuests();
  }, []);

  const filteredGuests = guests.filter((guest) =>
    guest.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const selectedGuest = guests.find((guest) => guest.name === selectedGuestName);
  const maxCompanions = selectedGuest?.maxCompanions ?? 0;

  useEffect(() => {
    const trimmedSearch = search.trim().toLowerCase();
    if (!trimmedSearch) return;

    const selectedStillMatches = selectedGuestName
      ? selectedGuestName.toLowerCase().includes(trimmedSearch)
      : false;

    if (!selectedStillMatches) {
      setSelectedGuestName("");
      setCompanions(0);
    }

    if (filteredGuests.length === 1) {
      const onlyGuest = filteredGuests[0];
      setSelectedGuestName(onlyGuest.name);
      setCompanions((prev) => Math.min(prev, onlyGuest.maxCompanions));
    }
  }, [search, filteredGuests, selectedGuestName]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedGuestName) {
      setFeedback("Selecione seu nome na lista.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: selectedGuestName,
          companions,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setFeedback(data.error || "Não foi possível salvar sua confirmação.");
        return;
      }

      setFeedback("Confirmação enviada com sucesso. Obrigado!");
      setSearch("");
      setSelectedGuestName("");
      setCompanions(0);
    } catch (error) {
      console.error("Erro ao enviar RSVP:", error);
      setFeedback("Erro ao enviar RSVP. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full min-h-screen bg-[#f9f6f2] px-6 py-12 md:px-12 font-sans">
      <div className="max-w-2xl mx-auto bg-white border-2 border-[#3e503c] rounded-xl p-6 md:p-8 font-sans">
        <button
          onClick={() => router.back()}
          className="text-[#3e503c] font-semibold mb-4"
        >
          ← Voltar
        </button>

        <h1 className="text-4xl text-[#3e503c] mb-3 font-semibold">RSVP</h1>
        <p className="text-[#3e503c] mb-6">
          Confirme sua presença no casamento.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#3e503c] mb-1">
              Buscar convidado
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[#d6d1c4] rounded-lg px-3 py-2"
              placeholder="Digite para buscar seu nome"
              disabled={isLoadingGuests}
            />
            {search.trim() && (
              <p className="text-xs text-[#3e503c] mt-1">
                {filteredGuests.length} resultado(s)
              </p>
            )}
            {search.trim() && filteredGuests.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto border border-[#d6d1c4] rounded-lg">
                {filteredGuests.slice(0, 20).map((guest) => (
                  <button
                    key={guest.name}
                    type="button"
                    onClick={() => {
                      setSelectedGuestName(guest.name);
                      setCompanions((prev) => Math.min(prev, guest.maxCompanions));
                    }}
                    className={`w-full text-left px-3 py-2 text-sm border-b border-[#eee] last:border-b-0 ${
                      selectedGuestName === guest.name
                        ? "bg-[#eef4ed] text-[#2c3b2a] font-semibold"
                        : "hover:bg-[#f7f7f7] text-[#3e503c]"
                    }`}
                  >
                    {guest.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3e503c] mb-1">
              Nome na lista
            </label>
            <select
              value={selectedGuestName}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedGuestName(value);
                const selected = guests.find((guest) => guest.name === value);
                if (!selected) {
                  setCompanions(0);
                  return;
                }
                setCompanions((prev) => Math.min(prev, selected.maxCompanions));
              }}
              className="w-full border border-[#d6d1c4] rounded-lg px-3 py-2"
              required
              disabled={isLoadingGuests}
            >
              <option value="">Selecione seu nome</option>
              {filteredGuests.map((guest) => (
                <option key={guest.name} value={guest.name}>
                  {guest.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3e503c] mb-1">
              Acompanhantes
            </label>
            <select
              value={companions}
              onChange={(e) => setCompanions(Number(e.target.value))}
              className="w-full border border-[#d6d1c4] rounded-lg px-3 py-2"
              disabled={!selectedGuestName || isLoadingGuests}
            >
              {Array.from({ length: maxCompanions + 1 }, (_, index) => index).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {selectedGuestName && (
              <p className="text-xs text-[#3e503c] mt-1">
                Máximo permitido para você: {maxCompanions}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoadingGuests}
            className="w-full bg-[#3e503c] text-white rounded-lg py-3 font-semibold hover:bg-[#2c3b2a] disabled:opacity-60"
          >
            {isLoadingGuests ? "Carregando convidados..." : isSubmitting ? "Enviando..." : "Confirmar Presença"}
          </button>
        </form>

        {feedback && (
          <p className="mt-4 text-sm text-[#3e503c] font-semibold">{feedback}</p>
        )}
      </div>
    </section>
  );
}
