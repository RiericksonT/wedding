"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface ReservedGift {
  id: string;
  name?: string;
  success: boolean;
}

interface ConfirmResult {
  success: boolean;
  guestName?: string;
  guestPhone?: string;
  paymentId?: string;
  gifts?: ReservedGift[];
  error?: string;
}

function SucessoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mpStatus = searchParams.get("status") || searchParams.get("collection_status");
  const externalReference = searchParams.get("external_reference");
  const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id");

  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">("loading");
  const [result, setResult] = useState<ConfirmResult | null>(null);
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;

    if (!externalReference || (mpStatus !== "approved" && mpStatus !== "pending")) {
      setStatus("error");
      setResult({ success: false, error: "Pagamento não aprovado ou dados ausentes." });
      return;
    }

    const params = new URLSearchParams({
      status: mpStatus,
      external_reference: externalReference,
      ...(paymentId ? { payment_id: paymentId } : {}),
    });

    fetch(`/api/checkout?${params.toString()}`)
      .then((res) => res.json())
      .then((data: ConfirmResult) => {
        if (data.success) {
          setResult(data);
          setStatus(mpStatus === "pending" ? "pending" : "success");
          sessionStorage.removeItem("selectedGifts");
        } else {
          setResult(data);
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [mpStatus, externalReference, paymentId]);

  const handleOpenWhatsApp = () => {
    if (!result) return;
    const successfulGifts = (result.gifts || []).filter((g) => g.success);
    const itemsText = successfulGifts.map((g) => `• ${g.name || g.id}`).join("\n");

    const message =
      `Oi, Gabriela e Kaique! 🎊\n\nAcabei de pagar pelo Mercado Pago! Presente(s) enviado(s) com muito carinho:\n\n` +
      `${itemsText}\n\n` +
      `Nome: ${result.guestName}\n` +
      (result.guestPhone && result.guestPhone !== "nao-informado"
        ? `Telefone: ${result.guestPhone}\n`
        : "") +
      `\nMuito obrigado(a) e que o casamento de vocês seja lindo! 💍`;

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999";
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <section
      className="w-full min-h-screen flex flex-col items-center justify-center bg-[#f9f6f2] px-6 py-16"
      style={{ fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif' }}
    >
      {status === "loading" && (
        <div className="text-center">
          <div className="text-5xl mb-4 animate-spin">⏳</div>
          <p className="text-[#3e503c] text-xl font-sans">Confirmando seu pagamento...</p>
        </div>
      )}

      {status === "success" && (
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-serif italic text-[#3e503c] mb-2">
            Pagamento confirmado!
          </h1>
          <p className="text-[#3e503c] font-sans mb-6">
            Obrigado, <span className="font-semibold">{result?.guestName}</span>! Seu presente
            foi reservado com sucesso. 💍
          </p>

          {result?.gifts && result.gifts.filter((g) => g.success).length > 0 && (
            <div className="bg-[#eef4ed] border border-[#c9d8c6] rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-[#3e503c] mb-2">Presentes reservados:</p>
              <ul className="space-y-1">
                {result.gifts
                  .filter((g) => g.success)
                  .map((g) => (
                    <li key={g.id} className="text-sm text-[#3e503c] font-sans">
                      ✓ {g.name || g.id}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <p className="text-sm text-[#3e503c] font-sans mb-6">
            Que tal avisar os noivos pelo WhatsApp? 😊
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleOpenWhatsApp}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold font-sans flex items-center justify-center gap-2"
            >
              <span>💬</span> Avisar pelo WhatsApp
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full px-6 py-3 bg-[#3e503c] text-white rounded-lg hover:bg-[#2c3b2a] transition-colors font-sans"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      )}

      {status === "pending" && (
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-3xl font-serif italic text-[#3e503c] mb-2">
            Pagamento em processamento
          </h1>
          <p className="text-[#3e503c] font-sans mb-6">
            Obrigado, <span className="font-semibold">{result?.guestName}</span>! Seu pagamento
            está sendo processado. Assim que for confirmado, os presentes serão reservados automaticamente. 💚
          </p>

          {result?.gifts && result.gifts.filter((g) => g.success).length > 0 && (
            <div className="bg-[#fef9e7] border border-[#f0e4a8] rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-[#3e503c] mb-2">Presentes reservados (aguardando confirmação):</p>
              <ul className="space-y-1">
                {result.gifts
                  .filter((g) => g.success)
                  .map((g) => (
                    <li key={g.id} className="text-sm text-[#3e503c] font-sans">
                      ⏳ {g.name || g.id}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <p className="text-sm text-[#3e503c] font-sans mb-6">
            Se pagou via Pix ou boleto, avise os noivos pelo WhatsApp para que saibam! 😊
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleOpenWhatsApp}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold font-sans flex items-center justify-center gap-2"
            >
              <span>💬</span> Avisar pelo WhatsApp
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full px-6 py-3 bg-[#3e503c] text-white rounded-lg hover:bg-[#2c3b2a] transition-colors font-sans"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-serif italic text-[#3e503c] mb-2">
            Algo deu errado
          </h1>
          <p className="text-[#3e503c] font-sans mb-6">
            {result?.error ||
              "Não foi possível confirmar o pagamento. Se o valor foi cobrado, entre em contato conosco pelo WhatsApp."}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/presentes")}
              className="w-full px-6 py-3 bg-[#3e503c] text-white rounded-lg hover:bg-[#2c3b2a] transition-colors font-sans"
            >
              Voltar aos presentes
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default function Sucesso() {
  return (
    <Suspense>
      <SucessoContent />
    </Suspense>
  );
}
