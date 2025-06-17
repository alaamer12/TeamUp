import { useEffect, useState } from 'react';
import AnnouncementToastTest from './AnnouncementToastTest';

/**
 * DevTools component
 * 
 * Renders development tools and test components when in development mode
 * and when VITE_SHOW_TEST_COMPONENTS is enabled
 */
const DevTools = () => {
  const [showTools, setShowTools] = useState(false);
  
  useEffect(() => {
    // Check if we should show test components
    const shouldShowTools = 
      import.meta.env.DEV && 
      import.meta.env.VITE_SHOW_TEST_COMPONENTS === 'true';
      
    setShowTools(shouldShowTools);
  }, []);
  
  if (!showTools) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4">
      <div className="flex flex-col gap-3">
        <div className="text-xs font-semibold text-muted-foreground mb-1">
          Development Tools
        </div>
        <AnnouncementToastTest />
      </div>
    </div>
  );
};

export default DevTools; 