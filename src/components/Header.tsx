
import { ArrowLeft, User, LogOut, Search, Heart, Instagram, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  userRole: string;
  username?: string;
  onBack?: () => void;
  onLogout?: () => void;
  onNavigate?: (view: string) => void;
  onHome?: () => void;
  onDonate?: () => void;
  isAuthenticated?: boolean;
}

export const Header = ({ userRole, username, onBack, onLogout, onNavigate, onHome, onDonate, isAuthenticated }: HeaderProps) => {
  const navigate = useNavigate();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'donator': return 'bg-green-100 text-green-800 border-green-200';
      case 'buyer': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDonate = () => {
    // Check if user is authenticated (either via Supabase or as admin)
    if (!isAuthenticated && userRole !== 'admin') {
      // Not authenticated, redirect to login
      navigate('/login');
    } else {
      // Authenticated, go to donate functionality
      if (onDonate) {
        onDonate();
      } else {
        // Fallback to direct navigation if onDonate not provided
        navigate('/donate');
      }
    }
  };

  const handleBrowseItems = () => {
    navigate('/items');
  };

  const handleHome = () => {
    if (isAuthenticated && onHome) {
      onHome();
    } else {
      navigate('/');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <img
              src="/lovable-uploads/66828e04-ca12-4680-80e2-f4704d6832eb.png"
              alt="Rackis for Barn Logo"
              className="w-8 h-8 object-contain"
              onError={(e) => {
                console.error('Failed to load bear logo in header');
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Rackis för Barn</h1>
              <p className="text-xs text-gray-600">Inventory Management System</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBrowseItems}
            className="hover:bg-gray-100"
          >
            <Search className="h-4 w-4 mr-2" />
            Browse Items
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDonate}
            className="hover:bg-green-50 hover:text-green-600"
          >
            <Heart className="h-4 w-4 mr-2" />
            Donate
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/about')}
            className="hover:bg-gray-100"
          >
            About Us
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.open('https://www.instagram.com/rackis_for_barn/', '_blank')}
            className="hover:bg-pink-50 hover:text-pink-600"
          >
            <Instagram className="h-4 w-4" />
          </Button>
          
          {(isAuthenticated || userRole === 'admin') && userRole && userRole !== 'buyer' && (
            <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-lg">
              <Badge className={`${getRoleColor(userRole)} text-xs font-medium`}>
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
              
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="h-4 w-4" />
                <span>{username || 'Demo User'}</span>
              </div>
            </div>
          )}
          
          {/* Show logout button when authenticated or admin */}
          {(isAuthenticated || userRole === 'admin') && onLogout && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
          
          {/* Show home button when not authenticated */}
          {!isAuthenticated && userRole !== 'admin' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleHome}
              className="hover:bg-blue-50 hover:text-blue-600"
            >
              <Home className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
