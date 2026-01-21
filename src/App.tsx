import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AcceptInvite from "./pages/AcceptInvite";

// Portal pages
import Dashboard from "./pages/portal/Dashboard";
import Invoices from "./pages/portal/Invoices";
import InvoiceDetail from "./pages/portal/InvoiceDetail";
import Settings from "./pages/portal/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/invite" element={<AcceptInvite />} />

            {/* Portal routes (protected) */}
            <Route path="/portal" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/portal/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
            <Route path="/portal/invoices/:id" element={<ProtectedRoute><InvoiceDetail /></ProtectedRoute>} />
            <Route path="/portal/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
