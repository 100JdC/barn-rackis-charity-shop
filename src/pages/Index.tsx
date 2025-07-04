
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { LoginForm } from "@/components/LoginForm";
import { DonatePage } from "@/pages/DonatePage";
import { Header } from "@/components/Header";
import { ItemCard } from "@/components/ItemCard";
import { ItemDetail } from "@/components/ItemDetail";
import { ItemForm } from "@/components/ItemForm";
import { QRCodeModal } from "@/components/QRCodeModal";
import { UserManagement } from "@/components/UserManagement";
import { ItemSplitModal } from "@/components/ItemSplitModal";
import { PendingDonations } from "@/components/PendingDonations";
import { PhotoGallery } from "@/components/PhotoGallery";
import { storage } from "@/utils/storage";
import { exportItemsToExcel } from "@/utils/exportUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, Plus, Search, Users, Package, TrendingUp, ShoppingCart, Clock, Image } from "lucide-react";
import type { Item, UserRole } from "@/types/item";
import { CategoryBrowser } from "@/components/CategoryBrowser";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [username, setUsername] = useState<string>('');
  const [view, setView] = useState<'home' | 'items' | 'add-item' | 'item-detail' | 'edit-item' | 'user-management' | 'donate' | 'pending-donations' | 'photo-gallery'>('home');
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [soldQuantityInput, setSoldQuantityInput] = useState<{ [key: string]: number }>({});
  const [showCategories, setShowCategories] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
        
        // Save session to localStorage for compatibility
        storage.saveSession(role, userUsername);
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setUsername('');
        storage.clearSession();
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
        storage.saveSession(role, userUsername);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load items when the component mounts or when view changes to items
  useEffect(() => {
    loadItems(); // Load items immediately when component mounts
  }, []);

  useEffect(() => {
    if (view === 'items') {
      loadItems();
    }
  }, [view]);

  const loadItems = async () => {
    try {
      const loadedItems = await storage.getItems();
      console.log('Items loaded:', loadedItems.length);
      
      // Filter items based on user role - admin can see all, others can't see pending
      let filteredItems = loadedItems;
      if (userRole !== 'admin') {
        filteredItems = loadedItems.filter(item => item.status !== 'pending_approval');
      }
      
      const processedItems = filteredItems.map(item => {
        if (item.sold_quantity && item.sold_quantity > 0) {
          return {
            ...item,
            quantityDisplay: `${item.sold_quantity}/${item.quantity} sold`
          };
        }
        return item;
      });
      
      setItems(processedItems);

      // Show admin notification for pending items
      if (userRole === 'admin') {
        const pendingItems = loadedItems.filter(item => item.status === 'pending_approval');
        if (pendingItems.length > 0) {
          toast({
            title: "Pending Donations",
            description: `You have ${pendingItems.length} donation(s) waiting for approval.`,
            duration: 5000,
          });
        }
      }
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
    
    // If registering as donator, go directly to donate page
    if (role === 'donator' && view === 'home') {
      // Check if this is a new registration by looking at the auth state
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user && new Date(user.created_at).getTime() > Date.now() - 10000) { // User created in last 10 seconds
          setView('donate');
        } else {
          setView('items');
        }
      });
    } else {
      setView('items');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
    setUsername('');
    setIsAuthenticated(false);
    setView('home');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  const handleNavigate = (newView: string) => {
    if (newView === 'home') {
      setView('home');
    } else if (newView === 'items') {
      setView('items');
      setShowCategories(false); // Go directly to items view
      setCategoryFilter('all');
    } else if (newView === 'donate') {
      setView('donate');
    } else if (newView === 'pending-donations') {
      setView('pending-donations');
    } else if (newView === 'photo-gallery') {
      setView('photo-gallery');
    } else {
      setView(newView as any);
    }
  };

  const handleDonate = async () => {
    // Check if user is properly authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user && userRole !== 'admin') {
      toast({
        title: "Login Required",
        description: "Please log in or register to donate items.",
      });
      setView('home');
      return;
    }
    
    setView('donate');
  };

  const handleItemSave = async (itemData: Partial<Item>) => {
    try {
      if (selectedItem) {
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
        const newItem: Item = {
          id: Date.now().toString(),
          ...itemData as Item,
          status: userRole === 'admin' ? (itemData.status || 'available') : 'pending_approval',
          created_by: username,
          updated_by: username,
          donor_name: username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          photos: itemData.photos || []
        };
        
        await storage.addItem(newItem);
        toast({
          title: "Success",
          description: userRole === 'admin' ? "Item added successfully" : "Item submitted for approval"
        });
      }
      
      loadItems();
      setView('items');
      setSelectedItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "Error",
        description: "Failed to save item",
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

  const handleCategorySelect = (category: string) => {
    console.log('Category selected:', category);
    setCategoryFilter(category);
    setShowCategories(false);
    setView('items'); // Ensure we're in items view
  };

  // Handle search with Enter key - now takes user to items view
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      setShowCategories(false);
      setView('items');
      console.log('Search executed:', searchTerm);
    }
  };

  // Handle search button click
  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      setShowCategories(false);
      setView('items');
      console.log('Search executed:', searchTerm);
    }
  };

  // Improved filtering logic with fuzzy search capabilities
  const filteredItems = items.filter(item => {
    // Enhanced search functionality
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      item.category.toLowerCase().includes(searchLower) ||
      item.subcategory.toLowerCase().includes(searchLower) ||
      (item.donor_name && item.donor_name.toLowerCase().includes(searchLower)) ||
      (item.location && item.location.toLowerCase().includes(searchLower)) ||
      // Add fuzzy matching by checking if search terms are contained in any field
      searchLower.split(' ').some(term => 
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        item.category.toLowerCase().includes(term) ||
        item.subcategory.toLowerCase().includes(term)
      );
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesCondition;
  });

  const stats = {
    totalItems: items.length,
    availableItems: items.filter(item => item.status === 'available').length,
    soldItems: items.filter(item => item.status === 'sold').length,
    pendingItems: items.filter(item => item.status === 'pending_approval').length,
    totalValue: items.reduce((sum, item) => sum + (item.final_price || item.suggested_price), 0)
  };

  const categories = [
    { value: "bedding", label: "Bedding" },
    { value: "bathroom", label: "Bathroom" },
    { value: "decoration", label: "Decoration" },
    { value: "other_room_inventory", label: "Other Room Inventory" },
    { value: "kitchen", label: "Kitchen" },
    { value: "bike_sports", label: "Bike & Sports" },
    { value: "electronics", label: "Electronics" },
    { value: "other", label: "Other" }
  ];

  // Allow browsing without login - only show login page if explicitly going to 'home'
  if (view === 'home' && !isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // If user is authenticated but trying to go to home, redirect to items
  if (view === 'home' && isAuthenticated) {
    setView('items');
  }

  if (view === 'donate') {
    return (
      <DonatePage
        userRole={userRole}
        username={username}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        onBack={() => setView('items')}
      />
    );
  }

  if (view === 'add-item' || view === 'edit-item') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          userRole={userRole || 'buyer'} 
          username={username}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          onDonate={handleDonate}
        />
        <div className="container mx-auto px-4 py-8">
          <ItemForm
            item={selectedItem}
            userRole={userRole}
            onSubmit={handleItemSave}
            onCancel={() => {
              setView('items');
              setSelectedItem(null);
            }}
          />
        </div>
      </div>
    );
  }

  if (view === 'item-detail') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          userRole={userRole || 'buyer'} 
          username={username}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          onDonate={handleDonate}
        />
        <div className="container mx-auto px-4 py-8">
          {selectedItem && (
            <ItemDetail
              item={selectedItem}
              userRole={userRole}
              onEdit={() => setView('edit-item')}
              onDelete={() => handleItemDelete(selectedItem)}
              onShowQRCode={() => setShowQRModal(true)}
            />
          )}
          <div className="mt-6">
            <Button onClick={() => setView('items')} variant="outline">
              Back to Items
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'user-management') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          userRole={userRole || 'buyer'} 
          username={username}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          onDonate={handleDonate}
        />
        <div className="container mx-auto px-4 py-8">
          <UserManagement userRole={userRole} onBack={() => setView('items')} />
        </div>
      </div>
    );
  }

  if (view === 'pending-donations') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          userRole={userRole || 'buyer'} 
          username={username}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          onDonate={handleDonate}
        />
        <PendingDonations
          userRole={userRole}
          username={username}
          onBack={() => setView('items')}
        />
      </div>
    );
  }

  if (view === 'photo-gallery') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          userRole={userRole || 'buyer'} 
          username={username}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          onDonate={handleDonate}
        />
        <PhotoGallery />
        <div className="container mx-auto px-4 pb-8">
          <Button onClick={() => setView('items')} variant="outline">
            Back to Items
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1733a7' }}>
      <div className="absolute inset-0 flex items-center justify-center z-0 opacity-30 pointer-events-none">
        <img
          src="/lovable-uploads/bearlogo.png"
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
          userRole={userRole || 'buyer'} 
          username={username}
          onLogout={isAuthenticated ? handleLogout : undefined}
          onNavigate={handleNavigate}
          onDonate={handleDonate}
        />
        
        <div className="container mx-auto px-4 py-8">
          {/* Show stats to everyone, not just admins */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalItems}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.availableItems}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sold</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.soldItems}</div>
              </CardContent>
            </Card>

            {userRole === 'admin' && (
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.pendingItems}</div>
                </CardContent>
              </Card>
            )}
            
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalValue} SEK</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm mb-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  {!showCategories && (
                    <Button 
                      onClick={() => {
                        setShowCategories(true);
                        setCategoryFilter('all');
                        setSearchTerm(''); // Clear search when going back to categories
                      }} 
                      variant="outline"
                      className="bg-white/80"
                    >
                      ← Back to Categories
                    </Button>
                  )}
                  <CardTitle className="text-white" style={{ color: '#1733a7' }}>
                    {showCategories ? 'Browse Categories' : 
                     categoryFilter !== "all" ? 
                       `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1).replace('_', ' ')} Items` : 
                       searchTerm ? `Search Results for "${searchTerm}"` : 'All Items'
                    }
                  </CardTitle>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!isAuthenticated && (
                    <Button 
                      onClick={() => setView('home')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Login / Register
                    </Button>
                  )}
                  {userRole === 'admin' && (
                    <>
                      <Button onClick={() => setView('add-item')} className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                      <Button onClick={() => setView('pending-donations')} variant="outline" className="bg-orange-50 border-orange-200">
                        <Clock className="h-4 w-4 mr-2" />
                        Pending ({stats.pendingItems})
                      </Button>
                      <Button onClick={() => exportItemsToExcel(items)} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button onClick={() => setView('user-management')} variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Users
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Search bar - always visible */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search items... (Press Enter to search)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="pl-10"
                  />
                </div>
                <Button 
                  onClick={handleSearchClick}
                  disabled={!searchTerm.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              
              {/* Filters - only show when viewing items */}
              {!showCategories && (
                <div className="flex flex-wrap gap-2">
                  <Select value={categoryFilter} onValueChange={(value) => {
                    console.log('Category filter changed to:', value);
                    setCategoryFilter(value);
                  }}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="bedding">Bedding</SelectItem>
                      <SelectItem value="bathroom">Bathroom</SelectItem>
                      <SelectItem value="decoration">Decoration</SelectItem>
                      <SelectItem value="other_room_inventory">Other Room Inventory</SelectItem>
                      <SelectItem value="kitchen">Kitchen</SelectItem>
                      <SelectItem value="bike_sports">Bike & Sports</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={(value) => {
                    console.log('Status filter changed to:', value);
                    setStatusFilter(value);
                  }}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="donated">Donated</SelectItem>
                      {userRole === 'admin' && (
                        <SelectItem value="pending_approval">Pending</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  
                  <Select value={conditionFilter} onValueChange={(value) => {
                    console.log('Condition filter changed to:', value);
                    setConditionFilter(value);
                  }}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Conditions</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="lightly_used">Lightly Used</SelectItem>
                      <SelectItem value="worn">Worn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {!showCategories && (
                <div className="text-sm text-gray-600">
                  Showing {filteredItems.length} of {items.length} items
                  {searchTerm && ` for "${searchTerm}"`}
                  {categoryFilter !== "all" && ` in ${categoryFilter.replace('_', ' ')}`}
                </div>
              )}
            </CardContent>
          </Card>

          {showCategories ? (
            <CategoryBrowser 
              items={items} 
              onCategorySelect={handleCategorySelect}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="relative">
                  <ItemCard
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
                  
                  {userRole === 'admin' && item.quantity > 1 && (
                    <div className="mt-2 p-3 bg-white rounded-lg border space-y-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowSplitModal(true);
                          }}
                          variant="outline"
                        >
                          Split Item
                        </Button>
                        
                        <div className="flex items-center gap-2 flex-1">
                          <Label className="text-xs">Mark as sold:</Label>
                          <Input
                            type="number"
                            min="1"
                            max={item.quantity - (item.sold_quantity || 0)}
                            value={soldQuantityInput[item.id] || 1}
                            onChange={(e) => setSoldQuantityInput(prev => ({
                              ...prev,  
                              [item.id]: parseInt(e.target.value) || 1
                            }))}
                            className="w-16 h-8 text-xs"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsSold(item, soldQuantityInput[item.id] || 1)}
                            disabled={!soldQuantityInput[item.id] || (item.sold_quantity || 0) >= item.quantity}
                            className="h-8 px-2 text-xs"
                          >
                            Sell
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!showCategories && filteredItems.length === 0 && (
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || categoryFilter !== "all" || statusFilter !== "all" || conditionFilter !== "all" 
                    ? "Try adjusting your search criteria" 
                    : "Get started by adding your first item"}
                </p>
                {userRole === 'admin' && (
                  <Button onClick={() => setView('add-item')} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {selectedItem && showQRModal && (
        <QRCodeModal
          item={selectedItem}
          onClose={() => setShowQRModal(false)}
        />
      )}
      
      {selectedItem && showSplitModal && (
        <ItemSplitModal
          item={selectedItem}
          onSplit={handleSplitItem}
          onClose={() => setShowSplitModal(false)}
        />
      )}

      <Toaster />
    </div>
  );
}
