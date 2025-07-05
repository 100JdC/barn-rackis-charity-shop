import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ItemCard } from "@/components/ItemCard";
import { ItemDetail } from "@/components/ItemDetail";
import { QRCodeModal } from "@/components/QRCodeModal";
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
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [view, setView] = useState<'items' | 'item-detail'>('items');
  const [showQRModal, setShowQRModal] = useState(false);
  const { toast } = useToast();

  // Set up authentication state management
  useEffect(() => {
    let mounted = true;

    // Check for admin session in localStorage first
    const savedSession = storage.getSession();
    if (savedSession && savedSession.userRole === 'admin') {
      console.log('Found admin session in localStorage:', savedSession);
      setIsAuthenticated(true);
      setUserRole('admin');
      setUsername(savedSession.username);
    }

    // Set up Supabase auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed in Category:', event, session?.user?.email);
      
      if (session?.user) {
        const userUsername = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User';
        const role: UserRole = session.user.email === 'jacob@admin.com' ? 'admin' : 'donator';
        
        setIsAuthenticated(true);
        setUserRole(role);
        setUsername(userUsername);
        storage.saveSession(role, userUsername);
      } else {
        // Only reset if we don't have an admin session
        const currentSession = storage.getSession();
        if (!currentSession || currentSession.userRole !== 'admin') {
          setIsAuthenticated(false);
          setUserRole('buyer');
          setUsername('');
          storage.clearSession();
        }
      }
    });

    // Check for existing Supabase session if no admin session
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
    try {
      await supabase.auth.signOut();
      setUserRole('buyer');
      setUsername('');
      setIsAuthenticated(false);
      storage.clearSession();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleDonate = async () => {
    if (!isAuthenticated && userRole !== 'admin') {
      navigate('/');
      return;
    }
    // Handle donate functionality here
  };

  const handleItemDelete = async (item: Item) => {
    console.log('Delete requested for item:', item.name, 'Current user role:', userRole, 'Is authenticated:', isAuthenticated);
    
    // Check admin permissions
    if (userRole !== 'admin') {
      console.log('Access denied - user is not admin');
      toast({
        title: "Access Denied",
        description: "Only administrators can delete items",
        variant: "destructive"
      });
      return;
    }

    console.log('Admin permission confirmed, proceeding with delete');

    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        const success = await storage.deleteItem(item.id);
        if (success) {
          loadCategoryItems();
          toast({
            title: "Success",
            description: "Item deleted successfully"
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to delete item",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        toast({
          title: "Error",
          description: "Failed to delete item",
          variant: "destructive"
        });
      }
    }
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

  if (view === 'item-detail' && selectedItem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          userRole={userRole} 
          username={username}
          onLogout={(isAuthenticated || userRole === 'admin') ? handleLogout : undefined}
          onDonate={handleDonate}
          onHome={handleHome}
          isAuthenticated={isAuthenticated}
        />
        <div className="container mx-auto px-4 py-8">
          <ItemDetail
            item={selectedItem}
            userRole={userRole}
            onEdit={() => navigate('/items')}
            onDelete={() => handleItemDelete(selectedItem)}
            onShowQRCode={() => setShowQRModal(true)}
          />
          <div className="mt-6">
            <Button onClick={() => setView('items')} variant="outline">
              Back to Category
            </Button>
          </div>
        </div>
        
        {selectedItem && showQRModal && (
          <QRCodeModal
            item={selectedItem}
            onClose={() => setShowQRModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1733a7' }}>
      <div className="absolute inset-0 flex items-center justify-center z-0 opacity-30 pointer-events-none">
        <img
          src="/lovable-uploads/logos/standard_logo.png"
          alt="Rackis for Barn Logo"
          className="w-[600px] h-auto object-contain"
        />
      </div>
      
      <div className="relative z-10">
        <Header 
          userRole={userRole} 
          username={username}
          onLogout={(isAuthenticated || userRole === 'admin') ? handleLogout : undefined}
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
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="search" className="sr-only">Search items</label>
                  <input
                    id="search"
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="min-w-[120px]">
                    <span className="block text-sm font-medium text-gray-700 mb-1">Category</span>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">
                      {getCategoryDisplayName(categoryName || '')}
                    </div>
                  </div>
                  
                  {userRole && (
                    <div className="min-w-[120px]">
                      <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                        {userRole === 'admin' && <option value="pending_approval">Pending</option>}
                      </select>
                    </div>
                  )}
                  
                  <div className="min-w-[120px]">
                    <label htmlFor="condition-filter" className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <select
                      id="condition-filter"
                      value={conditionFilter}
                      onChange={(e) => setConditionFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Conditions</option>
                      <option value="new">New</option>
                      <option value="like_new">Like New</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                Showing {filteredItems.length} of {items.length} items
              </div>
            </CardContent>
          </Card>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  userRole={userRole} 
                  onView={() => {
                    setSelectedItem(item);
                    setView('item-detail');
                  }}
                  onEdit={() => navigate('/items')}
                  onDelete={() => handleItemDelete(item)}
                  onShowQRCode={() => {
                    setSelectedItem(item);
                    setShowQRModal(true);
                  }}
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
