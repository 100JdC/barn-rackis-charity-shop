import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { ItemCard } from "@/components/ItemCard";
import { ItemDetail } from "@/components/ItemDetail";
import { ItemForm } from "@/components/ItemForm";
import { QRCodeModal } from "@/components/QRCodeModal";
import { ItemSplitModal } from "@/components/ItemSplitModal";
import { SearchAndFilters } from "@/components/SearchAndFilters";
import { CategoryBrowser } from "@/components/CategoryBrowser";
import { StatsDashboard } from "@/components/StatsDashboard";
import { storage } from "@/utils/storage";
import { exportItemsToExcel } from "@/utils/exportUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus } from "lucide-react";
import type { Item, UserRole } from "@/types/item";
import { supabase } from "@/integrations/supabase/client";

const Items = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [username, setUsername] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<'items' | 'item-detail' | 'edit-item' | 'add-item'>('items');
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [soldQuantityInput, setSoldQuantityInput] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  // Check if we should show individual items (when there's a search or category filter)
  const shouldShowItems = searchTerm.trim() !== "" || categoryFilter !== "all";

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

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
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

    return () => subscription.unsubscribe();
  }, []);

  // Handle URL search parameters
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search');
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [searchParams]);

  useEffect(() => {
    loadItems();
  }, [userRole]);

  const loadItems = async () => {
    try {
      const loadedItems = await storage.getItems();
      let filteredItems = loadedItems;
      if (userRole !== 'admin') {
        filteredItems = loadedItems.filter(item => item.status !== 'pending_approval');
      }
      setItems(filteredItems);
    } catch (error) {
      console.error('Error loading items:', error);
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

  const handleCategorySelect = (category: string) => {
    navigate(`/category/${category}`);
  };

  const handleSearchClick = () => {
    // Search functionality is handled by the search term state
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Search functionality is handled by the search term state
    }
  };

  const handleItemSave = async (itemsData: Omit<Item, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>[]) => {
    try {
      if (selectedItem) {
        // For editing, we should only have one item
        const itemData = itemsData[0];
        const updatedItem = await storage.updateItem(selectedItem.id, {
          ...itemData,
          updated_by: username,
          updated_at: new Date().toISOString()
        });
        if (updatedItem) {
          toast({
            title: "Success",
            description: "Item updated successfully"
          });
        }
      } else {
        // For adding new items
        for (const itemData of itemsData) {
          const newItem: Item = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...itemData,
            status: userRole === 'admin' ? (itemData.status || 'available') : 'pending_approval',
            created_by: username,
            updated_by: username,
            donor_name: itemData.donor_name || username,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            photos: itemData.photos || []
          };
          
          await storage.addItem(newItem);
        }
        
        toast({
          title: "Success",
          description: userRole === 'admin' 
            ? `${itemsData.length} item${itemsData.length > 1 ? 's' : ''} added successfully`
            : `${itemsData.length} item${itemsData.length > 1 ? 's' : ''} submitted for approval`
        });
      }
      
      loadItems();
      setView('items');
      setSelectedItem(null);
    } catch (error) {
      console.error('Error saving items:', error);
      toast({
        title: "Error",
        description: "Failed to save items",
        variant: "destructive"
      });
    }
  };

  const handleItemDelete = async (item: Item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        const success = await storage.deleteItem(item.id);
        if (success) {
          loadItems();
          setView('items');
          toast({
            title: "Success",
            description: "Item deleted successfully"
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

  const handleSplitItem = async (soldQuantity: number, finalPrice: number, status: 'sold' | 'reserved', reservedBy?: string) => {
    if (!selectedItem) return;
    
    try {
      const newItem: Item = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...selectedItem,
        quantity: soldQuantity,
        status: status,
        final_price: finalPrice,
        reserved_by: reservedBy,
        created_by: username,
        updated_by: username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await storage.addItem(newItem);
      
      const remainingQuantity = selectedItem.quantity - soldQuantity;
      await storage.updateItem(selectedItem.id, {
        quantity: remainingQuantity,
        updated_by: username,
        updated_at: new Date().toISOString()
      });
      
      loadItems();
      setShowSplitModal(false);
      setSelectedItem(null);
      
      toast({
        title: "Success",
        description: `Item split successfully`
      });
    } catch (error) {
      console.error('Error splitting item:', error);
      toast({
        title: "Error",
        description: "Failed to split item",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsSold = async (item: Item, soldQuantity: number) => {
    try {
      const currentSold = item.sold_quantity || 0;
      const newSoldQuantity = currentSold + soldQuantity;
      
      if (newSoldQuantity > item.quantity) {
        toast({
          title: "Error",
          description: "Cannot sell more items than available",
          variant: "destructive"
        });
        return;
      }
      
      const newStatus = newSoldQuantity >= item.quantity ? 'sold' : 'available';
      
      await storage.updateItem(item.id, {
        sold_quantity: newSoldQuantity,
        status: newStatus,
        updated_by: username,
        updated_at: new Date().toISOString()
      });
      
      setSoldQuantityInput(prev => ({ ...prev, [item.id]: 1 }));
      loadItems();
      
      toast({
        title: "Success",
        description: `Marked ${soldQuantity} item(s) as sold`
      });
    } catch (error) {
      console.error('Error marking as sold:', error);
      toast({
        title: "Error",
        description: "Failed to mark items as sold",
        variant: "destructive"
      });
    }
  };

  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      item.category.toLowerCase().includes(searchLower) ||
      item.subcategory.toLowerCase().includes(searchLower);
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesCondition;
  });

  if (view === 'item-detail' && selectedItem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          userRole={userRole || 'buyer'} 
          username={username}
          onLogout={isAuthenticated ? handleLogout : undefined}
          onDonate={handleDonate}
          onHome={handleHome}
          isAuthenticated={isAuthenticated}
        />
        <div className="container mx-auto px-4 py-8">
          <ItemDetail
            item={selectedItem}
            userRole={userRole}
            onEdit={() => setView('edit-item')}
            onDelete={() => handleItemDelete(selectedItem)}
            onShowQRCode={() => setShowQRModal(true)}
          />
          <div className="mt-6">
            <Button onClick={() => setView('items')} variant="outline">
              Back to Items
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          userRole={userRole || 'buyer'} 
          username={username}
          onLogout={isAuthenticated ? handleLogout : undefined}
          onDonate={handleDonate}
          onHome={handleHome}
          isAuthenticated={isAuthenticated}
        />
        
        <div className="container mx-auto px-4 py-8">
          <StatsDashboard items={items} userRole={userRole} />

          <Card className="bg-white/90 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <SearchAndFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                conditionFilter={conditionFilter}
                setConditionFilter={setConditionFilter}
                onSearchClick={handleSearchClick}
                onSearchKeyPress={handleSearchKeyPress}
                showCategories={!shouldShowItems}
                userRole={userRole}
                filteredItemsCount={filteredItems.length}
                totalItemsCount={items.length}
              />
            </CardContent>
          </Card>

          {shouldShowItems ? (
            <>
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      userRole={userRole || 'buyer'} 
                      onView={() => {
                        setSelectedItem(item);
                        setView('item-detail');
                      }}
                      onEdit={() => {
                        setSelectedItem(item);
                        setView('edit-item');
                      }}
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
                    <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <CategoryBrowser 
              items={items} 
              onCategorySelect={handleCategorySelect}
            />
          )}
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
};

export default Items;
