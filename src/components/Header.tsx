
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
      navigate('/auth');
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
    <header className="bg-white shadow-sm border-b border-gray-200 px-3 md:px-6 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-1 md:gap-3 flex-wrap">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBrowseItems}
            className="hover:bg-gray-100 text-xs md:text-sm px-2 md:px-3"
          >
            <Search className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
            <span className="hidden md:inline">Browse Items</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDonate}
            className="hover:bg-green-50 hover:text-green-600 text-xs md:text-sm px-2 md:px-3"
          >
            <Heart className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
            <span className="hidden md:inline">Donate</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/about')}
            className="hover:bg-gray-100 text-xs md:text-sm px-2 md:px-3 hidden sm:flex"
          >
            <span className="hidden md:inline">About Us</span>
            <span className="md:hidden">About</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.open('https://www.instagram.com/rackis_for_barn/', '_blank')}
            className="hover:bg-pink-50 hover:text-pink-600 px-2 md:px-3"
          >
            <Instagram className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          
          {(isAuthenticated || userRole === 'admin') && userRole && userRole !== 'buyer' && (
            <div className="flex items-center gap-1 md:gap-3 bg-gray-50 px-2 md:px-3 py-1.5 rounded-lg">
              <Badge className={`${getRoleColor(userRole)} text-xs font-medium`}>
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
              
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-700">
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
              className="hover:bg-red-50 hover:text-red-600 px-2 md:px-3"
            >
              <LogOut className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          )}
          
          {/* Show home button when not authenticated */}
          {!isAuthenticated && userRole !== 'admin' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleHome}
              className="hover:bg-blue-50 hover:text-blue-600 px-2 md:px-3"
            >
              <Home className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
