import { useState, useEffect } from 'react';
import { storage } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye } from 'lucide-react';
import { ItemDetail } from './ItemDetail';
import type { Item, UserRole } from '@/types/item';

interface PendingDonationsProps {
  onItemsUpdate: () => Promise<void>;
}

export const PendingDonations = ({ onItemsUpdate }: PendingDonationsProps) => {
  const [pendingItems, setPendingItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    try {
      const allItems = await storage.getItems();
      const pending = allItems.filter(item => item.status === 'pending_approval');
      setPendingItems(pending);
    } catch (error) {
      console.error('Error loading pending items:', error);
      toast({
        title: "Error",
        description: "Failed to load pending donations.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item: Item) => {
    try {
      const updatedItem = {
        ...item,
        status: 'available' as const,
        updated_at: new Date().toISOString()
      };
      
      const success = await storage.updateItem(updatedItem.id, updatedItem);
      if (success) {
        toast({
          title: "Success",
          description: `"${item.name}" has been approved and is now available.`
        });
        await loadPendingItems();
        await onItemsUpdate();
      }
    } catch (error) {
      console.error('Error approving item:', error);
      toast({
        title: "Error",
        description: "Failed to approve item.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (item: Item) => {
    if (window.confirm(`Are you sure you want to reject "${item.name}"? This action cannot be undone.`)) {
      try {
        const success = await storage.deleteItem(item.id);
        if (success) {
          toast({
            title: "Success",
            description: `"${item.name}" has been rejected and removed.`
          });
          await loadPendingItems();
          await onItemsUpdate();
        }
      } catch (error) {
        console.error('Error rejecting item:', error);
        toast({
          title: "Error",
          description: "Failed to reject item.",
          variant: "destructive"
        });
      }
    }
  };

  const handleViewDetail = (item: Item) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  if (showDetail && selectedItem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Button onClick={() => setShowDetail(false)} variant="outline">
              ← Back to Pending Donations
            </Button>
          </div>
          <ItemDetail
            item={selectedItem}
            userRole="admin"
            onEdit={() => {}}
            onDelete={() => {}}
            onShowQRCode={() => {}}
          />
          <div className="mt-6 flex gap-4">
            <Button 
              onClick={() => handleApprove(selectedItem)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              onClick={() => handleReject(selectedItem)}
              variant="destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Pending Donations
          <Badge variant="secondary">{pendingItems.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading pending donations...</p>
          </div>
        ) : pendingItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No pending donations to review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-gray-600">{item.description}</p>
                    <p className="text-sm text-gray-500">
                      Donated by: {item.donor_name} • {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-600">
                    Pending
                  </Badge>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetail(item)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(item)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(item)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
