
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Item, UserRole } from "@/types/item";

interface ItemFormProps {
  item?: Item | null;
  userRole: UserRole;
  onSubmit: (items: Omit<Item, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>[]) => void;
  onCancel: () => void;
}

const CATEGORY_SUBCATEGORIES = {
  bedding: ['thick duvet', 'regular duvet (blanket)', 'pillow', 'duvet cover', 'pillow cover', 'matching duvet+pillow cover', 'matress cover', 'bedspread', 'other'],
  bathroom: ['mirror', 'container', 'towel', 'other'],
  decoration: ['plant', 'picture', 'light chain', 'lamp', 'other'],
  other_room_inventory: ['hangers', 'curtains', 'other'],
  kitchen: ['pot', 'pan', 'plate', 'cup', 'cutlery', 'appliance', 'other'],
  bike_sports: ['bike', 'helmet', 'equipment', 'clothing', 'other'],
  electronics: ['computer', 'phone', 'tablet', 'cable', 'other'],
  other: ['other']
};

// Photo mapping for bedding and bathroom subcategories
const SUBCATEGORY_PHOTOS: Record<string, string[]> = {
  'pillow cover': ['/lovable-uploads/0821fd07-eb1a-415b-8030-75b16e71349e.png'],
  'regular duvet (blanket)': ['/lovable-uploads/8aaaa293-1c21-4856-9a90-59dcdfb53d55.png'],
  'thick duvet': ['/lovable-uploads/32a63d4c-20c5-41af-907a-1b05082e2f39.png'],
  'bedspread': ['/lovable-uploads/f394b99a-4fbc-4e8f-865e-e4d193184f6b.png'],
  'matress cover': ['/lovable-uploads/64001d16-d0ac-4d99-8624-4b82334fa3b7.png'],
  'matching duvet+pillow cover': ['/lovable-uploads/d9859291-db59-42d7-a21a-0a9491a92e39.png'],
  'pillow': ['/lovable-uploads/33d9e0cd-e2a5-4b47-809b-c8ec1d2b122e.png'],
  'duvet cover': ['/lovable-uploads/34ec46f2-e0c7-4af4-9664-dc56e99c3fdf.png'],
  'mirror': ['/lovable-uploads/54254c2e-2b34-4212-89f2-a57955c91c26.png'],
  'container': ['/lovable-uploads/09dcfd5c-cd3b-43e4-9273-19b7664fc35c.png'],
  'towel': ['/lovable-uploads/116e0341-a0a5-41c2-9bbd-015bb33ce398.png']
};

const LOCATION_OPTIONS = [
  'Rackis 32 basement',
  'Bike garage',
  'other'
];

interface ItemData {
  name: string;
  description: string;
  category: Item['category'];
  subcategory: string;
  condition: Item['condition'];
  quantity: number;
  original_price: number | '';
  suggested_price: number | '';
  final_price?: number;
  status: Item['status'];
  reserved_by?: string;
  location?: string;
  photos: string[];
  internal_notes?: string;
  donor_name?: string;
}

