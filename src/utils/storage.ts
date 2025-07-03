
import { supabase } from '@/integrations/supabase/client';
import type { Item } from "@/types/item";

const STORAGE_KEYS = {
  SESSION: 'user_session'
};

export interface RegisteredUser {
  id: string;
  username: string;
  password?: string;
  role: 'donator';
  registeredAt: string;
}

// Helper functions to convert between Item type and Supabase table format
const convertFromSupabase = (dbItem: any): Item => ({
  id: dbItem['Item ID']?.toString() || '',
  name: dbItem.Name || '',
  description: dbItem.Description || '',
  category: dbItem.Category || 'other',
  subcategory: dbItem.Subcategory || '',
  condition: dbItem.Condition || 'new',
  quantity: dbItem.Quantity || 0,
  original_price: dbItem['Original Price (SEK)'] || 0,
  suggested_price: parseFloat(dbItem['Suggested Price (SEK)'] || '0'),
  final_price: parseFloat(dbItem['Final Price (SEK)'] || '0') || undefined,
  status: dbItem.Status || 'available',
  reserved_by: dbItem['Reserved By'] || '',
  location: dbItem.Location || '',
  internal_notes: dbItem['Internal Notes'] || '',
  donor_name: dbItem['Donor Name'] || '',
  created_by: dbItem['Created By'] || '',
  updated_by: dbItem['Updated By'] || '',
  created_at: dbItem['Created At'] || new Date().toISOString(),
  updated_at: dbItem['Updated At'] || new Date().toISOString(),
  photos: [] // Photos will need separate handling
});

const convertToSupabase = (item: Item) => ({
  'Item ID': parseInt(item.id),
  'Name': item.name,
  'Description': item.description || '',
  'Category': item.category,
  'Subcategory': item.subcategory,
  'Condition': item.condition,
  'Quantity': item.quantity,
  'Original Price (SEK)': item.original_price,
  'Suggested Price (SEK)': item.suggested_price.toString(),
  'Final Price (SEK)': item.final_price?.toString() || null,
  'Status': item.status,
  'Reserved By': item.reserved_by || '',
  'Location': item.location || '',
  'Internal Notes': item.internal_notes || '',
  'Donor Name': item.donor_name || '',
  'Created By': item.created_by,
  'Updated By': item.updated_by,
  'Created At': item.created_at,
  'Updated At': item.updated_at,
  'Photos Count': item.photos?.length || 0
});

