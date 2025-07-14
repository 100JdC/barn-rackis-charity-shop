
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { UserRole } from "@/types/item";

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  conditionFilter: string;
  setConditionFilter: (condition: string) => void;
  userRole: UserRole;
}

export const SearchAndFilters = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  conditionFilter,
  setConditionFilter,
  userRole
}: SearchAndFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="bedding">Bedding</SelectItem>
            <SelectItem value="bathroom">Bathroom</SelectItem>
            <SelectItem value="decoration">Decoration</SelectItem>
            <SelectItem value="other_room_inventory">Other Room Inventory</SelectItem>
            <SelectItem value="kitchen">Kitchen</SelectItem>
            <SelectItem value="bike_sports">Bike & Sports</SelectItem>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="donated">Donated</SelectItem>
            {userRole === 'admin' && (
              <SelectItem value="pending_approval">Pending</SelectItem>
            )}
          </SelectContent>
        </Select>
        
        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="lightly_used">Lightly Used</SelectItem>
            <SelectItem value="worn">Worn</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
