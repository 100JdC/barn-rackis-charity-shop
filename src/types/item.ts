
export interface Item {
  id: string;
  name: string;
  description: string;
  category: 'furniture' | 'kitchen' | 'electronics' | 'decor' | 'other';
  condition: 'new' | 'lightly_used' | 'worn';
  original_price: number;
  suggested_price: number;
  final_price?: number;
  status: 'available' | 'reserved' | 'sold' | 'donated';
  location: string;
  photos: string[];
  internal_notes?: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'volunteer' | 'viewer';
