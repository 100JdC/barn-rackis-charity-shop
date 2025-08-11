
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Items from "./pages/Items";
import Category from "./pages/Category";
import Auth from "./pages/Auth";
import Impressum from "./pages/Impressum";
import LegalNotice from "./pages/Legalnotice";
import TermsAndConditions from "./pages/Terms_and_conditions";
import HowDonatingWorks from "./pages/HowDonatingWorks";
import HowBrowsingWorks from "./pages/HowBrowsingWorks";
import HowSupportingWorks from "./pages/HowSupportingWorks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/items" element={<Items />} />
          <Route path="/category/:categoryName" element={<Category />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/how-donating-works" element={<HowDonatingWorks />} />
          <Route path="/how-browsing-works" element={<HowBrowsingWorks />} />
          <Route path="/how-supporting-works" element={<HowSupportingWorks />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/legal-notice" element={<LegalNotice />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
