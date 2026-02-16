export interface GiftOption {
  id: string;
  name: string;
  description: string;
  estimatedValue: number;
  image: string;
  storeLink?: string;
  category?: string; 
  status?: 'available' | 'partial' | 'reserved' | 'purchased';
  isQuotaEligible?: boolean;
  quotaValue?: number;
  quotasTotal?: number;
  quotasReserved?: number;
  quotasRemaining?: number;
}
