import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { furnitureItems } from '@/types/furnitureItensRecord';

// Tipos
export interface GiftItem {
  id: string;
  name: string;
  description: string;
  estimatedValue: number;
  image: string;
  storeLink?: string;
  category: string;
  status: 'available' | 'reserved' | 'purchased';
  reservedBy?: string;
  reservationDate?: string;
  phone?: string;
}

export interface FurnitureCategory {
  id: string;
  name: string;
  description: string;
}

// Inicializar Google Sheets
export async function initGoogleSheet() {
  // Configurações do ambiente
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
}

// Buscar todos os presentes
export async function getGifts(): Promise<GiftItem[]> {
  try {
    const doc = await initGoogleSheet();
    const sheet = doc.sheetsByTitle[process.env.GOOGLE_SHEET_NAME || 'Presentes'];
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    
    return rows.map(row => ({
      id: row.get('ID') || '',
      name: row.get('Nome') || '',
      description: row.get('Descrição') || '',
      estimatedValue: parseFloat(row.get('Valor') || '0'),
      image: row.get('Imagem') || '',
      storeLink: row.get('LinkLoja') || undefined,
      category: row.get('Categoria') || '',
      status: (row.get('Status') as any) || 'available',
      reservedBy: row.get('ReservadoPor') || undefined,
      reservationDate: row.get('DataReserva') || undefined,
      phone: row.get('Telefone') || undefined,
    }));
  } catch (error) {
    console.error('Erro ao buscar presentes:', error);
    return [];
  }
}

// Buscar presentes por categoria
export async function getGiftsByCategory(categoryId: string): Promise<GiftItem[]> {
  const gifts = await getGifts();
  return gifts.filter(gift => gift.category === categoryId && gift.status === 'available');
}

// Buscar categorias únicas
export async function getCategories(): Promise<FurnitureCategory[]> {
  const gifts = await getGifts();
  const categories = [...new Set(gifts.map(gift => gift.category))];
  
  const categoryDescriptions: Record<string, string> = {
    'bed': 'Para nosso descanso e conforto',
    'wardrobe': 'Para organizar nossas roupas',
    'nightstand': 'Para nossos momentos de leitura',
    'decorations': 'Toques especiais para nosso cantinho',
    'rug': 'Conforto para nossos pés',
    'window': 'Privacidade e controle de luz',
    'tv': 'Para nosso entretenimento',
    'electronics': 'Tecnologia para nosso conforto',
    'chair': 'Para relaxar e ler',
    'desk': 'Espaço para trabalho',
  };
  
  return categories.map(category => ({
    id: category,
    name: furnitureItems[category] || category,
    description: categoryDescriptions[category] || '',
  }));
}

// Reservar um presente
export async function reserveGift(
  giftId: string, 
  reservedBy: string, 
  phone: string,
  additionalInfo?: string
): Promise<boolean> {
  try {
    const doc = await initGoogleSheet();
    const sheet = doc.sheetsByTitle[process.env.GOOGLE_SHEET_NAME || 'Presentes'];
    const rows = await sheet.getRows();
    
    const rowIndex = rows.findIndex(row => row.get('ID') === giftId);
    if (rowIndex === -1) {
      console.error('Presente não encontrado:', giftId);
      return false;
    }
    
    const row = rows[rowIndex];
    const currentStatus = row.get('Status');
    
    // Verificar se já está reservado
    if (currentStatus === 'reserved' || currentStatus === 'purchased') {
      console.error('Presente já está reservado ou comprado');
      return false;
    }
    
    // Atualizar dados
    row.set('Status', 'reserved');
    row.set('ReservadoPor', reservedBy);
    row.set('DataReserva', new Date().toISOString());
    row.set('Telefone', phone);
    
    // Se houver informação adicional, você pode adicionar uma coluna para isso
    if (additionalInfo) {
      // Adicione uma coluna "InformacoesAdicionais" na sua planilha se quiser
      // row.set('InformacoesAdicionais', additionalInfo);
    }
    
    await row.save();
    return true;
  } catch (error) {
    console.error('Erro ao reservar presente:', error);
    return false;
  }
}

// Buscar histórico de reservas de um usuário
export async function getUserReservations(phone: string): Promise<GiftItem[]> {
  const gifts = await getGifts();
  return gifts.filter(gift => gift.phone === phone && gift.status === 'reserved');
}