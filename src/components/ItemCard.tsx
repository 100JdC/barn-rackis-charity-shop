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

// Photo mapping for bedding and bathroom subcategories - same as in ItemForm
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
  'container': ['/lovable-uploads/09dcfd5c-cd3b-43e4-9273-19b7664fc35c.png']
};

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

  // Get photo for this item - prioritize subcategory photos for bedding and bathroom items
  const getItemPhoto = () => {
    // If it's a bedding or bathroom item, use the subcategory photo mapping
    if ((item.category === 'bedding' || item.category === 'bathroom') && item.subcategory && SUBCATEGORY_PHOTOS[item.subcategory]) {
      return SUBCATEGORY_PHOTOS[item.subcategory][0];
    }
    
    // Otherwise, use the item's stored photos
    if (item.photos && item.photos.length > 0) {
      const validPhotos = item.photos.filter(photo => 
        photo && 
        typeof photo === 'string' && 
        photo !== 'undefined' && 
        !photo.includes('_type')
      );
      
      if (validPhotos.length > 0) {
        return storage.getPhoto(validPhotos[0]);
      }
    }
    
    return null;
  };

  const photoUrl = getItemPhoto();
  
  console.log('ItemCard photo debug:', {
    itemName: item.name,
    category: item.category,
    subcategory: item.subcategory,
    photoUrl: photoUrl,
    hasSubcategoryPhoto: !!((item.category === 'bedding' || item.category === 'bathroom') && SUBCATEGORY_PHOTOS[item.subcategory])
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Photo section */}
        {photoUrl ? (
          <div className="mb-3">
            <img 
              src={photoUrl} 
              alt={item.name}
              className="w-full h-40 object-cover rounded-md"
              onError={(e) => {
                console.error('Failed to load image:', photoUrl);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', photoUrl);
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
