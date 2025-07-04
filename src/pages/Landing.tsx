import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, ArrowRight, HelpCircle, WifiOff, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Navbar from "../components/Navbar";
import { saveTeamRequest } from "../utils/db";
import { getCurrentOwnership } from "../utils/fingerprint-safe";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "../components/LanguageProvider";

const techFields = [
  "Frontend Development", "Backend Development", "Full Stack", "Mobile Development",
  "Data Science", "AI [ML, DL, CV, NLP]", "DevOps", "UI/UX",
];

const majors = [
  "CS", "IS", "SC", "AI"
];

const programmingLanguages = [
  "JavaScript", "Python", "Java", "C++", "C# [.NET]", "Rust", "PHP",
  "TypeScript", "Flutter", "React Native", "React", "Angular", "Vue", "Other"
];

const Landing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Initialize form data, checking if we're in edit mode
  const [formData, setFormData] = useState(() => {
    // Check if we have team data from navigation state (edit mode)
    const editData = location.state?.editMode && location.state?.teamData;
    
    if (editData) {
      setIsEditMode(true);
      return editData;
    }
    
    // Default initial state
    return {
      user_personal_phone: "",
      user_name: "",
      user_gender: "",
      user_abstract: "",
      members: [
        {
          tech_field: [],
          gender: "Any",
          major: "",
          planguage: [],
          already_know: false
        }
      ]
    };
  });

  // Check online status
  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };
    
    checkOnlineStatus();
    
    // Listen for online/offline events
    window.addEventListener('online', () => setIsOffline(false));
    window.addEventListener('offline', () => setIsOffline(true));
    
    return () => {
      window.removeEventListener('online', () => setIsOffline(false));
      window.removeEventListener('offline', () => setIsOffline(true));
    };
  }, []);

  const scrollToForm = () => {
    document.getElementById("team-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMemberChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const addMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, {
        tech_field: [],
        gender: "Any",
        major: "",
        planguage: [],
        already_know: false
      }]
    }));
  };

  const removeMember = (index: number) => {
    if (formData.members.length > 1) {
      setFormData(prev => ({
        ...prev,
        members: prev.members.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.user_personal_phone || !formData.user_abstract) {
      toast({
        title: "Validation Error",
        description: "Please fill in required fields (phone and abstract)",
        variant: "destructive"
      });
      return;
    }

    for (const member of formData.members) {
      if (!member.tech_field.length || !member.major) {
        toast({
          title: "Validation Error", 
          description: "Please complete all member requirements",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      // In edit mode, we want to preserve the original ID and ownership
      const teamData = isEditMode 
        ? { ...formData } // Keep existing ID and ownership
        : { ...formData, ownerFingerprint: getCurrentOwnership() };
      
      await saveTeamRequest(teamData);
      
      toast({
        title: isEditMode ? "Team Request Updated!" : "Team Request Created!",
        description: isEditMode 
          ? "Your team request has been updated successfully."
          : "Your team request has been saved successfully.",
      });

      // Reset form if not in edit mode
      if (!isEditMode) {
        setFormData({
          user_personal_phone: "",
          user_name: "",
          user_gender: "",
          user_abstract: "",
          members: [{
            tech_field: [],
            gender: "Any", 
            major: "",
            planguage: [],
            already_know: false
          }]
        });
      }

      // Navigate to listings
      setTimeout(() => navigate("/listings"), 1000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'save'} team request. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Offline Mode Alert */}
        {isOffline && (
          <Alert className="mx-4 mt-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
            <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            <AlertTitle>{t('landing.offline_title')}</AlertTitle>
            <AlertDescription>
              {t('landing.offline_description')}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />
          <div className="relative container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              
              <h1 className="text-4xl md:text-6xl font-bold mb-8 pb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent inline-block">
                {t('landing.title')}
              </h1>
              
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="lg" 
                      onClick={scrollToForm}
                      className="gradient-button text-lg px-8 py-3"
                    >
                      {t('landing.find_teammates')}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('landing.create_tooltip')}</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      onClick={() => navigate("/listings")}
                      className="text-lg px-8 py-3"
                    >
                      {t('landing.join_team')}
                      <Users className="ml-2 w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('landing.join_tooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Team Creation Form */}
        <section id="team-form" className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold">
                    {isEditMode ? t('landing.edit_title') : t('landing.create_title')}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {isEditMode 
                      ? t('landing.edit_description')
                      : t('landing.create_description')}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Information */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold flex items-center">
                        <Users className="mr-2 w-5 h-5" />
                        {t('landing.your_info')}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-field">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="phone">{t('landing.phone')}</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('landing.phone_tooltip')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="01155555555"
                            value={formData.user_personal_phone}
                            onChange={(e) => handleInputChange("user_personal_phone", e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="form-field">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="name">{t('landing.name')}</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('landing.name_tooltip')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Your name"
                            value={formData.user_name}
                            onChange={(e) => handleInputChange("user_name", e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="form-field">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="gender">{t('landing.gender')}</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('landing.gender_tooltip')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={formData.user_gender} onValueChange={(value) => handleInputChange("user_gender", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">{t('landing.gender_male')}</SelectItem>
                            <SelectItem value="Female">{t('landing.gender_female')}</SelectItem>
                            <SelectItem value="Other">{t('landing.gender_other')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="form-field">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="abstract">{t('landing.about')}</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('landing.about_tooltip')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Textarea
                          id="abstract"
                          placeholder={t('landing.about_placeholder')}
                          value={formData.user_abstract}
                          onChange={(e) => handleInputChange("user_abstract", e.target.value)}
                          required
                          rows={4}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Member Requirements */}
                    <div className="space-y-8 my-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5 text-primary" />
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">{t('landing.looking_for')}</h3>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{t('landing.looking_for_tooltip')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              type="button" 
                              onClick={addMember} 
                              variant="outline" 
                              size="sm"
                              className="border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {t('landing.add_member')}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('landing.add_member_tooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <Alert variant="default" className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                        <AlertTitle className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-blue-500" />
                          {t('landing.tips_title')}
                        </AlertTitle>
                        <AlertDescription className="text-sm text-muted-foreground">
                          {t('landing.tips_description')}
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-1 gap-6">
                        {formData.members.map((member, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-6 border border-primary/20 rounded-xl space-y-6 bg-gradient-to-br from-background to-muted/30 shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-center justify-between border-b border-border/50 pb-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                                  {index + 1}
                                </div>
                                <h4 className="font-semibold text-lg">{t('landing.team_member')} {index + 1}</h4>
                              </div>
                              {formData.members.length > 1 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      onClick={() => removeMember(index)}
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t('landing.remove_member')}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <div className="flex items-center space-x-2 mb-3">
                                    <Label className="text-base font-medium">{t('landing.tech_fields')}</Label>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{t('landing.tech_fields_tooltip')}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <div className="p-4 border rounded-lg bg-background/80 max-h-48 overflow-y-auto space-y-3 grid grid-cols-1 md:grid-cols-2">
                                    {techFields.map((field) => (
                                      <div 
                                        key={field} 
                                        className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded-md transition-colors"
                                      >
                                        <Checkbox
                                          id={`tech-${index}-${field}`}
                                          checked={member.tech_field.includes(field)}
                                          onCheckedChange={(checked) => {
                                            const updatedFields = checked
                                              ? [...member.tech_field, field]
                                              : member.tech_field.filter(f => f !== field);
                                            handleMemberChange(index, "tech_field", updatedFields);
                                          }}
                                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <Label 
                                          htmlFor={`tech-${index}-${field}`} 
                                          className="text-sm cursor-pointer select-none"
                                        >
                                          {field}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <div className="flex items-center space-x-2 mb-3">
                                    <Label className="text-base font-medium">{t('landing.programming')}</Label>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{t('landing.programming_tooltip')}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <div className="p-4 border rounded-lg sm:w-[750px] w-full bg-background/80 min-h-[100px]">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                      {programmingLanguages.map((lang) => {
                                        const isSelected = member.planguage.includes(lang);
                                        return (
                                          <div 
                                            key={lang}
                                            className="relative"
                                          >
                                            <div
                                              className={`
                                                py-1 px-2 rounded-md border text-center cursor-pointer transition-all
                                                ${isSelected 
                                                  ? 'bg-primary text-primary-foreground border-primary' 
                                                  : 'bg-background hover:bg-background/80 border-input hover:border-primary/50'}
                                                hover:scale-105 select-none
                                              `}
                                              onClick={() => {
                                                const updatedLangs = isSelected
                                                  ? member.planguage.filter(l => l !== lang)
                                                  : [...member.planguage, lang];
                                                handleMemberChange(index, "planguage", updatedLangs);
                                              }}
                                            >
                                              {lang}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-6">
                                <div>
                                  <div className="flex items-center space-x-2 mb-3">
                                    <Label className="text-base font-medium">{t('landing.gender_preference')}</Label>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{t('landing.gender_preference_tooltip')}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <Select 
                                    value={member.gender} 
                                    onValueChange={(value) => handleMemberChange(index, "gender", value)}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Any">{t('landing.gender_any')}</SelectItem>
                                      <SelectItem value="Male">{t('landing.gender_male')}</SelectItem>
                                      <SelectItem value="Female">{t('landing.gender_female')}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <div className="flex items-center space-x-2 mb-3">
                                    <Label className="text-base font-medium">{t('landing.major')}</Label>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs">
                                        <p>{t('landing.major_tooltip')}</p>
                                        <ul className="mt-2 text-xs space-y-1">
                                          <li><span className="font-bold">CS:</span> {t('landing.major_cs')}</li>
                                          <li><span className="font-bold">IS:</span> {t('landing.major_is')}</li>
                                          <li><span className="font-bold">SC:</span> {t('landing.major_sc')}</li>
                                          <li><span className="font-bold">AI:</span> {t('landing.major_ai')}</li>
                                        </ul>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <Select 
                                    value={member.major} 
                                    onValueChange={(value) => handleMemberChange(index, "major", value)}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select major" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {majors.map((major) => (
                                        <SelectItem key={major} value={major}>{major}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="pt-2">
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {formData.members.length > 1 && (
                        <div className="flex justify-center">
                          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
                            <Users className="w-4 h-4 mr-2" />
                            {t('landing.looking_for_members')} {formData.members.length} {t('landing.team_members')}
                          </div>
                        </div>
                      )}
                    </div>

                    <CardFooter className="flex justify-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full gradient-button text-lg py-3"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEditMode ? t('landing.updating') : t('landing.creating')}
                              </>
                            ) : (
                              <>
                                {isEditMode ? t('landing.update_button') : t('landing.create_button')}
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isEditMode ? t('landing.update_tooltip_submit') : t('landing.create_tooltip_submit')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardFooter>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
};

export default Landing;
