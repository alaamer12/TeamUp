import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, ChevronRight, Plus, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Test component for the announcement toast
 * This component is only for development/testing purposes
 */
const AnnouncementToastTest = () => {
  const [version, setVersion] = useState("1.2.6");
  const [title, setTitle] = useState("New Features Available");
  const [summaryItems, setSummaryItems] = useState([
    "Added multilingual footer",
    "Improved mobile responsiveness",
    "Fixed team request validation"
  ]);

  const addSummaryItem = () => {
    setSummaryItems([...summaryItems, ""]);
  };

  const removeSummaryItem = (index: number) => {
    setSummaryItems(summaryItems.filter((_, i) => i !== index));
  };

  const updateSummaryItem = (index: number, value: string) => {
    setSummaryItems(
      summaryItems.map((item, i) => (i === index ? value : item))
    );
  };

  const showTestAnnouncement = () => {
    const { dismiss: toastDismiss } = toast({
      title: (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span>{title}</span>
          </div>
          <Badge variant="outline" className="ml-2 text-xs">v{version}</Badge>
        </div>
      ) as any,
      description: (
        <div className="mt-2 space-y-2">
          <ul className="space-y-1.5">
            {summaryItems.map((item, index) => (
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
              onClick={() => toastDismiss()}
            >
              Got it
            </Button>
          </div>
        </div>
      ) as any,
      duration: 15000, // 15 seconds
      className: "announcement-toast",
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Version</label>
          <Input 
            value={version} 
            onChange={(e) => setVersion(e.target.value)} 
            className="h-8 text-xs" 
            placeholder="1.2.6"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Title</label>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="h-8 text-xs" 
            placeholder="New Features Available"
          />
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-muted-foreground">Summary Items</label>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5" 
            onClick={addSummaryItem}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
          {summaryItems.map((item, index) => (
            <div key={index} className="flex gap-1">
              <Input
                value={item}
                onChange={(e) => updateSummaryItem(index, e.target.value)}
                className="h-7 text-xs"
                placeholder={`Feature ${index + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0"
                onClick={() => removeSummaryItem(index)}
              >
                <Trash className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      <Button 
        onClick={showTestAnnouncement} 
        size="sm" 
        className="w-full"
      >
        Test Announcement Toast
      </Button>
    </div>
  );
};

export default AnnouncementToastTest; 