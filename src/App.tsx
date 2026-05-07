import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { useProductCacheSync } from "@/hooks/useProductCacheSync";
import Index from "./pages/Index";
import Products from "./pages/Products";
import OrderConfirmation from "./pages/OrderConfirmation";
import TrackOrder from "./pages/TrackOrder";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import FAQ from "./pages/FAQ";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import LabReports from "./pages/LabReports";
import InternalDiagrams from "./pages/internal/Diagrams";
import Admin from "./pages/Admin";
import ContactUs from "./pages/ContactUs";
import AdminAuth from "./pages/AdminAuth";

const queryClient = new QueryClient();

// Inner component so hooks (useProductCacheSync) can access QueryClientProvider context
function AppRoutes() {
  useProductCacheSync();
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products category="all" />} />
          <Route path="/sarms" element={<Products category="sarms" />} />
          <Route path="/peptides" element={<Products category="peptides" />} />
          <Route path="/glp-1" element={<Products category="glp-1" />} />
          <Route path="/weight-loss" element={<Products category="glp-1" />} />
          
          <Route path="/erectile-performance" element={<Products category="erectile-performance" />} />
          <Route path="/dilutes" element={<Products category="dilutes" />} />
          <Route path="/pct" element={<Products category="pct" />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/lab-reports" element={<LabReports />} />
          <Route path="/product-diagrams" element={<InternalDiagrams />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/login" element={<AdminAuth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppRoutes />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
