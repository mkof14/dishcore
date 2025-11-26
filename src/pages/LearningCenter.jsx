import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Rocket,
  HelpCircle,
  Search,
  ArrowRight,
  Lightbulb,
  FileText,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";

export default function LearningCenter() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const mainSections = [
    {
      icon: Rocket,
      title: "Getting Started",
      description: "Step-by-step guide to your first week with DishCore.",
      link: createPageUrl("GettingStarted"),
      buttonText: "Start here",
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      icon: BookOpen,
      title: "Knowledge Base",
      description: "Explore guides by topic: measurements, menus, reports and more.",
      link: createPageUrl("KnowledgeBase"),
      buttonText: "Browse topics",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      icon: HelpCircle,
      title: "FAQ",
      description: "Quick answers to common questions.",
      link: createPageUrl("FAQ"),
      buttonText: "View FAQ",
      gradient: "from-green-400 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-block p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-4">
            <Lightbulb className="w-12 h-12" style={{ color: 'var(--accent-from)' }} />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Learning Center
          </h1>
          
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Everything you need to get comfortable with DishCore.
          </p>
          
          <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Start with the basics, explore detailed guides, or find quick answers to your questions.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
              style={{ color: 'var(--text-muted)' }} />
            <Input
              placeholder="Search for help articles, guides, and FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base rounded-2xl"
              style={{ 
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-soft)'
              }}
            />
          </div>
        </motion.div>

        {/* Main Sections Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {mainSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="gradient-card border-0 p-8 rounded-3xl h-full flex flex-col hover:scale-105 transition-transform duration-300">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-6 shadow-xl`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    {section.title}
                  </h3>
                  
                  <p className="text-sm mb-6 flex-1" style={{ color: 'var(--text-secondary)' }}>
                    {section.description}
                  </p>
                  
                  <Link to={section.link}>
                    <Button className="w-full gradient-accent text-white border-0">
                      {section.buttonText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Links Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="gradient-card border-0 p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Popular Topics
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "What is DishCore Studio?", icon: FileText },
                { title: "How to set body goals", icon: MessageSquare },
                { title: "Understanding DishCore Score", icon: FileText },
                { title: "Creating your first menu", icon: MessageSquare },
                { title: "Connecting wearables", icon: FileText },
                { title: "Sharing reports with coach", icon: MessageSquare }
              ].map((topic, idx) => {
                const TopicIcon = topic.icon;
                return (
                  <Link
                    key={idx}
                    to={createPageUrl("KnowledgeBase")}
                    className="p-4 rounded-xl hover:scale-105 transition-all duration-200"
                    style={{ 
                      background: 'var(--bg-surface-alt)',
                      border: '1px solid var(--border-soft)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <TopicIcon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent-from)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {topic.title}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Help Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="gradient-card border-0 p-8 rounded-3xl text-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Need more help?
            </h3>
            <p className="text-sm mb-6 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Can't find what you're looking for? Our support team is here to help you succeed.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button variant="outline" style={{ borderColor: 'var(--border)' }}>
                Contact Support
              </Button>
              <Button variant="outline" style={{ borderColor: 'var(--border)' }}>
                Send Feedback
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}