import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/PageWrapper";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BetaNotice } from "@/components/BetaNotice";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const About = () => {
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

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-center" style={{ color: '#1733a7' }}>
                About Rackis for Barn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg">
              {/* Quick Navigation Links at the top */}
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-center" style={{ color: '#1733a7' }}>Learn More</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg text-center text-white shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="font-semibold mb-2">🎁 Donate Items</h3>
                    <p className="text-blue-100 text-sm mb-3">
                      Moving out? Register as a donor and list your items. We'll help find them new homes.
                    </p>
                    <Button 
                      onClick={() => navigate('/how-donating-works')} 
                      variant="secondary" 
                      size="sm"
                      className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      Learn How to Donate
                    </Button>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500 to-yellow-500 p-4 rounded-lg text-center text-white shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="font-semibold mb-2">🛍️ Shop Sustainably</h3>
                    <p className="text-yellow-100 text-sm mb-3">
                      Browse our inventory and find what you need for your Uppsala student life.
                    </p>
                    <Button 
                      onClick={() => navigate('/how-browsing-works')} 
                      variant="secondary" 
                      size="sm"
                      className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      Learn How to Browse
                    </Button>
                  </div>
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-lg text-center text-white shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="font-semibold mb-2">💛 Support Us</h3>
                    <p className="text-blue-100 text-sm mb-3">
                      Learn about the various ways you can support our mission and help children with cancer.
                    </p>
                    <Button 
                      onClick={() => navigate('/how-supporting-works')} 
                      variant="secondary" 
                      size="sm"
                      className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      Learn How to Support
                    </Button>
                  </div>
                </div>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>What Does "Rackis för Barn" Mean?</h2>
                <div className="bg-blue-50 p-4 rounded-lg space-y-3 text-gray-700">
                  <p>
                    🧸 <strong>Rackis</strong> – short for Rackarberget, a student housing area in Uppsala. That's where this whole idea started — students helping students.
                  </p>
                  <p>
                    👶 <strong>Barn</strong> – means children. All our profits go to Barncancerfonden, which supports kids with cancer in Sweden.
                  </p>
                  <p>
                    🎓 <strong>Studenterna</strong> – means the students. In Swedish, you often add a syllable to the end of a word instead of putting "the" in front. So student becomes studenterna — the students.
                  </p>
                  <p>
                    🌍 <strong>Miljön</strong> – means the environment. Same thing here: miljö = environment → miljön = the environment.
                    By giving things a second life, we help reduce waste and make Uppsala a little greener.
                  </p>
                  <p className="font-semibold text-center" style={{ color: '#1733a7' }}>
                    In short: students helping students, helping the planet — and helping children with cancer. 🧡
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Our Mission</h2>
                <p className="text-gray-700">
                  Rackis for Barn is a platform designed specifically for students in Uppsala to exchange 
                  second-hand items during move-ins and move-outs. We believe in creating a sustainable 
                  cycle where useful items find new homes instead of being discarded.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>How It Works</h2>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>For Donors:</strong> When you're moving out, instead of throwing away items 
                    that are still useful, donate them to us. We collect items like duvets, curtains, 
                    bikes, kitchen equipment, and much more.
                  </p>
                  <p>
                    <strong>For Buyers:</strong> Moving into a new place in Uppsala? Browse our collection 
                    of second-hand items at fair prices. Everything you need to make your student housing 
                    feel like home.
                  </p>
                  <p>
                    <strong>For a Good Cause:</strong> All profits from sales go directly to Barncancerfonden, 
                    supporting children with cancer and their families.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Why Choose Us?</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Sustainable:</strong> Reduce waste by giving items a second life</li>
                  <li><strong>Affordable:</strong> Get quality items at fair, student-friendly prices</li>
                  <li><strong>Charitable:</strong> Your purchase supports children with cancer</li>
                  <li><strong>Convenient:</strong> Perfect for short-term student housing needs</li>
                  <li><strong>Community-driven:</strong> By students, for students in Uppsala</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>About Barncancerfonden</h2>
                <p className="text-gray-700">
                  Barncancerfonden is Sweden's leading organization dedicated to supporting children 
                  with cancer and their families. Through research funding, family support programs, 
                  and advocacy, they work tirelessly to improve outcomes for young cancer patients 
                  and their loved ones.
                </p>
              </section>


              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="font-semibold" style={{ color: '#1733a7' }}>
                  🌍 Bra för studenter. Bra för planeten. Bra för barn i nöd. 💛
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
