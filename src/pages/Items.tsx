import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ItemCard } from "@/components/ItemCard";
import { ItemDetail } from "@/components/ItemDetail";
import { QRCodeModal } from "@/components/QRCodeModal";
import { SearchAndFilters } from "@/components/SearchAndFilters";
import { PendingDonations } from "@/components/PendingDonations";
import { StatsDashboard } from "@/components/StatsDashboard";
import { UserManagement } from "@/components/UserManagement";
import { ItemsHeader } from "@/components/ItemsHeader";
import { Footer } from "@/components/Footer";
import { CategoryBrowser } from "@/components/CategoryBrowser";
import { storage } from "@/utils/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import type { Item, UserRole } from "@/types/item";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ItemForm } from "@/components/ItemForm";

const Items = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>('buyer');
  const [username, setUsername] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [view, setView] = useState<'items' | 'pending' | 'stats' | 'users' | 'item-detail' | 'edit-item'>('items');
  const [showQRModal, setShowQRModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const savedSession = storage.getSession();
    if (savedSession && savedSession.userRole === 'admin') {
      console.log('Found admin session in localStorage:', savedSession);
      setIsAuthenticated(true);
      setUserRole(savedSession.userRole);
      setUsername(savedSession.username);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed in Items:', event, session?.user?.email);
      
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
  }, [categoryFilter, userRole]);

  const loadItems = async () => {
    try {
      const loadedItems = await storage.getItems();
      let filteredItems = loadedItems;
      
      if (categoryFilter !== "all") {
        filteredItems = filteredItems.filter(item => item.category === categoryFilter);
      }

      if (userRole !== 'admin') {
        filteredItems = filteredItems.filter(item => item.status !== 'pending_approval');
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

  const handleDonate = () => {
    navigate('/');
  };

  const handleItemDelete = async (item: Item) => {
    if (userRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete items",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        const success = await storage.deleteItem(item.id);
        if (success) {
          loadItems();
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

  const handleItemUpdate = async (itemData: Item) => {
    if (userRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can update items",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedItem: Item = {
        ...itemData,
        updated_at: new Date().toISOString(),
        updated_by: username,
      };
      
      const success = await storage.updateItem(updatedItem.id, updatedItem);
      if (success) {
        loadItems();
        setSelectedItem(updatedItem);
        setView('item-detail');
        toast({
          title: "Success",
          description: "Item updated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update item",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive"
      });
    }
  };

  const handleExportData = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(items, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "items-data.json";
    link.click();
  };

  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      item.subcategory.toLowerCase().includes(searchLower);
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesCondition;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img 
          src="/lovable-uploads/logos/standard_logo.png" 
          alt="Background Logo" 
          className="absolute bottom-20 right-10 w-96 h-96 opacity-[0.03] object-contain"
        />
      </div>
      <Header 
        userRole={userRole} 
        username={username}
        onLogout={(isAuthenticated || userRole === 'admin') ? handleLogout : undefined}
        onDonate={handleDonate}
        onHome={handleHome}
        isAuthenticated={isAuthenticated}
      />
      
      <div className="container mx-auto px-4 py-8 flex-1 relative z-10">
        <ItemsHeader 
          userRole={userRole}
          view={view}
          onViewChange={setView}
          onExportData={handleExportData}
        />

        {view === 'items' && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Browse by Category</h2>
              <CategoryBrowser 
                items={items} 
                onCategorySelect={(category) => {
                  setCategoryFilter(category);
                  // Scroll to items section after category selection
                  setTimeout(() => {
                    const itemsSection = document.getElementById('items-section');
                    if (itemsSection) {
                      itemsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
              />
            </div>
            
            <div id="items-section">
              <h2 className="text-2xl font-bold mb-6 text-center">Individual Items</h2>
              <SearchAndFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                conditionFilter={conditionFilter}
                onConditionChange={setConditionFilter}
                userRole={userRole}
              />
              
              <div className="mt-6 text-sm text-gray-600">
                Showing {filteredItems.length} of {items.length} items
              </div>

              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {filteredItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      userRole={userRole} 
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
                <Card className="mt-6">
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || categoryFilter !== "all" || statusFilter !== "all" || conditionFilter !== "all"
                        ? "No items match your search criteria"
                        : "No items available at the moment"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}

        {view === 'pending' && userRole === 'admin' && (
          <PendingDonations onItemsUpdate={loadItems} />
        )}

        {view === 'stats' && userRole === 'admin' && (
          <StatsDashboard items={items} userRole={userRole} />
        )}

        {view === 'users' && userRole === 'admin' && (
          <UserManagement userRole={userRole} onBack={() => setView('items')} />
        )}

        {view === 'item-detail' && selectedItem && (
          <ItemDetail
            item={selectedItem}
            userRole={userRole}
            onEdit={() => setView('edit-item')}
            onDelete={() => handleItemDelete(selectedItem)}
            onShowQRCode={() => setShowQRModal(true)}
          />
        )}

        {view === 'edit-item' && selectedItem && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Item</h2>
            <ItemForm
              item={selectedItem}
              userRole={userRole}
              onSubmit={(items) => handleItemUpdate(items[0] as Item)}
              onCancel={() => setView('items')}
              username={username}
            />
          </div>
        )}
      </div>

      {selectedItem && showQRModal && (
        <QRCodeModal
          item={selectedItem}
          onClose={() => setShowQRModal(false)}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default Items;
