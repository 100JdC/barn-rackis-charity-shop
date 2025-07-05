
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, ShoppingCart } from "lucide-react";
import type { Item, UserRole } from "@/types/item";

interface StatsDashboardProps {
  items: Item[];
  userRole: UserRole;
  onPendingClick?: () => void;
}

export const StatsDashboard = ({ items, userRole, onPendingClick }: StatsDashboardProps) => {
  const stats = {
    totalItems: items.length,
    availableItems: items.filter(item => item.status === 'available').length,
    soldItems: items.filter(item => item.status === 'sold').length,
    pendingItems: items.filter(item => item.status === 'pending_approval').length,
    totalValue: items.reduce((sum, item) => sum + (item.final_price || item.suggested_price), 0)
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalItems}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.availableItems}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sold</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.soldItems}</div>
        </CardContent>
      </Card>

      {userRole === 'admin' && (
        <Card 
          className={`bg-white/90 backdrop-blur-sm ${stats.pendingItems > 0 ? 'cursor-pointer hover:bg-orange-50' : ''}`}
          onClick={stats.pendingItems > 0 ? onPendingClick : undefined}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingItems}</div>
            {stats.pendingItems > 0 && (
              <p className="text-xs text-gray-500 mt-1">Click to review</p>
            )}
          </CardContent>
        </Card>
      )}
      
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalValue} SEK</div>
        </CardContent>
      </Card>
    </div>
  );
};
