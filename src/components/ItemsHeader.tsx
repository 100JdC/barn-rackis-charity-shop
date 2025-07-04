
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Download, Plus, Clock, Users } from "lucide-react";
import type { UserRole } from "@/types/item";

interface ItemsHeaderProps {
  showCategories: boolean;
  categoryFilter: string;
  searchTerm: string;
  isAuthenticated: boolean;
  userRole: UserRole;
  pendingItemsCount: number;
  onBackToCategories: () => void;
  onLoginClick: () => void;
  onAddItem: () => void;
  onPendingDonations: () => void;
  onExport: () => void;
  onUserManagement: () => void;
}

export const ItemsHeader = ({
  showCategories,
  categoryFilter,
  searchTerm,
  isAuthenticated,
  userRole,
  pendingItemsCount,
  onBackToCategories,
  onLoginClick,
  onAddItem,
  onPendingDonations,
  onExport,
  onUserManagement
}: ItemsHeaderProps) => {
  const getTitle = () => {
    if (showCategories) return 'Browse Categories';
    if (categoryFilter !== "all") {
      const categoryName = categoryFilter === 'bedding' ? 'Duvet/Blanket' : 
                          categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1).replace('_', ' ');
      return `${categoryName} Items`;
    }
    if (searchTerm) return `Search Results for "${searchTerm}"`;
    return 'All Items';
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        {!showCategories && (
          <Button 
            onClick={onBackToCategories} 
            variant="outline"
            className="bg-white/80"
          >
            ← Back to Categories
          </Button>
        )}
        <CardTitle className="text-white" style={{ color: '#1733a7' }}>
          {getTitle()}
        </CardTitle>
      </div>
      <div className="flex flex-wrap gap-2">
        {!isAuthenticated && (
          <Button 
            onClick={onLoginClick}
            className="bg-green-600 hover:bg-green-700"
          >
            Login / Register
          </Button>
        )}
        {userRole === 'admin' && (
          <>
            <Button onClick={onAddItem} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            <Button onClick={onPendingDonations} variant="outline" className="bg-orange-50 border-orange-200">
              <Clock className="h-4 w-4 mr-2" />
              Pending ({pendingItemsCount})
            </Button>
            <Button onClick={onExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={onUserManagement} variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Users
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
