import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Edit, Trash2, User, Calendar, Clock } from "lucide-react";
import { useCardOwnership } from "../hooks/useCardOwnership";
import { deleteTeamRequest } from "../utils/db";
import { toast } from "@/hooks/use-toast";

interface TeamCardProps {
  team: any;
  onUpdate: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onUpdate }) => {
  const { isOwner, currentFingerprint } = useCardOwnership(team);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteTeamRequest(team.id, currentFingerprint);
      toast({
        title: "Team request deleted",
        description: "Your team request has been removed successfully."
      });
      onUpdate();
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete team request.",
        variant: "destructive"
      });
    }
  };

  const handleWhatsAppContact = () => {
    const phone = team.user_personal_phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hi! I saw your team request on TeamForge and I'm interested in joining your team. Let's discuss!`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Invalid date format:", dateString);
      return "Invalid date";
    }
  };

  const getDaysLeft = (expiresAt: string | undefined) => {
    if (!expiresAt) return null;
    
    try {
      const expiry = new Date(expiresAt);
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch (error) {
      console.error("Invalid expiry date:", expiresAt);
      return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="team-card"
    >
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-start space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(team.user_name || "User")}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  {team.user_name && (
                    <h3 className="font-semibold text-lg">{team.user_name}</h3>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    Created {formatDate(team.createdAt)}
                  </div>
                </div>
                
                {team.expiresAt && getDaysLeft(team.expiresAt) !== null && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    {getDaysLeft(team.expiresAt)} days left
                  </div>
                )}
              </div>
              
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {team.user_abstract}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Member Requirements */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center">
              <User className="w-4 h-4 mr-2" />
              Looking for {team.members.length} member{team.members.length !== 1 ? 's' : ''}:
            </h4>
            
            {team.members.map((member: any, index: number) => (
              <div key={index} className="pl-6 border-l-2 border-muted space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Member {index + 1}</span>
                  <div className="flex items-center space-x-2">
                    {member.gender !== "Any" && (
                      <Badge variant="outline" className="text-xs">
                        {member.gender}
                      </Badge>
                    )}
                    {member.already_know && (
                      <Badge variant="secondary" className="text-xs">
                        Known person
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1">
                    {member.tech_field.map((field: string) => (
                      <Badge key={field} variant="default" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Major: <span className="font-medium">{member.major}</span>
                  </div>
                  
                  {member.planguage?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {member.planguage.map((lang: string) => (
                        <Badge key={lang} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button 
              onClick={handleWhatsAppContact}
              className="flex-1 mr-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact via WhatsApp
            </Button>

            {isOwner && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Team Request</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this team request? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDelete}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TeamCard;
