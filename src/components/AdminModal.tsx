import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminMode } from '../hooks/useAdminMode';
import { toast } from "@/hooks/use-toast";
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';

const app_version = "1.2.3";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HighlightedNoteComponent: React.FC<{ container_className?: string, note: string }> = ({ container_className, note }) => {
  return (
    <div className={`bg-yellow-50/20 dark:bg-yellow-900/20 p-2 rounded-md ${container_className}`}>
      <p className="text-sm text-yellow-800 dark:text-yellow-400">{note}</p>
    </div>
  );
};

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const { activateAdmin, shortcuts } = useAdminMode();
  const [error, setError] = useState('');
  
  // Get the formatter for keyboard shortcuts
  const { formatShortcutForDisplay } = useKeyboardShortcut({}, { enabled: false });
  
  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure DOM is ready
      const timer = setTimeout(() => {
        const inputEl = document.getElementById('admin-password');
        if (inputEl) {
          inputEl.focus();
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    
    const success = activateAdmin(password);
    
    if (success) {
      toast({
        title: "Admin Mode Activated",
        description: "You now have privileged access to edit and delete any card.",
        variant: "default"
      });
      setPassword(''); // Clear password on success
      onClose();
    } else {
      setError('Invalid password');
    }
  };
  
  // Format shortcuts for display - using primary and secondary from centralized config
  const primaryActivate = formatShortcutForDisplay(shortcuts.activate[0]);
  const primaryDeactivate = formatShortcutForDisplay(shortcuts.deactivate[0]);
  const secondaryActivate = formatShortcutForDisplay(shortcuts.activate[1]);
  const secondaryDeactivate = formatShortcutForDisplay(shortcuts.deactivate[1]);
  
  // Handle Escape key explicitly
  const handleEscape = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onKeyDown={handleEscape}>
        <DialogHeader>
          <DialogTitle>Admin Authentication</DialogTitle>
          <DialogDescription>
            Enter the admin password to gain privileged access.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              id="admin-password"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(e);
                } else if (e.key === 'Escape') {
                  onClose();
                }
              }}
              className={error ? "border-red-500" : ""}
              // Don't set autoFocus directly, we handle it with useEffect
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              type="button" 
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Authenticate
            </Button>
          </div>
          
          <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>Keyboard shortcuts:</strong><br />
              Activate admin mode: <kbd className="px-1 py-0.5 text-xs font-semibold border rounded">{primaryActivate}</kbd><br />
              Deactivate admin mode: <kbd className="px-1 py-0.5 text-xs font-semibold border rounded">{primaryDeactivate}</kbd>
              <br />
              <br />
              <strong>Current app version: {app_version}</strong>
              <br />
              <span className="text-xs text-gray-400">(Fallback: <kbd className="px-1 py-0.5 text-xs font-semibold border rounded">{secondaryActivate}</kbd> / <kbd className="px-1 py-0.5 text-xs font-semibold border rounded">{secondaryDeactivate}</kbd>)</span>
              <br />
              <HighlightedNoteComponent container_className='mt-4' note="Note: The admin mode is currently in development and may not work as expected. Please use with caution." />
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminModal; 