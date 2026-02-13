import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { GiftOption } from '@/types/giftOptionInterface';

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
    const rows = await sheet.getRows();
    
    const gifts: GiftOption[] = rows.map(row => {
      const status = row.get('Status') as 'available' | 'reserved' | 'purchased' | undefined;
      
      return {
        id: row.get('ID') || '',
        name: row.get('Nome') || '',
        description: row.get('Descrição') || '',
        estimatedValue: parseFloat(row.get('Valor') || '0'),
        image: row.get('Imagem') || '',
        storeLink: row.get('LinkLoja') || undefined,
        category: row.get('Categoria') || '',
        status: status || 'available',
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
    const { giftId, reservedBy, phone, additionalInfo, status } = body as {
      giftId?: string;
      reservedBy?: string;
      phone?: string;
      additionalInfo?: string;
      status?: 'reserved' | 'purchased';
    };
    
    if (!giftId || !reservedBy) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    const doc = await initGoogleSheet();
    const sheet = doc.sheetsByTitle[process.env.GOOGLE_SHEET_NAME || 'Presentes'];
    const rows = await sheet.getRows();
    
    const rowIndex = rows.findIndex(row => row.get('ID') === giftId);
    if (rowIndex === -1) {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      );
    }
    
    const row = rows[rowIndex];
    const currentStatus = row.get('Status');
    
    // Verificar se já está reservado ou comprado
    if (currentStatus === 'reserved' || currentStatus === 'purchased') {
      return NextResponse.json(
        { error: 'Presente já está reservado ou comprado' },
        { status: 409 }
      );
    }
    
    const nextStatus: 'reserved' | 'purchased' = status === 'purchased' ? 'purchased' : 'reserved';

    // Atualizar dados
    row.set('Status', nextStatus);
    row.set('ReservadoPor', reservedBy);
    row.set('DataReserva', new Date().toISOString());
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
      message: `Presente marcado como ${nextStatus} com sucesso`,
      giftId,
      reservedBy,
      status: nextStatus,
      reservedAt: new Date().toISOString()
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
