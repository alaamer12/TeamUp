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
            <AlertTitle>Offline Mode</AlertTitle>
            <AlertDescription>
              You're currently in offline mode. Your team request will be saved locally and synced when you reconnect.
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
              
              <h1 className="text-4xl md:text-6xl font-bold mb-8 pb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Build Graduation <br />
                Project Teams
              </h1>
              
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="lg" 
                      onClick={scrollToForm}
                      className="gradient-button text-lg px-8 py-3"
                    >
                      Find Teammates
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create a team request to find collaborators for your project</p>
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
                      Join a Team
                      <Users className="ml-2 w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Browse existing team requests to find a team to join</p>
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
                    {isEditMode ? "Edit Team Request" : "Create Team Request"}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {isEditMode 
                      ? "Update your team request details" 
                      : "Tell us about yourself and the teammates you're looking for"}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Information */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold flex items-center">
                        <Users className="mr-2 w-5 h-5" />
                        Your Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-field">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Your WhatsApp number for team communication (e.g., 01155555555)</p>
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
                            <Label htmlFor="name">Name (Optional)</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Your preferred name or nickname</p>
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
                          <Label htmlFor="gender">Gender (Optional)</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Your gender identity (optional for team diversity information)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={formData.user_gender} onValueChange={(value) => handleInputChange("user_gender", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="form-field">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="abstract">About You *</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Brief description of your skills, experience, and what you bring to the team</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Textarea
                          id="abstract"
                          placeholder="Brief description about yourself, your skills, and what you bring to the team..."
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
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Looking For</h3>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Define the team members you need for your project</p>
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
                              Add Member
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add another team member requirement</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <Alert variant="default" className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                        <AlertTitle className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-blue-500" />
                          Team Building Tips
                        </AlertTitle>
                        <AlertDescription className="text-sm text-muted-foreground">
                          Define specific skills and requirements to attract the right team members. Consider diversity in technical backgrounds for a well-rounded team.
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
                                <h4 className="font-semibold text-lg">Team Member {index + 1}</h4>
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
                                    <p>Remove this member requirement</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <div className="flex items-center space-x-2 mb-3">
                                    <Label className="text-base font-medium">Tech Fields *</Label>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Technical areas of expertise required for this team member</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <div className="p-4 border rounded-lg bg-background/80 max-h-48 overflow-y-auto space-y-3 grid grid-cols-1 md:grid-cols-2">
                                    {techFields.map((field) => (
                                      <div key={field} className="flex items-center space-x-2">
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
                                        <Label htmlFor={`tech-${index}-${field}`} className="text-sm cursor-pointer">{field}</Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <div className="flex items-center space-x-2 mb-3">
                                    <Label className="text-base font-medium">Programming Languages/Frameworks</Label>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Specific programming languages or frameworks this team member should know</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <div className="p-4 border rounded-lg sm:w-[750px] w-full bg-background/80 min-h-[100px]">
                                    <div className="flex flex-wrap gap-2 w-full h-full">
                                      {programmingLanguages.map((lang) => (
                                        <Badge
                                          key={lang}
                                          variant={member.planguage.includes(lang) ? "default" : "outline"}
                                          className={`cursor-pointer transition-all duration-200 hover:scale-105 m-1 ${
                                            member.planguage.includes(lang) 
                                              ? "bg-primary text-primary-foreground" 
                                              : "hover:border-primary/50"
                                          }`}
                                          onClick={() => {
                                            const updatedLangs = member.planguage.includes(lang)
                                              ? member.planguage.filter(l => l !== lang)
                                              : [...member.planguage, lang];
                                            handleMemberChange(index, "planguage", updatedLangs);
                                          }}
                                        >
                                          {lang}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-6">
                                <div>
                                  <div className="flex items-center space-x-2 mb-3">
                                    <Label className="text-base font-medium">Gender Preference</Label>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Preferred gender for this team member (select "Any" if no preference)</p>
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
                                      <SelectItem value="Any">Any</SelectItem>
                                      <SelectItem value="Male">Male</SelectItem>
                                      <SelectItem value="Female">Female</SelectItem>
                                      <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <div className="flex items-center space-x-2 mb-3">
                                    <Label className="text-base font-medium">Major *</Label>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs">
                                        <p>Academic major required for this team member</p>
                                        <ul className="mt-2 text-xs space-y-1">
                                          <li><span className="font-bold">CS:</span> Computer Science</li>
                                          <li><span className="font-bold">IS:</span> Information Systems</li>
                                          <li><span className="font-bold">SC:</span> Scientific Computing</li>
                                          <li><span className="font-bold">AI:</span> Artificial Intelligence</li>
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
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`already-know-${index}`}
                                      checked={member.already_know}
                                      onCheckedChange={(checked) => 
                                        handleMemberChange(index, "already_know", !!checked)
                                      }
                                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <Label 
                                      htmlFor={`already-know-${index}`}
                                      className="text-sm cursor-pointer"
                                    >
                                      I already have someone in mind for this role
                                    </Label>
                                  </div>
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
                            Looking for {formData.members.length} team members
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
                                {isEditMode ? "Updating..." : "Creating..."}
                              </>
                            ) : (
                              <>
                                {isEditMode ? "Update Team Request" : "Create Team Request"}
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isEditMode ? "Update your team request" : "Submit your team request to find collaborators"}</p>
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
