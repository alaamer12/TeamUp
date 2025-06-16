import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminMode } from '../hooks/useAdminMode';
import { toast } from "@/hooks/use-toast";

const app_version = "1.2.6";

// Highlighted note component
const HighlightedNoteComponent = ({ note, container_className }) => {
  return (
    <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-2 ${container_className || ''}`}>
      <p className="text-xs text-yellow-800 dark:text-yellow-200">
        {note}
      </p>
    </div>
  );
};

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const { activateAdmin, shortcuts, isAdmin } = useAdminMode();
  const [error, setError] = useState('');
  
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Focus password input when modal opens
  useEffect(() => {
    if (isOpen && passwordInputRef.current) {
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      activateAdmin(password);
      setPassword('');
      setError('');
      toast({
        title: "Admin Mode Activated",
        description: "You now have admin privileges.",
      });
    } catch (error) {
      setError('Invalid password');
      toast({
        title: "Authentication Failed",
        description: "The password you entered is incorrect.",
        variant: "destructive",
      });
    }
  };
  
  // Handle Escape key press
  const handleEscape = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Format shortcuts for display - using primary and secondary from centralized config
  const primaryActivate = shortcuts.activate[0] || 'Ctrl+Shift+A';
  const primaryDeactivate = shortcuts.deactivate[0] || 'Ctrl+Shift+D';
  const secondaryActivate = shortcuts.activate[1] || 'Alt+A';
  const secondaryDeactivate = shortcuts.deactivate[1] || 'Alt+D';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onKeyDown={handleEscape}>
        <DialogHeader>
          <DialogTitle>Admin Access</DialogTitle>
          <DialogDescription>
            {isAdmin ? "Admin mode is active" : "Enter admin password to continue"}
          </DialogDescription>
        </DialogHeader>
        
        {!isAdmin ? (
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
                ref={passwordInputRef}
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
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground pt-4">Admin mode is active. You can now perform privileged actions across the site.</p>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminModal; 