
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Image } from "lucide-react";
import type { Item } from "@/types/item";

interface CategoryBrowserProps {
  items: Item[];
  onCategorySelect: (category: string) => void;
}

export const CategoryBrowser = ({ items, onCategorySelect }: CategoryBrowserProps) => {
  const categories = [
    { 
      value: "bedding", 
      label: "Bedding", 
      image: "/lovable-uploads/bedding.jpg",
      hasImage: false // Set to true when you upload the image
    },
    { 
      value: "bathroom", 
      label: "Bathroom", 
      image: "/lovable-uploads/bathroom.jpg",
      hasImage: false // Set to true when you upload the image
    },
    { 
      value: "decoration", 
      label: "Decoration", 
      image: "/lovable-uploads/decoration.jpg",
      hasImage: false // Set to true when you upload the image
    },
    { 
      value: "other_room_inventory", 
      label: "Other Room Inventory", 
      image: "/lovable-uploads/other-room.jpg",
      hasImage: false // Set to true when you upload the image
    },
    { 
      value: "kitchen", 
      label: "Kitchen", 
      image: "/lovable-uploads/kitchen.jpg",
      hasImage: false // Set to true when you upload the image
    },
    { 
      value: "bike_sports", 
      label: "Bike & Sports", 
      image: "/lovable-uploads/bike-sports.jpg",
      hasImage: false // Set to true when you upload the image
    },
    { 
      value: "electronics", 
      label: "Electronics", 
      image: "/lovable-uploads/electronics.jpg",
      hasImage: false // Set to true when you upload the image
    },
    { 
      value: "other", 
      label: "Other", 
      image: "/lovable-uploads/other.jpg",
      hasImage: false // Set to true when you upload the image
    }
  ];

  const getCategoryCount = (category: string) => {
    return items.filter(item => item.category === category).length;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {categories.map((category) => {
        const count = getCategoryCount(category.value);
        
        return (
          <Card 
            key={category.value} 
            className="cursor-pointer hover:shadow-lg transition-shadow bg-white/90 backdrop-blur-sm"
            onClick={() => onCategorySelect(category.value)}
          >
            <CardContent className="p-4">
              {/* Image section - mobile friendly height */}
              {category.hasImage ? (
                <div className="mb-3">
                  <img 
                    src={category.image} 
                    alt={category.label}
                    className="w-full h-32 md:h-40 object-cover rounded-md"
                    onError={(e) => {
                      console.error('Failed to load category image:', category.image);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="mb-3 h-32 md:h-40 bg-gray-100 rounded-md flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                  <span className="text-xs text-gray-400 ml-2">No image</span>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-center">{category.label}</h3>
                <div className="flex justify-center">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {count} items
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
