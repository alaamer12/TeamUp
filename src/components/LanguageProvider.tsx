import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "ar" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const translations = {
  // Navbar
  "navbar.home": {
    en: "Home",
    ar: "الرئيسية"
  },
  "navbar.listings": {
    en: "Listings",
    ar: "الطلبات"
  },
  "navbar.about": {
    en: "About",
    ar: "عن التطبيق"
  },
  
  // Landing Page
  "landing.title": {
    en: "Build Graduation Project Teams",
    ar: "كوّن فرق مشاريع التخرج"
  },
  "landing.find_teammates": {
    en: "Find Teammates",
    ar: "ابحث عن زملاء"
  },
  "landing.join_team": {
    en: "Join a Team",
    ar: "انضم لفريق"
  },
  "landing.create_tooltip": {
    en: "Create a team request to find collaborators for your project",
    ar: "أنشئ طلب فريق للعثور على متعاونين لمشروعك"
  },
  "landing.join_tooltip": {
    en: "Browse existing team requests to find a team to join",
    ar: "تصفح طلبات الفرق الموجودة للعثور على فريق للانضمام إليه"
  },
  "landing.create_title": {
    en: "Create Team Request",
    ar: "إنشاء طلب فريق"
  },
  "landing.edit_title": {
    en: "Edit Team Request",
    ar: "تعديل طلب الفريق"
  },
  "landing.create_description": {
    en: "Tell us about yourself and the teammates you're looking for",
    ar: "أخبرنا عن نفسك وعن زملاء الفريق الذين تبحث عنهم"
  },
  "landing.edit_description": {
    en: "Update your team request details",
    ar: "تحديث تفاصيل طلب الفريق الخاص بك"
  },
  "landing.your_info": {
    en: "Your Information",
    ar: "معلوماتك"
  },
  "landing.phone": {
    en: "Phone Number *",
    ar: "رقم الهاتف *"
  },
  "landing.phone_tooltip": {
    en: "Your WhatsApp number for team communication (e.g., 01155555555)",
    ar: "رقم الواتساب الخاص بك للتواصل مع الفريق (مثال: 01155555555)"
  },
  "landing.name": {
    en: "Name (Optional)",
    ar: "الاسم (اختياري)"
  },
  "landing.name_tooltip": {
    en: "Your preferred name or nickname",
    ar: "اسمك المفضل أو لقبك"
  },
  "landing.gender": {
    en: "Gender (Optional)",
    ar: "الجنس (اختياري)"
  },
  "landing.gender_tooltip": {
    en: "Your gender identity (optional for team diversity information)",
    ar: "هويتك الجنسية (اختياري لمعلومات تنوع الفريق)"
  },
  "landing.gender_male": {
    en: "Male",
    ar: "ذكر"
  },
  "landing.gender_female": {
    en: "Female",
    ar: "أنثى"
  },
  "landing.gender_other": {
    en: "Other",
    ar: "آخر"
  },
  "landing.about": {
    en: "About You *",
    ar: "عن نفسك *"
  },
  "landing.about_tooltip": {
    en: "Brief description of your skills, experience, and what you bring to the team",
    ar: "وصف موجز لمهاراتك وخبراتك وما تقدمه للفريق"
  },
  "landing.about_placeholder": {
    en: "Brief description about yourself, your skills, and what you bring to the team...",
    ar: "وصف موجز عن نفسك ومهاراتك وما تقدمه للفريق..."
  },
  "landing.looking_for": {
    en: "Looking For",
    ar: "أبحث عن"
  },
  "landing.looking_for_tooltip": {
    en: "Define the team members you need for your project",
    ar: "حدد أعضاء الفريق الذين تحتاجهم لمشروعك"
  },
  "landing.add_member": {
    en: "Add Member",
    ar: "إضافة عضو"
  },
  "landing.add_member_tooltip": {
    en: "Add another team member requirement",
    ar: "إضافة متطلبات عضو آخر"
  },
  "landing.tips_title": {
    en: "Team Building Tips",
    ar: "نصائح لبناء الفريق"
  },
  "landing.tips_description": {
    en: "Define specific skills and requirements to attract the right team members. Consider diversity in technical backgrounds for a well-rounded team.",
    ar: "حدد المهارات والمتطلبات المحددة لجذب أعضاء الفريق المناسبين. ضع في اعتبارك التنوع في الخلفيات التقنية للحصول على فريق متكامل."
  },
  "landing.team_member": {
    en: "Team Member",
    ar: "عضو الفريق"
  },
  "landing.remove_member": {
    en: "Remove this member requirement",
    ar: "إزالة متطلبات هذا العضو"
  },
  "landing.tech_fields": {
    en: "Tech Fields *",
    ar: "المجالات التقنية *"
  },
  "landing.tech_fields_tooltip": {
    en: "Technical areas of expertise required for this team member",
    ar: "مجالات الخبرة التقنية المطلوبة لهذا العضو"
  },
  "landing.programming": {
    en: "Programming Languages/Frameworks",
    ar: "لغات/أطر البرمجة"
  },
  "landing.programming_tooltip": {
    en: "Specific programming languages or frameworks this team member should know",
    ar: "لغات أو أطر البرمجة المحددة التي يجب أن يعرفها هذا العضو"
  },
  "landing.gender_preference": {
    en: "Gender Preference",
    ar: "تفضيل الجنس"
  },
  "landing.gender_preference_tooltip": {
    en: "Preferred gender for this team member (select \"Any\" if no preference)",
    ar: "الجنس المفضل لهذا العضو (اختر \"أي\" إذا لم يكن هناك تفضيل)"
  },
  "landing.gender_any": {
    en: "Any",
    ar: "أي"
  },
  "landing.major": {
    en: "Major *",
    ar: "التخصص *"
  },
  "landing.major_tooltip": {
    en: "Academic major required for this team member",
    ar: "التخصص الأكاديمي المطلوب لهذا العضو"
  },
  "landing.major_cs": {
    en: "Computer Science",
    ar: "علوم الحاسب"
  },
  "landing.major_is": {
    en: "Information Systems",
    ar: "نظم المعلومات"
  },
  "landing.major_sc": {
    en: "Scientific Computing",
    ar: "الحوسبة العلمية"
  },
  "landing.major_ai": {
    en: "Artificial Intelligence",
    ar: "الذكاء الاصطناعي"
  },
  "landing.already_know": {
    en: "I already have someone in mind for this role",
    ar: "لدي بالفعل شخص في ذهني لهذا الدور"
  },
  "landing.looking_for_members": {
    en: "Looking for",
    ar: "أبحث عن"
  },
  "landing.team_members": {
    en: "team members",
    ar: "أعضاء فريق"
  },
  "landing.create_button": {
    en: "Create Team Request",
    ar: "إنشاء طلب فريق"
  },
  "landing.update_button": {
    en: "Update Team Request",
    ar: "تحديث طلب الفريق"
  },
  "landing.creating": {
    en: "Creating...",
    ar: "جاري الإنشاء..."
  },
  "landing.updating": {
    en: "Updating...",
    ar: "جاري التحديث..."
  },
  "landing.create_tooltip_submit": {
    en: "Submit your team request to find collaborators",
    ar: "قدم طلب الفريق الخاص بك للعثور على متعاونين"
  },
  "landing.update_tooltip_submit": {
    en: "Update your team request",
    ar: "تحديث طلب الفريق الخاص بك"
  },
  "landing.offline_title": {
    en: "Offline Mode",
    ar: "وضع عدم الاتصال"
  },
  "landing.offline_description": {
    en: "You're currently in offline mode. Your team request will be saved locally and synced when you reconnect.",
    ar: "أنت حاليًا في وضع عدم الاتصال. سيتم حفظ طلب الفريق الخاص بك محليًا ومزامنته عند إعادة الاتصال."
  },
  
  // Listings Page
  "listings.title": {
    en: "Team Requests",
    ar: "طلبات الفرق"
  },
  "listings.subtitle": {
    en: "Browse and join amazing teams looking for talented members",
    ar: "تصفح وانضم إلى فرق رائعة تبحث عن أعضاء موهوبين"
  },
  "listings.create_button": {
    en: "Create Team Request",
    ar: "إنشاء طلب فريق"
  },
  "listings.create_tooltip": {
    en: "Create your own team request to find collaborators",
    ar: "أنشئ طلب الفريق الخاص بك للعثور على متعاونين"
  },
  "listings.search": {
    en: "Search teams, skills, languages...",
    ar: "البحث عن فرق، مهارات، لغات..."
  },
  "listings.search_tooltip": {
    en: "Search by skills, languages, or team descriptions",
    ar: "البحث حسب المهارات أو اللغات أو أوصاف الفريق"
  },
  "listings.filter_major": {
    en: "Filter by major",
    ar: "تصفية حسب التخصص"
  },
  "listings.all_majors": {
    en: "All Majors",
    ar: "جميع التخصصات"
  },
  "listings.filter_tooltip": {
    en: "Filter teams by academic major (CS: Computer Science, IS: Information Systems, SC: Scientific Computing, AI: Artificial Intelligence)",
    ar: "تصفية الفرق حسب التخصص الأكاديمي (CS: علوم الحاسب، IS: نظم المعلومات، SC: الحوسبة العلمية، AI: الذكاء الاصطناعي)"
  },
  "listings.teams_count": {
    en: "teams",
    ar: "فرق"
  },
  "listings.teams_count_singular": {
    en: "team",
    ar: "فريق"
  },
  "listings.teams_count_tooltip": {
    en: "Number of teams matching your current filters",
    ar: "عدد الفرق المطابقة للمرشحات الحالية"
  },
  "listings.no_teams_title": {
    en: "No teams found",
    ar: "لم يتم العثور على فرق"
  },
  "listings.no_teams_filters": {
    en: "Try adjusting your search or filters",
    ar: "حاول ضبط البحث أو المرشحات الخاصة بك"
  },
  "listings.no_teams_empty": {
    en: "Be the first to create a team request!",
    ar: "كن أول من ينشئ طلب فريق!"
  },
  "listings.previous": {
    en: "Previous",
    ar: "السابق"
  },
  "listings.next": {
    en: "Next",
    ar: "التالي"
  },
  "listings.previous_tooltip": {
    en: "Go to previous page",
    ar: "الذهاب إلى الصفحة السابقة"
  },
  "listings.next_tooltip": {
    en: "Go to next page",
    ar: "الذهاب إلى الصفحة التالية"
  },
  "listings.page_tooltip": {
    en: "Go to page",
    ar: "الذهاب إلى الصفحة"
  },
  "listings.offline_title": {
    en: "Offline Mode",
    ar: "وضع عدم الاتصال"
  },
  "listings.offline_description": {
    en: "You're currently in offline mode. Changes will be saved locally and synced when you reconnect.",
    ar: "أنت حاليًا في وضع عدم الاتصال. سيتم حفظ التغييرات محليًا ومزامنتها عند إعادة الاتصال."
  },
  
  // TeamCard
  "teamcard.created": {
    en: "Date when this team request was created",
    ar: "تاريخ إنشاء طلب الفريق هذا"
  },
  "teamcard.days_left": {
    en: "Days remaining before this request expires",
    ar: "الأيام المتبقية قبل انتهاء صلاحية هذا الطلب"
  },
  "teamcard.days_left_text": {
    en: "days left",
    ar: "أيام متبقية"
  },
  "teamcard.looking_for": {
    en: "Team members being sought for this project",
    ar: "أعضاء الفريق المطلوبين لهذا المشروع"
  },
  "teamcard.member": {
    en: "Member",
    ar: "عضو"
  },
  "teamcard.gender_preference": {
    en: "Preferred gender for this team member",
    ar: "الجنس المفضل لهذا العضو"
  },
  "teamcard.known_person": {
    en: "Known person",
    ar: "شخص معروف"
  },
  "teamcard.known_person_tooltip": {
    en: "The team creator already has someone specific in mind",
    ar: "منشئ الفريق لديه بالفعل شخص محدد في ذهنه"
  },
  "teamcard.technical_skills": {
    en: "Technical skills:",
    ar: "المهارات التقنية:"
  },
  "teamcard.major": {
    en: "Major:",
    ar: "التخصص:"
  },
  "teamcard.major_tooltip": {
    en: "Academic major required (CS: Computer Science, IS: Information Systems, SC: Scientific Computing, AI: Artificial Intelligence)",
    ar: "التخصص الأكاديمي المطلوب (CS: علوم الحاسب، IS: نظم المعلومات، SC: الحوسبة العلمية، AI: الذكاء الاصطناعي)"
  },
  "teamcard.programming": {
    en: "Programming:",
    ar: "البرمجة:"
  },
  "teamcard.contact_whatsapp": {
    en: "Contact via WhatsApp",
    ar: "التواصل عبر واتساب"
  },
  "teamcard.contact_tooltip": {
    en: "Open WhatsApp to contact the team creator directly",
    ar: "فتح واتساب للتواصل مع منشئ الفريق مباشرة"
  },
  "teamcard.edit": {
    en: "Edit your team request",
    ar: "تعديل طلب الفريق الخاص بك"
  },
  "teamcard.delete": {
    en: "Delete your team request",
    ar: "حذف طلب الفريق الخاص بك"
  },
  "teamcard.delete_title": {
    en: "Delete Team Request",
    ar: "حذف طلب الفريق"
  },
  "teamcard.delete_description": {
    en: "Are you sure you want to delete this team request? This action cannot be undone.",
    ar: "هل أنت متأكد أنك تريد حذف طلب الفريق هذا؟ لا يمكن التراجع عن هذا الإجراء."
  },
  "teamcard.cancel": {
    en: "Cancel",
    ar: "إلغاء"
  },
  "teamcard.confirm_delete": {
    en: "Delete",
    ar: "حذف"
  },
  
  // About Page
  "about.how_works": {
    en: "How It Works",
    ar: "كيف يعمل"
  },
  "about.how_works_subtitle": {
    en: "Simple steps to find your perfect team",
    ar: "خطوات بسيطة للعثور على فريقك المثالي"
  },
  "about.step1_title": {
    en: "Create Your Profile",
    ar: "أنشئ ملفك الشخصي"
  },
  "about.step1_description": {
    en: "Tell us about yourself, your skills, and what you bring to a team.",
    ar: "أخبرنا عن نفسك ومهاراتك وما تقدمه للفريق."
  },
  "about.step2_title": {
    en: "Define Team Requirements",
    ar: "حدد متطلبات الفريق"
  },
  "about.step2_description": {
    en: "Specify exactly what skills, expertise, and qualities you're looking for in teammates.",
    ar: "حدد بالضبط المهارات والخبرات والصفات التي تبحث عنها في زملاء الفريق."
  },
  "about.step3_title": {
    en: "Browse & Connect",
    ar: "تصفح وتواصل"
  },
  "about.step3_description": {
    en: "Browse team requests, find matches, and connect via WhatsApp to start collaborating.",
    ar: "تصفح طلبات الفريق، وابحث عن التطابقات، وتواصل عبر واتساب لبدء التعاون."
  },
  "about.tech_stack": {
    en: "Built With Modern Tech",
    ar: "مبني بتقنيات حديثة"
  },
  "about.tech_stack_subtitle": {
    en: "A robust, performant stack focused on user experience and privacy",
    ar: "مجموعة قوية وفعالة تركز على تجربة المستخدم والخصوصية"
  },
  "about.tech_stack_title": {
    en: "Technology Stack",
    ar: "مجموعة التقنيات"
  },
  "about.privacy_title": {
    en: "Privacy First",
    ar: "الخصوصية أولاً"
  },
  "about.privacy_description": {
    en: "Your privacy matters. TeamUp is built with a privacy-first approach:",
    ar: "خصوصيتك مهمة. تم بناء TeamUp بنهج الخصوصية أولاً:"
  },
  "about.local_storage_title": {
    en: "Local Storage Only",
    ar: "التخزين المحلي فقط"
  },
  "about.local_storage_description": {
    en: "All your data stays on your device using IndexedDB. No servers, no data collection.",
    ar: "تبقى جميع بياناتك على جهازك باستخدام IndexedDB. لا خوادم، لا جمع للبيانات."
  },
  "about.ownership_title": {
    en: "Ownership Protection",
    ar: "حماية الملكية"
  },
  "about.ownership_description": {
    en: "Browser fingerprinting ensures only you can modify your team requests.",
    ar: "بصمة المتصفح تضمن أنك أنت فقط من يمكنه تعديل طلبات الفريق الخاصة بك."
  },
  "about.expiry_title": {
    en: "Auto Expiry",
    ar: "انتهاء الصلاحية التلقائي"
  },
  "about.expiry_description": {
    en: "Team requests automatically expire after 90 days to keep listings fresh.",
    ar: "تنتهي صلاحية طلبات الفريق تلقائيًا بعد 90 يومًا للحفاظ على تحديث القوائم."
  },
  "about.direct_comm_title": {
    en: "Direct Communication",
    ar: "التواصل المباشر"
  },
  "about.direct_comm_description": {
    en: "Connect directly via WhatsApp - no intermediary platforms or message tracking.",
    ar: "تواصل مباشرة عبر واتساب - بدون منصات وسيطة أو تتبع للرسائل."
  },
  
  // Footer
  "footer.motto": {
    en: "Connecting Talent, Building Futures.",
    ar: "نصل المواهب، نبني المستقبل."
  },
  "footer.crafted_by": {
    en: "Crafted with ❤️ by",
    ar: "صنع بـ ❤️ بواسطة"
  },
  "footer.source_code": {
    en: "Source Code",
    ar: "الكود المصدري"
  },
  "footer.docs": {
    en: "Docs",
    ar: "المستندات"
  },
  "footer.contact": {
    en: "Contact",
    ar: "التواصل"
  },
  "footer.all_rights_reserved": {
    en: "All rights reserved.",
    ar: "جميع الحقوق محفوظة."
  },
  
  // Common
  "common.language": {
    en: "Language",
    ar: "اللغة"
  },
  "common.english": {
    en: "English",
    ar: "الإنجليزية"
  },
  "common.arabic": {
    en: "Arabic",
    ar: "العربية"
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: "ar",
  setLanguage: () => {},
  t: () => ""
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get from localStorage or default to Arabic
    const savedLang = localStorage.getItem("teamup-language");
    return (savedLang === "en" || savedLang === "ar") ? savedLang : "ar";
  });

  useEffect(() => {
    // Save to localStorage when language changes
    localStorage.setItem("teamup-language", language);
    
    // Set dir attribute on document body
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    
    // Add a class to the body for RTL-specific styling if needed
    if (language === "ar") {
      document.body.classList.add("rtl");
    } else {
      document.body.classList.remove("rtl");
    }
  }, [language]);

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}; 