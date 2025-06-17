import { useState, useEffect } from "react";
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
import { Users, Plus, Trash2, ArrowRight, HelpCircle, WifiOff, Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Navbar from "../components/Navbar";
import { saveTeamRequest } from "../utils/db";
import { getCurrentOwnership } from "../utils/fingerprint-safe";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "../components/LanguageProvider";
import Footer from "@/components/Footer";

// Maximum limits to prevent spamming
const MAX_MEMBERS = 10;
const MAX_PLANGUAGE = 3;
const MAX_TECH_FIELDS = 3;
const MAX_NAME_LENGTH = 50;
const MAX_ABSTRACT_LENGTH = 500;
const MIN_ABSTRACT_LENGTH = 20;
const PHONE_REGEX = /^\d{11}$/; // Regex for exactly 11 digits

const techFields = [
  "Frontend Development", "Backend Development", "Full Stack", "Mobile Development",
  "Data Science", "AI [ML, DL, CV, NLP]", "DevOps", "UI/UX",
];

const majors = ["CS", "IS", "SC", "AI", "Any"];

const programmingLanguages = [
  "JavaScript", "Python", "Java", "C++", "C# [.NET]", "Rust", "PHP",
  "TypeScript", "Flutter", "React Native", "React", "Angular", "Vue", "Other"
];

// Offline Alert Component
const OfflineAlert = ({ isOffline, t }) => {
  if (!isOffline) return null;
  
  return (
    <Alert className="mx-4 mt-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
      <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      <AlertTitle>{t('landing.offline_title')}</AlertTitle>
      <AlertDescription>
        {t('landing.offline_description')}
      </AlertDescription>
    </Alert>
  );
};

// Hero Section Component
const HeroSection = ({ t, onScrollToForm, onNavigateToListings }) => (
  <section className="relative overflow-hidden py-20 px-4">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />
    <div className="relative container mx-auto text-center max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-8 pb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {t('landing.title')}
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="lg" 
                onClick={onScrollToForm}
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
                onClick={onNavigateToListings}
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
);

// Personal Information Form Component
const PersonalInfoForm = ({ formData, onInputChange, t }) => {
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");
  const [abstractError, setAbstractError] = useState("");
  
  const validatePhone = (value) => {
    if (!value) {
      setPhoneError(t('validation.phone_required'));
      return false;
    }
    if (!PHONE_REGEX.test(value)) {
      setPhoneError(t('validation.phone_format'));
      return false;
    }
    setPhoneError("");
    return true;
  };
  
  const validateName = (value) => {
    if (!value.trim()) {
      setNameError(t('validation.name_required'));
      return false;
    }
    if (value.trim().length > MAX_NAME_LENGTH) {
      setNameError(t('validation.name_too_long'));
      return false;
    }
    setNameError("");
    return true;
  };
  
  const validateAbstract = (value) => {
    if (!value.trim()) {
      setAbstractError(t('validation.abstract_required'));
      return false;
    }
    if (value.trim().length < MIN_ABSTRACT_LENGTH) {
      setAbstractError(t('validation.abstract_too_short'));
      return false;
    }
    if (value.trim().length > MAX_ABSTRACT_LENGTH) {
      setAbstractError(t('validation.abstract_too_long'));
      return false;
    }
    setAbstractError("");
    return true;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Allow only digits
    if (value === "" || /^\d+$/.test(value)) {
      onInputChange("user_personal_phone", value);
      if (value) validatePhone(value);
    }
  };
  
  const handleNameChange = (e) => {
    const value = e.target.value;
    onInputChange("user_name", value);
    if (value) validateName(value);
  };
  
  const handleAbstractChange = (e) => {
    const value = e.target.value;
    onInputChange("user_abstract", value);
    if (value) validateAbstract(value);
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold flex items-center">
        <Users className="mr-2 w-5 h-5" />
        {t('landing.your_info')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-field">
          <div className="flex items-center space-x-2">
            <Label htmlFor="phone">{t('landing.phone')} *</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('landing.phone_tooltip')}</p>
                <p className="text-xs mt-1">{t('validation.phone_format_help')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="01155555555"
            value={formData.user_personal_phone}
            onChange={handlePhoneChange}
            onBlur={() => validatePhone(formData.user_personal_phone)}
            maxLength={11}
            required
            className={phoneError ? "border-red-500" : ""}
          />
          {phoneError && (
            <div className="text-red-500 text-xs flex items-center mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              {phoneError}
            </div>
          )}
        </div>
        
        <div className="form-field">
          <div className="flex items-center space-x-2">
            <Label htmlFor="name">{t('landing.name')} *</Label>
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
            onChange={handleNameChange}
            onBlur={() => validateName(formData.user_name)}
            maxLength={MAX_NAME_LENGTH}
            required
            className={nameError ? "border-red-500" : ""}
          />
          {nameError && (
            <div className="text-red-500 text-xs flex items-center mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              {nameError}
            </div>
          )}
        </div>
      </div>
      
      <div className="form-field">
        <div className="flex items-center space-x-2">
          <Label htmlFor="gender">{t('landing.gender')} *</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('landing.gender_tooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Select value={formData.user_gender} onValueChange={(value) => onInputChange("user_gender", value)} required>
          <SelectTrigger className={!formData.user_gender ? "border-red-500" : ""}>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">{t('landing.gender_male')}</SelectItem>
            <SelectItem value="Female">{t('landing.gender_female')}</SelectItem>
            <SelectItem value="Other">{t('landing.gender_other')}</SelectItem>
          </SelectContent>
        </Select>
        {!formData.user_gender && (
          <div className="text-red-500 text-xs flex items-center mt-1">
            <AlertCircle className="h-3 w-3 mr-1" />
            {t('validation.gender_required')}
          </div>
        )}
      </div>
      
      <div className="form-field">
        <div className="flex items-center space-x-2">
          <Label htmlFor="abstract">{t('landing.about')} *</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('landing.about_tooltip')}</p>
              <p className="text-xs mt-1">{MIN_ABSTRACT_LENGTH}-{MAX_ABSTRACT_LENGTH} {t('validation.characters')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Textarea
          id="abstract"
          placeholder={t('landing.about_placeholder')}
          value={formData.user_abstract}
          onChange={handleAbstractChange}
          onBlur={() => validateAbstract(formData.user_abstract)}
          required
          rows={4}
          maxLength={MAX_ABSTRACT_LENGTH}
          className={abstractError ? "border-red-500" : ""}
        />
        <div className="flex justify-between mt-1">
          {abstractError ? (
            <div className="text-red-500 text-xs flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {abstractError}
            </div>
          ) : <div />}
          <div className="text-xs text-muted-foreground">
            {formData.user_abstract.length}/{MAX_ABSTRACT_LENGTH}
          </div>
        </div>
      </div>
    </div>
  );
};

// Tech Fields Selection Component
const TechFieldsSelection = ({ member, index, onMemberChange, t }) => (
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
    <div className="p-4 border rounded-lg bg-background/80 max-h-48 overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {techFields.map((field) => (
          <div 
            key={field} 
            className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded-md transition-colors"
          >
            <Checkbox
              id={`tech-${index}-${field}`}
              checked={member.tech_field.includes(field)}
              onCheckedChange={(checked) => {
                if (checked && member.tech_field.length >= MAX_TECH_FIELDS) {
                  toast({
                    title: t('landing.limit_exceeded'),
                    description: `${t('landing.max_tech_fields')} (${MAX_TECH_FIELDS})`,
                    variant: "destructive"
                  });
                  return;
                }
                
                const updatedFields = checked
                  ? [...member.tech_field, field]
                  : member.tech_field.filter(f => f !== field);
                onMemberChange(index, "tech_field", updatedFields);
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
  </div>
);

// Programming Languages Selection Component
const ProgrammingLanguagesSelection = ({ member, index, onMemberChange, t }) => (
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
    <div className="p-4 border rounded-lg bg-background/80 min-h-[100px] w-full overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {programmingLanguages.map((lang) => {
          const isSelected = member.planguage.includes(lang);
          return (
            <div 
              key={lang}
              className={`
                py-1 px-2 rounded-md border text-center cursor-pointer transition-all text-sm
                ${isSelected 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background hover:bg-background/80 border-input hover:border-primary/50'}
                hover:scale-105 select-none
              `}
              onClick={() => {
                if (!isSelected && member.planguage.length >= MAX_PLANGUAGE) {
                  toast({
                    title: t('landing.limit_exceeded'),
                    description: `${t('landing.max_planguage')} (${MAX_PLANGUAGE})`,
                    variant: "destructive"
                  });
                  return;
                }
                
                const updatedLangs = isSelected
                  ? member.planguage.filter(l => l !== lang)
                  : [...member.planguage, lang];
                onMemberChange(index, "planguage", updatedLangs);
              }}
            >
              {lang}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

// Member Card Component
const MemberCard = ({ member, index, onMemberChange, onRemoveMember, canRemove, t }) => (
  <motion.div
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
      {canRemove && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              onClick={() => onRemoveMember(index)}
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

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="space-y-6">
        <TechFieldsSelection 
          member={member} 
          index={index} 
          onMemberChange={onMemberChange} 
          t={t} 
        />
        <ProgrammingLanguagesSelection 
          member={member} 
          index={index} 
          onMemberChange={onMemberChange} 
          t={t} 
        />
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
            onValueChange={(value) => onMemberChange(index, "gender", value)}
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
            onValueChange={(value) => onMemberChange(index, "major", value)}
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
      </div>
    </div>
  </motion.div>
);

// Member Requirements Section Component
const MemberRequirementsSection = ({ formData, onMemberChange, onAddMember, onRemoveMember, t }) => (
  <div className="space-y-8 my-8">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          {t('landing.looking_for')}
        </h3>
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
            onClick={onAddMember} 
            variant="outline" 
            size="sm"
            className="border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
            disabled={formData.members.length >= MAX_MEMBERS}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('landing.add_member')}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{formData.members.length >= MAX_MEMBERS 
              ? `${t('landing.max_members_tooltip')} (${MAX_MEMBERS})` 
              : t('landing.add_member_tooltip')}
          </p>
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

    <div className="space-y-6">
      {formData.members.map((member, index) => (
        <MemberCard
          key={index}
          member={member}
          index={index}
          onMemberChange={onMemberChange}
          onRemoveMember={onRemoveMember}
          canRemove={formData.members.length > 1}
          t={t}
        />
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
);

// Main Landing Component
const Landing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Initialize form data
  const [formData, setFormData] = useState(() => {
    const editData = location.state?.editMode && location.state?.teamData;
    
    if (editData) {
      setIsEditMode(true);
      return editData;
    }
    
    return {
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
    };
  });

  // Check online status
  useEffect(() => {
    const checkOnlineStatus = () => setIsOffline(!navigator.onLine);
    checkOnlineStatus();
    
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMemberChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const addMember = () => {
    if (formData.members.length >= MAX_MEMBERS) {
      toast({
        title: t('landing.limit_exceeded'),
        description: `${t('landing.max_members')} (${MAX_MEMBERS})`,
        variant: "destructive"
      });
      return;
    }
    
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

  const removeMember = (index) => {
    if (formData.members.length > 1) {
      setFormData(prev => ({
        ...prev,
        members: prev.members.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced validation
    const errors = [];
    
    // Validate personal info
    if (!formData.user_personal_phone) {
      errors.push(t('validation.phone_required'));
    } else if (!PHONE_REGEX.test(formData.user_personal_phone)) {
      errors.push(t('validation.phone_format'));
    }
    
    if (!formData.user_name?.trim()) {
      errors.push(t('validation.name_required'));
    }
    
    if (!formData.user_gender) {
      errors.push(t('validation.gender_required'));
    }
    
    if (!formData.user_abstract?.trim()) {
      errors.push(t('validation.abstract_required'));
    } else if (formData.user_abstract.trim().length < MIN_ABSTRACT_LENGTH) {
      errors.push(t('validation.abstract_too_short'));
    }

    // Validate member requirements
    const memberErrors = [];
    formData.members.forEach((member, index) => {
      if (!member.tech_field.length) {
        memberErrors.push(`${t('landing.team_member')} ${index + 1}: ${t('validation.tech_field_required')}`);
      }
      
      if (!member.planguage.length) {
        memberErrors.push(`${t('landing.team_member')} ${index + 1}: ${t('validation.planguage_required')}`);
      }
      
      if (!member.major) {
        memberErrors.push(`${t('landing.team_member')} ${index + 1}: ${t('validation.major_required')}`);
      }
    });
    
    if (errors.length > 0 || memberErrors.length > 0) {
      const allErrors = [...errors, ...memberErrors];
      toast({
        title: t('validation.form_errors'),
        description: (
          <ul className="list-disc pl-4 space-y-1">
            {allErrors.slice(0, 3).map((error, i) => (
              <li key={i}>{error}</li>
            ))}
            {allErrors.length > 3 && (
              <li>{t('validation.and_more_errors')}</li>
            )}
          </ul>
        ),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const teamData = isEditMode 
        ? { ...formData }
        : { ...formData, ownerFingerprint: getCurrentOwnership() };
      
      await saveTeamRequest(teamData);
      
      toast({
        title: isEditMode ? "Team Request Updated!" : "Team Request Created!",
        description: isEditMode 
          ? "Your team request has been updated successfully."
          : "Your team request has been saved successfully.",
      });

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
        
        <OfflineAlert isOffline={isOffline} t={t} />
        
        <HeroSection 
          t={t} 
          onScrollToForm={scrollToForm}
          onNavigateToListings={() => navigate("/listings")}
        />

        <section id="team-form" className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
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
                
                <CardContent className="px-4 sm:px-6">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <PersonalInfoForm 
                      formData={formData}
                      onInputChange={handleInputChange}
                      t={t}
                    />

                    <Separator />

                    <MemberRequirementsSection
                      formData={formData}
                      onMemberChange={handleMemberChange}
                      onAddMember={addMember}
                      onRemoveMember={removeMember}
                      t={t}
                    />

                    <CardFooter className="flex justify-center px-0">
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
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default Landing;