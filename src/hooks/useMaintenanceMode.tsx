import React, { createContext, useContext, useState } from 'react';

interface MaintenanceModeContextType {
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  estimatedTime: string;
}

const MaintenanceModeContext = createContext<MaintenanceModeContextType | undefined>(undefined);

// Read maintenance mode state from environment variables
const maintenanceEnabled = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
const defaultMessage = import.meta.env.VITE_MAINTENANCE_MESSAGE || "We're currently fixing some issues. Please check back shortly.";
const defaultTime = import.meta.env.VITE_MAINTENANCE_ESTIMATED_TIME || "a few minutes";

export const MaintenanceModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMaintenanceMode] = useState<boolean>(maintenanceEnabled);
  const [maintenanceMessage] = useState<string>(defaultMessage);
  const [estimatedTime] = useState<string>(defaultTime);

  return (
    <MaintenanceModeContext.Provider
      value={{
        isMaintenanceMode,
        maintenanceMessage,
        estimatedTime
      }}
    >
      {children}
    </MaintenanceModeContext.Provider>
  );
};

export const useMaintenanceMode = (): MaintenanceModeContextType => {
  const context = useContext(MaintenanceModeContext);
  if (context === undefined) {
    throw new Error('useMaintenanceMode must be used within a MaintenanceModeProvider');
  }
  return context;
}; 