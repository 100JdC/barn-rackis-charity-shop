
import { supabase } from './supabase';
import type { Item } from "@/types/item";

const STORAGE_KEYS = {
  ITEMS: 'inventory_items',
  USERS: 'registered_users',
  PHOTOS: 'uploaded_photos'
};

export interface RegisteredUser {
  id: string;
  username: string;
  password?: string;
  role: 'donator';
  registeredAt: string;
}

export const storage = {
  // Items storage - with fallback to localStorage
  getItems: async (): Promise<Item[]> => {
    try {
      console.log('Fetching items from Supabase...');
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('dummy')) {
        console.warn('Supabase not configured, falling back to localStorage');
        return storage.getItemsFromLocalStorage();
      }
      
      const { data, error } = await supabase
        .from('Item inventory')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error fetching items:', error);
        console.log('Falling back to localStorage...');
        return storage.getItemsFromLocalStorage();
      }
      
      console.log('Successfully fetched items from Supabase:', data?.length || 0);
      return data || [];
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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('dummy')) {
        // Fallback to localStorage
        const items = storage.getItemsFromLocalStorage();
        const newItems = [item, ...items];
        storage.setItemsToLocalStorage(newItems);
        return item;
      }

      const { data, error } = await supabase
        .from('Item inventory')
        .insert([item])
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
      
      return data;
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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('dummy')) {
        // Fallback to localStorage
        const items = storage.getItemsFromLocalStorage();
        const updatedItems = items.map(item => 
          item.id === id ? { ...item, ...updates } : item
        );
        storage.setItemsToLocalStorage(updatedItems);
        return updatedItems.find(item => item.id === id) || null;
      }

      const { data, error } = await supabase
        .from('Item inventory')
        .update(updates)
        .eq('id', id)
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
      
      return data;
    } catch (error) {
      console.error('Error updating item:', error);
      return null;
    }
  },

  deleteItem: async (id: string): Promise<boolean> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('dummy')) {
        // Fallback to localStorage
        const items = storage.getItemsFromLocalStorage();
        const filteredItems = items.filter(item => item.id !== id);
        storage.setItemsToLocalStorage(filteredItems);
        return true;
      }

      const { error } = await supabase
        .from('Item inventory')
        .delete()
        .eq('id', id);
      
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

  // Users storage - keeping localStorage for now (can be migrated later)
  getUsers: (): RegisteredUser[] => {
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

  addUser: (username: string, password?: string): RegisteredUser => {
    const users = storage.getUsers();
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

  // Photo storage - fallback to localStorage for now
  savePhoto: async (file: File): Promise<string | null> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('dummy')) {
        // Fallback: convert to base64 and store reference
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            const photoId = Date.now().toString();
            localStorage.setItem(`photo_${photoId}`, base64);
            resolve(photoId);
          };
          reader.readAsDataURL(file);
        });
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('dummy')) {
        // Fallback: get from localStorage
        const base64 = localStorage.getItem(`photo_${photoPath}`);
        return base64 || null;
      }

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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('dummy')) {
        // Fallback: remove from localStorage
        localStorage.removeItem(`photo_${photoPath}`);
        return true;
      }

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
