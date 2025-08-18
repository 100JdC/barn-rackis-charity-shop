
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { storage } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import type { Item } from "@/types/item";

interface Reservation {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  itemId: string;
  itemName: string;
  quantity: number;
  reservedDate: string;
  isPaid: boolean;
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
    itemId: '',
    quantity: 1,
    isPaid: false,
    notes: ''
  });

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
    // Load from localStorage for now (can be migrated to Supabase later)
    const stored = localStorage.getItem('admin_reservations');
    return stored ? JSON.parse(stored) : [];
  };

  const saveReservations = async (newReservations: Reservation[]) => {
    localStorage.setItem('admin_reservations', JSON.stringify(newReservations));
    setReservations(newReservations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.itemId) {
      toast({
        title: "Validation Error",
        description: "Customer name and item are required",
        variant: "destructive"
      });
      return;
    }

    const selectedItem = items.find(item => item.id === formData.itemId);
    if (!selectedItem) {
      toast({
        title: "Error",
        description: "Selected item not found",
        variant: "destructive"
      });
      return;
    }

    if (formData.quantity > selectedItem.quantity) {
      toast({
        title: "Error",
        description: `Only ${selectedItem.quantity} items available`,
        variant: "destructive"
      });
      return;
    }

    try {
      const reservation: Reservation = {
        id: editingReservation?.id || Date.now().toString(),
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        itemId: formData.itemId,
        itemName: selectedItem.name,
        quantity: formData.quantity,
        reservedDate: editingReservation?.reservedDate || new Date().toISOString(),
        isPaid: formData.isPaid,
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
      
      // Update item status to reserved
      await storage.updateItem(formData.itemId, {
        status: 'reserved',
        reserved_by: formData.customerName
      });

      toast({
        title: "Success",
        description: editingReservation ? "Reservation updated" : "Reservation created"
      });

      resetForm();
      setIsDialogOpen(false);
      loadData(); // Reload to get updated items
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
      itemId: reservation.itemId,
      quantity: reservation.quantity,
      isPaid: reservation.isPaid,
      notes: reservation.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return;

    try {
      const updatedReservations = reservations.filter(r => r.id !== reservationId);
      await saveReservations(updatedReservations);
      
      // Update item status back to available
      await storage.updateItem(reservation.itemId, {
        status: 'available',
        reserved_by: ''
      });

      toast({
        title: "Success",
        description: "Reservation deleted"
      });

      loadData(); // Reload to get updated items
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

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      itemId: '',
      quantity: 1,
      isPaid: false,
      notes: ''
    });
    setEditingReservation(null);
  };

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
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingReservation ? 'Edit Reservation' : 'Create New Reservation'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
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
                    
                    <div>
                      <Label htmlFor="customerPhone">Customer Phone</Label>
                      <Input
                        id="customerPhone"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="itemId">Item *</Label>
                      <Select value={formData.itemId} onValueChange={(value) => setFormData({...formData, itemId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an item" />
                        </SelectTrigger>
                        <SelectContent>
                          {items.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} (Available: {item.quantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                      />
                    </div>
                    
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
                    
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
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
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reserved Date</TableHead>
                    <TableHead>Payment Status</TableHead>
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
                        <div className="text-sm">
                          {reservation.customerEmail && <div>{reservation.customerEmail}</div>}
                          {reservation.customerPhone && <div>{reservation.customerPhone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{reservation.itemName}</TableCell>
                      <TableCell>{reservation.quantity}</TableCell>
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
