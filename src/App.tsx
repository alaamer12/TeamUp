import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Landing from "./pages/Landing";
import Listings from "./pages/Listings";
import About from "./pages/About";
import { ThemeProvider } from "./components/ThemeProvider";
import { AdminProvider, useAdminMode } from "./hooks/useAdminMode.tsx";
import AdminModal from "./components/AdminModal.tsx";
import "./styles/globals.css";

const queryClient = new QueryClient();

const AppContent = () => {
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const { isAdmin, deactivateAdmin } = useAdminMode();
  
  // Handle keyboard shortcut for admin mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+A to activate
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        setAdminModalOpen(true);
      }
      
      // Check for Ctrl+Shift+D to deactivate
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        if (isAdmin) {
          deactivateAdmin();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin, deactivateAdmin]);
  
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AdminModal isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="team-formation-theme">
      <AdminProvider>
        <AppContent />
      </AdminProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
