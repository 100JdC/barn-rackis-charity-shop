import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ItemForm } from "@/components/ItemForm";
import { ThankYouAnimation } from "@/components/ThankYouAnimation";
import { Footer } from "@/components/Footer";
import { storage } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Item } from "@/types/item";
import { supabase } from "@/integrations/supabase/client";

export const DonatePage = () => {
  const [showThankYou, setShowThankYou] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, userRole, username, isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔐 DonatePage: Checking authentication...', { isAuthenticated, userRole, user: !!user });
      
      setLoading(false);
      
      if (!isAuthenticated || !user) {
        console.log('❌ DonatePage: Not authenticated, redirecting to auth');
        toast({
          title: "Authentication Required",
          description: "Please log in to donate items.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }
      
      console.log('✅ DonatePage: Authentication verified');
    };

    checkAuth();
  }, [isAuthenticated, user, navigate, toast]);

  const handleItemsSave = async (items: Omit<Item, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>[]) => {
    console.log('💾 DonatePage: Starting donation save...', { itemCount: items.length, userRole, user: !!user });
    
    if (!user) {
      console.log('❌ DonatePage: No user found during save');
      toast({
        title: "Authentication Required",
        description: "Please log in to donate items.",
        variant: "destructive"
      });
      navigate('/auth');
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
      
      toast({
        title: "Success",
        description: userRole === 'admin' 
          ? `${items.length} item${items.length > 1 ? 's' : ''} added successfully!`
          : `Thank you for your donation! ${items.length} item${items.length > 1 ? 's have' : ' has'} been submitted for admin approval.`
      });
      
      // Navigate back to home
      navigate('/');
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
    navigate('/');
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
        onDonate={() => navigate('/donate')}
        onLogout={signOut}
        isAuthenticated={isAuthenticated}
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
            onCancel={() => navigate('/')}
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
