import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { initGoogleSheet } from '@/lib/google-sheets';

const QUOTA_THRESHOLD = 1100;
const DEFAULT_QUOTAS_TOTAL = 6;

function parseNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function appendTextValue(currentValue: unknown, nextValue: string): string {
  const current = String(currentValue ?? '').trim();
  if (!current) return nextValue;
  return `${current} | ${nextValue}`;
}

interface GiftPayload {
  id: string;
  name: string;
  furnitureName: string;
  description?: string;
  estimatedValue: number;
  isQuotaEligible?: boolean;
  quotaSelectionType?: 'full' | 'quotas';
  quotasSelected?: number;
  quotaValue?: number;
  quotasTotal?: number;
}

function getGiftValue(gift: GiftPayload): number {
  if (!gift.isQuotaEligible) return gift.estimatedValue;
  if (gift.quotaSelectionType === 'full') return gift.estimatedValue;
  const quotaValue =
    gift.quotaValue ||
    Number((gift.estimatedValue / (gift.quotasTotal || DEFAULT_QUOTAS_TOTAL)).toFixed(2));
  return Number((quotaValue * (gift.quotasSelected || 1)).toFixed(2));
}

function getGiftLabel(gift: GiftPayload): string {
  if (!gift.isQuotaEligible) return gift.name;
  if (gift.quotaSelectionType === 'full') return `${gift.name} (inteiro)`;
  return `${gift.name} (${gift.quotasSelected || 1} cota(s))`;
}

// POST: Criar preferência de pagamento do Mercado Pago
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      gifts: GiftPayload[];
      name: string;
      phone: string;
    };

    const { gifts, name, phone } = body;

    if (!gifts || gifts.length === 0) {
      return NextResponse.json({ error: 'Nenhum presente selecionado' }, { status: 400 });
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    });

    const preference = new Preference(client);

    const items = gifts.map((gift) => ({
      id: gift.id,
      title: getGiftLabel(gift),
      description: `${gift.furnitureName}${gift.description ? ` — ${gift.description}` : ''}`.slice(0, 256),
      quantity: 1,
      unit_price: getGiftValue(gift),
      currency_id: 'BRL' as const,
    }));

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

    if (!baseUrl || baseUrl === '') {
      return NextResponse.json({ error: 'BASE_URL não configurada' }, { status: 500 });
    }

    // Dados compactos dos presentes para o external_reference
    const externalData = {
      n: (name || 'Convidado').slice(0, 80),
      p: (phone || '').slice(0, 20),
      g: gifts.map((g) => ({
        id: g.id,
        fn: g.furnitureName,
        full: g.quotaSelectionType === 'full',
        qty: g.quotasSelected || 1,
        quota: g.isQuotaEligible || false,
      })),
    };

    const externalReference = Buffer.from(JSON.stringify(externalData)).toString('base64');

    const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');

    const result = await preference.create({
      body: {
        items,
        ...(isLocalhost
          ? {}
          : {
              back_urls: {
                success: `${baseUrl}/presentes/sucesso`,
                failure: `${baseUrl}/presentes/cancelado`,
                pending: `${baseUrl}/presentes/sucesso`,
              },
              auto_return: 'approved' as const,
            }),
        external_reference: externalReference,
        payment_methods: {
            installments: 12,
            default_installments: 1,
        },
        payer: {
          name: name || 'Convidado',
          ...(phone ? { phone: { number: phone } } : {}),
        },
      },
    });

    return NextResponse.json({
      url: result.init_point,
      sandbox_url: result.sandbox_init_point,
      preference_id: result.id,
    });
  } catch (error) {
    console.error('Erro ao criar preferência Mercado Pago:', error);
    return NextResponse.json({ error: 'Erro ao criar pagamento' }, { status: 500 });
  }
}

