import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

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

// Provider component
export function AdminProvider({ children }: AdminProviderProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if admin mode was previously activated in this session
  useEffect(() => {
    const adminStatus = sessionStorage.getItem('teamup-admin-mode');
    if (adminStatus === 'active') {
      setIsAdmin(true);
    }
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
      return true;
    }
    return false;
  };
  
  // Deactivate admin mode
  const deactivateAdmin = (): void => {
    setIsAdmin(false);
    sessionStorage.removeItem('teamup-admin-mode');
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