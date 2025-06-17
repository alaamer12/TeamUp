import React, { useState, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageCircle, Edit, Trash2, User, Calendar, Clock, HelpCircle, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useCardOwnership } from "../hooks/useCardOwnership";
import { deleteTeamRequest } from "../utils/db";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "./LanguageProvider";
import { useAdminMode } from "../hooks/useAdminMode";

interface TeamCardProps {
  team: any;
  onUpdate: () => void;
}

// Header component with user info
const TeamCardHeader = memo(({ team, t }: { team: any; t: any }) => {
  const getInitials = useCallback((name: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  }, []);

  const formatDate = useCallback((team: any) => {
    const dateString = team.createdAt || team.created_at;
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Invalid date format:", dateString);
      return "Invalid date";
    }
  }, []);

  const getDaysLeft = useCallback((expiresAt: string | undefined) => {
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
  }, []);

  return (
    <CardHeader className="pb-2 bg-gradient-to-r from-background to-background/80">
      <div className="flex items-start gap-4">
        <Avatar className="w-14 h-14 border-2 border-primary/20 shadow-sm">
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
            {getInitials(team.user_name || "User")}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-1">
          {team.user_name && (
            <h3 className="font-semibold text-lg tracking-tight">{team.user_name}</h3>
          )}
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="relative z-50">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(team)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="z-[9999]" side="top" sideOffset={5}>
                  <p>{t('teamcard.created')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            {team.expiresAt && getDaysLeft(team.expiresAt) !== null && (
              <div className="relative z-50">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className={getDaysLeft(team.expiresAt)! < 3 ? "text-amber-500 font-medium" : ""}>
                        {getDaysLeft(team.expiresAt)} {t('teamcard.days_left_text')}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="z-[9999]" side="top" sideOffset={5}>
                    <p>{t('teamcard.days_left')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {team.user_abstract && (
        <div className="mt-3 p-3 bg-muted/30 rounded-lg text-sm leading-relaxed">
          <p className="text-muted-foreground">{team.user_abstract}</p>
        </div>
      )}
    </CardHeader>
  );
});

// Single member card component
const MemberCard = memo(({ member, index, t }: { member: any; index: number; t: any }) => (
  <div className="p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center">
        <User className="w-4 h-4 mr-2 text-primary" />
        <span className="font-medium">{t('teamcard.member')} {index + 1}</span>
      </div>
      
      <div className="flex items-center gap-2">
        {member.gender !== "Any" && (
          <div className="relative z-50">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs">
                  {member.gender}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="z-[9999]" side="top" sideOffset={5}>
                <p>{t('teamcard.gender_preference')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        {member.already_know && (
          <div className="relative z-50">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="text-xs">
                  {t('teamcard.known_person')}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="z-[9999]" side="top" sideOffset={5}>
                <p>{t('teamcard.known_person_tooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div>
        <div className="text-xs text-muted-foreground mb-1">{t('teamcard.technical_skills')}</div>
        <div className="flex flex-wrap gap-1 mb-2">
          {member.tech_field.map((field: string) => (
            <Badge key={field} variant="default" className="text-xs">
              {field}
            </Badge>
          ))}
        </div>
      </div>
      
      <div>
        <div className="relative z-50">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-xs font-medium mb-1 flex items-center">
                <span className="text-muted-foreground mr-1">{t('teamcard.major')}</span>
                <span>{member.major}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="z-[9999]" side="top" sideOffset={5}>
              <p>{t('teamcard.major_tooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {member.planguage?.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">{t('teamcard.programming')}</div>
            <div className="flex flex-wrap gap-1">
              {member.planguage.map((lang: string) => (
                <Badge key={lang} variant="outline" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
));

// Members section with collapsible functionality
const MembersSection = memo(({ members, t }: { members: any[]; t: any }) => {
  const [showAll, setShowAll] = useState(false);
  const hasMoreThanThree = members.length > 3;
  const displayedMembers = showAll ? members : members.slice(0, 3);
  const hiddenCount = members.length - 3;

  const toggleShowAll = useCallback(() => {
    setShowAll(prev => !prev);
  }, []);

  return (
    <div>
      <div className="flex items-center mb-3">
        <h4 className="font-medium flex items-center text-primary">
          <Users className="w-4 h-4 mr-2" />
          {t('landing.looking_for_members')} {members.length} {members.length !== 1 ? t('landing.team_members') : t('teamcard.member')}
        </h4>
        <div className="relative z-50">
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="z-[9999]" side="top" sideOffset={5}>
              <p>{t('teamcard.looking_for')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {hasMoreThanThree && !showAll && (
          <Badge variant="secondary" className="ml-2 text-xs">
            +{hiddenCount} more
          </Badge>
        )}
      </div>
      
      <div className="space-y-4">
        {displayedMembers.map((member: any, index: number) => (
          <MemberCard key={index} member={member} index={index} t={t} />
        ))}
        
        {hasMoreThanThree && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleShowAll}
            className="w-full mt-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show More ({hiddenCount} more members)
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
});

// Delete confirmation dialog
const DeleteDialog = memo(({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isAdmin, 
  t 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  isAdmin: boolean; 
  t: any; 
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="z-[9999]">
      <DialogHeader>
        <DialogTitle>{isAdmin ? "Admin: Delete Team Request" : t('teamcard.delete_title')}</DialogTitle>
        <DialogDescription>
          {isAdmin 
            ? "As an admin, you are about to delete someone else's team request. This action cannot be undone."
            : t('teamcard.delete_description')
          }
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          {t('teamcard.cancel')}
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          {t('teamcard.confirm_delete')}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
));

// Action buttons component
const ActionButtons = memo(({ 
  team, 
  canModify, 
  isAdmin, 
  onWhatsAppContact, 
  onEdit, 
  onDeleteClick, 
  t 
}: { 
  team: any; 
  canModify: boolean; 
  isAdmin: boolean; 
  onWhatsAppContact: () => void; 
  onEdit: () => void; 
  onDeleteClick: () => void; 
  t: any; 
}) => (
  <div className="flex flex-wrap items-center gap-2 pt-4 border-t mt-4">
    {isAdmin && (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 text-xs">
        Admin Mode
      </Badge>
    )}
    
    <div className="flex flex-1 gap-2">
      <div className="relative z-50 flex-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={onWhatsAppContact}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t('teamcard.contact_whatsapp')}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-[9999]" side="top" sideOffset={5}>
            <p>{t('teamcard.contact_tooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {canModify && (
        <div className="flex space-x-2">
          <div className="relative z-50">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="z-[9999]" side="top" sideOffset={5}>
                <p>{t('teamcard.edit')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="relative z-50">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive"
                  onClick={onDeleteClick}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="z-[9999]" side="top" sideOffset={5}>
                <p>{t('teamcard.delete')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  </div>
));

// Main TeamCard component
const TeamCard: React.FC<TeamCardProps> = ({ team, onUpdate }) => {
  const navigate = useNavigate();
  const { isOwner, currentFingerprint } = useCardOwnership(team);
  const { isAdmin } = useAdminMode();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { t } = useLanguage();

  const canModify = isOwner || isAdmin;

  const handleDelete = useCallback(async () => {
    try {
      const fingerprint = isAdmin 
        ? (team.ownerFingerprint || team.owner_fingerprint) 
        : (team.ownerFingerprint || team.owner_fingerprint || currentFingerprint);
      
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Delete request fingerprints:', {
          current: currentFingerprint,
          team: team.ownerFingerprint || team.owner_fingerprint,
          using: fingerprint,
          adminMode: isAdmin
        });
      }
      
      await deleteTeamRequest(team.id, fingerprint);
      toast({
        title: isAdmin ? "Admin: Team request deleted" : "Team request deleted",
        description: "The team request has been removed successfully."
      });
      onUpdate();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete team request.",
        variant: "destructive"
      });
    }
  }, [team, isAdmin, currentFingerprint, onUpdate]);

  const handleEdit = useCallback(() => {
    const fingerprint = isAdmin
      ? (team.ownerFingerprint || team.owner_fingerprint)
      : (team.ownerFingerprint || team.owner_fingerprint || currentFingerprint);
    
    const teamWithFingerprint = {
      ...team,
      ownerFingerprint: fingerprint,
      isAdminEdit: isAdmin
    };
    
    navigate('/', { state: { editMode: true, teamData: teamWithFingerprint } });
  }, [team, isAdmin, currentFingerprint, navigate]);

  const handleWhatsAppContact = useCallback(() => {
    const phone = team.user_personal_phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hi! I saw your team request on TeamUp and I'm interested in joining your team. Let's discuss!`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  }, [team.user_personal_phone]);

  const handleDeleteClick = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="team-card relative"
        style={{ zIndex: 1 }}
      >
        <Card className="h-full w-full border border-muted/60 shadow-sm hover:shadow-md hover:scale-[1.01] hover:border-primary/30 transition-all duration-200 relative overflow-visible">
          <TeamCardHeader team={team} t={t} />

          <CardContent className="pt-4 space-y-5">
            <MembersSection members={team.members} t={t} />

            <ActionButtons
              team={team}
              canModify={canModify}
              isAdmin={isAdmin}
              onWhatsAppContact={handleWhatsAppContact}
              onEdit={handleEdit}
              onDeleteClick={handleDeleteClick}
              t={t}
            />
          </CardContent>
        </Card>

        <DeleteDialog
          isOpen={deleteDialogOpen}
          onClose={handleDeleteDialogClose}
          onConfirm={handleDelete}
          isAdmin={isAdmin}
          t={t}
        />
      </motion.div>
    </TooltipProvider>
  );
};

export default memo(TeamCard);