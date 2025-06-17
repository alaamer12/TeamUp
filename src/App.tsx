import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Landing from "./pages/Landing";
import Listings from "./pages/Listings";
import About from "./pages/About";
import { ThemeProvider } from "./components/ThemeProvider";
import { AdminProvider, useAdminMode } from "./hooks/useAdminMode";
import AdminModal from "./components/AdminModal";
import { useKeyboardShortcut } from "./hooks/useKeyboardShortcut";
import { MaintenanceModeProvider, useMaintenanceMode } from "./hooks/useMaintenanceMode";
import MaintenanceMode from "./components/MaintenanceMode";
import { AnnouncementProvider } from "./hooks/useAnnouncement";
import AnnouncementToast from "./components/AnnouncementToast";
import DevTools from "./components/DevTools";
import "./styles/globals.css";

const queryClient = new QueryClient();

const AppContent = () => {
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const { isAdmin, deactivateAdmin, shortcuts } = useAdminMode();
  const { isMaintenanceMode, maintenanceMessage, estimatedTime } = useMaintenanceMode();
  
  // Create keyboard shortcut handlers based on centralized configuration
  const shortcutHandlers = {
    // Convert array of shortcuts to object with handlers
    ...Object.fromEntries(
      shortcuts.activate.map(shortcut => [
        shortcut, 
        () => setAdminModalOpen(true)
      ])
    ),
    ...Object.fromEntries(
      shortcuts.deactivate.map(shortcut => [
        shortcut, 
        () => {
          if (isAdmin) deactivateAdmin();
        }
      ])
    )
  };
  
  // Use the keyboard shortcut hook with the dynamic handlers
  useKeyboardShortcut(shortcutHandlers, {
    preventDefault: true,
    capture: true,
    enabled: true
  });
  
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AnnouncementToast />
      <AdminModal isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
      
      {/* Development tools - only shown in dev mode */}
      <DevTools />
      
      {/* Show maintenance mode overlay if enabled */}
      {isMaintenanceMode && (
        <MaintenanceMode 
          message={maintenanceMessage} 
          estimatedTime={estimatedTime} 
        />
      )}
      
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
        <MaintenanceModeProvider>
          <AnnouncementProvider>
            <AppContent />
          </AnnouncementProvider>
        </MaintenanceModeProvider>
      </AdminProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
