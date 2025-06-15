import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

// Define types for the context
interface AdminContextType {
  isAdmin: boolean;
  activateAdmin: (password: string) => boolean;
  deactivateAdmin: () => void;
  verifyPassword: (password: string) => boolean;
}

// Create context with default values
const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  activateAdmin: () => false,
  deactivateAdmin: () => {},
  verifyPassword: () => false
});

// Define props for the provider
interface AdminProviderProps {
  children: ReactNode;
}

const ADMIN_TIMEOUT = 10 * 60 * 1000; // 10 minutes

// Provider component
export function AdminProvider({ children }: AdminProviderProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const adminTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const deactivateAdmin = (): void => {
    setIsAdmin(false);
    sessionStorage.removeItem('teamup-admin-mode');
    sessionStorage.removeItem('teamup-admin-timestamp');
    if (adminTimeoutRef.current) {
      clearTimeout(adminTimeoutRef.current);
    }
    toast({
      title: "Admin Mode Deactivated",
      description: "You no longer have privileged access.",
    });
  };

  // Check if admin mode was previously activated and if it has expired
  useEffect(() => {
    const adminStatus = sessionStorage.getItem('teamup-admin-mode');
    const adminTimestamp = sessionStorage.getItem('teamup-admin-timestamp');
    
    if (adminStatus === 'active' && adminTimestamp) {
      const timeElapsed = Date.now() - parseInt(adminTimestamp, 10);
      
      if (timeElapsed < ADMIN_TIMEOUT) {
        setIsAdmin(true);
        const remainingTime = ADMIN_TIMEOUT - timeElapsed;
        adminTimeoutRef.current = setTimeout(deactivateAdmin, remainingTime);
      } else {
        deactivateAdmin();
      }
    }
    
    // Cleanup timeout on component unmount
    return () => {
      if (adminTimeoutRef.current) {
        clearTimeout(adminTimeoutRef.current);
      }
    };
  }, []);
  
  // Verify admin password
  const verifyPassword = (password: string): boolean => {
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    
    if (!correctPassword) {
      console.error('Admin password not configured in environment variables');
      return false;
    }
    
    return password === correctPassword;
  };
  
  // Activate admin mode
  const activateAdmin = (password: string): boolean => {
    if (verifyPassword(password)) {
      setIsAdmin(true);
      sessionStorage.setItem('teamup-admin-mode', 'active');
      sessionStorage.setItem('teamup-admin-timestamp', Date.now().toString());
      
      if (adminTimeoutRef.current) {
        clearTimeout(adminTimeoutRef.current);
      }
      adminTimeoutRef.current = setTimeout(deactivateAdmin, ADMIN_TIMEOUT);
      
      return true;
    }
    return false;
  };
  
  return (
    <AdminContext.Provider value={{ isAdmin, activateAdmin, deactivateAdmin, verifyPassword }}>
      {children}
    </AdminContext.Provider>
  );
}

// Custom hook for using the admin context
export function useAdminMode(): AdminContextType {
  const context = useContext(AdminContext);
  
  if (!context) {
    throw new Error('useAdminMode must be used within an AdminProvider');
  }
  
  return context;
} 