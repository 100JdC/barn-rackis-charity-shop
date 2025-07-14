
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Download, Plus, Clock, Users, BarChart3 } from "lucide-react";
import type { UserRole } from "@/types/item";

interface ItemsHeaderProps {
  userRole: UserRole;
  view: 'items' | 'pending' | 'stats' | 'users' | 'item-detail' | 'edit-item';
  onViewChange: (view: 'items' | 'pending' | 'stats' | 'users' | 'item-detail' | 'edit-item') => void;
  onExportData: () => void;
}

export const ItemsHeader = ({
  userRole,
  view,
  onViewChange,
  onExportData
}: ItemsHeaderProps) => {
  const getTitle = () => {
    switch (view) {
      case 'pending':
        return 'Pending Donations';
      case 'stats':
        return 'Statistics Dashboard';
      case 'users':
        return 'User Management';
      case 'item-detail':
        return 'Item Details';
      case 'edit-item':
        return 'Edit Item';
      default:
        return 'All Items';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-3">
        <CardTitle className="text-2xl font-bold text-gray-900">
          {getTitle()}
        </CardTitle>
      </div>
      <div className="flex flex-wrap gap-2">
        {userRole === 'admin' && (
          <>
            <Button 
              onClick={() => onViewChange('items')} 
              variant={view === 'items' ? 'default' : 'outline'}
            >
              Items
            </Button>
            <Button 
              onClick={() => onViewChange('pending')} 
              variant={view === 'pending' ? 'default' : 'outline'}
            >
              <Clock className="h-4 w-4 mr-2" />
              Pending
            </Button>
            <Button 
              onClick={() => onViewChange('stats')} 
              variant={view === 'stats' ? 'default' : 'outline'}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Stats
            </Button>
            <Button 
              onClick={() => onViewChange('users')} 
              variant={view === 'users' ? 'default' : 'outline'}
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </Button>
            <Button onClick={onExportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
