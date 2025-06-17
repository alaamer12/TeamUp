import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface AnnouncementContextType {
  showAnnouncement: boolean;
  announcementTitle: string;
  announcementSummary: string[];
  announcementVersion: string;
  dismissAnnouncement: () => void;
}

const AnnouncementContext = createContext<AnnouncementContextType>({
  showAnnouncement: false,
  announcementTitle: '',
  announcementSummary: [],
  announcementVersion: '',
  dismissAnnouncement: () => {},
});

export const useAnnouncement = () => useContext(AnnouncementContext);

interface AnnouncementProviderProps {
  children: ReactNode;
}

export const AnnouncementProvider = ({ children }: AnnouncementProviderProps) => {
  const [showAnnouncement, setShowAnnouncement] = useState<boolean>(false);
  const [announcementTitle, setAnnouncementTitle] = useState<string>('');
  const [announcementSummary, setAnnouncementSummary] = useState<string[]>([]);
  const [announcementVersion, setAnnouncementVersion] = useState<string>('');

  useEffect(() => {
    // Check if there's a new announcement to show
    const hasNewAnnouncement = import.meta.env.VITE_NEW_ANNOUNCEMENT === 'true';
    const currentVersion = import.meta.env.VITE_ANNOUNCEMENT_VERSION || '';
    
    // Check if this version's announcement has already been shown
    const shownVersions = JSON.parse(localStorage.getItem('teamup-shown-announcements') || '[]');
    const alreadyShown = shownVersions.includes(currentVersion);
    
    if (hasNewAnnouncement && currentVersion && !alreadyShown) {
      setAnnouncementVersion(currentVersion);
      setAnnouncementTitle(import.meta.env.VITE_ANNOUNCEMENT_TITLE || 'New Update Available');
      
      // Parse the summary items which are separated by pipes
      const summaryText = import.meta.env.VITE_ANNOUNCEMENT_SUMMARY || '';
      setAnnouncementSummary(summaryText.split('|').filter(item => item.trim()));
      
      setShowAnnouncement(true);
    }
  }, []);

  const dismissAnnouncement = () => {
    // Mark this version's announcement as shown
    const shownVersions = JSON.parse(localStorage.getItem('teamup-shown-announcements') || '[]');
    if (announcementVersion && !shownVersions.includes(announcementVersion)) {
      shownVersions.push(announcementVersion);
      localStorage.setItem('teamup-shown-announcements', JSON.stringify(shownVersions));
    }
    
    setShowAnnouncement(false);
  };

  return (
    <AnnouncementContext.Provider
      value={{
        showAnnouncement,
        announcementTitle,
        announcementSummary,
        announcementVersion,
        dismissAnnouncement,
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
}; 