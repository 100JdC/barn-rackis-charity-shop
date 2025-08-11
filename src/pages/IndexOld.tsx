import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoginForm } from "@/components/LoginForm";
import { DonatePage } from "@/pages/DonatePage";
import { Header } from "@/components/Header";
import { CategoryBrowser } from "@/components/CategoryBrowser";
import { PendingDonations } from "@/components/PendingDonations";
import { Footer } from "@/components/Footer";
import { BetaNotice } from "@/components/BetaNotice";
import { storage } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import type { Item, UserRole } from "@/types/item";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>('donor');
  const [username, setUsername] = useState<string>('');
  const [view, setView] = useState<'home' | 'donate'>('home');
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if donate parameter is in URL
    if (searchParams.get('donate') === 'true') {
      setView('donate');
    }
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        setTimeout(async () => {
          try {
            // Get the user's role from the database
            const { data: profileData } = await supabase
              .from('profiles')
              .select('role, username')
              .eq('id', session.user.id)
              .single();

            const userUsername = profileData?.username || session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User';
            const role: UserRole = (profileData?.role === 'admin' ? 'admin' : 'donor') as UserRole;
            
            console.log('User profile loaded:', { userUsername, role, email: session.user.email });
            
            setIsAuthenticated(true);
            setUserRole(role);
            setUsername(userUsername);
            storage.saveSession(role, userUsername);
          } catch (error) {
            console.error('Error loading profile:', error);
            setIsAuthenticated(true);
            setUserRole('donor');
            setUsername(session.user.email?.split('@')[0] || 'User');
          }
        }, 0);
      } else {
        setIsAuthenticated(false);
        setUserRole('donor');
        setUsername('');
        storage.clearSession();
      }
    });

    // Check for existing session on load
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error('Error getting session:', error);
        return;
      }

      if (session?.user) {
        try {
          // Get the user's role from the database
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role, username')
            .eq('id', session.user.id)
            .single();

          const userUsername = profileData?.username || session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User';
          const role: UserRole = (profileData?.role === 'admin' ? 'admin' : 'donor') as UserRole;
          
          console.log('Initial session loaded:', { userUsername, role, email: session.user.email });
          
          setIsAuthenticated(true);
          setUserRole(role);
          setUsername(userUsername);
          storage.saveSession(role, userUsername);
        } catch (error) {
          console.error('Error loading profile:', error);
          setIsAuthenticated(true);
          setUserRole('donor');
          setUsername(session.user.email?.split('@')[0] || 'User');
        }
      }
    });

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

  const handleLogin = (role: 'admin' | 'donor', loginUsername?: string) => {
    console.log('Login successful:', role, loginUsername);
    setUserRole(role);
    setUsername(loginUsername || '');
    setIsAuthenticated(true);
    setShowLoginForm(false);
    
    if (role === 'donor') {
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
      setUserRole('donor');
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
      navigate('/auth');
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
    setUserRole('donor');
    navigate('/items');
  };

  if (view === 'donate') {
    return <DonatePage />;
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
        <BetaNotice />
        
        <div className="container mx-auto px-4 py-4">
          <div className="text-center mb-2">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4">Welcome to Rackis for barn</h1>
            <p className="text-lg md:text-xl text-white/90 mb-2 md:mb-4 px-2">
              Find quality second-hand items for your student life in Uppsala
            </p>
          </div>

          {/* Centered bear image with search bar */}
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="relative mt-0 mb-4">
              <img
                src="/lovable-uploads/50d0870c-a6a5-46a2-99ad-d9bbf533e576.png"
                alt="Rackis for Barn Logo"
                className="w-full max-w-[280px] md:max-w-[350px] h-auto object-contain opacity-90"
                onLoad={() => console.log('Bear image loaded')}
              />
              
              {/* Search bar positioned in the bear's sign */}
              <div className="absolute top-[67%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[85%] md:w-[90%] z-50 pointer-events-auto">
                <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg">
                  <Input
                    type="text"
                    placeholder="What do you need in Uppsala?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="flex-1 border-0 bg-transparent text-gray-800 placeholder-gray-500 text-xs md:text-sm h-6 md:h-7 p-0 focus:ring-0 focus:outline-none"
                  />
                  <Button 
                    onClick={handleSearchClick}
                    size="sm" 
                    className="bg-transparent hover:bg-transparent p-0 h-5 md:h-6"
                  >
                    <Search className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Text content below the bear */}
          {!isAuthenticated && (
            <div className="text-white space-y-4 md:space-y-6 text-center max-w-4xl mx-auto px-2">
              <div className="text-sm md:text-lg text-white/90 space-y-2 md:space-y-3 leading-relaxed">
                <p>A platform for students in Rackarbergsgatan Uppsala to exchange second-hand items during move-ins and move-outs.</p>
                <p className="hidden md:block">We collect useful items from outgoing students and sell them at fair prices to new tenants.</p>
                <p className="hidden md:block">All profits go to Barncancerfonden, supporting children with cancer and their families.</p>
                <p className="md:hidden">We collect items from outgoing students and sell them at fair prices. All profits support Barncancerfonden.</p>
                <p>It's simple: buy and donate things you only need in Uppsala — sustainably and for a good cause.</p>
                <p className="font-semibold text-white">🧸 För barn. För studenterna. För miljön.</p>
              </div>
              <div className="text-center mt-4 md:mt-6">
                <Button
                  variant="link"
                  onClick={() => window.open('/about', '_blank')}
                  className="text-white/90 hover:text-white text-sm md:text-lg underline px-2 whitespace-normal leading-relaxed break-words h-auto"
                >
                   Find out more about the concept, the swedish words we use, who we are, and how you can contribute.
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-md mx-auto px-4">
                <Button
                  onClick={handleBrowseItems}
                  className="w-full bg-white/20 hover:bg-white/30 text-white h-10 md:h-12 text-sm md:text-lg border-white/30"
                  variant="outline"
                >
                  Browse our items
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-white/20 hover:bg-white/30 text-white h-10 md:h-12 text-sm md:text-lg border-white/30"
                  variant="outline"
                >
                  Register to donate
                </Button>
              </div>
              <div className="text-center">
                <Button
                  onClick={() => navigate('/auth')}
                  className="text-white/80 hover:text-white text-sm md:text-lg underline"
                  variant="link"
                >
                  Already have an account? Login here
                </Button>
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
