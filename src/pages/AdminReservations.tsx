import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Check, X, ChevronsUpDown, Trash2, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { storage } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import type { Item } from "@/types/item";

interface ReservationItem {
  itemId: string;
  itemName: string;
  quantity: number;
}

interface Reservation {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: ReservationItem[];
  reservedDate: string;
  isPaid: boolean;
  isPickedUp: boolean;
  notes?: string;
  createdBy: string;
}

export default function AdminReservations() {
  const navigate = useNavigate();
  const { userRole, username, isAuthenticated, signOut } = useAuth();
  const { toast } = useToast();
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    isPaid: false,
    isPickedUp: false,
    notes: ''
  });
  
  const [selectedItems, setSelectedItems] = useState<ReservationItem[]>([]);
  const [itemSearchOpen, setItemSearchOpen] = useState(false);
  const [itemSearchValue, setItemSearchValue] = useState('');

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'admin') {
      navigate('/auth');
      return;
    }
    loadData();
  }, [isAuthenticated, userRole, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, reservationsData] = await Promise.all([
        storage.getItems(),
        loadReservations()
      ]);
      setItems(itemsData.filter(item => item.status === 'available'));
      setReservations(reservationsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async (): Promise<Reservation[]> => {
    const stored = localStorage.getItem('admin_reservations');
    return stored ? JSON.parse(stored) : [];
  };

  const saveReservations = async (newReservations: Reservation[]) => {
    localStorage.setItem('admin_reservations', JSON.stringify(newReservations));
    setReservations(newReservations);
  };

  const addItemToReservation = (item: Item) => {
    const existingItem = selectedItems.find(si => si.itemId === item.id);
    if (existingItem) {
      setSelectedItems(selectedItems.map(si => 
        si.itemId === item.id 
          ? { ...si, quantity: si.quantity + 1 }
          : si
      ));
    } else {
      setSelectedItems([...selectedItems, {
        itemId: item.id,
        itemName: item.name,
        quantity: 1
      }]);
    }
    setItemSearchValue('');
    setItemSearchOpen(false);
  };

  const removeItemFromReservation = (itemId: string) => {
    setSelectedItems(selectedItems.filter(si => si.itemId !== itemId));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromReservation(itemId);
      return;
    }
    setSelectedItems(selectedItems.map(si => 
      si.itemId === itemId ? { ...si, quantity } : si
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || selectedItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Customer name and at least one item are required",
        variant: "destructive"
      });
      return;
    }

    // Validate quantities
    for (const selectedItem of selectedItems) {
      const item = items.find(i => i.id === selectedItem.itemId);
      if (!item || selectedItem.quantity > item.quantity) {
        toast({
          title: "Error",
          description: `Only ${item?.quantity || 0} of ${selectedItem.itemName} available`,
          variant: "destructive"
        });
        return;
      }
    }

    try {
      const reservation: Reservation = {
        id: editingReservation?.id || Date.now().toString(),
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        items: selectedItems,
        reservedDate: editingReservation?.reservedDate || new Date().toISOString(),
        isPaid: formData.isPaid,
        isPickedUp: formData.isPickedUp,
        notes: formData.notes,
        createdBy: username || 'Admin'
      };

      let updatedReservations;
      if (editingReservation) {
        updatedReservations = reservations.map(r => r.id === editingReservation.id ? reservation : r);
      } else {
        updatedReservations = [...reservations, reservation];
      }

      await saveReservations(updatedReservations);
      
      // Update item statuses to reserved
      for (const selectedItem of selectedItems) {
        await storage.updateItem(selectedItem.itemId, {
          status: 'reserved',
          reserved_by: formData.customerName
        });
      }

      toast({
        title: "Success",
        description: editingReservation ? "Reservation updated" : "Reservation created"
      });

      resetForm();
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving reservation:', error);
      toast({
        title: "Error",
        description: "Failed to save reservation",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setFormData({
      customerName: reservation.customerName,
      customerEmail: reservation.customerEmail || '',
      customerPhone: reservation.customerPhone || '',
      isPaid: reservation.isPaid,
      isPickedUp: reservation.isPickedUp,
      notes: reservation.notes || ''
    });
    setSelectedItems(reservation.items);
    setIsDialogOpen(true);
  };

  const handleDelete = async (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return;

    try {
      const updatedReservations = reservations.filter(r => r.id !== reservationId);
      await saveReservations(updatedReservations);
      
      // Update item statuses back to available
      for (const item of reservation.items) {
        await storage.updateItem(item.itemId, {
          status: 'available',
          reserved_by: ''
        });
      }

      toast({
        title: "Success",
        description: "Reservation deleted"
      });

      loadData();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast({
        title: "Error",
        description: "Failed to delete reservation",
        variant: "destructive"
      });
    }
  };

  const togglePaymentStatus = async (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return;

    try {
      const updatedReservation = { ...reservation, isPaid: !reservation.isPaid };
      const updatedReservations = reservations.map(r => 
        r.id === reservationId ? updatedReservation : r
      );
      await saveReservations(updatedReservations);

      toast({
        title: "Success",
        description: `Payment status ${updatedReservation.isPaid ? 'marked as paid' : 'marked as unpaid'}`
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive"
      });
    }
  };

  const togglePickupStatus = async (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return;

    try {
      const updatedReservation = { ...reservation, isPickedUp: !reservation.isPickedUp };
      const updatedReservations = reservations.map(r => 
        r.id === reservationId ? updatedReservation : r
      );
      await saveReservations(updatedReservations);

      toast({
        title: "Success",
        description: `Pickup status ${updatedReservation.isPickedUp ? 'marked as picked up' : 'marked as not picked up'}`
      });
    } catch (error) {
      console.error('Error updating pickup status:', error);
      toast({
        title: "Error",
        description: "Failed to update pickup status",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      isPaid: false,
      isPickedUp: false,
      notes: ''
    });
    setSelectedItems([]);
    setEditingReservation(null);
    setItemSearchValue('');
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(itemSearchValue.toLowerCase()) ||
    item.category?.toLowerCase().includes(itemSearchValue.toLowerCase())
  );

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          userRole={userRole}
          username={username}
          onLogout={signOut}
          isAuthenticated={isAuthenticated}
        />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600">Access denied. Admin privileges required.</p>
              <Button onClick={() => navigate('/')} className="mt-4">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        userRole={userRole}
        username={username}
        onLogout={signOut}
        isAuthenticated={isAuthenticated}
      />
      
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Reservations Management</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Reservation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingReservation ? 'Edit Reservation' : 'Create New Reservation'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerName">Customer Name *</Label>
                        <Input
                          id="customerName"
                          value={formData.customerName}
                          onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="customerEmail">Customer Email</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          value={formData.customerEmail}
                          onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="customerPhone">Customer Phone</Label>
                      <Input
                        id="customerPhone"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Items *</Label>
                      <div className="space-y-2">
                        <Popover open={itemSearchOpen} onOpenChange={setItemSearchOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={itemSearchOpen}
                              className="w-full justify-between"
                            >
                              <span className="flex items-center">
                                <Package className="h-4 w-4 mr-2" />
                                Search and add items...
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search items..."
                                value={itemSearchValue}
                                onValueChange={setItemSearchValue}
                              />
                              <CommandEmpty>No items found.</CommandEmpty>
                              <CommandGroup>
                                <CommandList className="max-h-[200px]">
                                  {filteredItems.map((item) => (
                                    <CommandItem
                                      key={item.id}
                                      value={item.name}
                                      onSelect={() => addItemToReservation(item)}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex justify-between w-full">
                                        <span>{item.name}</span>
                                        <span className="text-muted-foreground">
                                          Available: {item.quantity}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandList>
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        
                        {selectedItems.length > 0 && (
                          <div className="space-y-2 mt-3">
                            <Label className="text-sm font-medium">Selected Items:</Label>
                            {selectedItems.map((selectedItem) => (
                              <div key={selectedItem.itemId} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                <div className="flex-1">
                                  <span className="font-medium">{selectedItem.itemName}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Input
                                    type="number"
                                    min="1"
                                    value={selectedItem.quantity}
                                    onChange={(e) => updateItemQuantity(selectedItem.itemId, parseInt(e.target.value) || 1)}
                                    className="w-16 h-8"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeItemFromReservation(selectedItem.itemId)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isPaid"
                          checked={formData.isPaid}
                          onChange={(e) => setFormData({...formData, isPaid: e.target.checked})}
                          className="rounded"
                        />
                        <Label htmlFor="isPaid">Paid</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isPickedUp"
                          checked={formData.isPickedUp}
                          onChange={(e) => setFormData({...formData, isPickedUp: e.target.checked})}
                          className="rounded"
                        />
                        <Label htmlFor="isPickedUp">Picked Up</Label>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingReservation ? 'Update' : 'Create'} Reservation
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading reservations...</div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reservations found. Create your first reservation above.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Reserved Date</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell className="font-medium">
                        {reservation.customerName}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {reservation.customerEmail && <div>{reservation.customerEmail}</div>}
                          {reservation.customerPhone && <div>{reservation.customerPhone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {reservation.items.map((item, index) => (
                            <div key={index} className="text-sm">
                              {item.itemName} <span className="text-muted-foreground">(x{item.quantity})</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(reservation.reservedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={reservation.isPaid ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => togglePaymentStatus(reservation.id)}
                        >
                          {reservation.isPaid ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Paid
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Unpaid
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={reservation.isPickedUp ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => togglePickupStatus(reservation.id)}
                        >
                          {reservation.isPickedUp ? (
                            <>
                              <Package className="h-3 w-3 mr-1" />
                              Picked Up
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(reservation)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(reservation.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}