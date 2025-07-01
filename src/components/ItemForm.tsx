
import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Item } from "@/types/item";

interface ItemFormProps {
  item?: Item | null;
  onSubmit: (item: Omit<Item, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export const ItemForm = ({ item, onSubmit, onCancel }: ItemFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other' as const,
    condition: 'lightly_used' as const,
    original_price: 0,
    suggested_price: 0,
    final_price: undefined as number | undefined,
    status: 'available' as const,
    location: '',
    photos: [] as string[],
    internal_notes: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        category: item.category,
        condition: item.condition,
        original_price: item.original_price,
        suggested_price: item.suggested_price,
        final_price: item.final_price,
        status: item.status,
        location: item.location,
        photos: item.photos,
        internal_notes: item.internal_notes || '',
      });
    }
  }, [item]);

  const handleOriginalPriceChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      original_price: value,
      suggested_price: prev.suggested_price === prev.original_price * 0.5 ? value * 0.5 : prev.suggested_price
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{item ? 'Edit Item' : 'Add New Item'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
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
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                placeholder="Describe the item"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="decor">Decor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="original_price">Original Price (SEK) *</Label>
                <Input
                  id="original_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) => handleOriginalPriceChange(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="suggested_price">Suggested Price (SEK) *</Label>
                <Input
                  id="suggested_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.suggested_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, suggested_price: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="donated">Donated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                  placeholder="Storage location"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="internal_notes">Internal Notes</Label>
              <Textarea
                id="internal_notes"
                value={formData.internal_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, internal_notes: e.target.value }))}
                placeholder="Internal notes (visible to admins and volunteers only)"
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              {item ? 'Update Item' : 'Add Item'}
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
