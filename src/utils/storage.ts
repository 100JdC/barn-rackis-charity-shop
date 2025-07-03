
import { supabase } from "@/integrations/supabase/client";
import type { Item } from "@/types/item";

interface StoredUser {
  id: string;
  username: string;
  role: string;
  registeredAt: string;
  password?: string; // Add password field
}

export const storage = {
  saveSession(role: string, username: string) {
    localStorage.setItem('userRole', role);
    localStorage.setItem('username', username);
  },

  getSession() {
    return {
      userRole: localStorage.getItem('userRole'),
      username: localStorage.getItem('username')
    };
  },

  clearSession() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
  },

  async savePhoto(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      return filePath;
    } catch (error) {
      console.error('Error saving photo:', error);
      return null;
    }
  },

  getPhoto(photoPath: string): string | null {
    if (!photoPath) return null;
    
    try {
      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(photoPath);
      
      return data?.publicUrl || null;
    } catch (error) {
      console.error('Error getting photo URL:', error);
      return null;
    }
  },

  async getItems(): Promise<Item[]> {
    try {
      const { data, error } = await supabase
        .from('Item inventory')
        .select('*')
        .order('Created At', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        return [];
      }

      return data.map(item => ({
        id: item['Item ID']?.toString() || '',
        name: item.Name || '',
        description: item.Description || '',
        category: (item.Category || 'other') as Item['category'],
        subcategory: item.Subcategory || '',
        condition: (item.Condition || 'lightly_used') as Item['condition'],
        original_price: item['Original Price (SEK)'] || 0,
        suggested_price: parseFloat(item['Suggested Price (SEK)'] || '0'),
        final_price: parseFloat(item['Final Price (SEK)'] || '0'),
        quantity: item.Quantity || 1,
        status: (item.Status || 'available') as Item['status'],
        reserved_by: item['Reserved By'] || '',
        location: item.Location || '',
        internal_notes: item['Internal Notes'] || '',
        photos: [],
        donor_name: item['Donor Name'] || '',
        created_by: item['Created By'] || '',
        updated_by: item['Updated By'] || '',
        created_at: item['Created At'] || new Date().toISOString(),
        updated_at: item['Updated At'] || new Date().toISOString(),
        sold_quantity: 0
      }));
    } catch (error) {
      console.error('Error fetching items:', error);
      return [];
    }
  },

  async addItem(item: Item): Promise<void> {
    try {
      const { error } = await supabase
        .from('Item inventory')
        .insert({
          'Item ID': parseInt(item.id),
          'Name': item.name,
          'Description': item.description,
          'Category': item.category,
          'Subcategory': item.subcategory,
          'Condition': item.condition,
          'Original Price (SEK)': item.original_price,
          'Suggested Price (SEK)': item.suggested_price?.toString(),
          'Final Price (SEK)': item.final_price?.toString(),
          'Quantity': item.quantity,
          'Status': item.status,
          'Reserved By': item.reserved_by,
          'Location': item.location,
          'Internal Notes': item.internal_notes,
          'Photos Count': item.photos?.length || 0,
          'Donor Name': item.donor_name,
          'Created By': item.created_by,
          'Updated By': item.updated_by,
          'Created At': item.created_at,
          'Updated At': item.updated_at
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  },

  async updateItem(id: string, updates: Partial<Item>): Promise<Item | null> {
    try {
      const supabaseUpdates: any = {};
      
      if (updates.name !== undefined) supabaseUpdates['Name'] = updates.name;
      if (updates.description !== undefined) supabaseUpdates['Description'] = updates.description;
      if (updates.category !== undefined) supabaseUpdates['Category'] = updates.category;
      if (updates.subcategory !== undefined) supabaseUpdates['Subcategory'] = updates.subcategory;
      if (updates.condition !== undefined) supabaseUpdates['Condition'] = updates.condition;
      if (updates.original_price !== undefined) supabaseUpdates['Original Price (SEK)'] = updates.original_price;
      if (updates.suggested_price !== undefined) supabaseUpdates['Suggested Price (SEK)'] = updates.suggested_price?.toString();
      if (updates.final_price !== undefined) supabaseUpdates['Final Price (SEK)'] = updates.final_price?.toString();
      if (updates.quantity !== undefined) supabaseUpdates['Quantity'] = updates.quantity;
      if (updates.status !== undefined) supabaseUpdates['Status'] = updates.status;
      if (updates.reserved_by !== undefined) supabaseUpdates['Reserved By'] = updates.reserved_by;
      if (updates.location !== undefined) supabaseUpdates['Location'] = updates.location;
      if (updates.internal_notes !== undefined) supabaseUpdates['Internal Notes'] = updates.internal_notes;
      if (updates.photos !== undefined) supabaseUpdates['Photos Count'] = updates.photos.length;
      if (updates.donor_name !== undefined) supabaseUpdates['Donor Name'] = updates.donor_name;
      if (updates.created_by !== undefined) supabaseUpdates['Created By'] = updates.created_by;
      if (updates.updated_by !== undefined) supabaseUpdates['Updated By'] = updates.updated_by;
      if (updates.created_at !== undefined) supabaseUpdates['Created At'] = updates.created_at;
      if (updates.updated_at !== undefined) supabaseUpdates['Updated At'] = updates.updated_at;
      if (updates.sold_quantity !== undefined) supabaseUpdates['Sold Quantity'] = updates.sold_quantity;

      const { data, error } = await supabase
        .from('Item inventory')
        .update(supabaseUpdates)
        .eq('Item ID', parseInt(id))
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        id: data['Item ID']?.toString() || '',
        name: data.Name || '',
        description: data.Description || '',
        category: (data.Category || 'other') as Item['category'],
        subcategory: data.Subcategory || '',
        condition: (data.Condition || 'lightly_used') as Item['condition'],
        original_price: data['Original Price (SEK)'] || 0,
        suggested_price: parseFloat(data['Suggested Price (SEK)'] || '0'),
        final_price: parseFloat(data['Final Price (SEK)'] || '0'),
        quantity: data.Quantity || 1,
        status: (data.Status || 'available') as Item['status'],
        reserved_by: data['Reserved By'] || '',
        location: data.Location || '',
        internal_notes: data['Internal Notes'] || '',
        photos: [],
        donor_name: data['Donor Name'] || '',
        created_by: data['Created By'] || '',
        updated_by: data['Updated By'] || '',
        created_at: data['Created At'] || new Date().toISOString(),
        updated_at: data['Updated At'] || new Date().toISOString(),
        sold_quantity: data['Sold Quantity'] || 0
      };
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },

  async deleteItem(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('Item inventory')
        .delete()
        .eq('Item ID', parseInt(id));

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    }
  },

  async getUsers(): Promise<StoredUser[]> {
    const users = localStorage.getItem('registeredUsers');
    return users ? JSON.parse(users) : [];
  },

  async addUser(user: StoredUser): Promise<void> {
    const users = await this.getUsers();
    users.push(user);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
  }
};