// GET: Confirmar pagamento e reservar presentes na planilha
export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status');
  const externalReference = request.nextUrl.searchParams.get('external_reference');
  const paymentId = request.nextUrl.searchParams.get('payment_id');

  if (status !== 'approved' || !externalReference) {
    return NextResponse.json({ error: 'Pagamento não aprovado ou referência ausente' }, { status: 400 });
  }

  let data: { n: string; p: string; g: Array<{ id: string; fn: string; full: boolean; qty: number; quota: boolean }> };
  try {
    data = JSON.parse(Buffer.from(externalReference, 'base64').toString('utf-8'));
  } catch {
    return NextResponse.json({ error: 'Referência inválida' }, { status: 400 });
  }

  const guestName = data.n || 'Convidado';
  const guestPhone = data.p || 'nao-informado';
  const compactGifts = data.g;

  if (!compactGifts || compactGifts.length === 0) {
    return NextResponse.json({ error: 'Dados dos presentes não encontrados' }, { status: 400 });
  }

  try {
    const doc = await initGoogleSheet();
    const sheet = doc.sheetsByTitle[process.env.GOOGLE_SHEET_NAME || 'Presentes'];
    await sheet.loadHeaderRow();
    const headers = new Set(sheet.headerValues);
    const rows = await sheet.getRows();

    const results = await Promise.all(
      compactGifts.map(async (compactGift) => {
        const rowIndex = rows.findIndex((row) => row.get('ID') === compactGift.id);
        if (rowIndex === -1) return { id: compactGift.id, success: false };

        const row = rows[rowIndex];
        const estimatedValue = parseNumber(row.get('Valor'));
        const isQuotaEligible = estimatedValue > QUOTA_THRESHOLD;
        const nowIso = new Date().toISOString();
        const additionalInfo = `Pago via Mercado Pago (ID: ${paymentId || 'N/A'}): ${compactGift.fn} — ${compactGift.id}`;

        if (isQuotaEligible && compactGift.quota) {
          if (!headers.has('CotasReservadas')) return { id: compactGift.id, success: false };

          const quotasTotal = Math.max(
            1,
            Math.trunc(parseNumber(headers.has('CotasTotais') ? row.get('CotasTotais') : '', DEFAULT_QUOTAS_TOTAL))
          );
          const quotasReserved = Math.max(
            0,
            Math.trunc(parseNumber(headers.has('CotasReservadas') ? row.get('CotasReservadas') : '', 0))
          );

          const quotasToReserve = compactGift.full
            ? Math.max(quotasTotal - quotasReserved, 0)
            : compactGift.qty;
          const quotasAfter = Math.min(quotasReserved + quotasToReserve, quotasTotal);

          row.set('CotasReservadas', quotasAfter);
          if (quotasAfter >= quotasTotal) {
            row.set('Status', 'purchased');
          }
          row.set('ReservadoPor', appendTextValue(row.get('ReservadoPor'), guestName));
          row.set('Telefone', appendTextValue(row.get('Telefone'), guestPhone));
          row.set('DataReserva', appendTextValue(row.get('DataReserva'), nowIso));
          if (headers.has('InformacoesAdicionais')) {
            row.set('InformacoesAdicionais', appendTextValue(row.get('InformacoesAdicionais'), additionalInfo));
          }
        } else {
          const currentStatus = row.get('Status');
          if (currentStatus === 'reserved' || currentStatus === 'purchased') {
            return { id: compactGift.id, success: false };
          }
          row.set('Status', 'purchased');
          row.set('ReservadoPor', guestName);
          row.set('Telefone', guestPhone);
          row.set('DataReserva', nowIso);
          if (headers.has('InformacoesAdicionais')) {
            row.set('InformacoesAdicionais', additionalInfo);
          }
        }

        await row.save();
        return { id: compactGift.id, name: row.get('Nome'), success: true };
      })
    );

    return NextResponse.json({
      success: true,
      guestName,
      guestPhone,
      paymentId,
      gifts: results,
    });
  } catch (error) {
    console.error('Erro ao reservar presentes após pagamento MP:', error);
    return NextResponse.json({ error: 'Erro ao salvar reserva' }, { status: 500 });
  }
}
