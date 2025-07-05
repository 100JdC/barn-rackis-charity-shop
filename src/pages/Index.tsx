
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/LoginForm";
import { DonatePage } from "@/pages/DonatePage";
import { Header } from "@/components/Header";
import { CategoryBrowser } from "@/components/CategoryBrowser";
import { storage } from "@/utils/storage";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  const { toast } = useToast();

  // Set up Supabase auth listener with better error handling
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        const userUsername = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User';
        const role = session.user.email === 'jacob@admin.com' ? 'admin' : 'donator';
        
        setIsAuthenticated(true);
        setUserRole(role);
        setUsername(userUsername);
        
        // Save session to localStorage for compatibility
        storage.saveSession(role, userUsername);
      } else {
        // Check for local storage session (for admin)
        const savedSession = storage.getSession();
        if (savedSession) {
          setIsAuthenticated(true);
          setUserRole(savedSession.userRole);
          setUsername(savedSession.username);
        } else {
          setIsAuthenticated(false);
          setUserRole('buyer');
          setUsername('');
          storage.clearSession();
        }
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error('Error getting session:', error);
        return;
      }

      if (session?.user) {
        const userUsername = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User';
        const role = session.user.email === 'jacob@admin.com' ? 'admin' : 'donator';
        
        setIsAuthenticated(true);
        setUserRole(role);
        setUsername(userUsername);
        storage.saveSession(role, userUsername);
      } else {
        // Check for local storage session (for admin)
        const savedSession = storage.getSession();
        if (savedSession) {
          setIsAuthenticated(true);
          setUserRole(savedSession.userRole);
          setUsername(savedSession.username);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load items when the component mounts
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
    
    // If registering as donator, go to donate page
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
    // Check if user is authenticated (either via Supabase or as admin)
    if (!isAuthenticated && userRole !== 'admin') {
      // Not authenticated, redirect to login page
      navigate('/login');
      return;
    }
    
    // Authenticated, go to donate view
    setView('donate');
  };

  const handleCategorySelect = (category: string) => {
    navigate(`/category/${category}`);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchTerm)}`);
    }
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

  // Show login form only when explicitly requested or when trying to donate without auth
  if (view === 'home' && !isAuthenticated && userRole !== 'admin' && searchTerm === '') {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1733a7' }}>
      <div className="absolute inset-0 flex items-center justify-center z-0 opacity-30 pointer-events-none">
        <img
          src="/lovable-uploads/66828e04-ca12-4680-80e2-f4704d6832eb.png"
          alt="Rackis for Barn Logo"
          className="w-[600px] h-auto object-contain"
          onError={(e) => {
            console.error('Failed to load bear logo');
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      
      <div className="relative z-10">
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
            
            <Card className="bg-white/90 backdrop-blur-sm max-w-md mx-auto mb-8">
              <CardContent className="p-6">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search for items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={handleSearchClick} size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <CategoryBrowser 
            items={items} 
            onCategorySelect={handleCategorySelect}
          />
        </div>
      </div>
    </div>
  );
}
