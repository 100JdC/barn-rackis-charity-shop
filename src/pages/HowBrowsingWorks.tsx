
import { ArrowLeft, MapPin, Clock, Euro, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BetaNotice } from "@/components/BetaNotice";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const HowBrowsingWorks = () => {
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
                How to Browse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Our online browsing tool gives you a taste of what we have in store — but please note:
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 my-6">
                  <p className="text-blue-800 font-medium mb-2">Important to know:</p>
                  <ul className="text-blue-700 space-y-1">
                    <li><strong>Not all items are listed online.</strong> The browsing section shows a selection of what we currently have, but there's always more waiting for you at our shop in Rackarbergsgatan.</li>
                    <li><strong>Purchases happen in person.</strong> We don't ship items — you can only buy things by visiting us at Rackarbergsgatan.</li>
                  </ul>
                </div>

                <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Buying Duvets & Pillows in Advance</h3>
                <p className="text-gray-700 mb-4">
                  The only items you can buy in advance are duvets and pillows as a set. This way, you'll have a bedding set ready for your first night in Uppsala!
                </p>
                
                <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Conditions:</h4>
                  <ul className="text-yellow-700 space-y-1 text-sm">
                    <li>• This only applies as long as we have enough items in stock</li>
                    <li>• You will receive a confirmation within 24 hours of your order</li>
                    <li>• We reserve the right to inform you if items are sold out and refund your money</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg my-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Euro className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Price: 100 SEK or 10 € for both together</span>
                  </div>
                </div>

                <h4 className="text-xl font-semibold text-gray-800 mt-6 mb-3">To buy in advance:</h4>
                
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-800 mb-2">1. Make a payment to one of the following:</p>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-800">Bank transfer (IBAN):</p>
                          <p className="text-gray-700 font-mono">DE38370501981930264617 – Jacob Lehmann</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-800">PayPal:</p>
                          <p className="text-gray-700">lina-lehmann@gmx.de</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-gray-800 mb-2">2. Send an email to info@rackisforbarn.com with:</p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                      <li>A screenshot of your payment</li>
                      <li>Your name</li>
                      <li>Betreff should be "Rackis för barn"</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Where to Find Us</h3>
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex items-start gap-3 mb-3">
                    <MapPin className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Visit us at:</p>
                      <p className="text-yellow-700 font-semibold">Rackarbergsgatan 32, Uppsala</p>
                    </div>
                  </div>
                  <p className="text-yellow-700">
                    Explore our full range of second-hand items and give them a new home — while supporting Barncancerfonden Mellansverige.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <p className="text-yellow-700 font-medium">
                      Please check our opening times on Instagram before you come by.
                    </p>
                  </div>
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

export default HowBrowsingWorks;
