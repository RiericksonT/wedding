import { useState, useEffect } from 'react';
import { GiftItem, FurnitureCategory } from '@/lib/google-sheets';

export function useGifts(category?: string) {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGifts();
  }, [category]);

  const fetchGifts = async () => {
    try {
      setLoading(true);
      const url = category 
        ? `/api/gifts?category=${category}`
        : '/api/gifts';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao buscar presentes');
      
      const data = await response.json();
      setGifts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const reserveGift = async (
    giftId: string, 
    reservedBy: string, 
    phone: string,
    additionalInfo?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId, reservedBy, phone, additionalInfo }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao reservar');
      }

      // Atualizar lista local
      setGifts(prev => prev.map(gift => 
        gift.id === giftId 
          ? { ...gift, status: 'reserved', reservedBy, phone }
          : gift
      ));

      return true;
    } catch (err) {
      console.error('Erro na reserva:', err);
      return false;
    }
  };

  return {
    gifts,
    loading,
    error,
    refetch: fetchGifts,
    reserveGift,
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<FurnitureCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Erro ao buscar categorias');
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}