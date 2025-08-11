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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#001da6' }}>
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#001da6' }}>
      <Header 
        userRole={userRole}
        username={username}
        onDonate={handleDonate}
        onLogout={isAuthenticated ? handleLogout : undefined}
        isAuthenticated={isAuthenticated}
      />
      <BetaNotice />
      
      <main className="pt-0">
        <div className="bg-[#001da6] text-white min-h-[calc(100vh-4rem)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-1">
            {/* Header text */}
            <div className="text-center mb-1">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 px-2">
                Welcome to Rackis for barn!
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-1 px-2">
                Find quality second-hand items for your student life in Uppsala
              </p>
            </div>

            {/* Centered bear image with search bar */}
            <div className="flex flex-col items-center justify-center mb-3">
              <div className="relative mt-0 mb-3">
                <img
                  src="/lovable-uploads/50d0870c-a6a5-46a2-99ad-d9bbf533e576.png"
                  alt="Rackis Bear Mascot"
                  className="w-full max-w-[280px] md:max-w-[350px] h-auto object-contain opacity-90"
                  onLoad={() => console.log('Bear image loaded')}
                />
                
                {/* Search bar positioned in the bear's sign */}
                <div className="absolute top-[67%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[85%] md:w-[90%] z-50 pointer-events-auto">
                  <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg">
                    <input
                      type="text"
                      placeholder="What do you need in Uppsala?"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      className="flex-1 border-0 bg-transparent text-gray-800 placeholder-gray-500 text-xs md:text-sm h-6 md:h-7 p-0 focus:ring-0 focus:outline-none"
                    />
                    <button 
                      onClick={handleSearchClick}
                      className="bg-transparent hover:bg-transparent p-0 h-5 md:h-6"
                    >
                      <svg className="h-3 w-3 md:h-4 md:w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Text content below the bear */}
            {!isAuthenticated && (
              <div className="text-white space-y-4 md:space-y-6 text-center max-w-4xl mx-auto px-2">
                <div className="text-sm md:text-lg text-white/90 space-y-2 md:space-y-3 leading-relaxed">
                  <p>A platform for students in Uppsala to exchange second-hand items during move-ins and move-outs.</p>
                  <p className="hidden md:block">We collect useful items from outgoing students and sell them at fair prices to new tenants.</p>
                  <p className="hidden md:block">All profits go to Barncancerfonden, supporting children with cancer and their families.</p>
                  <p className="md:hidden">We collect items from outgoing students and sell them at fair prices. All profits support Barncancerfonden.</p>
                  <p>It's simple: buy and donate things you only need in Uppsala — sustainably and for a good cause.</p>
                  <p className="font-semibold text-white">🧸 För barn. För studenterna. För miljön.</p>
                </div>
                <div className="text-center mt-4 md:mt-6">
                  <button
                    onClick={() => window.open('/about', '_blank')}
                    className="text-white/90 hover:text-white text-sm md:text-lg underline px-2 whitespace-normal leading-relaxed break-words h-auto"
                  >
                     Find out more about the concept, the swedish words we use, who we are, and how you can contribute.
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-md mx-auto px-4">
                  <button
                    onClick={handleBrowseItems}
                    className="w-full bg-white/20 hover:bg-white/30 text-white h-10 md:h-12 text-sm md:text-lg border border-white/30 rounded"
                  >
                    Browse our items
                  </button>
                  <button
                    onClick={() => navigate('/auth')}
                    className="w-full bg-white/20 hover:bg-white/30 text-white h-10 md:h-12 text-sm md:text-lg border border-white/30 rounded"
                  >
                    Login / Register
                  </button>
                </div>
              </div>
            )}

            {/* Admin Panel for pending donations */}
            {isAuthenticated && userRole === 'admin' && (
              <div className="mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Admin Dashboard</h2>
                  <PendingDonations onItemsUpdate={loadItems} />
                </div>
              </div>
            )}

            <div className="mt-8">
              <CategoryBrowser
              items={items} 
              onCategorySelect={handleCategorySelect}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}