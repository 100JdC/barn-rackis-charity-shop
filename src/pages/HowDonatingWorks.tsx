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
            <CardContent className="space-y-8 text-lg">
              <div className="text-center text-gray-700 mb-8">
                <p className="text-xl">We gladly accept second-hand items in good condition — and every donation helps us support <strong>Barncancerfonden Mellansverige</strong>.</p>
              </div>

              {/* What You Can Donate */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-blue-900">What You Can Donate</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p>Kitchenware, dishes, utensils</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p>Small appliances</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p>Bedding (duvets, pillows, covers, sheets)</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p>Sports equipment, bicycles</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p>Books and decorations</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p>Other useful household items for students</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What We Cannot Accept */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-red-900">What We Cannot Accept</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p>Broken or unsafe electronics</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p>Furniture too large to transport easily</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p>Clothes</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p>Items with strong odors or heavy wear</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Where and When */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-blue-900">Where and When to Bring Donations</h2>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="mb-3">We collect donations locally in Rackarbergsgatan student housing.</p>
                  <p className="mb-3">Bring your items to <strong>Rackarbergsgatan 32, Uppsala</strong> during our opening hours — please check our Instagram for the latest schedule.</p>
                  <p>If you have a lot to donate or need help carrying things, send us an email at <a href="mailto:info@rackisforbarn.com" className="text-blue-600 hover:text-blue-800 underline">info@rackisforbarn.com</a> to arrange a time.</p>
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

export default HowDonatingWorks;