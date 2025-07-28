import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ItemForm } from "@/components/ItemForm";
import { ThankYouAnimation } from "@/components/ThankYouAnimation";
import { Footer } from "@/components/Footer";
import { storage } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import type { Item, UserRole } from "@/types/item";
import { supabase } from "@/integrations/supabase/client";

interface DonatePageProps {
  userRole: UserRole;
  username?: string;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  onBack: () => void;
}

export const DonatePage = ({ userRole, username, onLogout, onNavigate, onBack }: DonatePageProps) => {
  const [showThankYou, setShowThankYou] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to donate items.",
          variant: "destructive"
        });
        onNavigate('home');
        return;
      }
    };

    checkAuth();
  }, [onNavigate, toast]);

  const handleItemsSave = async (items: Omit<Item, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>[]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to donate items.",
        variant: "destructive"
      });
      onNavigate('home');
      return;
    }

    try {
      const donorUsername = username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Anonymous Donor';
      
      for (const itemData of items) {
        const newItem: Item = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          ...itemData as Item,
          status: userRole === 'admin' ? 'available' : 'pending_approval',
          created_by: donorUsername,
          updated_by: donorUsername,
          donor_name: itemData.donor_name || donorUsername,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          photos: []
        };
        
        await storage.addItem(newItem);
      }
      
      setShowThankYou(true);
      toast({
        title: "Success",
        description: userRole === 'admin' 
          ? `${items.length} item${items.length > 1 ? 's' : ''} added successfully!`
          : `Thank you for your donation! ${items.length} item${items.length > 1 ? 's have' : ' has'} been submitted for admin approval.`
      });
    } catch (error) {
      console.error('Error saving donations:', error);
      toast({
        title: "Error",
        description: "Failed to submit donations. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleThankYouComplete = () => {
    setShowThankYou(false);
    onNavigate('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        userRole={userRole}
        username={username}
        onLogout={onLogout}
        onNavigate={onNavigate}
        onBack={onBack}
      />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Donate Items</h1>
            <p className="text-gray-600">
              Thank you for donating! Please fill out the form below to add your items to our inventory.
              {userRole !== 'admin' && " All donations will be reviewed by an admin before becoming available for purchase."}
            </p>
          </div>
          
          <ItemForm
            item={null}
            userRole={userRole}
            onSubmit={handleItemsSave}
            onCancel={onBack}
            username={username}
          />
        </div>
      </div>

      <ThankYouAnimation
        isVisible={showThankYou}
        onComplete={handleThankYouComplete}
      />
      
      <Footer />
    </div>
  );
};
