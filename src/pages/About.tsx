
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Target, Zap, Shield, Code, Database, Smartphone, Palette } from "lucide-react";
import Navbar from "../components/Navbar";

const About = () => {
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
      description: "All data is stored locally using IndexedDB - no servers, no data collection."
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
    { name: "CSS Modules", category: "Styling", color: "bg-purple-500" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              About TeamForge
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A modern, privacy-focused platform for connecting talented individuals and building amazing teams for hackathons, projects, and startups.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We believe that great ideas come to life when passionate people work together. 
                  TeamForge makes it easy to find the perfect teammates by allowing you to specify 
                  exactly what skills, expertise, and qualities you're looking for. Whether you're 
                  preparing for a hackathon, starting a side project, or building the next big startup, 
                  we help you assemble the dream team to make it happen.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-lg text-muted-foreground">
              Powerful tools designed to make team formation simple and effective
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Simple steps to find your perfect team
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: "Create Your Profile",
                  description: "Tell us about yourself, your skills, and what you bring to a team."
                },
                {
                  step: "2", 
                  title: "Define Team Requirements",
                  description: "Specify exactly what skills, expertise, and qualities you're looking for in teammates."
                },
                {
                  step: "3",
                  title: "Browse & Connect",
                  description: "Browse team requests, find matches, and connect via WhatsApp to start collaborating."
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
            <h2 className="text-3xl font-bold mb-4">Built With Modern Tech</h2>
            <p className="text-lg text-muted-foreground">
              A robust, performant stack focused on user experience and privacy
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
                  Technology Stack
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
                <CardTitle className="text-3xl">Privacy First</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg text-muted-foreground">
                  Your privacy matters. TeamForge is built with a privacy-first approach:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div>
                    <h4 className="font-semibold mb-2">Local Storage Only</h4>
                    <p className="text-sm text-muted-foreground">
                      All your data stays on your device using IndexedDB. No servers, no data collection.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Ownership Protection</h4>
                    <p className="text-sm text-muted-foreground">
                      Browser fingerprinting ensures only you can modify your team requests.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Auto Expiry</h4>
                    <p className="text-sm text-muted-foreground">
                      Team requests automatically expire after 90 days to keep listings fresh.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Direct Communication</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect directly via WhatsApp - no intermediary platforms or message tracking.
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
