import { useState, useEffect } from "react";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storage } from "@/utils/storage";
import type { Item } from "@/types/item";

interface ItemFormProps {
  item?: Item | null;
  userRole: 'admin' | 'donator' | 'buyer';
  currentUsername?: string | null;
  onSubmit?: (items: Omit<Item, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>[]) => void;
  onEdit?: (item: Omit<Item, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const CATEGORY_SUBCATEGORIES = {
  bedding: ['thick duvet', 'thin duvet', 'pillow', 'duvet cover', 'pillow cover', 'matching duvet+pillow cover', 'matress cover', 'other'],
  bathroom: ['mirror', 'container', 'towel', 'other'],
  decoration: ['plant', 'picture', 'light chain', 'lamp', 'other'],
  other_room_inventory: ['hangers', 'curtains', 'other'],
  kitchen: ['plate', 'kettle', 'other'],
  bike_sports: ['bike', 'ball', 'other'],
  electronics: ['wifi router', 'lamp', 'other'],
  other: ['other']
};

const LOCATION_OPTIONS = [
  '32 basement',
  'bike cellar',
  'other'
];

type ItemFormData = {
  name: string;
  description: string;
  category: 'bedding' | 'bathroom' | 'decoration' | 'other_room_inventory' | 'kitchen' | 'bike_sports' | 'electronics' | 'other';
  subcategory: string;
  condition: 'new' | 'lightly_used' | 'worn';
  quantity: number;
  original_price: number;
  suggested_price: number;
  final_price: number | undefined;
  status: 'available' | 'reserved' | 'sold' | 'donated' | 'pending_approval';
  location: string;
  custom_location: string;
  photos: string[];
  internal_notes: string;
  donor_name: string;
};

export const ItemForm = ({ item, userRole, currentUsername, onSubmit, onEdit, onCancel, isEditing = false }: ItemFormProps) => {
  const [items, setItems] = useState<ItemFormData[]>([]);

  const createEmptyItem = (): ItemFormData => ({
    name: '',
    description: '',
    category: 'other',
    subcategory: 'other',
    condition: 'new',
    quantity: 1,
    original_price: 0,
    suggested_price: 0,
    final_price: undefined,
    status: userRole === 'donator' ? 'pending_approval' : 'available',
    location: '',
    custom_location: '',
    photos: [],
    internal_notes: '',
    donor_name: currentUsername || '',
  });

  useEffect(() => {
    if (item && isEditing) {
      // For editing single item
      setItems([{
        name: item.name,
        description: item.description || '',
        category: item.category,
        subcategory: item.subcategory,
        condition: item.condition,
        quantity: item.quantity,
        original_price: item.original_price,
        suggested_price: item.suggested_price,
        final_price: item.final_price,
        status: item.status,
        location: LOCATION_OPTIONS.includes(item.location || '') ? item.location || '' : 'other',
        custom_location: LOCATION_OPTIONS.includes(item.location || '') ? '' : item.location || '',
        photos: item.photos,
        internal_notes: item.internal_notes || '',
        donor_name: item.donor_name || '',
      }]);
    } else {
      // For new donations, start with one empty item
      setItems([createEmptyItem()]);
    }
  }, [item, currentUsername, userRole, isEditing]);

  const updateItem = (index: number, field: keyof ItemFormData, value: any) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleCategoryChange = (index: number, value: string) => {
    const category = value as keyof typeof CATEGORY_SUBCATEGORIES;
    const firstSubcategory = CATEGORY_SUBCATEGORIES[category][0];
    setItems(prev => prev.map((item, i) => 
      i === index ? {
        ...item,
        category,
        subcategory: firstSubcategory,
        name: firstSubcategory.charAt(0).toUpperCase() + firstSubcategory.slice(1)
      } : item
    ));
  };

  const handleSubcategoryChange = (index: number, value: string) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? {
        ...item,
        subcategory: value,
        name: value.charAt(0).toUpperCase() + value.slice(1)
      } : item
    ));
  };

  const handleOriginalPriceChange = (index: number, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    const roundedSuggested = Math.ceil((isNaN(numValue) ? 0 : numValue) * 0.5);
    
    setItems(prev => prev.map((item, i) => 
      i === index ? {
        ...item,
        original_price: isNaN(numValue) ? 0 : numValue,
        suggested_price: item.suggested_price === Math.ceil(item.original_price * 0.5) ? roundedSuggested : item.suggested_price
      } : item
    ));
  };

  const handleSuggestedPriceChange = (index: number, value: string) => {
    const numValue = value === '' ? 0 : Math.ceil(parseFloat(value) || 0);
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, suggested_price: numValue } : item
    ));
  };

  const handleFinalPriceChange = (index: number, value: string) => {
    const numValue = value === '' ? undefined : parseInt(value);
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, final_price: isNaN(numValue as number) ? undefined : numValue } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, createEmptyItem()]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateItem = (item: ItemFormData): boolean => {
    return !!(
      item.name.trim() &&
      item.category &&
      item.subcategory &&
      item.condition &&
      item.quantity > 0 &&
      item.original_price >= 0 &&
      item.suggested_price >= 0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all items
    const invalidItems = items.filter((item, index) => !validateItem(item));
    if (invalidItems.length > 0) {
      alert('Please fill in all required fields for all items before submitting.');
      return;
    }

    const processedItems = items.map(item => {
      const finalLocation = item.location === 'other' ? item.custom_location : item.location;
      const { custom_location, ...finalItemData } = { ...item, location: finalLocation };
      return finalItemData;
    });
    
    if (isEditing && onEdit && items.length === 1) {
      onEdit(processedItems[0]);
    } else if (onSubmit) {
      onSubmit(processedItems);
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const names: Record<string, string> = {
      bedding: 'Bedding',
      bathroom: 'Bathroom',
      decoration: 'Decoration',
      other_room_inventory: 'Other Room Inventory',
      kitchen: 'Kitchen',
      bike_sports: 'Bike & Sports',
      electronics: 'Electronics',
      other: 'Other'
    };
    return names[category] || category;
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {item ? 'Edit Item' : 'Add New Items'}
          {userRole === 'donator' && !item && (
            <div className="text-sm text-gray-600 mt-1">Items require admin approval before appearing in the inventory</div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {items.map((itemData, index) => (
            <Card key={index} className="border-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Item {index + 1}</CardTitle>
                {!isEditing && items.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`category-${index}`}>Category *</Label>
                    <Select value={itemData.category} onValueChange={(value) => handleCategoryChange(index, value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(CATEGORY_SUBCATEGORIES).map(category => (
                          <SelectItem key={category} value={category}>
                            {getCategoryDisplayName(category)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`subcategory-${index}`}>Subcategory *</Label>
                    <Select value={itemData.subcategory} onValueChange={(value) => handleSubcategoryChange(index, value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_SUBCATEGORIES[itemData.category].map(sub => (
                          <SelectItem key={sub} value={sub}>
                            {sub.charAt(0).toUpperCase() + sub.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`name-${index}`}>Item Name *</Label>
                  <Input
                    id={`name-${index}`}
                    value={itemData.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    required
                    placeholder="Enter item name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  {index === 0 && (
                    <div>
                      <Label htmlFor="donor_name">Donor Name</Label>
                      <Input
                        id="donor_name"
                        value={itemData.donor_name}
                        onChange={(e) => updateItem(index, 'donor_name', e.target.value)}
                        placeholder="Enter donor name"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor={`description-${index}`}>Description (optional)</Label>
                  <Textarea
                    id={`description-${index}`}
                    value={itemData.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Describe the item (optional)"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor={`condition-${index}`}>Condition *</Label>
                  <Select value={itemData.condition} onValueChange={(value: any) => updateItem(index, 'condition', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="lightly_used">Lightly Used</SelectItem>
                      <SelectItem value="worn">Worn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`original_price-${index}`}>Original Price (SEK) *</Label>
                    <Input
                      id={`original_price-${index}`}
                      type="number"
                      min="0"
                      step="1"
                      value={itemData.original_price || ''}
                      onChange={(e) => handleOriginalPriceChange(index, e.target.value)}
                      required
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`suggested_price-${index}`}>Suggested Price (SEK) *</Label>
                    <Input
                      id={`suggested_price-${index}`}
                      type="number"
                      min="0"
                      step="1"
                      value={itemData.suggested_price || ''}
                      onChange={(e) => handleSuggestedPriceChange(index, e.target.value)}
                      required
                      placeholder="0"
                    />
                  </div>
                </div>

                {userRole === 'admin' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`final_price-${index}`}>Final Price (SEK)</Label>
                      <Input
                        id={`final_price-${index}`}
                        type="number"
                        min="0"
                        step="1"
                        value={itemData.final_price || ''}
                        onChange={(e) => handleFinalPriceChange(index, e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`status-${index}`}>Status *</Label>
                      <Select value={itemData.status} onValueChange={(value: any) => updateItem(index, 'status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending_approval">Pending Approval</SelectItem>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                          <SelectItem value="donated">Donated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor={`location-${index}`}>Location</Label>
                  <Select value={itemData.location} onValueChange={(value) => updateItem(index, 'location', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_OPTIONS.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {itemData.location === 'other' && (
                    <div className="mt-2">
                      <Label htmlFor={`custom_location-${index}`}>Custom Location</Label>
                      <Input
                        id={`custom_location-${index}`}
                        value={itemData.custom_location}
                        onChange={(e) => updateItem(index, 'custom_location', e.target.value)}
                        placeholder="Enter custom location"
                      />
                    </div>
                  )}
                </div>

                {userRole === 'admin' && (
                  <div>
                    <Label htmlFor={`internal_notes-${index}`}>Internal Notes</Label>
                    <Textarea
                      id={`internal_notes-${index}`}
                      value={itemData.internal_notes}
                      onChange={(e) => updateItem(index, 'internal_notes', e.target.value)}
                      placeholder="Internal notes (visible to admins only)"
                      rows={2}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex gap-3 pt-4">
            {!isEditing && (
              <Button 
                type="button" 
                onClick={addItem}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Item
              </Button>
            )}
            
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Item' : `Submit ${items.length} Item${items.length > 1 ? 's' : ''}`}
            </Button>
            
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