export const ItemForm = ({ item, userRole, username, onSubmit, onCancel }: ItemFormProps & { username?: string }) => {
  const [items, setItems] = useState<ItemData[]>([{
    name: '',
    description: '',
    category: 'bedding',
    subcategory: '',
    condition: 'lightly_used',
    quantity: 1,
    original_price: '',
    suggested_price: '',
    final_price: undefined,
    status: 'available',
    reserved_by: '',
    location: '',
    photos: [],
    internal_notes: '',
    donor_name: username || ''
  }]);
  
  const isEditing = !!item;
  const { toast } = useToast();

  useEffect(() => {
    if (item && isEditing) {
      // For editing single item, map old 'thin duvet' to new 'regular duvet (blanket)'
      const mappedSubcategory = item.subcategory === 'thin duvet' ? 'regular duvet (blanket)' : item.subcategory;
      
      setItems([{
        name: item.name,
        description: item.description || '',
        category: item.category,
        subcategory: mappedSubcategory,
        condition: item.condition,
        quantity: item.quantity,
        original_price: item.original_price,
        suggested_price: item.suggested_price,
        final_price: item.final_price,
        status: item.status,
        reserved_by: item.reserved_by || '',
        location: item.location || '',
        photos: item.photos || [],
        internal_notes: item.internal_notes || '',
        donor_name: item.donor_name || username || ''
      }]);
    }
  }, [item, isEditing, username]);

  const addNewItem = () => {
    setItems([...items, {
      name: '',
      description: '',
      category: 'bedding',
      subcategory: '',
      condition: 'lightly_used',
      quantity: 1,
      original_price: '',
      suggested_price: '',
      final_price: undefined,
      status: 'available',
      reserved_by: '',
      location: '',
      photos: [],
      internal_notes: '',
      donor_name: username || ''
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof ItemData, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-fill name based on subcategory and auto-assign photos
    if (field === 'subcategory' && value) {
      // Auto-fill the name with the subcategory if name is empty
      if (!updatedItems[index].name.trim()) {
        updatedItems[index].name = value;
      }
      
      // Auto-assign photos when subcategory changes
      const subcategoryPhotos = SUBCATEGORY_PHOTOS[value];
      if (subcategoryPhotos && subcategoryPhotos.length > 0) {
        updatedItems[index].photos = [...subcategoryPhotos];
      } else {
        updatedItems[index].photos = [];
      }
    }
    
    // Clear subcategory, name, and photos when category changes
    if (field === 'category') {
      updatedItems[index].subcategory = '';
      updatedItems[index].name = '';
      updatedItems[index].photos = [];
    }

    // Auto-fill suggested price when original price changes
    if (field === 'original_price' && value && !isNaN(parseFloat(value))) {
      const originalPrice = parseFloat(value);
      updatedItems[index].suggested_price = Math.round(originalPrice / 2);
    }
    
    setItems(updatedItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const invalidItems = items.filter(item => 
      !item.name.trim() || 
      !item.subcategory || 
      item.original_price === '' || 
      item.suggested_price === '' ||
      parseFloat(item.original_price.toString()) < 0 || 
      parseFloat(item.suggested_price.toString()) < 0 ||
      item.quantity < 1
    );

    if (invalidItems.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and ensure values are valid.",
        variant: "destructive"
      });
      return;
    }

    // Convert to the expected format - only handle single item for edit mode
    const formattedItem = {
      ...items[0],  // Take first item for editing
      original_price: parseFloat(items[0].original_price.toString()) || 0,
      suggested_price: parseFloat(items[0].suggested_price.toString()) || 0,
      final_price: items[0].final_price || undefined,
      reserved_by: items[0].reserved_by || undefined,
      location: items[0].location || undefined,
      internal_notes: items[0].internal_notes || undefined,
      donor_name: items[0].donor_name || undefined
    };

    onSubmit(formattedItems);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Edit Item' : 'Add New Item(s)'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {items.map((itemData, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Item {index + 1}
                  {items.length > 1 && (
                    <Badge variant="outline" className="ml-2">
                      {index + 1} of {items.length}
                    </Badge>
                  )}
                </CardTitle>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category and Subcategory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`category-${index}`}>Category *</Label>
                  <Select
                    value={itemData.category}
                    onValueChange={(value) => updateItem(index, 'category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bedding">Bedding</SelectItem>
                      <SelectItem value="bathroom">Bathroom</SelectItem>
                      <SelectItem value="decoration">Decoration</SelectItem>
                      <SelectItem value="other_room_inventory">Other Room Inventory</SelectItem>
                      <SelectItem value="kitchen">Kitchen</SelectItem>
                      <SelectItem value="bike_sports">Bike & Sports</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`subcategory-${index}`}>Subcategory *</Label>
                  <Select
                    value={itemData.subcategory}
                    onValueChange={(value) => updateItem(index, 'subcategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_SUBCATEGORIES[itemData.category]?.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Name */}
              <div>
                <Label htmlFor={`name-${index}`}>Name *</Label>
                <Input
                  id={`name-${index}`}
                  value={itemData.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  placeholder="Item name (auto-filled from subcategory)"
                  required
                />
              </div>

              <div>
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Textarea
                  id={`description-${index}`}
                  value={itemData.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Item description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`condition-${index}`}>Condition *</Label>
                  <Select
                    value={itemData.condition}
                    onValueChange={(value) => updateItem(index, 'condition', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="lightly_used">Lightly Used</SelectItem>
                      <SelectItem value="worn">Worn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`quantity-${index}`}>Quantity *</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={itemData.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`original_price-${index}`}>Original Price (SEK) *</Label>
                  <Input
                    id={`original_price-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemData.original_price}
                    onChange={(e) => updateItem(index, 'original_price', e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`suggested_price-${index}`}>Suggested Price (SEK) *</Label>
                  <Input
                    id={`suggested_price-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemData.suggested_price}
                    onChange={(e) => updateItem(index, 'suggested_price', e.target.value)}
                    placeholder="Auto-filled from original price"
                    required
                  />
                </div>
              </div>

              {userRole === 'admin' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`final_price-${index}`}>Final Price (SEK)</Label>
                      <Input
                        id={`final_price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemData.final_price || ''}
                        onChange={(e) => updateItem(index, 'final_price', parseFloat(e.target.value) || undefined)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`status-${index}`}>Status</Label>
                      <Select
                        value={itemData.status}
                        onValueChange={(value) => updateItem(index, 'status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                          <SelectItem value="donated">Donated</SelectItem>
                          <SelectItem value="pending_approval">Pending Approval</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {itemData.status === 'reserved' && (
                    <div>
                      <Label htmlFor={`reserved_by-${index}`}>Reserved By</Label>
                      <Input
                        id={`reserved_by-${index}`}
                        value={itemData.reserved_by || ''}
                        onChange={(e) => updateItem(index, 'reserved_by', e.target.value)}
                        placeholder="Person who reserved this item"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Location and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`location-${index}`}>Location</Label>
                  <Select
                    value={itemData.location || ''}
                    onValueChange={(value) => updateItem(index, 'location', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_OPTIONS.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`donor_name-${index}`}>Donor Name</Label>
                  <Input
                    id={`donor_name-${index}`}
                    value={itemData.donor_name || ''}
                    onChange={(e) => updateItem(index, 'donor_name', e.target.value)}
                    placeholder="Who donated this item?"
                  />
                </div>
              </div>

              {userRole === 'admin' && (
                <div>
                  <Label htmlFor={`internal_notes-${index}`}>Internal Notes</Label>
                  <Textarea
                    id={`internal_notes-${index}`}
                    value={itemData.internal_notes || ''}
                    onChange={(e) => updateItem(index, 'internal_notes', e.target.value)}
                    placeholder="Internal notes (only visible to admins)"
                    rows={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {!isEditing && (
          <div className="text-center">
            <Button
              type="button"
              variant="outline"
              onClick={addNewItem}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Item
            </Button>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            {isEditing ? 'Update Item' : `Add ${items.length} Item${items.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      </form>
    </div>
  );
};
