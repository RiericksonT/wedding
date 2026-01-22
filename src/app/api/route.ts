import { NextRequest, NextResponse } from 'next/server';
import { getGifts, getGiftsByCategory, getCategories, reserveGift } from '@/lib/google-sheets';

// GET: Buscar todos os presentes ou por categoria
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    
    if (category) {
      const gifts = await getGiftsByCategory(category);
      return NextResponse.json(gifts);
    }
    
    const gifts = await getGifts();
    return NextResponse.json(gifts);
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar presentes' },
      { status: 500 }
    );
  }
}

// POST: Reservar um presente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { giftId, reservedBy, phone, additionalInfo } = body;
    
    if (!giftId || !reservedBy || !phone) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }
    
    const success = await reserveGift(giftId, reservedBy, phone, additionalInfo);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Presente reservado com sucesso' 
      });
    } else {
      return NextResponse.json(
        { error: 'Presente já reservado ou não encontrado' },
        { status: 409 }
      );
    }
  } catch (error) {
    console.error('Erro na reserva:', error);
    return NextResponse.json(
      { error: 'Erro ao reservar presente' },
      { status: 500 }
    );
  }
}