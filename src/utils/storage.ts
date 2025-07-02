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
  // Items storage - now using Supabase
  getItems: async (): Promise<Item[]> => {
    try {
      console.log('Fetching items from Supabase...');
      const { data, error } = await supabase
        .from('Item inventory')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error fetching items:', error);
        return [];
      }
      
      console.log('Successfully fetched items:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Network error fetching items:', error);
      return [];
    }
  },

  setItems: async (items: Item[]): Promise<void> => {
    // This method is now deprecated since we handle individual items
    console.warn('setItems is deprecated, use addItem, updateItem, deleteItem instead');
  },

  addItem: async (item: Item): Promise<Item | null> => {
    try {
      const { data, error } = await supabase
        .from('Item inventory')
        .insert([item])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding item:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error adding item:', error);
      return null;
    }
  },

  updateItem: async (id: string, updates: Partial<Item>): Promise<Item | null> => {
    try {
      const { data, error } = await supabase
        .from('Item inventory')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating item:', error);
        return null;
      }
      
      return data;
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

  // Photo storage - now using Supabase Storage
  savePhoto: async (file: File): Promise<string | null> => {
    try {
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
