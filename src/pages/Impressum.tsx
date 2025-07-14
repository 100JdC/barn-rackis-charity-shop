
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/PageWrapper";
import { Footer } from "@/components/Footer";

const Impressum = () => {
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
                Impressum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg">
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Contact Information</h2>
                <div className="text-gray-700 space-y-2">
                  <p><strong>Organization:</strong> Rackis for Barn</p>
                  <p><strong>Address:</strong> Uppsala, Sweden</p>
                  <p><strong>Email:</strong> contact@rackisforbarn.se</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Legal Information</h2>
                <p className="text-gray-700">
                  This platform operates as a charitable initiative supporting Barncancerfonden. 
                  All proceeds from item sales are donated to support children with cancer and their families.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Disclaimer</h2>
                <p className="text-gray-700">
                  The information on this website is provided on an "as is" basis. We make no 
                  representations or warranties of any kind, express or implied, about the completeness, 
                  accuracy, reliability, suitability or availability of the information.
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

export default Impressum;
