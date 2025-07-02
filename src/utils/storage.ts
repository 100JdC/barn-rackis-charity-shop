
import { supabase } from '@/integrations/supabase/client';
import type { Item } from "@/types/item";

const STORAGE_KEYS = {
  ITEMS: 'inventory_items',
  USERS: 'registered_users',
  PHOTOS: 'uploaded_photos',
  ADMIN_SESSION: 'admin_session',
  DONOR_SESSION: 'donor_session'
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
  id: dbItem['Item ID'].toString(),
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
  'Photos Count': item.photos.length
});

export const storage = {
  // Session management
  saveSession: (role: 'admin' | 'donator', username?: string): void => {
    const sessionKey = role === 'admin' ? STORAGE_KEYS.ADMIN_SESSION : STORAGE_KEYS.DONOR_SESSION;
    const sessionData = {
      role,
      username: username || (role === 'admin' ? 'Jacob' : ''),
      timestamp: Date.now()
    };
    localStorage.setItem(sessionKey, JSON.stringify(sessionData));
  },

  getSession: (): { role: 'admin' | 'donator' | null, username?: string } => {
    // Check for admin session first
    const adminSession = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    if (adminSession) {
      try {
        const parsed = JSON.parse(adminSession);
        // Admin sessions last 24 hours
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return { role: 'admin', username: parsed.username };
        } else {
          localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
        }
      } catch (error) {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
      }
    }

    // Check for donor session
    const donorSession = localStorage.getItem(STORAGE_KEYS.DONOR_SESSION);
    if (donorSession) {
      try {
        const parsed = JSON.parse(donorSession);
        // Donor sessions last 7 days
        if (Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
          return { role: 'donator', username: parsed.username };
        } else {
          localStorage.removeItem(STORAGE_KEYS.DONOR_SESSION);
        }
      } catch (error) {
        localStorage.removeItem(STORAGE_KEYS.DONOR_SESSION);
      }
    }

    return { role: null };
  },

  clearSession: (role?: 'admin' | 'donator'): void => {
    if (!role) {
      // Clear all sessions
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
      localStorage.removeItem(STORAGE_KEYS.DONOR_SESSION);
    } else {
      const sessionKey = role === 'admin' ? STORAGE_KEYS.ADMIN_SESSION : STORAGE_KEYS.DONOR_SESSION;
      localStorage.removeItem(sessionKey);
    }
  },

  // Items storage - with fallback to localStorage
  getItems: async (): Promise<Item[]> => {
    try {
      console.log('Fetching items from Supabase...');
      
      const { data, error } = await supabase
        .from('Item inventory')
        .select('*')
        .order('Created At', { ascending: false });
      
      if (error) {
        console.error('Supabase error fetching items:', error);
        console.log('Falling back to localStorage...');
        return storage.getItemsFromLocalStorage();
      }
      
      console.log('Successfully fetched items from Supabase:', data?.length || 0);
      return data ? data.map(convertFromSupabase) : [];
    } catch (error) {
      console.error('Network error fetching items:', error);
      console.log('Falling back to localStorage...');
      return storage.getItemsFromLocalStorage();
    }
  },

  // Fallback localStorage methods
  getItemsFromLocalStorage: (): Item[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ITEMS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  setItemsToLocalStorage: (items: Item[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save items to localStorage:', error);
    }
  },

  setItems: async (items: Item[]): Promise<void> => {
    // This method is now deprecated since we handle individual items
    console.warn('setItems is deprecated, use addItem, updateItem, deleteItem instead');
    // Fallback to localStorage
    storage.setItemsToLocalStorage(items);
  },

  addItem: async (item: Item): Promise<Item | null> => {
    try {
      const supabaseData = convertToSupabase(item);
      
      const { data, error } = await supabase
        .from('Item inventory')
        .insert([supabaseData])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding item:', error);
        // Fallback to localStorage
        const items = storage.getItemsFromLocalStorage();
        const newItems = [item, ...items];
        storage.setItemsToLocalStorage(newItems);
        return item;
      }
      
      return convertFromSupabase(data);
    } catch (error) {
      console.error('Error adding item:', error);
      // Fallback to localStorage
      const items = storage.getItemsFromLocalStorage();
      const newItems = [item, ...items];
      storage.setItemsToLocalStorage(newItems);
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
      if (updates.photos !== undefined) supabaseUpdates['Photos Count'] = updates.photos.length;
      
      supabaseUpdates['Updated At'] = new Date().toISOString();

      const { data, error } = await supabase
        .from('Item inventory')
        .update(supabaseUpdates)
        .eq('Item ID', parseInt(id))
        .select()
        .single();
      
      if (error) {
        console.error('Error updating item:', error);
        // Fallback to localStorage
        const items = storage.getItemsFromLocalStorage();
        const updatedItems = items.map(item => 
          item.id === id ? { ...item, ...updates } : item
        );
        storage.setItemsToLocalStorage(updatedItems);
        return updatedItems.find(item => item.id === id) || null;
      }
      
      return convertFromSupabase(data);
    } catch (error) {
      console.error('Error updating item:', error);
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
        console.error('Error deleting item:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    }
  },

  // Users storage - now using Supabase with fallback to localStorage
  getUsers: async (): Promise<RegisteredUser[]> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users from Supabase:', error);
        return storage.getUsersFromLocalStorage();
      }
      
      return data.map(user => ({
        id: user.id,
        username: user.username,
        password: user.password_hash,
        role: 'donator' as const,
        registeredAt: user.created_at
      }));
    } catch (error) {
      console.error('Network error fetching users:', error);
      return storage.getUsersFromLocalStorage();
    }
  },

  getUsersFromLocalStorage: (): RegisteredUser[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  setUsers: (users: RegisteredUser[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save users:', error);
    }
  },

  addUser: async (username: string, password?: string): Promise<RegisteredUser> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username,
          password_hash: password || '',
          role: 'donator'
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding user to Supabase:', error);
        // Fallback to localStorage
        return storage.addUserToLocalStorage(username, password);
      }
      
      return {
        id: data.id,
        username: data.username,
        password: data.password_hash,
        role: 'donator',
        registeredAt: data.created_at
      };
    } catch (error) {
      console.error('Network error adding user:', error);
      return storage.addUserToLocalStorage(username, password);
    }
  },

  addUserToLocalStorage: (username: string, password?: string): RegisteredUser => {
    const users = storage.getUsersFromLocalStorage();
    const newUser: RegisteredUser = {
      id: Date.now().toString(),
      username,
      password,
      role: 'donator',
      registeredAt: new Date().toISOString()
    };
    
    const updatedUsers = [...users, newUser];
    storage.setUsers(updatedUsers);
    return newUser;
  },

  // Photo storage - now using Supabase
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
      
      console.log('Photo uploaded successfully:', data.path);
      return data.path;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  },

  getPhotos: (): Record<string, string> => {
    // This method is deprecated for Supabase
    console.warn('getPhotos is deprecated, use getPhoto instead');
    return {};
  },

  getPhoto: (photoPath: string): string | null => {
    if (!photoPath) return null;
    
    try {
      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(photoPath);
      
      return data.publicUrl;
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
