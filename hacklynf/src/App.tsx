import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EventDetails from "./pages/EventDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import OrganizerDashboard from "./pages/dashboard/OrganizerDashboard";
import JudgeDashboard from "./pages/dashboard/JudgeDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import NotFound from "./pages/NotFound";
import CompleteProfile from "./pages/CompleteProfile";
import OrganizeEvent from "./pages/dashboard/OrganizeEvent";
import ApplyEvent from "./pages/dashboard/ApplyEvent";
import OrganizerEventManage from "./pages/dashboard/OrganizerEventManage"; // Import new page

import { useEffect } from "react";
import { authAPI } from "@/lib/api";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const initAuth = async () => {
      if (authAPI.isAuthenticated()) {
        try {
          await authAPI.getMe();
        } catch (error) {
          console.error("Auth init failed:", error);
          // If getMe fails, we might still have a refresh token
          // but if it's a hard error, fetchWithAuth already clears tokens
        }
      }
    };
    initAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/dashboard/profile" element={<CompleteProfile />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/dashboard/student" element={<StudentDashboard />} />
            <Route path="/dashboard/organizer" element={<OrganizerDashboard />} />
            <Route path="/dashboard/judge" element={<JudgeDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/organize" element={<OrganizeEvent />} />
            <Route path="/dashboard/organize/manage/:id" element={<OrganizerEventManage />} /> {/* New Route */}
            <Route path="/dashboard/apply/:id" element={<ApplyEvent />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
