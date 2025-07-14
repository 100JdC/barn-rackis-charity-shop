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
            <CardContent className="space-y-6 text-lg text-gray-700">
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Acceptance of Terms</h2>
                <p>
                  By using Rackis for Barn, you agree to comply with and be bound by these terms
                  and conditions. These terms apply to all users of the website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Item Donations</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Donated items must be in good, usable condition.</li>
                  <li>We reserve the right to reject items deemed unsuitable.</li>
                  <li>Ownership of items transfers to Rackis for Barn upon donation.</li>
                  <li>We may determine pricing at our discretion.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Purchases</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Items are sold "as is" without warranty.</li>
                  <li>Sales are generally final. However, we may accept returns voluntarily on a case-by-case basis. This does not imply a future right to return.</li>
                  <li>Payment must be completed before item collection.</li>
                  <li>Buyers are responsible for collecting items.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Payments and Donations</h2>
                <p>
                  All payments are processed securely via approved providers. Proceeds, after minor operational costs, are donated to Barncancerfonden Mellansverige. Donations and purchases are generally non-refundable unless stated otherwise.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>User Conduct</h2>
                <p>
                  Users must not engage in fraud, misrepresentation, or misuse of the platform. We reserve the right to restrict access for any violations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Charitable Purpose</h2>
                <p>
                  By using this platform, you help fund the work of Barncancerfonden Mellansverige, which supports children with cancer and their families.
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
