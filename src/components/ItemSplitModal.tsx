
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Item } from "@/types/item";

interface ItemSplitModalProps {
  item: Item;
  onSplit: (soldQuantity: number, finalPrice: number, status: 'sold' | 'reserved', reservedBy?: string) => void;
  onClose: () => void;
}

export const ItemSplitModal = ({ item, onSplit, onClose }: ItemSplitModalProps) => {
  const [soldQuantity, setSoldQuantity] = useState(1);
  const [finalPrice, setFinalPrice] = useState(item.suggested_price);
  const [status, setStatus] = useState<'sold' | 'reserved'>('sold');
  const [reservedBy, setReservedBy] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (soldQuantity > 0 && soldQuantity < item.quantity) {
      onSplit(soldQuantity, finalPrice, status, status === 'reserved' ? reservedBy : undefined);
    }
  };

  if (item.quantity <= 1) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 bg-white">
        <CardHeader>
          <CardTitle>Split Item: {item.name}</CardTitle>
          <div className="text-sm text-gray-600">
            Current quantity: {item.quantity}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity to {status}:</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={item.quantity - 1}
                value={soldQuantity}
                onChange={(e) => setSoldQuantity(parseInt(e.target.value) || 1)}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                Remaining quantity will be: {item.quantity - soldQuantity}
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status:</Label>
              <Select value={status} onValueChange={(value: 'sold' | 'reserved') => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {status === 'reserved' && (
              <div>
                <Label htmlFor="reserved-by">Reserved by:</Label>
                <Input
                  id="reserved-by"
                  value={reservedBy}
                  onChange={(e) => setReservedBy(e.target.value)}
                  placeholder="Enter person's name"
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="final-price">Final Price (SEK):</Label>
              <Input
                id="final-price"
                type="number"
                min="0"
                step="0.01"
                value={finalPrice}
                onChange={(e) => setFinalPrice(parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit"
                disabled={soldQuantity <= 0 || soldQuantity >= item.quantity}
                className="flex-1"
              >
                Split & Mark as {status}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
