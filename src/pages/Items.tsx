import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { ItemCard } from "@/components/ItemCard";
import { ItemDetail } from "@/components/ItemDetail";
import { SearchAndFilters } from "@/components/SearchAndFilters";
import { CategoryBrowser } from "@/components/CategoryBrowser";
import { Footer } from "@/components/Footer";
import { storage } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Item, UserRole } from "@/types/item";

export default function Items() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userRole, setUserRole] = useState<UserRole>('buyer');
  const [username, setUsername] = useState<string>('');
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  useEffect(() => {
    applyFilters();
  }, [items, searchTerm, categoryFilter, statusFilter, conditionFilter]);

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

  const applyFilters = () => {
    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (conditionFilter !== 'all') {
      filtered = filtered.filter(item => item.condition === conditionFilter);
    }

    setFilteredItems(filtered);
  };

  const handleCategorySelect = (category: string) => {
    setCategoryFilter(category);
    setSearchTerm('');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserRole('buyer');
      setUsername('');
      setIsAuthenticated(false);
      storage.clearSession();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleItemUpdate = async (itemData: Item) => {
    try {
      const updatedItems = items.map(item =>
        item.id === itemData.id ? itemData : item
      );
      setItems(updatedItems);
      setFilteredItems(updatedItems);
      await storage.updateItem(itemData.id, itemData);
      toast({
        title: "Item Updated",
        description: "The item has been successfully updated."
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update the item. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleItemDelete = async (itemId: string) => {
    try {
      const newItems = items.filter(item => item.id !== itemId);
      setItems(newItems);
      setFilteredItems(newItems);
      await storage.deleteItem(itemId);
      toast({
        title: "Item Deleted",
        description: "The item has been successfully deleted."
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete the item. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleItemEdit = (item: Item) => {
    // Navigate to edit page or open edit modal
    console.log('Edit item:', item);
  };

  const handleShowQRCode = (item: Item) => {
    // Show QR code modal
    console.log('Show QR code for item:', item);
  };

  if (selectedItem) {
    return (
      <ItemDetail
        item={selectedItem}
        userRole={userRole}
        username={username}
        onBack={() => setSelectedItem(null)}
        onEdit={userRole === 'admin' ? () => handleItemEdit(selectedItem) : undefined}
        onDelete={userRole === 'admin' ? () => handleItemDelete(selectedItem.id) : undefined}
        onLogout={handleLogout}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        userRole={userRole} 
        username={username}
        onLogout={(isAuthenticated || userRole === 'admin') ? handleLogout : undefined}
        onDonate={() => navigate('/donate')}
        onHome={() => navigate('/')}
        isAuthenticated={isAuthenticated}
      />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Items</h1>
            <p className="text-gray-600">Browse available items</p>
          </div>
          
          <div className="mb-8">
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
          </div>

          {/* Show search results first if there's a search term */}
          {searchTerm && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Search Results for "{searchTerm}" ({filteredItems.length} items found)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    userRole={userRole}
                    onView={() => setSelectedItem(item)}
                    onEdit={() => handleItemEdit(item)}
                    onDelete={() => handleItemDelete(item.id)}
                    onShowQRCode={() => handleShowQRCode(item)}
                  />
                ))}
              </div>
              {filteredItems.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No items found matching your search criteria.
                </p>
              )}
            </div>
          )}

          {/* Show categories only if no search term */}
          {!searchTerm && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse by Category</h2>
              <CategoryBrowser 
                items={items} 
                onCategorySelect={handleCategorySelect}
              />
            </div>
          )}

          {/* Show all items if no search term and no category filter */}
          {!searchTerm && categoryFilter === 'all' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">All Items</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    userRole={userRole}
                    onView={() => setSelectedItem(item)}
                    onEdit={() => handleItemEdit(item)}
                    onDelete={() => handleItemDelete(item.id)}
                    onShowQRCode={() => handleShowQRCode(item)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Show category-specific items */}
          {!searchTerm && categoryFilter !== 'all' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Items
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    userRole={userRole}
                    onView={() => setSelectedItem(item)}
                    onEdit={() => handleItemEdit(item)}
                    onDelete={() => handleItemDelete(item.id)}
                    onShowQRCode={() => handleShowQRCode(item)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
