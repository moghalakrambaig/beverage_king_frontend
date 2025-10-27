import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { LoginPage } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import NotFound from "./pages/NotFound";
import CustomerDetails from "./pages/CustomerDetails";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const loadingContainer = document.getElementById('loading-container');
    if (loadingContainer) {
      // Optional: Add a fade-out effect
      loadingContainer.style.transition = 'opacity 0.5s ease';
      loadingContainer.style.opacity = '0';
      setTimeout(() => {
        loadingContainer.remove();
      }, 500);
    }
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
           <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/customer-details/:id" element={<CustomerDetails />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  )
};

export default App;
