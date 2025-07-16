import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/LoginForm";
import { DonatePage } from "@/pages/DonatePage";
import { Header } from "@/components/Header";
import { CategoryBrowser } from "@/components/CategoryBrowser";
import { Footer } from "@/components/Footer";
import { storage } from "@/utils/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import type { Item, UserRole } from "@/types/item";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>('buyer');
  const [username, setUsername] = useState<string>('');
  const [view, setView] = useState<'home' | 'donate'>('home');
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const savedSession = storage.getSession();
    if (savedSession && savedSession.userRole === 'admin') {
      console.log('Found admin session in localStorage:', savedSession);
      setIsAuthenticated(true);
      setUserRole(savedSession.userRole as UserRole);
      setUsername(savedSession.username);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        const userUsername = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User';
        const role: UserRole = session.user.email === 'jacob@admin.com' ? 'admin' : 'donator';
        
        setIsAuthenticated(true);
        setUserRole(role);
        setUsername(userUsername);
        storage.saveSession(role, userUsername);
      } else {
        const currentSession = storage.getSession();
        if (!currentSession || currentSession.userRole !== 'admin') {
          setIsAuthenticated(false);
          setUserRole('buyer');
          setUsername('');
          storage.clearSession();
        }
      }
    });

    if (!savedSession || savedSession.userRole !== 'admin') {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (session?.user) {
          const userUsername = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User';
          const role: UserRole = session.user.email === 'jacob@admin.com' ? 'admin' : 'donator';
          
          setIsAuthenticated(true);
          setUserRole(role);
          setUsername(userUsername);
          storage.saveSession(role, userUsername);
        }
      });
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

  const handleLogin = (role: 'admin' | 'donator' | 'buyer', loginUsername?: string) => {
    console.log('Login successful:', role, loginUsername);
    setUserRole(role);
    setUsername(loginUsername || '');
    setIsAuthenticated(true);
    setShowLoginForm(false);
    
    if (role === 'donator') {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user && new Date(user.created_at).getTime() > Date.now() - 10000) {
          setView('donate');
        } else {
          navigate('/items');
        }
      });
    } else {
      navigate('/items');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserRole('buyer');
      setUsername('');
      setIsAuthenticated(false);
      setView('home');
      setShowLoginForm(false);
      storage.clearSession();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDonate = () => {
    if (!isAuthenticated && userRole !== 'admin') {
      navigate('/login');
      return;
    }
    
    setView('donate');
  };

  const handleCategorySelect = (category: string) => {
    navigate(`/category/${category}`);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleBrowseItems = () => {
    setUserRole('buyer');
    navigate('/items');
  };

  if (view === 'donate') {
    return (
      <DonatePage
        userRole={userRole}
        username={username}
        onLogout={handleLogout}
        onNavigate={() => {}}
        onBack={() => setView('home')}
      />
    );
  }

  if (showLoginForm && !isAuthenticated && userRole !== 'admin') {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#001faa' }}>
      <div className="relative z-10 flex-1">
        <Header 
          userRole={userRole} 
          username={username}
          onLogout={(isAuthenticated || userRole === 'admin') ? handleLogout : undefined}
          onDonate={handleDonate}
          onHome={() => setView('home')}
          isAuthenticated={isAuthenticated}
        />
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to Rackis för Barn</h1>
            <p className="text-xl text-white/90 mb-8">
              Find quality second-hand items for your student life in Uppsala
            </p>
          </div>

          {/* Two-column layout: Image + Search on left, Text on right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left column: Bear image with search bar */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <img
                  src="/lovable-uploads/08412347-e9d0-402d-a43c-8c3d1d381714.png"
                  alt="Rackis for Barn Logo"
                  className="w-full max-w-[500px] h-auto object-contain opacity-90"
                />
                
                {/* Search bar positioned in the bear's sign */}
                <div className="absolute top-[47%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[52%]">
                  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-2">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Search for items..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyPress={handleSearchKeyPress}
                          className="flex-1 border-gray-300 text-gray-800 placeholder-gray-500 text-sm h-8"
                        />
                        <Button 
                          onClick={handleSearchClick}
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 px-3 h-8"
                        >
                          <Search className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Right column: Text content */}
            <div className="flex flex-col justify-center">
              {!isAuthenticated && userRole === 'buyer' && (
                <div className="text-white space-y-6">
                  <div className="text-lg text-white/90 space-y-3 leading-relaxed">
                    <p>A platform for students in Uppsala to exchange second-hand items during move-ins and move-outs.</p>
                    <p>We collect useful items from outgoing students and sell them at fair prices to new tenants.</p>
                    <p>All profits go to Barncancerfonden, supporting children with cancer and their families.</p>
                    <p>It's simple: buy and donate things you only need in Uppsala (duvets, curtains, bikes and much more) — sustainably and for a good cause.</p>
                    <p className="font-semibold text-white">🌍 Good for students. Good for the planet.</p>
                  </div>
                  <div className="text-center mt-6">
                    <Button
                      variant="link"
                      onClick={() => window.open('/about', '_blank')}
                      className="text-white/90 hover:text-white text-lg underline"
                    >
                      👉 Find out more about the concept, who we are, and how you can contribute.
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={handleBrowseItems}
                      className="w-full bg-white/20 hover:bg-white/30 text-white h-12 text-lg border-white/30"
                      variant="outline"
                    >
                      Browse our items
                    </Button>
                    <Button
                      onClick={() => navigate('/register')}
                      className="w-full bg-white/20 hover:bg-white/30 text-white h-12 text-lg border-white/30"
                      variant="outline"
                    >
                      Register to donate
                    </Button>
                  </div>
                  <div className="text-center">
                    <Button
                      onClick={() => navigate('/login')}
                      className="text-white/80 hover:text-white text-lg underline"
                      variant="link"
                    >
                      Already have an account? Login here
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <CategoryBrowser 
            items={items} 
            onCategorySelect={handleCategorySelect}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
