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

const HowSupportingWorks = () => {
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
                How to Support Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg">
              <div className="text-center mb-6">
                <img 
                  src="/lovable-uploads/84975080-89b6-4544-a1d5-f8661acb4bb1.png" 
                  alt="Our team with donations at Rackarbergsgatan 32" 
                  className="rounded-lg shadow-md mx-auto max-w-full h-auto"
                />
              </div>
              
              <div className="space-y-6 text-gray-700">
                <div>
                  <p className="text-xl font-semibold mb-3" style={{ color: '#1733a7' }}>
                    Right now, we urgently need extra hands to help sort the huge amount of donations we've received.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#1733a7' }}>Volunteer Hours</h3>
                  <p>From <strong>August 11th to August 20th</strong>, we'll have helping hours every afternoon at Rackarbergsgatan 32.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#1733a7' }}>How to Join</h3>
                  <p>If you'd like to join, just send us a message on Instagram or email us at <a href="mailto:info@rackisforbarn.com" className="text-blue-600 hover:underline">info@rackisforbarn.com</a></p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#1733a7' }}>Our Thanks</h3>
                  <p>After each sorting session, we'll relax together with pizza and beer — our way of saying thanks for your time.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HowSupportingWorks;