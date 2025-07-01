
export interface Item {
  id: string;
  name: string;
  description?: string;
  category: 'bedding' | 'bathroom' | 'decoration' | 'other_room_inventory' | 'kitchen' | 'bike_sports' | 'electronics' | 'other';
  subcategory: string;
  condition: 'new' | 'lightly_used' | 'worn';
  quantity: number;
  original_price: number;
  suggested_price: number;
  final_price?: number;
  status: 'available' | 'reserved' | 'sold' | 'donated' | 'pending_approval';
  location?: string;
  photos: string[];
  internal_notes?: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'donator';
