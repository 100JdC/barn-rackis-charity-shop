import { Edit, Trash2, MapPin, User, Calendar, Image, Images } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { storage } from "@/utils/storage";
import type { Item, UserRole } from "@/types/item";

interface ItemDetailProps {
  item: Item;
  userRole: UserRole;
  onEdit: () => void;
  onDelete: () => void;
  
}

export const ItemDetail = ({ item, userRole, onEdit, onDelete }: ItemDetailProps) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fix photo filtering - same as in ItemCard
  const validPhotos = item.photos ? item.photos.filter(photo => 
    photo && 
    typeof photo === 'string' && 
    photo !== 'undefined' && 
    !photo.includes('_type')
  ) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{item.name}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge className={getStatusColor(item.status)}>
                  {item.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {getCategoryDisplayName(item.category)}
                </Badge>
                <Badge className={getConditionColor(item.condition)}>
                  {item.condition.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {userRole === 'admin' && (
                <>
                  <Button variant="outline" onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" onClick={onDelete} className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Photos section */}
          {validPhotos.length > 0 && (
            <>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Images className="h-4 w-4" />
                  Photos ({validPhotos.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {validPhotos.map((photoPath, index) => {
                    const photoUrl = storage.getPhoto(photoPath);
                    return photoUrl ? (
                      <div key={index} className="aspect-square">
                        <img 
                          src={photoUrl} 
                          alt={`${item.name} - Photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-md border"
                          onError={(e) => {
                            console.error('Failed to load image:', photoUrl);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div key={index} className="aspect-square bg-gray-100 rounded-md flex items-center justify-center border">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                    );
                  })}
                </div>
              </div>
              <Separator />
            </>
          )}

          {item.description && (
            <>
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{item.description}</p>
              </div>
              <Separator />
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Item Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{getCategoryDisplayName(item.category)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subcategory:</span>
                    <span className="font-medium capitalize">{item.subcategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <span className="font-medium">{item.condition.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{item.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{item.status.replace('_', ' ')}</span>
                  </div>
                  {item.reserved_by && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reserved by:</span>
                      <span className="font-medium text-orange-600">{item.reserved_by}</span>
                    </div>
                  )}
                </div>
              </div>

              {item.location && (
                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4" />
                    <span>{item.location}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Pricing Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Price:</span>
                    <span className="font-medium">{item.original_price} SEK</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Suggested Price:</span>
                    <span className="font-medium text-green-600">{item.suggested_price} SEK</span>
                  </div>
                  {item.final_price && userRole === 'admin' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Final Price:</span>
                      <span className="font-bold text-blue-600">{item.final_price} SEK</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {item.internal_notes && userRole === 'admin' && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Internal Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{item.internal_notes}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Created by: {item.created_by}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created: {formatDate(item.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Updated by: {item.updated_by}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Updated: {formatDate(item.updated_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
