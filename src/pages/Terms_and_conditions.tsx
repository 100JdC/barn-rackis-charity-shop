
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/PageWrapper";
import { Footer } from "@/components/Footer";

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <PageWrapper>
        <div className="w-full max-w-4xl space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-center" style={{ color: '#1733a7' }}>
                Terms and Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg">
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Acceptance of Terms</h2>
                <p className="text-gray-700">
                  By using Rackis for Barn, you agree to comply with and be bound by these terms 
                  and conditions. These terms apply to all users of the website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Item Donations</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Donated items must be in good, usable condition</li>
                  <li>Items deemed unsuitable may be rejected at our discretion</li>
                  <li>Donors transfer ownership of items upon donation</li>
                  <li>We reserve the right to set pricing for donated items</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Purchases</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>All sales are final - no returns or exchanges</li>
                  <li>Items are sold "as is" without warranty</li>
                  <li>Payment must be completed before item collection</li>
                  <li>Buyers are responsible for item collection arrangements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Charitable Purpose</h2>
                <p className="text-gray-700">
                  All proceeds from item sales are donated to Barncancerfonden. By participating 
                  in our platform, you contribute to supporting children with cancer and their families.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>User Conduct</h2>
                <p className="text-gray-700">
                  Users must not engage in fraudulent activities, misrepresent items, or use the 
                  platform for commercial gain. We reserve the right to terminate access for 
                  violations of these terms.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
