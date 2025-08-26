import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VisitorRegister from "./pages/visitor/Register";
import VisitorLogin from "./pages/visitor/Login";
import FacultyLogin from "./pages/faculty/Login";
import SecurityLogin from "./pages/security/Login";
import SecurityScanner from "./pages/security/Scanner";
import AdminLogin from "./pages/admin/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/visitor/register" element={<VisitorRegister />} />
          <Route path="/visitor/login" element={<VisitorLogin />} />
          <Route path="/faculty/login" element={<FacultyLogin />} />
          <Route path="/security/login" element={<SecurityLogin />} />
          <Route path="/security/scanner" element={<SecurityScanner />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
