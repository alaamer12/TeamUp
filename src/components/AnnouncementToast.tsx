import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAnnouncement } from '@/hooks/useAnnouncement';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToastActionElement } from '@/components/ui/toast';

/**
 * AnnouncementToast component
 * 
 * Displays a toast notification when a new version of the application is released.
 * The toast appears only once per version and shows a summary of new features.
 */
const AnnouncementToast = () => {
  const { 
    showAnnouncement, 
    announcementTitle, 
    announcementSummary, 
    announcementVersion, 
    dismissAnnouncement 
  } = useAnnouncement();

  useEffect(() => {
    if (showAnnouncement && announcementSummary.length > 0) {
      const { dismiss } = toast({
        title: (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>{announcementTitle}</span>
            </div>
            <Badge variant="outline" className="ml-2 text-xs">v{announcementVersion}</Badge>
          </div>
        ) as any,
        description: (
          <div className="mt-2 space-y-2">
            <ul className="space-y-1.5">
              {announcementSummary.map((item, index) => (
                <li key={index} className="flex items-start">
                  <ChevronRight className="h-4 w-4 text-primary mr-1 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={dismissAnnouncement}
              >
                Got it
              </Button>
            </div>
          </div>
        ) as any,
        duration: 15000, // 15 seconds
        className: "announcement-toast",
      });
      
      // Automatically mark as dismissed after the toast duration
      setTimeout(() => {
        dismissAnnouncement();
        dismiss();
      }, 15000);
    }
  }, [showAnnouncement, announcementTitle, announcementSummary, announcementVersion, dismissAnnouncement]);

  return null; // This component doesn't render anything directly
};

export default AnnouncementToast; 