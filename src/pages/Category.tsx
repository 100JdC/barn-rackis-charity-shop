
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ItemCard } from "@/components/ItemCard";
import { SearchAndFilters } from "@/components/SearchAndFilters";
import { StatsDashboard } from "@/components/StatsDashboard";
import { storage } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package } from "lucide-react";
import type { Item, UserRole } from "@/types/item";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Category = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>('buyer');
  const [username, setUsername] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const { toast } = useToast();

  // Set up Supabase auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const userUsername = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User';
        const role = session.user.email === 'jacob@admin.com' ? 'admin' : 'donator';
        
        setIsAuthenticated(true);
        setUserRole(role);
        setUsername(userUsername);
      } else {
        setIsAuthenticated(false);
        setUserRole('buyer');
        setUsername('');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userUsername = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User';
        const role = session.user.email === 'jacob@admin.com' ? 'admin' : 'donator';
        
        setIsAuthenticated(true);
        setUserRole(role);
        setUsername(userUsername);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadCategoryItems();
  }, [categoryName, userRole]);

  const loadCategoryItems = async () => {
    try {
      const loadedItems = await storage.getItems();
      let filteredItems = loadedItems.filter(item => item.category === categoryName);
      
      if (userRole !== 'admin') {
        filteredItems = filteredItems.filter(item => item.status !== 'pending_approval');
      }
      
      setItems(filteredItems);
    } catch (error) {
      console.error('Error loading category items:', error);
      toast({
        title: "Error",
        description: "Failed to load items. Please check your connection.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleDonate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user && userRole !== 'admin') {
      navigate('/');
      return;
    }
    // Handle donate functionality here
  };

  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      item.subcategory.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter;
    
    return matchesSearch && matchesStatus && matchesCondition;
  });

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'bedding': 'Bedding',
      'bathroom': 'Bathroom',
      'decoration': 'Decoration',
      'other_room_inventory': 'Other Room Inventory',
      'kitchen': 'Kitchen',
      'bike_sports': 'Bike & Sports',
      'electronics': 'Electronics',
      'other': 'Other'
    };
    return categoryMap[category] || category;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1733a7' }}>
      <div className="absolute inset-0 flex items-center justify-center z-0 opacity-30 pointer-events-none">
        <img
          src="/lovable-uploads/66828e04-ca12-4680-80e2-f4704d6832eb.png"
          alt="Rackis for Barn Logo"
          className="w-[600px] h-auto object-contain"
        />
      </div>
      
      <div className="relative z-10">
        <Header 
          userRole={userRole} 
          username={username}
          onLogout={isAuthenticated ? handleLogout : undefined}
          onDonate={handleDonate}
          onHome={handleHome}
          isAuthenticated={isAuthenticated}
        />
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/items')}
              className="mb-4 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Items
            </Button>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              {getCategoryDisplayName(categoryName || '')}
            </h1>
            <p className="text-white/80">
              {filteredItems.length} items in this category
            </p>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <SearchAndFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categoryFilter={categoryName || "all"}
                setCategoryFilter={() => {}} // Disabled since we're in category view
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                conditionFilter={conditionFilter}
                setConditionFilter={setConditionFilter}
                onSearchClick={() => {}}
                onSearchKeyPress={() => {}}
                showCategories={false}
                userRole={userRole}
                filteredItemsCount={filteredItems.length}
                totalItemsCount={items.length}
              />
            </CardContent>
          </Card>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  userRole={userRole} 
                  onView={() => navigate(`/items`)} // For now, just go back to items
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onShowQRCode={() => {}}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600 mb-4">
                  No items in this category match your search criteria
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
