import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      {/* Background with Rackis logo positioned to show teddy bear */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="absolute bottom-10 right-10 opacity-60">
          <img 
            src="/lovable-uploads/f66a4279-172c-4960-8e91-d687f82c9610.png" 
            alt="Rackis for Barn Logo" 
            className="w-96 h-auto object-contain"
          />
        </div>
      </div>
      
      <div className="relative p-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-center text-blue-800">
                About Rackis for Barn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg">
              <section>
                <h2 className="text-2xl font-semibold text-blue-700 mb-3">Our Mission</h2>
                <p className="text-gray-700">
                  Rackis for Barn is a platform designed specifically for students in Uppsala to exchange 
                  second-hand items during move-ins and move-outs. We believe in creating a sustainable 
                  cycle where useful items find new homes instead of being discarded.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-blue-700 mb-3">How It Works</h2>
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
                <h2 className="text-2xl font-semibold text-blue-700 mb-3">Why Choose Us?</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Sustainable:</strong> Reduce waste by giving items a second life</li>
                  <li><strong>Affordable:</strong> Get quality items at fair, student-friendly prices</li>
                  <li><strong>Charitable:</strong> Your purchase supports children with cancer</li>
                  <li><strong>Convenient:</strong> Perfect for short-term student housing needs</li>
                  <li><strong>Community-driven:</strong> By students, for students in Uppsala</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-blue-700 mb-3">About Barncancerfonden</h2>
                <p className="text-gray-700">
                  Barncancerfonden is Sweden's leading organization dedicated to supporting children 
                  with cancer and their families. Through research funding, family support programs, 
                  and advocacy, they work tirelessly to improve outcomes for young cancer patients 
                  and their loved ones.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-blue-700 mb-3">Get Involved</h2>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>Donate Items:</strong> Moving out? Register as a donor and list your items. 
                    We'll help find them new homes.
                  </p>
                  <p>
                    <strong>Shop Sustainably:</strong> Browse our inventory and find what you need 
                    for your Uppsala student life.
                  </p>
                  <p>
                    <strong>Spread the Word:</strong> Tell your friends about this sustainable way 
                    to handle move-ins and move-outs.
                  </p>
                </div>
              </section>

              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-blue-800 font-semibold">
                  🌍 Good for students. Good for the planet. Good for children in need. 💛
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;