import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload, Image } from "lucide-react";
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

// Subcategory photos mapping using the uploaded photos
const SUBCATEGORY_PHOTOS: Record<string, Record<string, string[]>> = {
  bedding: {
    'thick duvet': ['/lovable-uploads/97c57dcc-37a1-4603-9224-829f8035c6f2.png'],
    'regular duvet (blanket)': ['/lovable-uploads/826485e4-8e7b-4da4-8296-5679cab7c192.png'],
    'pillow': ['/lovable-uploads/e864de0e-0b29-4248-a8d7-0a94ae10521b.png'],
    'duvet cover': ['/lovable-uploads/f66a4279-172c-4960-8e91-d687f82c9610.png'],
    'pillow cover': ['/lovable-uploads/74b13bd1-2a11-44cc-986f-298a9ebc67b6.png'],
    'matching duvet+pillow cover': ['/lovable-uploads/d12293c7-20a6-4048-9e25-9404ac21e90e.png'],
    'matress cover': ['/lovable-uploads/aa69fbc7-a9a8-4842-9493-ceff69afc35a.png'],
    'bedspread': ['/lovable-uploads/c57b86d5-b328-4772-b64d-395290573d13.png']
  }
};

interface ItemData {
  name: string;
  description: string;
  category: Item['category'];
  subcategory: string;
  condition: Item['condition'];
  quantity: number;
  original_price: number;
  suggested_price: number;
  final_price?: number;
  status: Item['status'];
  reserved_by?: string;
  location?: string;
  photos: string[];
  internal_notes?: string;
  donor_name?: string;
}

export const ItemForm = ({ item, userRole, onSubmit, onCancel }: ItemFormProps) => {
  const [items, setItems] = useState<ItemData[]>([{
    name: '',
    description: '',
    category: 'bedding',
    subcategory: '',
    condition: 'lightly_used',
    quantity: 1,
    original_price: 0,
    suggested_price: 0,
    final_price: undefined,
    status: 'available',
    reserved_by: '',
    location: '',
    photos: [],
    internal_notes: '',
    donor_name: ''
  }]);
  
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState(1);
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
        donor_name: item.donor_name || ''
      }]);
    }
  }, [item, isEditing]);

  const addNewItem = () => {
    setItems([...items, {
      name: '',
      description: '',
      category: 'bedding',
      subcategory: '',
      condition: 'lightly_used',
      quantity: 1,
      original_price: 0,
      suggested_price: 0,
      final_price: undefined,
      status: 'available',
      reserved_by: '',
      location: '',
      photos: [],
      internal_notes: '',
      donor_name: ''
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
    
    // Auto-assign photos when subcategory changes for bedding items
    if (field === 'subcategory' && updatedItems[index].category === 'bedding') {
      const categoryPhotos = SUBCATEGORY_PHOTOS.bedding[value];
      if (categoryPhotos && categoryPhotos.length > 0) {
        updatedItems[index].photos = [...categoryPhotos];
      } else {
        // Clear photos if no matching subcategory photos found
        updatedItems[index].photos = [];
      }
    }
    
    // Clear subcategory and photos when category changes
    if (field === 'category') {
      updatedItems[index].subcategory = '';
      updatedItems[index].photos = [];
    }
    
    setItems(updatedItems);
  };

  const handleBulkAdd = () => {
    const newItems = [];
    for (let i = 0; i < bulkQuantity; i++) {
      newItems.push({
        name: '',
        description: '',
        category: 'bedding' as Item['category'],
        subcategory: '',
        condition: 'lightly_used' as Item['condition'],
        quantity: 1,
        original_price: 0,
        suggested_price: 0,
        final_price: undefined,
        status: 'available' as Item['status'],
        reserved_by: '',
        location: '',
        photos: [],
        internal_notes: '',
        donor_name: ''
      });
    }
    setItems([...items, ...newItems]);
    setShowBulkAdd(false);
    setBulkQuantity(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const invalidItems = items.filter(item => 
      !item.name.trim() || 
      !item.subcategory || 
      item.original_price < 0 || 
      item.suggested_price < 0 ||
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

    // Convert to the expected format
    const formattedItems = items.map(item => ({
      ...item,
      final_price: item.final_price || undefined,
      reserved_by: item.reserved_by || undefined,
      location: item.location || undefined,
      internal_notes: item.internal_notes || undefined,
      donor_name: item.donor_name || undefined
    }));

    onSubmit(formattedItems);
  };

  const handlePhotoUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // For now, we'll just store the file names
    // In a real implementation, you'd upload to a service and get URLs
    const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
    updateItem(index, 'photos', [...items[index].photos, ...newPhotos]);
  };

  const removePhoto = (itemIndex: number, photoIndex: number) => {
    const updatedPhotos = items[itemIndex].photos.filter((_, i) => i !== photoIndex);
    updateItem(itemIndex, 'photos', updatedPhotos);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Edit Item' : 'Add New Item(s)'}
        </h1>
        {!isEditing && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBulkAdd(!showBulkAdd)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Bulk Add
            </Button>
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
      </div>

      {showBulkAdd && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Add Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bulkQuantity">Number of items to add</Label>
              <Input
                id="bulkQuantity"
                type="number"
                min="1"
                max="50"
                value={bulkQuantity}
                onChange={(e) => setBulkQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBulkAdd}>Add {bulkQuantity} Items</Button>
              <Button variant="outline" onClick={() => setShowBulkAdd(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`name-${index}`}>Name *</Label>
                  <Input
                    id={`name-${index}`}
                    value={itemData.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    placeholder="Item name"
                    required
                  />
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
                    onChange={(e) => updateItem(index, 'original_price', parseFloat(e.target.value) || 0)}
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
                    onChange={(e) => updateItem(index, 'suggested_price', parseFloat(e.target.value) || 0)}
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
                  <Input
                    id={`location-${index}`}
                    value={itemData.location || ''}
                    onChange={(e) => updateItem(index, 'location', e.target.value)}
                    placeholder="Where is this item located?"
                  />
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

              {/* Photos */}
              <div>
                <Label>Photos</Label>
                <div className="space-y-4">
                  {itemData.photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {itemData.photos.map((photo, photoIndex) => (
                        <div key={photoIndex} className="relative">
                          <img
                            src={photo}
                            alt={`Photo ${photoIndex + 1}`}
                            className="w-full h-24 object-cover rounded-md border"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index, photoIndex)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePhotoUpload(index, e)}
                      className="hidden"
                      id={`photo-upload-${index}`}
                    />
                    <Label
                      htmlFor={`photo-upload-${index}`}
                      className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-md hover:border-gray-400"
                    >
                      <Upload className="h-4 w-4" />
                      Add Photos
                    </Label>
                    <span className="text-sm text-gray-500">
                      {itemData.photos.length} photo(s) added
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

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
