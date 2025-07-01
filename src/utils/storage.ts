
import type { Item } from "@/types/item";

const STORAGE_KEYS = {
  ITEMS: 'inventory_items',
  USERS: 'registered_users'
};

export interface RegisteredUser {
  id: string;
  username: string;
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

  addUser: (username: string): RegisteredUser => {
    const users = storage.getUsers();
    const newUser: RegisteredUser = {
      id: Date.now().toString(),
      username,
      role: 'donator',
      registeredAt: new Date().toISOString()
    };
    
    const updatedUsers = [...users, newUser];
    storage.setUsers(updatedUsers);
    return newUser;
  }
};
