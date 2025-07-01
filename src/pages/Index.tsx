
import { useState, useMemo } from "react";
import { Plus, Search, Filter, QrCode, Eye, Edit, Trash2 } from "lucide-react";
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
import { mockItems } from "@/data/mockItems";
import type { Item } from "@/types/item";

const Index = () => {
  const [items, setItems] = useState<Item[]>(mockItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Mock user role - in real app this would come from auth
  const userRole = "admin"; // admin, volunteer, viewer

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesCondition;
    });
  }, [items, searchTerm, categoryFilter, statusFilter, conditionFilter]);

  const handleAddItem = (newItem: Omit<Item, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>) => {
    const item: Item = {
      ...newItem,
      id: Date.now().toString(),
      created_by: "current-user",
      updated_by: "current-user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setItems([...items, item]);
    setShowItemForm(false);
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

  const handleViewItem = (item: Item) => {
    setSelectedItem(item);
    setShowItemDetail(true);
  };

  const handleShowQRCode = (item: Item) => {
    setSelectedItem(item);
    setShowQRCode(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'donated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showItemForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          userRole={userRole}
          onBack={() => {
            setShowItemForm(false);
            setEditingItem(null);
          }}
        />
        <div className="p-4">
          <ItemForm
            item={editingItem}
            onSubmit={editingItem ? handleEditItem : handleAddItem}
            onCancel={() => {
              setShowItemForm(false);
              setEditingItem(null);
            }}
          />
        </div>
      </div>
    );
  }

  if (showItemDetail && selectedItem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          userRole={userRole}
          onBack={() => {
            setShowItemDetail(false);
            setSelectedItem(null);
          }}
        />
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
      <Header userRole={userRole} />
      
      <div className="p-4 space-y-6">
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
                {items.length}
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
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="decor">Decor</SelectItem>
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

        {/* Add Item Button */}
        {(userRole === 'admin' || userRole === 'volunteer') && (
          <Button 
            onClick={() => setShowItemForm(true)}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Item
          </Button>
        )}

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
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
