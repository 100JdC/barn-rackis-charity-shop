
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ImageIcon } from "lucide-react";
import type { Item } from "@/types/item";

interface CategoryBrowserProps {
  items: Item[];
  onCategorySelect: (category: string) => void;
}

const categories = [
  { 
    value: "bedding", 
    label: "Bedding", 
    image: "/lovable-uploads/bedding.jpg",
    hasImage: true 
  },
  { 
    value: "bathroom", 
    label: "Bathroom", 
    image: "/lovable-uploads/bathroom.jpg",
    hasImage: true 
  },
  { 
    value: "decoration", 
    label: "Decoration", 
    image: "/lovable-uploads/scandinaviandecoration.jpg",
    hasImage: true 
  },
  { 
    value: "other_room_inventory", 
    label: "Room Inventory", 
    image: "/lovable-uploads/room.jpg",
    hasImage: true 
  },
  { 
    value: "kitchen", 
    label: "Kitchen", 
    image: "/lovable-uploads/kitchen.jpg",
    hasImage: true 
  },
  { 
    value: "bike_sports", 
    label: "Bike & Sports", 
    image: "",
    hasImage: false 
  },
  { 
    value: "electronics", 
    label: "Electronics", 
    image: "",
    hasImage: false 
  },
  { 
    value: "other", 
    label: "Other", 
    image: "",
    hasImage: false 
  }
];

export const CategoryBrowser = ({ items, onCategorySelect }: CategoryBrowserProps) => {
  const getCategoryCount = (categoryValue: string) => {
    return items.filter(item => item.category === categoryValue && item.status === 'available').length;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => {
        const itemCount = getCategoryCount(category.value);
        
        return (
          <Card 
            key={category.value} 
            className="bg-white/95 backdrop-blur-sm hover:bg-white cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
            onClick={() => onCategorySelect(category.value)}
          >
            <CardContent className="p-6">
              <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                {category.hasImage ? (
                  <img
                    src={category.image}
                    alt={category.label}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error(`Failed to load image for ${category.label}:`, category.image);
                      e.currentTarget.style.display = 'none';
                      const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full h-full ${category.hasImage ? 'hidden' : 'flex'} items-center justify-center bg-gray-100`}
                >
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.label}
                </h3>
                
                <div className="flex items-center justify-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <Badge variant="secondary" className="text-sm">
                    {itemCount} items
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
