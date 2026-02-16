import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { GiftOption } from '@/types/giftOptionInterface';

const QUOTA_THRESHOLD = 1100;
const DEFAULT_QUOTAS_TOTAL = 10;

function parseNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getDynamicQuotaValue(totalValue: number, quotasTotal = DEFAULT_QUOTAS_TOTAL): number {
  const value = totalValue / Math.max(1, quotasTotal);
  return Number(value.toFixed(2));
}

function appendTextValue(currentValue: unknown, nextValue: string): string {
  const current = String(currentValue ?? '').trim();
  if (!current) return nextValue;
  return `${current} | ${nextValue}`;
}

// Inicializar Google Sheets
async function initGoogleSheet() {
  try {
    const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!;
    const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Presentes';
    
    // Autenticação
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    
    return doc;
  } catch (error) {
    console.error('Erro ao inicializar Google Sheet:', error);
    throw error;
  }
}

// GET: Buscar todos os presentes
export async function GET(request: NextRequest) {
  try {
    const doc = await initGoogleSheet();
    const sheet = doc.sheetsByTitle[process.env.GOOGLE_SHEET_NAME || 'Presentes'];
    
    await sheet.loadHeaderRow();
    const headers = new Set(sheet.headerValues);
    const rows = await sheet.getRows();
    
    const gifts: GiftOption[] = rows.map(row => {
      const estimatedValue = parseNumber(row.get('Valor'));
      const originalStatus = row.get('Status') as 'available' | 'reserved' | 'purchased' | undefined;
      const isQuotaEligible = estimatedValue > QUOTA_THRESHOLD;
      const quotasTotal = isQuotaEligible
        ? Math.max(1, Math.trunc(parseNumber(headers.has('CotasTotais') ? row.get('CotasTotais') : '', DEFAULT_QUOTAS_TOTAL)))
        : 0;
      const quotasReserved = isQuotaEligible
        ? Math.max(0, Math.trunc(parseNumber(headers.has('CotasReservadas') ? row.get('CotasReservadas') : '', 0)))
        : 0;
      const quotasRemaining = isQuotaEligible ? Math.max(quotasTotal - quotasReserved, 0) : 0;
      const quotaValue = isQuotaEligible
        ? parseNumber(
            headers.has('ValorCota') ? row.get('ValorCota') : '',
            getDynamicQuotaValue(estimatedValue, quotasTotal)
          )
        : undefined;
      const computedStatus: GiftOption['status'] = isQuotaEligible
        ? quotasRemaining <= 0
          ? 'reserved'
          : quotasReserved > 0
            ? 'partial'
            : 'available'
        : (originalStatus || 'available');
      
      return {
        id: row.get('ID') || '',
        name: row.get('Nome') || '',
        description: row.get('Descrição') || '',
        estimatedValue,
        image: row.get('Imagem') || '',
        storeLink: row.get('LinkLoja') || undefined,
        category: row.get('Categoria') || '',
        status: computedStatus,
        isQuotaEligible,
        quotaValue,
        quotasTotal: isQuotaEligible ? quotasTotal : undefined,
        quotasReserved: isQuotaEligible ? quotasReserved : undefined,
        quotasRemaining: isQuotaEligible ? quotasRemaining : undefined,
      };
    });

    return NextResponse.json(gifts);
  } catch (error) {
    console.error('Erro na API GET /gifts:', error);
    
    // Retornar dados de fallback em caso de erro
    const fallbackGifts: GiftOption[] = [
      {
        id: "bed-1",
        name: "Cama Queen Size Casal",
        description: "Cama em madeira maciça com cabeceira estofada",
        estimatedValue: 1899.90,
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        storeLink: "https://www.mobly.com.br/cama-queen-size-casal-madeira-macica",
        category: "cama",
        status: "available"
      },
      {
        id: "ward-1",
        name: "Guarda-Roupa 6 Portas",
        description: "Guarda-roupa casal com espelho e gavetas",
        estimatedValue: 2599.00,
        image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        storeLink: "https://www.mobly.com.br/guarda-roupa-6-portas-casal",
        category: "guarda-roupa",
        status: "available"
      },
    ];

    return NextResponse.json(fallbackGifts, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'X-Fallback-Data': 'true'
      }
    });
  }
}

