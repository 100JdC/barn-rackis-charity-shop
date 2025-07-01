
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
      case 'donator': return 'bg-green-100 text-green-800';
      case 'buyer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 p-4 relative">
      {/* Logo in top right corner */}
      <div className="absolute top-2 right-4 w-16 h-16">
        <img 
          src="/lovable-uploads/e864de0e-0b29-4248-a8d7-0a94ae10521b.png" 
          alt="Barncancerfonden Logo" 
          className="w-full h-full object-contain"
        />
      </div>

      {/* Scientist with speech bubble - only show on main page (when no onBack prop) */}
      {!onBack && (
        <div className="absolute top-2 right-24 flex items-start gap-2">
          <div className="relative bg-white border-2 border-gray-300 rounded-lg px-3 py-2 shadow-lg">
            <div className="text-sm font-medium text-gray-800">Welcome to Rackis for Barn!</div>
            {/* Speech bubble arrow */}
            <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
            <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-0 h-0 border-l-6 border-l-gray-300 border-t-3 border-t-transparent border-b-3 border-b-transparent"></div>
          </div>
          <div className="w-12 h-12">
            <img 
              src="/lovable-uploads/74b13bd1-2a11-44cc-986f-298a9ebc67b6.png" 
              alt="Scientist" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">Rackis for Barn</h1>
            <p className="text-sm text-gray-600">Inventory Management System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mr-32">
          <Badge className={getRoleColor(userRole)}>
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>Demo User</span>
          </div>
        </div>
      </div>
    </header>
  );
};
