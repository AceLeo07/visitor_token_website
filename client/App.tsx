import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NotFoundPortal from "./pages/NotFoundPortal";
import VisitorRegister from "./pages/visitor/Register";
import VisitorRegistration from "./pages/VisitorRegistration";
import VisitorLogin from "./pages/visitor/Login";
import VisitorDashboard from "./pages/visitor/Dashboard";
import FacultyPortal from "./pages/FacultyPortal";
import FacultyLogin from "./pages/faculty/Login";
import FacultyDashboard from "./pages/faculty/Dashboard";
import SecurityPortal from "./pages/SecurityPortal";
import SecurityLogin from "./pages/security/Login";
import SecurityScanner from "./pages/security/Scanner";
import AdminPortal from "./pages/AdminPortal";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/visitor/register" element={<VisitorRegistration />} />
          <Route path="/visitor/login" element={<VisitorLogin />} />
          <Route path="/visitor/dashboard" element={<VisitorDashboard />} />

          {/* Faculty Portal Routes */}
          <Route path="/faculty" element={<FacultyPortal />} />
          <Route path="/faculty/login" element={<FacultyLogin />} />
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />

          {/* Security Portal Routes */}
          <Route path="/security" element={<SecurityPortal />} />
          <Route path="/security/login" element={<SecurityLogin />} />
          <Route path="/security/scanner" element={<SecurityScanner />} />
          <Route path="/security/dashboard" element={<SecurityScanner />} />

          {/* Admin Portal Routes */}
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFoundPortal />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
