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
            <CardContent className="space-y-6 text-lg text-gray-700">
              <p><strong>Website Operator:</strong></p>
              <p>Jacob Lehmann<br />Rackarbergsgatan 32<br />752 32 Uppsala<br />Sweden</p>

              <p className="mt-4"><strong>Email:</strong> info@rackisforbarn.com</p>

              <p className="mt-4">
                Rackis for Barn is a student-run platform designed to support circular sharing among students in Uppsala.
                The platform enables the donation and purchase of second-hand items, with all proceeds going to Barncancerfonden Mellansverige (The Middle Sweden Childhood Cancer Fund).
              </p>

              <p className="mt-4 text-sm text-gray-500">
                This website is operated voluntarily by students. For legal or copyright concerns, please contact us via email.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
      <Footer />
    </div>
  );
};

export default Impressum;
