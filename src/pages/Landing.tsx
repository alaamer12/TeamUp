import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Navbar from "../components/Navbar";
import { saveTeamRequest } from "../utils/db";
import { getCurrentOwnership } from "../utils/fingerprint-safe";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
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
  });

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
      const ownerFingerprint = getCurrentOwnership();
      
      const teamData = {
        ...formData,
        ownerFingerprint
      };
      
      await saveTeamRequest(teamData);
      
      toast({
        title: "Team Request Created!",
        description: "Your team request has been saved successfully.",
      });

      // Reset form
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

      // Navigate to listings
      setTimeout(() => navigate("/listings"), 1000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save team request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
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
              <Button 
                size="lg" 
                onClick={scrollToForm}
                className="gradient-button text-lg px-8 py-3"
              >
                Find Teammates
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/listings")}
                className="text-lg px-8 py-3"
              >
                Join a Team
                <Users className="ml-2 w-5 h-5" />
              </Button>
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
                <CardTitle className="text-3xl font-bold">Create Team Request</CardTitle>
                <CardDescription className="text-lg">
                  Tell us about yourself and the teammates you're looking for
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
                        <Label htmlFor="phone">Phone Number *</Label>
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
                        <Label htmlFor="name">Name (Optional)</Label>
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
                      <Label htmlFor="gender">Gender (Optional)</Label>
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
                      <Label htmlFor="abstract">About You *</Label>
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
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">Looking For</h3>
                      <Button type="button" onClick={addMember} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Member
                      </Button>
                    </div>

                    {formData.members.map((member, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 border rounded-lg space-y-4 bg-muted/20"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Member {index + 1}</h4>
                          {formData.members.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeMember(index)}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Tech Fields *</Label>
                            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                              {techFields.map((field) => (
                                <div key={field} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={member.tech_field.includes(field)}
                                    onCheckedChange={(checked) => {
                                      const updatedFields = checked
                                        ? [...member.tech_field, field]
                                        : member.tech_field.filter(f => f !== field);
                                      handleMemberChange(index, "tech_field", updatedFields);
                                    }}
                                  />
                                  <Label className="text-sm">{field}</Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label>Gender Preference</Label>
                              <Select 
                                value={member.gender} 
                                onValueChange={(value) => handleMemberChange(index, "gender", value)}
                              >
                                <SelectTrigger>
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
                              <Label>Major *</Label>
                              <Select 
                                value={member.major} 
                                onValueChange={(value) => handleMemberChange(index, "major", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select major" />
                                </SelectTrigger>
                                <SelectContent>
                                  {majors.map((major) => (
                                    <SelectItem key={major} value={major}>{major}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Programming Languages/Frameworks (Optional)</Label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {programmingLanguages.map((lang) => (
                              <Badge
                                key={lang}
                                variant={member.planguage.includes(lang) ? "default" : "outline"}
                                className="cursor-pointer transition-colors"
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

                      </motion.div>
                    ))}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gradient-button text-lg py-3" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Team Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
