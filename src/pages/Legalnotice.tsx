import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/PageWrapper";
import { Footer } from "@/components/Footer";

const PrivacyPolicy = () => {
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
                Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg text-gray-700">
              <p><strong>Last updated:</strong> July 2025</p>

              <p>
                Rackis for Barn respects your privacy and is committed to protecting your personal data. This policy outlines how we handle your information.
              </p>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>What We Collect</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Email address (for user registration)</li>
                  <li>Purchase and donation history</li>
                  <li>Device and browser data (via analytics)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Why We Collect It</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>To manage user accounts and inventory</li>
                  <li>To improve our service</li>
                  <li>To support donation tracking for transparency</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Cookies</h2>
                <p>
                  We may use cookies for analytics and user experience. You can disable cookies in your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Data Sharing</h2>
                <p>
                  We do not sell your data. Data may be processed by third-party services (e.g., payment providers or hosting platforms) only for functional purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Your Rights</h2>
                <p>
                  You have the right to access, correct, or delete your personal data. Contact us at contact@rackisforbarn.com for any requests.
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

export default PrivacyPolicy;