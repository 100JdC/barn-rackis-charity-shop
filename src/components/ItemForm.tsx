import { useState, useEffect } from "react";
import { Save, X, Plus, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Item } from "@/types/item";

interface ItemFormProps {
  item?: Item | null;
  userRole: 'admin' | 'donator';
  onSubmit?: (item: Omit<Item, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>, addAnother?: boolean) => void;
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

export const ItemForm = ({ item, userRole, onSubmit, onEdit, onCancel, isEditing = false }: ItemFormProps) => {
  const [formData, setFormData] = useState<{
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
  }>({
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
  });

  useEffect(() => {
    if (item) {
      setFormData({
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
      });
    }
  }, [item]);

  const handleCategoryChange = (value: string) => {
    const category = value as keyof typeof CATEGORY_SUBCATEGORIES;
    const firstSubcategory = CATEGORY_SUBCATEGORIES[category][0];
    setFormData(prev => ({
      ...prev,
      category,
      subcategory: firstSubcategory,
      name: firstSubcategory.charAt(0).toUpperCase() + firstSubcategory.slice(1)
    }));
  };

  const handleSubcategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      subcategory: value,
      name: value.charAt(0).toUpperCase() + value.slice(1)
    }));
  };

  const handleOriginalPriceChange = (value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      original_price: isNaN(numValue) ? 0 : numValue,
      suggested_price: prev.suggested_price === prev.original_price * 0.5 ? (isNaN(numValue) ? 0 : numValue) * 0.5 : prev.suggested_price
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, you'd upload these to a server and get URLs back
      // For now, we'll just create object URLs for preview
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos]
      }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent, addAnother: boolean = false) => {
    e.preventDefault();
    
    const finalLocation = formData.location === 'other' ? formData.custom_location : formData.location;
    
    const itemData = {
      ...formData,
      location: finalLocation
    };
    
    // Remove custom_location from the final data
    const { custom_location, ...finalItemData } = itemData;
    
    if (isEditing && onEdit) {
      onEdit(finalItemData);
    } else if (onSubmit) {
      onSubmit(finalItemData, addAnother);
      
      if (addAnother) {
        // Reset form for next item but keep some fields
        setFormData(prev => ({
          ...prev,
          name: '',
          description: '',
          quantity: 1,
          original_price: 0,
          suggested_price: 0,
          final_price: undefined,
          photos: [],
          custom_location: '',
        }));
      }
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
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {item ? 'Edit Item' : 'Add New Item'}
          {userRole === 'donator' && !item && (
            <div className="text-sm text-gray-600 mt-1">Items require admin approval before appearing in the inventory</div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
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
                <Label htmlFor="subcategory">Subcategory *</Label>
                <Select value={formData.subcategory} onValueChange={handleSubcategoryChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_SUBCATEGORIES[formData.category].map(sub => (
                      <SelectItem key={sub} value={sub}>
                        {sub.charAt(0).toUpperCase() + sub.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Enter item name"
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the item (optional)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="condition">Condition *</Label>
              <Select value={formData.condition} onValueChange={(value: any) => setFormData(prev => ({ ...prev, condition: value }))}>
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
                <Label htmlFor="original_price">Original Price (SEK) *</Label>
                <Input
                  id="original_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.original_price || ''}
                  onChange={(e) => handleOriginalPriceChange(e.target.value)}
                  required
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="suggested_price">Suggested Price (SEK) *</Label>
                <Input
                  id="suggested_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.suggested_price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, suggested_price: parseFloat(e.target.value) || 0 }))}
                  required
                  placeholder="0"
                />
              </div>
            </div>

            {userRole === 'admin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="final_price">Final Price (SEK)</Label>
                  <Input
                    id="final_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.final_price || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, final_price: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
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
              <Label htmlFor="location">Location</Label>
              <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
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
              
              {formData.location === 'other' && (
                <div className="mt-2">
                  <Label htmlFor="custom_location">Custom Location</Label>
                  <Input
                    id="custom_location"
                    value={formData.custom_location}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_location: e.target.value }))}
                    placeholder="Enter custom location"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="photos">Photos</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photos')?.click()}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Add Photos
                  </Button>
                </div>
                
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={photo} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-1 -right-1 h-6 w-6 p-0"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {userRole === 'admin' && (
              <div>
                <Label htmlFor="internal_notes">Internal Notes</Label>
                <Textarea
                  id="internal_notes"
                  value={formData.internal_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, internal_notes: e.target.value }))}
                  placeholder="Internal notes (visible to admins only)"
                  rows={2}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Item' : 'Add Item'}
            </Button>
            
            {!isEditing && (
              <Button 
                type="button" 
                onClick={(e) => handleSubmit(e, true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add & Add Another
              </Button>
            )}
            
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
