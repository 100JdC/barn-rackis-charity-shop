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
import { Button } from "@/components/ui/button";
import type { Item, UserRole } from "@/types/item";

const ITEMS_PER_PAGE = 20;

export default function Items() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userRole, setUserRole] = useState<UserRole>('donor');
  const [username, setUsername] = useState<string>('');
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [displayedItems, setDisplayedItems] = useState<Item[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmedSearchTerm, setConfirmedSearchTerm] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

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
    // Initialize search term from URL
    const urlSearchTerm = searchParams.get('search') || '';
    setSearchTerm(urlSearchTerm);
    setConfirmedSearchTerm(urlSearchTerm);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, confirmedSearchTerm, categoryFilter, statusFilter, conditionFilter]);

  useEffect(() => {
    updateDisplayedItems();
  }, [filteredItems, currentPage]);

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

    if (confirmedSearchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(confirmedSearchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(confirmedSearchTerm.toLowerCase())
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
    setCurrentPage(1); // Reset to first page when filters change
  };

  const updateDisplayedItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayedItems(filteredItems.slice(startIndex, endIndex));
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleSearchSubmit = (term: string) => {
    setConfirmedSearchTerm(term);
  };

  const handleCategorySelect = (category: string) => {
    navigate(`/category/${category}`);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserRole('donor');
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
      setSelectedItem(null); // Close detail view after deletion
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


  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const hasMore = currentPage < totalPages;

  if (selectedItem) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#001faa' }}>
        <Header 
          userRole={userRole} 
          username={username}
          onLogout={(isAuthenticated || userRole === 'admin') ? handleLogout : undefined}
          onDonate={() => navigate('/?donate=true')}
          onHome={() => navigate('/')}
          isAuthenticated={isAuthenticated}
        />
        
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-4">
            <button
              onClick={() => setSelectedItem(null)}
              className="text-white hover:text-white/80 mb-4"
            >
              ← Back to Items
            </button>
          </div>
          
          <ItemDetail
            item={selectedItem}
            userRole={userRole}
            onEdit={() => handleItemEdit(selectedItem)}
            onDelete={() => handleItemDelete(selectedItem.id)}
            
          />
        </div>
        
        <Footer />
      </div>
    );
  }

  const renderItemGrid = (items: Item[], title: string) => (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            userRole={userRole}
            onView={() => setSelectedItem(item)}
            onEdit={() => handleItemEdit(item)}
            onDelete={() => handleItemDelete(item.id)}
            
          />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-8">
          <Button 
            onClick={handleLoadMore}
            variant="outline"
            className="px-8 py-2"
          >
            Load More ({filteredItems.length - displayedItems.length} remaining)
          </Button>
        </div>
      )}
      {displayedItems.length === 0 && (
        <p className="text-white/70 text-center py-8">
          No items found matching your search criteria.
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#001faa' }}>
      <Header 
        userRole={userRole} 
        username={username}
        onLogout={(isAuthenticated || userRole === 'admin') ? handleLogout : undefined}
        onDonate={() => navigate('/?donate=true')}
        onHome={() => navigate('/')}
        isAuthenticated={isAuthenticated}
      />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Items</h1>
            <p className="text-white/90">Browse available items</p>
          </div>
          
          <div className="mb-8">
            <SearchAndFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onSearchSubmit={handleSearchSubmit}
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
          {confirmedSearchTerm && (
            <div className="mb-8">
              {renderItemGrid(
                displayedItems, 
                `Search Results for "${confirmedSearchTerm}" (${filteredItems.length} items found)`
              )}
            </div>
          )}

          {/* Show categories only if no search term */}
          {!confirmedSearchTerm && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Browse by Category</h2>
              <CategoryBrowser 
                items={items} 
                onCategorySelect={handleCategorySelect}
              />
            </div>
          )}

          {/* Show all items if no search term and no category filter */}
          {!confirmedSearchTerm && categoryFilter === 'all' && (
            <div>
              {renderItemGrid(displayedItems, "All Items")}
            </div>
          )}

          {/* Show category-specific items */}
          {!confirmedSearchTerm && categoryFilter !== 'all' && (
            <div>
              {renderItemGrid(
                displayedItems, 
                `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Items`
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