export const storage = {
  // Session management - uses localStorage for simplicity
  saveSession: (role: 'admin' | 'donator' | 'buyer', username?: string): void => {
    const session = { role, username, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  },

  getSession: (): { role: 'admin' | 'donator' | 'buyer' | null, username?: string } => {
    try {
      const session = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (session) {
        const parsed = JSON.parse(session);
        return { role: parsed.role, username: parsed.username };
      }
    } catch (error) {
      console.error('Error parsing session:', error);
    }
    return { role: null };
  },

  clearSession: (): void => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  // Items storage - Try Supabase first, fallback to localStorage
  getItems: async (): Promise<Item[]> => {
    try {
      console.log('Fetching items from Supabase...');
      
      const { data, error } = await supabase
        .from('Item inventory')
        .select('*')
        .order('Created At', { ascending: false });
      
      if (error) {
        console.error('Supabase error fetching items:', error);
        // Fallback to localStorage
        const localItems = localStorage.getItem('items');
        return localItems ? JSON.parse(localItems) : [];
      }
      
      console.log('Successfully fetched items from Supabase:', data?.length || 0);
      return data && data.length > 0 ? data.map(convertFromSupabase) : [];
    } catch (error) {
      console.error('Error fetching items:', error);
      // Fallback to localStorage
      const localItems = localStorage.getItem('items');
      return localItems ? JSON.parse(localItems) : [];
    }
  },

  addItem: async (item: Item): Promise<Item | null> => {
    try {
      // Ensure donated items are always pending approval unless created by admin
      const itemToAdd = {
        ...item,
        status: item.status === 'available' && item.created_by !== 'Jacob' ? 'pending_approval' : item.status
      };
      
      const supabaseData = convertToSupabase(itemToAdd);
      
      const { data, error } = await supabase
        .from('Item inventory')
        .insert([supabaseData])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding item to Supabase:', error);
        // Fallback to localStorage
        const items = JSON.parse(localStorage.getItem('items') || '[]');
        items.push(itemToAdd);
        localStorage.setItem('items', JSON.stringify(items));
        return itemToAdd;
      }
      
      return data ? convertFromSupabase(data) : null;
    } catch (error) {
      console.error('Error adding item:', error);
      // Fallback to localStorage
      const items = JSON.parse(localStorage.getItem('items') || '[]');
      items.push(item);
      localStorage.setItem('items', JSON.stringify(items));
      return item;
    }
  },

  updateItem: async (id: string, updates: Partial<Item>): Promise<Item | null> => {
    try {
      // Convert updates to Supabase format
      const supabaseUpdates: any = {};
      if (updates.name !== undefined) supabaseUpdates['Name'] = updates.name;
      if (updates.description !== undefined) supabaseUpdates['Description'] = updates.description;
      if (updates.category !== undefined) supabaseUpdates['Category'] = updates.category;
      if (updates.subcategory !== undefined) supabaseUpdates['Subcategory'] = updates.subcategory;
      if (updates.condition !== undefined) supabaseUpdates['Condition'] = updates.condition;
      if (updates.quantity !== undefined) supabaseUpdates['Quantity'] = updates.quantity;
      if (updates.original_price !== undefined) supabaseUpdates['Original Price (SEK)'] = updates.original_price;
      if (updates.suggested_price !== undefined) supabaseUpdates['Suggested Price (SEK)'] = updates.suggested_price;
      if (updates.final_price !== undefined) supabaseUpdates['Final Price (SEK)'] = updates.final_price;
      if (updates.status !== undefined) supabaseUpdates['Status'] = updates.status;
      if (updates.reserved_by !== undefined) supabaseUpdates['Reserved By'] = updates.reserved_by;
      if (updates.location !== undefined) supabaseUpdates['Location'] = updates.location;
      if (updates.internal_notes !== undefined) supabaseUpdates['Internal Notes'] = updates.internal_notes;
      if (updates.donor_name !== undefined) supabaseUpdates['Donor Name'] = updates.donor_name;
      if (updates.updated_by !== undefined) supabaseUpdates['Updated By'] = updates.updated_by;
      if (updates.sold_quantity !== undefined) supabaseUpdates['Sold Quantity'] = updates.sold_quantity;
      if (updates.photos !== undefined) supabaseUpdates['Photos Count'] = updates.photos.length;
      
      supabaseUpdates['Updated At'] = new Date().toISOString();

      const { data, error } = await supabase
        .from('Item inventory')
        .update(supabaseUpdates)
        .eq('Item ID', parseInt(id))
        .select()
        .single();
      
      if (error) {
        console.error('Error updating item in Supabase:', error);
        // Fallback to localStorage
        const items = JSON.parse(localStorage.getItem('items') || '[]');
        const itemIndex = items.findIndex((item: Item) => item.id === id);
        if (itemIndex !== -1) {
          items[itemIndex] = { ...items[itemIndex], ...updates };
          localStorage.setItem('items', JSON.stringify(items));
          return items[itemIndex];
        }
        return null;
      }
      
      return data ? convertFromSupabase(data) : null;
    } catch (error) {
      console.error('Error updating item:', error);
      // Fallback to localStorage
      const items = JSON.parse(localStorage.getItem('items') || '[]');
      const itemIndex = items.findIndex((item: Item) => item.id === id);
      if (itemIndex !== -1) {
        items[itemIndex] = { ...items[itemIndex], ...updates };
        localStorage.setItem('items', JSON.stringify(items));
        return items[itemIndex];
      }
      return null;
    }
  },

  deleteItem: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('Item inventory')
        .delete()
        .eq('Item ID', parseInt(id));
      
      if (error) {
        console.error('Error deleting item from Supabase:', error);
        // Fallback to localStorage
        const items = JSON.parse(localStorage.getItem('items') || '[]');
        const filteredItems = items.filter((item: Item) => item.id !== id);
        localStorage.setItem('items', JSON.stringify(filteredItems));
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      // Fallback to localStorage
      const items = JSON.parse(localStorage.getItem('items') || '[]');
      const filteredItems = items.filter((item: Item) => item.id !== id);
      localStorage.setItem('items', JSON.stringify(filteredItems));
      return true;
    }
  },

  // Users storage - localStorage based (kept for compatibility)
  getUsers: async (): Promise<RegisteredUser[]> => {
    const users = localStorage.getItem('registered_users');
    return users ? JSON.parse(users) : [];
  },

  addUser: async (username: string, password?: string): Promise<RegisteredUser> => {
    const newUser: RegisteredUser = {
      id: Date.now().toString(),
      username,
      password,
      role: 'donator',
      registeredAt: new Date().toISOString()
    };
    
    const users = await this.getUsers();
    users.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(users));
    
    return newUser;
  },

  savePhoto: async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      console.log('Uploading photo to Supabase:', fileName);
      
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Error uploading photo:', error);
        return null;
      }
      
      console.log('Photo uploaded successfully:', data?.path);
      return data?.path || null;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  },

  getPhoto: (photoPath: string): string | null => {
    if (!photoPath) return null;
    
    try {
      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(photoPath);
      
      console.log('Generated photo URL:', data?.publicUrl);
      return data?.publicUrl || null;
    } catch (error) {
      console.error('Error getting photo URL:', error);
      return null;
    }
  },

  deletePhoto: async (photoPath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('photos')
        .remove([photoPath]);
      
      if (error) {
        console.error('Error deleting photo:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  }
};
