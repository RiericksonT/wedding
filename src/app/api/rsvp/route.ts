import { NextRequest, NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

async function initGoogleSheet() {
  const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!;
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  return doc;
}

function normalizeName(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function parseCompanionsLimit(row: any): number {
  const raw = row.get("Acompanhantes");
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.trunc(parsed);
}

export async function GET() {
  try {
    const doc = await initGoogleSheet();
    const RSVP_SHEET_NAME = process.env.GOOGLE_RSVP_SHEET_NAME || "RSVP";
    const sheet = doc.sheetsByTitle[RSVP_SHEET_NAME];

    if (!sheet) {
      return NextResponse.json(
        { error: `Aba '${RSVP_SHEET_NAME}' não encontrada na planilha` },
        { status: 500 }
      );
    }

    await sheet.loadHeaderRow();
    const headers = new Set(sheet.headerValues);
    if (!headers.has("Nome") || !headers.has("Acompanhantes") || !headers.has("Vai")) {
      return NextResponse.json(
        { error: "Aba RSVP precisa ter os headers: Nome, Acompanhantes, Vai" },
        { status: 500 }
      );
    }

    const rows = await sheet.getRows();

    const guests = rows
      .map((row) => ({
        name: String(row.get("Nome") || "").trim(),
        maxCompanions: parseCompanionsLimit(row),
      }))
      .filter((guest) => guest.name.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    return NextResponse.json({ guests });
  } catch (error) {
    console.error("Erro na API GET /rsvp:", error);
    return NextResponse.json(
      { error: "Erro ao buscar convidados" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestName, companions } = body as {
      guestName?: string;
      companions?: number;
    };

    const normalizedGuestName = guestName?.trim();
    const normalizedCompanions = Number.isFinite(Number(companions))
      ? Math.max(0, Math.trunc(Number(companions)))
      : 0;

    if (!normalizedGuestName) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    const doc = await initGoogleSheet();
    const RSVP_SHEET_NAME = process.env.GOOGLE_RSVP_SHEET_NAME || "RSVP";
    const sheet = doc.sheetsByTitle[RSVP_SHEET_NAME];

    if (!sheet) {
      return NextResponse.json(
        { error: `Aba '${RSVP_SHEET_NAME}' não encontrada na planilha` },
        { status: 500 }
      );
    }

    await sheet.loadHeaderRow();
    const headers = new Set(sheet.headerValues);
    if (!headers.has("Nome") || !headers.has("Acompanhantes") || !headers.has("Vai")) {
      return NextResponse.json(
        { error: "Aba RSVP precisa ter os headers: Nome, Acompanhantes, Vai" },
        { status: 500 }
      );
    }

    const rows = await sheet.getRows();
    const row = rows.find(
      (item) => normalizeName(item.get("Nome")) === normalizeName(normalizedGuestName)
    );

    if (!row) {
      return NextResponse.json(
        { error: "Convidado não encontrado na planilha" },
        { status: 404 }
      );
    }

    const maxCompanions = parseCompanionsLimit(row);
    if (normalizedCompanions > maxCompanions) {
      return NextResponse.json(
        { error: `Quantidade inválida. Máximo permitido: ${maxCompanions}` },
        { status: 400 }
      );
    }

    row.set("Vai", true);

    await row.save();

    return NextResponse.json({
      success: true,
      message: "RSVP salvo com sucesso",
    });
  } catch (error) {
    console.error("Erro na API POST /rsvp:", error);
    return NextResponse.json(
      { error: "Erro ao salvar RSVP" },
      { status: 500 }
    );
  }
}
