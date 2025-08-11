import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { CategoryBrowser } from "@/components/CategoryBrowser";
import { Footer } from "@/components/Footer";
import { BetaNotice } from "@/components/BetaNotice";
import { PendingDonations } from "@/components/PendingDonations";
import { DonatePage } from "@/pages/DonatePage";
import { LoginForm } from "@/components/LoginForm";
import { storage } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Item } from "@/types/item";

export default function Index() {
  const navigate = useNavigate();
  const [view, setView] = useState<'home' | 'donate'>('home');
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const { 
    user, 
    userRole, 
    username, 
    isAuthenticated, 
    loading: authLoading,
    signOut 
  } = useAuth();

  useEffect(() => {
    // Check if donate parameter is in URL
    if (searchParams.get('donate') === 'true') {
      setView('donate');
    }
  }, [searchParams]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const loadedItems = await storage.getItems();
      console.log('Items loaded:', loadedItems.length);
      setItems(loadedItems);
    } catch (error) {
      console.error('Error loading items:', error);
      toast({
        title: "Error",
        description: "Failed to load items. Please check your connection.",
        variant: "destructive"
      });
    }
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setView('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDonate = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to donate items.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    setView('donate');
  };

  const handleCategorySelect = (category: string) => {
    navigate(`/category/${category}?role=${userRole}`);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchTerm.trim())}&role=${userRole}`);
    }
  };

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchTerm.trim())}&role=${userRole}`);
    }
  };

  const handleBrowseItems = () => {
    navigate(`/items?role=${userRole}`);
  };

  // If showing donate page, render it
  if (view === 'donate') {
    return (
      <DonatePage 
        userRole={userRole}
        username={username}
        onBack={() => setView('home')}
        onLogout={handleLogout}
        onNavigate={(view: string) => {
          if (view === 'home') setView('home');
        }}
      />
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header 
        userRole={userRole}
        username={username}
        onDonate={handleDonate}
        onLogout={isAuthenticated ? handleLogout : undefined}
        isAuthenticated={isAuthenticated}
      />
      <BetaNotice />
      
      <main className="pt-16">
        {/* Search Section */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none transition-colors bg-white/90 backdrop-blur-sm"
                />
                <button
                  onClick={handleSearchClick}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Panel */}
        {isAuthenticated && userRole === 'admin' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
              <PendingDonations 
                onItemsUpdate={loadItems}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <div className="relative">
              <img 
                src="/lovable-uploads/Categories/micky.png" 
                alt="Rackis Mascot"
                className="w-48 h-48 mx-auto mb-6 object-contain"
                onLoad={() => console.log('Bear image loaded')}
                onError={(e) => {
                  console.error('Bear image failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">Welcome to Rackis for Barn!</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  A platform for students in Uppsala to exchange second-hand items during move-ins and move-outs.
                </p>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                  We collect useful items from outgoing students and sell them at fair prices to new tenants. 
                  All profits go to Barncancerfonden, supporting children with cancer and their families.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <button
              onClick={handleBrowseItems}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold py-4 px-8 rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              Browse our items
            </button>
            <button
              onClick={handleDonate}
              className="bg-green-600 hover:bg-green-700 text-white text-xl font-semibold py-4 px-8 rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              {isAuthenticated ? 'Donate items' : 'Login to donate'}
            </button>
          </div>

          {/* Categories */}
          <CategoryBrowser 
            items={items}
            onCategorySelect={handleCategorySelect}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}