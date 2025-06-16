import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Tool, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MaintenanceModeProps {
  message?: string;
  estimatedTime?: string;
}

const MaintenanceMode: React.FC<MaintenanceModeProps> = ({
  message = "We're currently fixing a CORS issue with our API.",
  estimatedTime = "15 minutes"
}) => {
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="border-2 border-yellow-500/50 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Tool className="h-12 w-12 text-yellow-500" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-1 -right-1"
                >
                  <Loader2 className="h-5 w-5 text-primary" />
                </motion.div>
              </div>
            </div>
            <CardTitle className="text-center text-xl font-bold">System Maintenance</CardTitle>
            <CardDescription className="text-center text-base">
              We'll be back shortly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-500/10 p-4 rounded-md flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{message}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-center">
                <span className="font-medium">Estimated completion time:</span> {estimatedTime}
              </p>
              
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 60, repeat: Infinity }}
                />
              </div>
            </div>
            
            <div className="pt-2 text-center">
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Check if it's fixed
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default MaintenanceMode; 