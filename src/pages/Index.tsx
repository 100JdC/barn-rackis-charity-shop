import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Filter, QrCode, Eye, Edit, Trash2, Check, X as XIcon, LogOut, Users, Download, UserCheck, Split } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemCard } from "@/components/ItemCard";
import { ItemForm } from "@/components/ItemForm";
import { ItemDetail } from "@/components/ItemDetail";
import { QRCodeModal } from "@/components/QRCodeModal";
import { Header } from "@/components/Header";
import { LoginForm } from "@/components/LoginForm";
import { UserManagement } from "@/components/UserManagement";
import { ItemSplitModal } from "@/components/ItemSplitModal";
import { storage } from "@/utils/storage";
import { exportItemsToExcel } from "@/utils/exportUtils";
import type { Item, UserRole } from "@/types/item";
import { ThankYouAnimation } from "@/components/ThankYouAnimation";

const Index = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [reservingItem, setReservingItem] = useState<Item | null>(null);
  const [reservedByName, setReservedByName] = useState("");
  const [splittingItem, setSplittingItem] = useState<Item | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [markingSoldItem, setMarkingSoldItem] = useState<Item | null>(null);
  const [soldQuantityInput, setSoldQuantityInput] = useState("");

  // Load items with better error handling
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Loading items...');
        const supabaseItems = await storage.getItems();
        console.log('Items loaded:', supabaseItems.length);
        setItems(supabaseItems);
      } catch (err) {
        console.error('Failed to load items:', err);
        setError('Failed to load items. Using offline mode.');
        // Try to load from localStorage as fallback
        try {
          const fallbackItems = storage.getItemsFromLocalStorage();
          setItems(fallbackItems);
          console.log('Loaded items from localStorage fallback:', fallbackItems.length);
        } catch (fallbackErr) {
          console.error('Even localStorage fallback failed:', fallbackErr);
          setItems([]); // Empty state as last resort
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadItems();
  }, []);

  // Calculate sold quantities and group items by original item
  const { filteredItems: processedItems, soldQuantitiesStats } = useMemo(() => {
    if (!userRole) return { filteredItems: [], soldQuantitiesStats: { totalSoldItems: 0, totalSoldQuantity: 0 } };
    
    let itemsToShow = items;
    
    // For non-admin users, hide pending_approval items
    if (userRole !== 'admin') {
      itemsToShow = items.filter(item => item.status !== 'pending_approval');
    }

    // Group items by name and category to track sold quantities
    const itemGroups = new Map<string, { items: Item[], totalOriginal: number, totalSold: number }>();
    
    itemsToShow.forEach(item => {
      const key = `${item.name}_${item.category}_${item.subcategory}`;
      if (!itemGroups.has(key)) {
        itemGroups.set(key, { items: [], totalOriginal: 0, totalSold: 0 });
      }
      const group = itemGroups.get(key)!;
      group.items.push(item);
      
      // Calculate totals
      const originalQty = item.original_quantity || item.quantity;
      if (item.status === 'sold') {
        group.totalSold += item.quantity;
        group.totalOriginal += originalQty;
      } else {
        group.totalOriginal += originalQty;
      }
    });

    // Add quantity display info to items
    const itemsWithQuantityInfo = itemsToShow.map(item => {
      const key = `${item.name}_${item.category}_${item.subcategory}`;
      const group = itemGroups.get(key);
      
      if (group && group.totalOriginal > item.quantity && group.totalSold > 0) {
        return {
          ...item,
          quantityDisplay: `${group.totalSold}/${group.totalOriginal} sold`
        };
      }
      return item;
    });

    const filteredItems = itemsWithQuantityInfo.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesCondition;
    });

    // Calculate sold quantities stats
    const soldItems = items.filter(item => item.status === 'sold');
    const soldStats = {
      totalSoldItems: soldItems.length,
      totalSoldQuantity: soldItems.reduce((sum, item) => sum + item.quantity, 0)
    };

    return { filteredItems, soldQuantitiesStats: soldStats };
  }, [items, searchTerm, categoryFilter, statusFilter, conditionFilter, userRole]);

  const pendingApprovalItems = useMemo(() => {
    if (!userRole) return [];
    return items.filter(item => item.status === 'pending_approval');
  }, [items, userRole]);

  // Calculate sold quantities
  const soldQuantitiesStatsOld = useMemo(() => {
    const soldItems = items.filter(item => item.status === 'sold');
    return {
      totalSoldItems: soldItems.length,
      totalSoldQuantity: soldItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [items]);

  // Define logout and home handlers BEFORE they are used
  const handleLogout = () => {
    storage.clearSession();
    setUserRole(null);
    setCurrentUsername(null);
  };

  const handleGoHome = () => {
    storage.clearSession();
    setUserRole(null);
    setCurrentUsername(null);
  };

  // Check for existing session and redirect to donation if they click "Here you can donate"
  const handleDonateClick = () => {
    const session = storage.getSession();
    if (session.role === 'donator' || session.role === 'admin') {
      // Already logged in as donor or admin, go to donation form
      setShowItemForm(true);
    } else {
      // Need to login first
      setUserRole(null);
    }
  };

  // Show login form if user is not logged in
  if (!userRole) {
    return <LoginForm onLogin={(role, username) => {
      setUserRole(role);
      if (username) setCurrentUsername(username);
    }} />;
  }

  // Show user management if admin requested it
  if (showUserManagement && userRole === 'admin') {
    return (
      <UserManagement 
        onBack={() => setShowUserManagement(false)}
        onLogout={handleLogout}
        onHome={handleGoHome}
        userRole={userRole}
      />
    );
  }

  const handleAddItem = async (newItem: Omit<Item, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>, addAnother: boolean = false) => {
    const item: Item = {
      ...newItem,
      id: Date.now().toString(),
      created_by: "current-user",
      updated_by: "current-user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const savedItem = await storage.addItem(item);
    if (savedItem) {
      setItems(prev => [savedItem, ...prev]);
    }
    
    if (!addAnother) {
      setShowItemForm(false);
      
      // Show thank you animation for donations (non-admin users)
      if (userRole === 'donator') {
        setShowThankYou(true);
      }
    }
  };

  const handleEditItem = async (updatedItem: Omit<Item, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>) => {
    if (!editingItem) return;
    
    const updates = {
      ...updatedItem,
      updated_by: "current-user",
      updated_at: new Date().toISOString(),
    };
    
    const updated = await storage.updateItem(editingItem.id, updates);
    if (updated) {
      setItems(items.map(item => item.id === editingItem.id ? updated : item));
    }
    
    setEditingItem(null);
    setShowItemForm(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    const success = await storage.deleteItem(itemId);
    if (success) {
      setItems(items.filter(item => item.id !== itemId));
    }
  };

  const handleApproveItem = async (itemId: string) => {
    const updates = { 
      status: 'available' as const, 
      updated_by: "current-user", 
      updated_at: new Date().toISOString() 
    };
    
    const updated = await storage.updateItem(itemId, updates);
    if (updated) {
      setItems(items.map(item => item.id === itemId ? updated : item));
    }
  };

  const handleRejectItem = async (itemId: string) => {
    await handleDeleteItem(itemId);
  };

  const handleViewItem = (item: Item) => {
    setSelectedItem(item);
    setShowItemDetail(true);
  };

  const handleShowQRCode = (item: Item) => {
    setSelectedItem(item);
    setShowQRCode(true);
  };

  const handleExportToExcel = () => {
    exportItemsToExcel(items);
  };

  const handleReserveItem = (item: Item) => {
    setReservingItem(item);
    setReservedByName(item.reserved_by || "");
  };

  const handleConfirmReservation = async () => {
    if (!reservingItem) return;
    
    const updates = { 
      status: 'reserved' as const, 
      reserved_by: reservedByName,
      updated_by: "current-user", 
      updated_at: new Date().toISOString() 
    };
    
    const updated = await storage.updateItem(reservingItem.id, updates);
    if (updated) {
      setItems(items.map(item => item.id === reservingItem.id ? updated : item));
    }
    
    setReservingItem(null);
    setReservedByName("");
  };

  const handleSplitItem = async (soldQuantity: number, finalPrice: number, status: 'sold' | 'reserved', reservedBy?: string) => {
    if (!splittingItem) return;
    
    const remainingQuantity = splittingItem.quantity - soldQuantity;
    
    // Create the sold/reserved portion
    const soldItem: Item = {
      ...splittingItem,
      id: Date.now().toString() + '_sold',
      quantity: soldQuantity,
      original_quantity: splittingItem.original_quantity || splittingItem.quantity, // Preserve original quantity
      final_price: finalPrice,
      status: status,
      reserved_by: status === 'reserved' ? reservedBy : undefined,
      updated_by: "current-user",
      updated_at: new Date().toISOString()
    };
    
    // Update the original item with remaining quantity
    const remainingUpdates = {
      quantity: remainingQuantity,
      original_quantity: splittingItem.original_quantity || splittingItem.quantity, // Set original quantity if not set
      updated_by: "current-user",
      updated_at: new Date().toISOString()
    };
    
    // Save both items to Supabase
    const [savedSoldItem, updatedRemainingItem] = await Promise.all([
      storage.addItem(soldItem),
      storage.updateItem(splittingItem.id, remainingUpdates)
    ]);
    
    if (savedSoldItem && updatedRemainingItem) {
      setItems(items.map(i => 
        i.id === splittingItem.id ? updatedRemainingItem : i
      ).concat([savedSoldItem]));
    }
    
    setSplittingItem(null);
  };

  const handleMarkSold = (item: Item) => {
    setMarkingSoldItem(item);
    setSoldQuantityInput("");
  };

  const handleConfirmMarkSold = async () => {
    if (!markingSoldItem || !soldQuantityInput) return;
    
    const soldQty = parseInt(soldQuantityInput);
    if (isNaN(soldQty) || soldQty <= 0 || soldQty > markingSoldItem.quantity) return;
    
    if (soldQty === markingSoldItem.quantity) {
      // Mark entire item as sold
      const updates = {
        status: 'sold' as const,
        updated_by: "current-user",
        updated_at: new Date().toISOString()
      };
      
      const updated = await storage.updateItem(markingSoldItem.id, updates);
      if (updated) {
        setItems(items.map(item => item.id === markingSoldItem.id ? updated : item));
      }
    } else {
      // Split the item
      const remainingQuantity = markingSoldItem.quantity - soldQty;
      
      const soldItem: Item = {
        ...markingSoldItem,
        id: Date.now().toString() + '_sold',
        quantity: soldQty,
        original_quantity: markingSoldItem.original_quantity || markingSoldItem.quantity,
        status: 'sold',
        updated_by: "current-user",
        updated_at: new Date().toISOString()
      };
      
      const remainingUpdates = {
        quantity: remainingQuantity,
        original_quantity: markingSoldItem.original_quantity || markingSoldItem.quantity,
        updated_by: "current-user",
        updated_at: new Date().toISOString()
      };
      
      const [savedSoldItem, updatedRemainingItem] = await Promise.all([
        storage.addItem(soldItem),
        storage.updateItem(markingSoldItem.id, remainingUpdates)
      ]);
      
      if (savedSoldItem && updatedRemainingItem) {
        setItems(items.map(i => 
          i.id === markingSoldItem.id ? updatedRemainingItem : i
        ).concat([savedSoldItem]));
      }
    }
    
    setMarkingSoldItem(null);
    setSoldQuantityInput("");
  };

  function getStatusColor(status: string) {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'donated': return 'bg-purple-100 text-purple-800';
      case 'pending_approval': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getCategoryDisplayName(category: string) {
    const names: Record<string, string> = {
      bedding: 'Bedding',
      bathroom: 'Bathroom',
      decoration: 'Decoration',
      other_room_inventory: 'Other Room Inventory',
      kitchen: 'Kitchen',
      bike_sports: 'Bike & Sports',
      electronics: 'Electronics',
      other: 'Other'
    };
    return names[category] || category;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1733a7' }}>
        <div className="text-white text-xl">Loading inventory...</div>
      </div>
    );
  }

  // Show error state with option to continue
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1733a7' }}>
        <div className="text-white text-center max-w-md">
          <div className="text-xl mb-4">⚠️ Connection Issue</div>
          <div className="text-sm mb-4">{error}</div>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 mr-2"
            >
              Retry Connection
            </button>
            <button 
              onClick={() => setError(null)} 
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Continue Offline
            </button>
          </div>
          <div className="text-xs mt-4 text-gray-300">
            Offline mode uses local storage. Changes won't sync until connection is restored.
          </div>
        </div>
      </div>
    );
  }

  if (showItemForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm shadow-sm">
          <Header 
            userRole={userRole}
            onBack={() => {
              setShowItemForm(false);
              setEditingItem(null);
            }}
            onLogout={handleLogout}
            onHome={handleGoHome}
          />
        </div>
        <div className="p-4">
          <ItemForm
            item={editingItem}
            userRole={userRole}
            currentUsername={currentUsername}
            onSubmit={handleAddItem}
            onEdit={handleEditItem}
            onCancel={() => {
              setShowItemForm(false);
              setEditingItem(null);
            }}
            isEditing={!!editingItem}
          />
        </div>
      </div>
    );
  }

  if (showItemDetail && selectedItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm shadow-sm">
          <Header 
            userRole={userRole}
            onBack={() => {
              setShowItemDetail(false);
              setSelectedItem(null);
            }}
            onLogout={handleLogout}
            onHome={handleGoHome}
          />
        </div>
        <div className="p-4">
          <ItemDetail
            item={selectedItem}
            userRole={userRole}
            onEdit={() => {
              setEditingItem(selectedItem);
              setShowItemDetail(false);
              setShowItemForm(true);
            }}
            onDelete={() => {
              handleDeleteItem(selectedItem.id);
              setShowItemDetail(false);
              setSelectedItem(null);
            }}
            onShowQRCode={() => {
              setShowItemDetail(false);
              setShowQRCode(true);
            }}
          />
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
        />
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm shadow-sm">
          <Header 
            userRole={userRole} 
            onLogout={handleLogout}
            onHome={handleGoHome}
          />
        </div>
        
        <div className="p-4 space-y-6">
          {/* Pending Approval Section - Admin Only */}
          {userRole === 'admin' && pendingApprovalItems.length > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-orange-600">
                  Pending Approval ({pendingApprovalItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingApprovalItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50/80 rounded-lg backdrop-blur-sm">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          {getCategoryDisplayName(item.category)} - {item.subcategory} | Qty: {item.quantity} | {item.original_price} SEK
                          {item.donor_name && <span> | Donor: {item.donor_name}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleViewItem(item)} variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" onClick={() => handleApproveItem(item.id)} className="bg-green-600 hover:bg-green-700">
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" onClick={() => handleRejectItem(item.id)} variant="outline" className="text-red-600 hover:text-red-700">
                          <XIcon className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {items.filter(item => item.status === 'available').length}
                </div>
                <div className="text-sm text-gray-600">Available</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {items.filter(item => item.status === 'reserved').length}
                </div>
                <div className="text-sm text-gray-600">Reserved</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {soldQuantitiesStats.totalSoldItems}
                </div>
                <div className="text-sm text-gray-600">Sold Items</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-800">
                  {soldQuantitiesStats.totalSoldQuantity}
                </div>
                <div className="text-sm text-gray-600">Sold Quantity</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {items.filter(item => item.status !== 'pending_approval').length}
                </div>
                <div className="text-sm text-gray-600">Total Items</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
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

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="donated">Donated</SelectItem>
                    {userRole === 'admin' && <SelectItem value="pending_approval">Pending Approval</SelectItem>}
                  </SelectContent>
                </Select>

                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Conditions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="lightly_used">Lightly Used</SelectItem>
                    <SelectItem value="worn">Worn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {userRole !== 'buyer' && (
              <Button 
                onClick={() => setShowItemForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {userRole === 'admin' ? 'Add New Item' : 'Donate Item'}
              </Button>
            )}
            
            {userRole === 'admin' && (
              <>
                <Button 
                  onClick={handleExportToExcel}
                  variant="outline"
                  className="border-green-300 hover:bg-green-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
                <Button 
                  onClick={() => setShowUserManagement(true)}
                  variant="outline"
                  className="border-blue-300 hover:bg-blue-50"
                >
                  <Users className="h-4 w-4 mr-2" />
                  User Management
                </Button>
              </>
            )}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                userRole={userRole}
                onView={() => handleViewItem(item)}
                onEdit={() => {
                  setEditingItem(item);
                  setShowItemForm(true);
                }}
                onDelete={() => handleDeleteItem(item.id)}
                onShowQRCode={() => handleShowQRCode(item)}
              />
            ))}
          </div>

          {processedItems.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">No items found matching your criteria.</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* QR Code Modal */}
        {showQRCode && selectedItem && (
          <QRCodeModal
            item={selectedItem}
            onClose={() => {
              setShowQRCode(false);
              setSelectedItem(null);
            }}
          />
        )}

        {/* Reservation Modal */}
        {reservingItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 bg-white">
              <CardHeader>
                <CardTitle>Reserve Item: {reservingItem.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reserved-by">Reserved by (person's name):</Label>
                  <Input
                    id="reserved-by"
                    value={reservedByName}
                    onChange={(e) => setReservedByName(e.target.value)}
                    placeholder="Enter person's name"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleConfirmReservation}
                    disabled={!reservedByName.trim()}
                    className="flex-1"
                  >
                    Confirm Reservation
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setReservingItem(null);
                      setReservedByName("");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mark as Sold Modal */}
        {markingSoldItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 bg-white">
              <CardHeader>
                <CardTitle>Mark as Sold: {markingSoldItem.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sold-quantity">Quantity sold (max: {markingSoldItem.quantity}):</Label>
                  <Input
                    id="sold-quantity"
                    type="number"
                    min="1"
                    max={markingSoldItem.quantity}
                    value={soldQuantityInput}
                    onChange={(e) => setSoldQuantityInput(e.target.value)}
                    placeholder="Enter quantity sold"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleConfirmMarkSold}
                    disabled={!soldQuantityInput || parseInt(soldQuantityInput) <= 0 || parseInt(soldQuantityInput) > markingSoldItem.quantity}
                    className="flex-1"
                  >
                    Confirm Sale
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setMarkingSoldItem(null);
                      setSoldQuantityInput("");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Item Split Modal */}
        {splittingItem && (
          <ItemSplitModal
            item={splittingItem}
            onSplit={handleSplitItem}
            onClose={() => setSplittingItem(null)}
          />
        )}

        {/* Thank You Animation */}
        <ThankYouAnimation 
          isVisible={showThankYou}
          onComplete={() => setShowThankYou(false)}
        />
      </div>
    </div>
  );
};

export default Index;
