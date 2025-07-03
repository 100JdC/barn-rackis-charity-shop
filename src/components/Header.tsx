
import { ArrowLeft, User, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  userRole: string;
  username?: string;
  onBack?: () => void;
  onLogout?: () => void;
  onNavigate?: (view: string) => void;
}

export const Header = ({ userRole, username, onBack, onLogout, onNavigate }: HeaderProps) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'donator': return 'bg-green-100 text-green-800 border-green-200';
      case 'buyer': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <img
              src="/lovable-uploads/bearlogo.png"
              alt="Rackis for Barn Logo"
              className="w-10 h-10 object-contain"
              onError={(e) => {
                console.error('Failed to load bear logo in header');
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Rackis för Barn</h1>
              <p className="text-sm text-gray-600">Inventory Management System</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {onNavigate && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('items')}
              className="hover:bg-gray-100"
            >
              <Home className="h-4 w-4 mr-2" />
              All Items
            </Button>
          )}
          
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg">
            <Badge className={`${getRoleColor(userRole)} text-xs font-medium`}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </Badge>
            
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="h-4 w-4" />
              <span>{username || 'Demo User'}</span>
            </div>
          </div>
          
          {onLogout && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
