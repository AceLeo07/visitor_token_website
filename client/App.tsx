import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import VisitorRegister from "./pages/visitor/Register";
import VisitorLogin from "./pages/visitor/Login";
import VisitorDashboard from "./pages/visitor/Dashboard";
import FacultyLogin from "./pages/faculty/Login";
import FacultyDashboard from "./pages/faculty/Dashboard";
import SecurityLogin from "./pages/security/Login";
import SecurityScanner from "./pages/security/Scanner";
import SecurityDashboard from "./pages/security/Dashboard";
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
          {/* Public/Visitor routes */}
          <Route path="/" element={<VisitorLogin />} />
          <Route path="/visitor/register" element={<VisitorRegister />} />
          <Route path="/visitor/login" element={<VisitorLogin />} />
          <Route path="/visitor/dashboard" element={<VisitorDashboard />} />

          {/* Faculty Routes */}
          <Route path="/faculty/login" element={<FacultyLogin />} />
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute requiredRole="faculty">
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />

          {/* Security Routes */}
          <Route path="/security/login" element={<SecurityLogin />} />
          <Route
            path="/security/scanner"
            element={
              <ProtectedRoute requiredRole="security">
                <SecurityScanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/security/dashboard"
            element={
              <ProtectedRoute requiredRole="security">
                <SecurityDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<VisitorLogin />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
