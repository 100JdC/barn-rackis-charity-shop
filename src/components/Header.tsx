
import { ArrowLeft, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  userRole: string;
  onBack?: () => void;
}

export const Header = ({ userRole, onBack }: HeaderProps) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'volunteer': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">Rackis for Barn</h1>
            <p className="text-sm text-gray-600">Inventory Management</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={getRoleColor(userRole)}>
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>Demo User</span>
          </div>
          <Button variant="ghost" size="sm">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
