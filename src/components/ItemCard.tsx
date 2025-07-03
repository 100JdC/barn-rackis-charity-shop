import { Eye, Edit, Trash2, QrCode, MapPin, Image, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { storage } from "@/utils/storage";
import type { Item, UserRole } from "@/types/item";

interface ItemCardProps {
  item: Item;
  userRole: UserRole;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShowQRCode: () => void;
}

export const ItemCard = ({ item, userRole, onView, onEdit, onDelete, onShowQRCode }: ItemCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'donated': return 'bg-purple-100 text-purple-800';
      case 'pending_approval': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-emerald-100 text-emerald-800';
      case 'lightly_used': return 'bg-amber-100 text-amber-800';
      case 'worn': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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

  // Fix photo URL generation - filter out undefined/invalid entries
  const validPhotos = item.photos ? item.photos.filter(photo => 
    photo && 
    typeof photo === 'string' && 
    photo !== 'undefined' && 
    !photo.includes('_type')
  ) : [];
  
  const firstPhotoUrl = validPhotos.length > 0 ? storage.getPhoto(validPhotos[0]) : null;
  
  console.log('ItemCard photo debug:', {
    itemName: item.name,
    rawPhotosArray: item.photos,
    validPhotos: validPhotos,
    firstPhotoPath: validPhotos[0],
    firstPhotoUrl: firstPhotoUrl
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Photo section */}
        {firstPhotoUrl ? (
          <div className="mb-3">
            <img 
              src={firstPhotoUrl} 
              alt={item.name}
              className="w-full h-40 object-cover rounded-md"
              onError={(e) => {
                console.error('Failed to load image:', firstPhotoUrl);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', firstPhotoUrl);
              }}
            />
          </div>
        ) : (
          <div className="mb-3 h-40 bg-gray-100 rounded-md flex items-center justify-center">
            <Image className="h-8 w-8 text-gray-400" />
            <span className="text-xs text-gray-400 ml-2">No photo</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg truncate">{item.name}</h3>
            <Badge className={getStatusColor(item.status)}>
              {item.status.replace('_', ' ')}
            </Badge>
          </div>
          
          {item.description && (
            <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
          )}
          
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="capitalize">
              {getCategoryDisplayName(item.category)}
            </Badge>
            <Badge className={getConditionColor(item.condition)}>
              {item.condition.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subcategory:</span>
            <span className="font-medium capitalize">{item.subcategory}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Quantity:</span>
            <div className="font-medium">
              {item.quantity}
              {(item as any).quantityDisplay && (
                <span className="text-blue-600 ml-1">({(item as any).quantityDisplay})</span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Original:</span>
              <span className="font-medium">{item.original_price} SEK</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Suggested:</span>
              <span className="font-medium text-green-600">{item.suggested_price} SEK</span>
            </div>
            {item.final_price && userRole === 'admin' && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Final:</span>
                <span className="font-bold text-blue-600">{item.final_price} SEK</span>
              </div>
            )}
          </div>
          
          {item.location && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>{item.location}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={onView} className="flex-1">
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
        
        <Button variant="outline" size="sm" onClick={onShowQRCode}>
          <QrCode className="h-3 w-3" />
        </Button>
        
        {userRole === 'admin' && (
          <>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-3 w-3" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};
