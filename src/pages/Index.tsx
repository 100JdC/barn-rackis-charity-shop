import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { LoginForm } from "@/components/LoginForm";
import { DonorRegistration } from "@/components/DonorRegistration";
import { DonorLogin } from "@/components/DonorLogin";
import { Header } from "@/components/Header";
import { ItemCard } from "@/components/ItemCard";
import { ItemDetail } from "@/components/ItemDetail";
import { ItemForm } from "@/components/ItemForm";
import { QRCodeModal } from "@/components/QRCodeModal";
import { UserManagement } from "@/components/UserManagement";
import { ItemSplitModal } from "@/components/ItemSplitModal";
import { ThankYouAnimation } from "@/components/ThankYouAnimation";
import { storage } from "@/utils/storage";
import { exportItemsToExcel } from "@/utils/exportUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, Plus, Search, Filter, Users, Package, TrendingUp, ShoppingCart } from "lucide-react";
import type { Item, UserRole } from "@/types/item";

export default function Index() {
  const [currentUser, setCurrentUser] = useState<{ role: UserRole, username?: string }>({ role: null });
  const [view, setView] = useState<'home' | 'register' | 'donor-login' | 'admin' | 'items' | 'add-item' | 'item-detail' | 'edit-item' | 'user-management'>('home');
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [soldQuantityInput, setSoldQuantityInput] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  useEffect(() => {
    const session = storage.getSession();
    if (session.role) {
      setCurrentUser(session);
      setView('items');
    }
  }, []);

  useEffect(() => {
    if (currentUser.role) {
      loadItems();
    }
  }, [currentUser.role]);

  const loadItems = async () => {
    try {
      const loadedItems = await storage.getItems();
      console.log('Items loaded:', loadedItems.length);
      
      // Process items to add quantity display for split items
      const processedItems = loadedItems.map(item => {
        if (item.sold_quantity && item.sold_quantity > 0) {
          return {
            ...item,
            quantityDisplay: `${item.sold_quantity}/${item.quantity} sold`
          };
        }
        return item;
      });
      
      setItems(processedItems);
    } catch (error) {
      console.error('Error loading items:', error);
      toast({
        title: "Error",
        description: "Failed to load items",
        variant: "destructive"
      });
    }
  };

  const handleLogin = (role: UserRole, username?: string) => {
    setCurrentUser({ role, username });
    storage.saveSession(role, username);
    setView('items');
  };

  const handleLogout = () => {
    setCurrentUser({ role: null });
    storage.clearSession();
    setView('home');
  };

  const handleItemSave = async (itemData: Partial<Item>) => {
    try {
      if (selectedItem) {
        const updatedItem = await storage.updateItem(selectedItem.id, {
          ...itemData,
          updated_by: currentUser.username || 'admin',
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
          created_by: currentUser.username || 'admin',
          updated_by: currentUser.username || 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          photos: itemData.photos || []
        };
        
        await storage.addItem(newItem);
        toast({
          title: "Success",
          description: "Item added successfully"
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

  const handleSplitItem = async (originalItem: Item, newItems: Partial<Item>[]) => {
    try {
      for (const newItemData of newItems) {
        const newItem: Item = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          ...originalItem,
          ...newItemData,
          quantity: newItemData.quantity || 1,
          created_by: currentUser.username || 'admin',
          updated_by: currentUser.username || 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        await storage.addItem(newItem);
      }
      
      await storage.deleteItem(originalItem.id);
      
      loadItems();
      setShowSplitModal(false);
      setSelectedItem(null);
      
      toast({
        title: "Success",
        description: `Item split into ${newItems.length} separate items`
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
        updated_by: currentUser.username || 'admin',
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

  const handleDonationSubmit = () => {
    setShowThankYou(true);
  };

  const handleThankYouComplete = () => {
    setShowThankYou(false);
    setView('home');
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesCondition;
  });

  const stats = {
    totalItems: items.length,
    availableItems: items.filter(item => item.status === 'available').length,
    soldItems: items.filter(item => item.status === 'sold').length,
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

  if (view === 'home') {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (view === 'register') {
    return <DonorRegistration onBack={() => setView('home')} onSubmit={handleDonationSubmit} />;
  }

  if (view === 'donor-login') {
    return <DonorLogin onLogin={(username) => handleLogin('donator', username)} onBack={() => setView('home')} />;
  }

  if (view === 'add-item' || view === 'edit-item') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          role={currentUser.role!}
          username={currentUser.username}
          onLogout={handleLogout}
          onNavigate={setView}
        />
        <div className="container mx-auto px-4 py-8">
          <ItemForm
            item={selectedItem}
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
          role={currentUser.role!}
          username={currentUser.username}
          onLogout={handleLogout}
          onNavigate={setView}
        />
        <div className="container mx-auto px-4 py-8">
          {selectedItem && (
            <ItemDetail
              item={selectedItem}
              userRole={currentUser.role!}
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
          role={currentUser.role!}
          username={currentUser.username}
          onLogout={handleLogout}
          onNavigate={setView}
        />
        <div className="container mx-auto px-4 py-8">
          <UserManagement userRole={currentUser.role!} onBack={() => setView('items')} />
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
          role={currentUser.role!}
          username={currentUser.username}
          onLogout={handleLogout}
          onNavigate={setView}
        />
        
        <div className="container mx-auto px-4 py-8">
          {currentUser.role === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          )}

          <Card className="bg-white/90 backdrop-blur-sm mb-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-white" style={{ color: '#1733a7' }}>
                  Inventory Management
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  {currentUser.role === 'admin' && (
                    <>
                      <Button onClick={() => setView('add-item')} className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
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
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="donated">Donated</SelectItem>
                      <SelectItem value="pending_approval">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={conditionFilter} onValueChange={setConditionFilter}>
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
              </div>
              
              <div className="text-sm text-gray-600">
                Showing {filteredItems.length} of {items.length} items
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="relative">
                <ItemCard
                  item={item}
                  userRole={currentUser.role!}
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
                
                {currentUser.role === 'admin' && item.quantity > 1 && (
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

          {filteredItems.length === 0 && (
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || categoryFilter !== "all" || statusFilter !== "all" || conditionFilter !== "all" 
                    ? "Try adjusting your search criteria" 
                    : "Get started by adding your first item"}
                </p>
                {currentUser.role === 'admin' && (
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

      {selectedItem && (
        <>
          <QRCodeModal
            open={showQRModal}
            onOpenChange={setShowQRModal}
            item={selectedItem}
          />
          
          <ItemSplitModal
            open={showSplitModal}
            onOpenChange={setShowSplitModal}
            item={selectedItem}
            onSplit={handleSplitItem}
          />
        </>
      )}

      <ThankYouAnimation
        isVisible={showThankYou}
        onComplete={handleThankYouComplete}
      />

      <Toaster />
    </div>
  );
}
