import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Target, Zap, Shield, Code, Database, Smartphone, Palette } from "lucide-react";
import Navbar from "../components/Navbar";
import { useLanguage } from "../components/LanguageProvider";

const About = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Users,
      title: "Team Formation",
      description: "Create detailed team requests specifying exactly what skills and expertise you need."
    },
    {
      icon: Shield,
      title: "Ownership Security",
      description: "Browser fingerprinting ensures only you can edit or delete your team requests."
    },
    {
      icon: Zap,
      title: "Real-time Sync",
      description: "Updates sync across all browser tabs instantly using BroadcastChannel API."
    },
    {
      icon: Database,
      title: "Offline Storage",
      description: "All data is stored locally using IndexedDB with cloud backup via Supabase."
    }
  ];

  const techStack = [
    { name: "React", category: "Frontend", color: "bg-blue-500" },
    { name: "TypeScript", category: "Language", color: "bg-blue-600" },
    { name: "Vite", category: "Build Tool", color: "bg-yellow-500" },
    { name: "ShadCN UI", category: "UI Library", color: "bg-gray-800" },
    { name: "Framer Motion", category: "Animation", color: "bg-pink-500" },
    { name: "React Router", category: "Routing", color: "bg-red-500" },
    { name: "IndexedDB", category: "Storage", color: "bg-green-600" },
    { name: "Supabase", category: "Database", color: "bg-emerald-500" },
    { name: "Express.js", category: "Backend", color: "bg-gray-600" },
    { name: "Tailwind CSS", category: "Styling", color: "bg-blue-400" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      
      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">{t('about.how_works')}</h2>
            <p className="text-lg text-muted-foreground">
              {t('about.how_works_subtitle')}
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: t('about.step1_title'),
                  description: t('about.step1_description')
                },
                {
                  step: "2", 
                  title: t('about.step2_title'),
                  description: t('about.step2_description')
                },
                {
                  step: "3",
                  title: t('about.step3_title'),
                  description: t('about.step3_description')
                }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-6"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">{t('about.tech_stack')}</h2>
            <p className="text-lg text-muted-foreground">
              {t('about.tech_stack_subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  {t('about.tech_stack_title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {techStack.map((tech) => (
                    <div key={tech.name} className="text-center">
                      <div className={`w-12 h-12 ${tech.color} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
                        {tech.category === "Frontend" && <Smartphone className="w-6 h-6 text-white" />}
                        {tech.category === "Language" && <Code className="w-6 h-6 text-white" />}
                        {tech.category === "Build Tool" && <Zap className="w-6 h-6 text-white" />}
                        {tech.category === "UI Library" && <Palette className="w-6 h-6 text-white" />}
                        {tech.category === "Animation" && <Zap className="w-6 h-6 text-white" />}
                        {tech.category === "Routing" && <Users className="w-6 h-6 text-white" />}
                        {tech.category === "Storage" && <Database className="w-6 h-6 text-white" />}
                        {tech.category === "Styling" && <Palette className="w-6 h-6 text-white" />}
                      </div>
                      <h4 className="font-medium text-sm">{tech.name}</h4>
                      <p className="text-xs text-muted-foreground">{tech.category}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Card>
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl">{t('about.privacy_title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg text-muted-foreground">
                  {t('about.privacy_description')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div>
                    <h4 className="font-semibold mb-2">{t('about.local_storage_title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('about.local_storage_description')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('about.ownership_title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('about.ownership_description')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('about.expiry_title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('about.expiry_description')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('about.direct_comm_title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('about.direct_comm_description')}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-semibold mb-2">Supabase Database</h4>
                    <p className="text-sm text-muted-foreground">
                      We use Supabase, a secure PostgreSQL database service, to store team requests and member information. 
                      All data is encrypted in transit and at rest. We implement row-level security policies to ensure 
                      data can only be accessed by authorized users. Your information is never sold or shared with third parties.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
