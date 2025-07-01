import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Filter, QrCode, Eye, Edit, Trash2, Check, X as XIcon, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { storage } from "@/utils/storage";
import { mockItems } from "@/data/mockItems";
import type { Item, UserRole } from "@/types/item";

const Index = () => {
  const [items, setItems] = useState<Item[]>([]);
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

  // Load items from storage on component mount
  useEffect(() => {
    const storedItems = storage.getItems();
    if (storedItems.length === 0) {
      // Initialize with mock data if no stored items
      storage.setItems(mockItems);
      setItems(mockItems);
    } else {
      setItems(storedItems);
    }
  }, []);

  // Save items to storage whenever items change
  useEffect(() => {
    if (items.length > 0) {
      storage.setItems(items);
    }
  }, [items]);

  // Always call hooks - move filtering logic inside useMemo
  const filteredItems = useMemo(() => {
    if (!userRole) return [];
    
    let itemsToShow = items;
    
    // For donators, only show approved items (not pending_approval)
    if (userRole === 'donator') {
      itemsToShow = items.filter(item => item.status !== 'pending_approval');
    }
    // For buyers, only show available items
    else if (userRole === 'buyer') {
      itemsToShow = items.filter(item => item.status === 'available');
    }
    // For admin, show all items including pending_approval

    return itemsToShow.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesCondition;
    });
  }, [items, searchTerm, categoryFilter, statusFilter, conditionFilter, userRole]);

  const pendingApprovalItems = useMemo(() => {
    if (!userRole) return [];
    return items.filter(item => item.status === 'pending_approval');
  }, [items, userRole]);

  // Show login form if user is not logged in
  if (!userRole) {
    return <LoginForm onLogin={(role, username) => {
      setUserRole(role);
      if (username) setCurrentUsername(username);
    }} />;
  }

  // Show user management if admin requested it
  if (showUserManagement && userRole === 'admin') {
    return <UserManagement onBack={() => setShowUserManagement(false)} />;
  }

  const handleAddItem = (newItem: Omit<Item, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>, addAnother: boolean = false) => {
    const item: Item = {
      ...newItem,
      id: Date.now().toString(),
      created_by: "current-user",
      updated_by: "current-user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setItems([...items, item]);
    
    if (!addAnother) {
      setShowItemForm(false);
    }
  };

  const handleEditItem = (updatedItem: Omit<Item, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>) => {
    if (!editingItem) return;
    
    const updated: Item = {
      ...editingItem,
      ...updatedItem,
      updated_by: "current-user",
      updated_at: new Date().toISOString(),
    };
    
    setItems(items.map(item => item.id === editingItem.id ? updated : item));
    setEditingItem(null);
    setShowItemForm(false);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleApproveItem = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, status: 'available' as const, updated_by: "current-user", updated_at: new Date().toISOString() }
        : item
    ));
  };

  const handleRejectItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleViewItem = (item: Item) => {
    setSelectedItem(item);
    setShowItemDetail(true);
  };

  const handleShowQRCode = (item: Item) => {
    setSelectedItem(item);
    setShowQRCode(true);
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentUsername(null);
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

  if (showItemForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-between items-center p-4 bg-white shadow-sm">
          <Header 
            userRole={userRole}
            onBack={() => {
              setShowItemForm(false);
              setEditingItem(null);
            }}
          />
          <div className="flex gap-2">
            {userRole === 'admin' && (
              <Button variant="outline" onClick={() => setShowUserManagement(true)}>
                <Users className="h-4 w-4 mr-2" />
                Users
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout ({userRole})
            </Button>
          </div>
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
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-between items-center p-4 bg-white shadow-sm">
          <Header 
            userRole={userRole}
            onBack={() => {
              setShowItemDetail(false);
              setSelectedItem(null);
            }}
          />
          <div className="flex gap-2">
            {userRole === 'admin' && (
              <Button variant="outline" onClick={() => setShowUserManagement(true)}>
                <Users className="h-4 w-4 mr-2" />
                Users
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout ({userRole})
            </Button>
          </div>
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-between items-center p-4 bg-white shadow-sm">
        <Header userRole={userRole} />
        <div className="flex gap-2">
          {userRole === 'admin' && (
            <Button variant="outline" onClick={() => setShowUserManagement(true)}>
              <Users className="h-4 w-4 mr-2" />
              Users
            </Button>
          )}
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout ({userRole})
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Pending Approval Section - Admin Only */}
        {userRole === 'admin' && pendingApprovalItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">
                Pending Approval ({pendingApprovalItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingApprovalItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {items.filter(item => item.status === 'available').length}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {items.filter(item => item.status === 'reserved').length}
              </div>
              <div className="text-sm text-gray-600">Reserved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {items.filter(item => item.status === 'sold').length}
              </div>
              <div className="text-sm text-gray-600">Sold</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {items.filter(item => item.status !== 'pending_approval').length}
              </div>
              <div className="text-sm text-gray-600">Total Items</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
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

        {/* Add Item Button - Hide for buyers */}
        {userRole !== 'buyer' && (
          <Button 
            onClick={() => setShowItemForm(true)}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {userRole === 'admin' ? 'Add New Item' : 'Donate Item'}
          </Button>
        )}

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                {/* Show first photo if available */}
                {item.photos && item.photos.length > 0 && (
                  <div className="mb-3">
                    <img 
                      src={item.photos[0]} 
                      alt={item.name}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {getCategoryDisplayName(item.category)} - {item.subcategory}
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Qty:</span> {item.quantity} | 
                    <span className="font-medium"> Price:</span> {item.suggested_price} SEK
                  </div>
                  
                  {item.donor_name && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Donor:</span> {item.donor_name}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={() => handleViewItem(item)} variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    
                    {userRole === 'admin' && (
                      <>
                        <Button size="sm" onClick={() => {
                          setEditingItem(item);
                          setShowItemForm(true);
                        }} variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" onClick={() => handleDeleteItem(item.id)} variant="outline" className="text-red-600">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                    
                    <Button size="sm" onClick={() => handleShowQRCode(item)} variant="outline">
                      <QrCode className="h-3 w-3 mr-1" />
                      QR
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card>
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
    </div>
  );
};

export default Index;
