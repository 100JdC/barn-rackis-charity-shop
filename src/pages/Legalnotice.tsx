
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/PageWrapper";
import { Footer } from "@/components/Footer";

const LegalNotice = () => {
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
                Legal Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg">
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Website Usage</h2>
                <p className="text-gray-700">
                  By accessing and using this website, you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to these terms, please do not 
                  use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Intellectual Property</h2>
                <p className="text-gray-700">
                  The content of this website is protected by copyright and other intellectual property 
                  rights. All rights are reserved. You may not reproduce, distribute, or create 
                  derivative works from our content without explicit permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Limitation of Liability</h2>
                <p className="text-gray-700">
                  Rackis for Barn shall not be liable for any direct, indirect, incidental, special, 
                  or consequential damages arising from the use of this website or the purchase of 
                  items through our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1733a7' }}>Privacy</h2>
                <p className="text-gray-700">
                  We respect your privacy and are committed to protecting your personal data. 
                  Any information collected is used solely for the purpose of facilitating 
                  transactions and supporting our charitable mission.
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

export default LegalNotice;
