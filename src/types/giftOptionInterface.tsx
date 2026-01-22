export interface GiftOption {
  id: string;
  name: string;
  description: string;
  estimatedValue: number;
  image: string;
  storeLink?: string;
  category?: string; 
  status?: 'available' | 'reserved' | 'purchased'; 
}