
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
  // Items storage
  getItems: (): Item[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ITEMS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  setItems: (items: Item[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save items:', error);
    }
  },

  // Users storage
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

  // Photo storage utilities
  savePhoto: (photoId: string, photoData: string): void => {
    try {
      const photos = storage.getPhotos();
      photos[photoId] = photoData;
      localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
    } catch (error) {
      console.error('Failed to save photo:', error);
    }
  },

  getPhotos: (): Record<string, string> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PHOTOS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  getPhoto: (photoId: string): string | null => {
    const photos = storage.getPhotos();
    return photos[photoId] || null;
  }
};
