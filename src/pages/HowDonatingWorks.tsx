import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BetaNotice } from "@/components/BetaNotice";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const HowDonatingWorks = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch user profile to get role
        supabase
          .from('profiles')
          .select('role, username')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUserRole(data.role || 'buyer');
            }
          });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('role, username')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUserRole(data.role || 'buyer');
            }
          });
      } else {
        setUserRole('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#001faa' }}>
      {/* Header */}
      <Header 
        userRole={userRole || "buyer"} 
        username={user?.email || ""}
        isAuthenticated={!!user}
        onHome={() => navigate('/')}
        onDonate={() => navigate('/?donate=true')}
        onLogout={async () => {
          await supabase.auth.signOut();
          navigate('/');
        }}
      />
      <BetaNotice />

      <div className="relative z-10 flex-1 container mx-auto px-4 py-8">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <Button
            onClick={() => navigate('/about')}
            variant="outline"
            className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to About
          </Button>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-center" style={{ color: '#1733a7' }}>
                How Donating Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg">
              <div className="text-center text-gray-600">
                <p>Content coming soon! We're working on detailed instructions for how to donate your items.</p>
                <p className="mt-4">Check back soon for step-by-step guidance on the donation process.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HowDonatingWorks;