// POST: Reservar um presente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { giftId, reservedBy, phone, additionalInfo, status, reserveWhole, quotasToReserve } = body as {
      giftId?: string;
      reservedBy?: string;
      phone?: string;
      additionalInfo?: string;
      status?: 'reserved' | 'purchased';
      reserveWhole?: boolean;
      quotasToReserve?: number;
    };
    
    if (!giftId || !reservedBy) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    const doc = await initGoogleSheet();
    const sheet = doc.sheetsByTitle[process.env.GOOGLE_SHEET_NAME || 'Presentes'];
    await sheet.loadHeaderRow();
    const headers = new Set(sheet.headerValues);
    const rows = await sheet.getRows();
    
    const rowIndex = rows.findIndex(row => row.get('ID') === giftId);
    if (rowIndex === -1) {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      );
    }
    
    const row = rows[rowIndex];
    const currentStatus = row.get('Status') as 'available' | 'reserved' | 'purchased' | undefined;
    const estimatedValue = parseNumber(row.get('Valor'));
    const isQuotaEligible = estimatedValue > QUOTA_THRESHOLD;
    const nextStatusRequested: 'reserved' | 'purchased' = status === 'purchased' ? 'purchased' : 'reserved';
    const nowIso = new Date().toISOString();

    if (isQuotaEligible) {
      if (!headers.has('CotasReservadas')) {
        return NextResponse.json(
          { error: 'Coluna CotasReservadas não encontrada na planilha' },
          { status: 500 }
        );
      }

      const quotasTotal = Math.max(
        1,
        Math.trunc(
          parseNumber(
            headers.has('CotasTotais') ? row.get('CotasTotais') : '',
            DEFAULT_QUOTAS_TOTAL
          )
        )
      );
      const quotasReserved = Math.max(
        0,
        Math.trunc(
          parseNumber(
            headers.has('CotasReservadas') ? row.get('CotasReservadas') : '',
            0
          )
        )
      );

      if (quotasReserved >= quotasTotal || currentStatus === 'purchased') {
        return NextResponse.json(
          { error: 'Todas as cotas deste presente já foram reservadas' },
          { status: 409 }
        );
      }

      const quotasRemaining = Math.max(quotasTotal - quotasReserved, 0);
      const requestedQuotas = reserveWhole
        ? quotasRemaining
        : Math.max(1, Math.trunc(parseNumber(quotasToReserve, 1)));

      if (!reserveWhole && requestedQuotas > quotasRemaining) {
        return NextResponse.json(
          { error: `Quantidade de cotas inválida. Máximo disponível: ${quotasRemaining}` },
          { status: 400 }
        );
      }

      const nextQuotasReserved = quotasReserved + requestedQuotas;
      const isFullyReserved = nextQuotasReserved >= quotasTotal;
      const nextStatus: 'available' | 'reserved' = isFullyReserved ? 'reserved' : 'available';
      const safePhone = phone?.trim() || 'nao-informado';
      const quotasLabel = `${requestedQuotas} cota${requestedQuotas > 1 ? 's' : ''}`;

      row.set('Status', nextStatus);
      row.set('ReservadoPor', appendTextValue(row.get('ReservadoPor'), `${reservedBy} (${quotasLabel})`));
      row.set('DataReserva', nowIso);
      row.set('Telefone', appendTextValue(row.get('Telefone'), safePhone));

      if (headers.has('CotasReservadas')) {
        row.set('CotasReservadas', String(nextQuotasReserved));
      }

      if (headers.has('CotasTotais') && !row.get('CotasTotais')) {
        row.set('CotasTotais', String(DEFAULT_QUOTAS_TOTAL));
      }

      if (headers.has('ValorCota') && !row.get('ValorCota')) {
        row.set('ValorCota', String(getDynamicQuotaValue(estimatedValue, quotasTotal)));
      }

      if (headers.has('HistoricoReservas')) {
        row.set(
          'HistoricoReservas',
          appendTextValue(
            row.get('HistoricoReservas'),
            `${nowIso} - ${reservedBy} - ${safePhone} - ${quotasLabel}`
          )
        );
      }

      await row.save();

      return NextResponse.json({
        success: true,
        message: isFullyReserved
          ? 'Todas as cotas foram reservadas com sucesso'
          : 'Cota reservada com sucesso',
        giftId,
        reservedBy,
        status: nextStatus,
        quotaReservation: true,
        reservedQuotasCount: requestedQuotas,
        quotasTotal,
        quotasReserved: nextQuotasReserved,
        quotasRemaining: Math.max(quotasTotal - nextQuotasReserved, 0),
        reservedAt: nowIso
      });
    }

    // Verificar se já está reservado ou comprado (presentes sem cota)
    if (currentStatus === 'reserved' || currentStatus === 'purchased') {
      return NextResponse.json(
        { error: 'Presente já está reservado ou comprado' },
        { status: 409 }
      );
    }
    
    // Atualizar dados
    row.set('Status', nextStatusRequested);
    row.set('ReservadoPor', reservedBy);
    row.set('DataReserva', nowIso);
    if (phone) {
      row.set('Telefone', phone);
    }
    
    if (additionalInfo) {
      // Se quiser salvar informações adicionais, adicione uma coluna na planilha
      // row.set('InformacoesAdicionais', additionalInfo);
    }
    
    await row.save();
    
    return NextResponse.json({ 
      success: true, 
      message: `Presente marcado como ${nextStatusRequested} com sucesso`,
      giftId,
      reservedBy,
      status: nextStatusRequested,
      reservedAt: nowIso
    });

  } catch (error) {
    console.error('Erro na API POST /gifts:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao reservar presente',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
