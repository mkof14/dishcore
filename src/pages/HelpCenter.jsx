import React from "react";
import PublicLayout from "../components/layouts/PublicLayout";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, FileText, HelpCircle, Search } from "lucide-react";

const helpSections = [
  {
    title: "Learning Center",
    description: "Detailed, in-depth guides to get started fast",
    icon: BookOpen,
    link: createPageUrl("LearningCenter"),
  },
  {
    title: "Knowledge Base",
    description: "Comprehensive documentation and personalized resources",
    icon: FileText,
    link: createPageUrl("KnowledgeBase"),
  },
  {
    title: "FAQ",
    description: "Answer frequently asked questions on many common topics",
    icon: HelpCircle,
    link: createPageUrl("FAQ"),
  },
];

export default function HelpCenter() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-24 md:py-40 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 text-white">
            Help Center
          </h1>
          <p className="text-xl md:text-2xl mb-12 leading-relaxed" style={{ color: '#B8C5D6' }}>
            Find answers and articles to help you get the<br />most out of DishCore.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#7B8BA3' }} />
              <Input 
                placeholder="Search articles..."
                className="pl-12 py-6 text-lg rounded-xl text-white"
                style={{ background: '#141B3D', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              />
            </div>
          </div>

          {/* Get Started Button */}
          <Link to={createPageUrl("GettingStarted")}>
            <Button 
              className="px-10 py-6 text-lg rounded-full font-semibold text-white"
              style={{ background: 'transparent', border: '2px solid #00A3E3', color: '#00A3E3' }}>
              Getting Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Main Help Sections */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {helpSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link key={section.title} to={section.link}>
                  <Card className="p-8 h-full feature-card text-left"
                    style={{ background: '#141B3D', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div className="w-14 h-14 rounded-xl mb-6 flex items-center justify-center"
                      style={{ background: 'rgba(0, 163, 227, 0.1)' }}>
                      <Icon className="w-7 h-7" style={{ color: '#00A3E3' }} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">
                      {section.title}
                    </h3>
                    <p className="leading-relaxed" style={{ color: '#7B8BA3' }}>
                      {section.description}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Browse by Category Section */}
      <section className="py-20 px-4" style={{ background: '#141B3D' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
            Browse Articles by Category
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Nutrition & Diet", topics: ["Heartful Diet", "Calories & Macros", "Recipes & Ideas"] },
              { title: "Weight Loss", topics: ["Getting Started", "Meal Planning", "Progress Tracking"] },
              { title: "Recipes & Cooking", topics: ["Beginner Recipes", "Quick & Easy", "Meal Prep"] },
              { title: "Troubleshooting", topics: ["Popular FAQs", "Feature Not Working", "Common Issues"] },
              { title: "Account & Settings", topics: ["Account Management", "Privacy Settings", "Device Sync"] },
            ].map((category) => (
              <Card key={category.title} className="p-6"
                style={{ background: '#0A0E27', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#00A3E3' }}>
                  {category.title}
                </h3>
                <ul className="space-y-3">
                  {category.topics.map((topic) => (
                    <li key={topic}>
                      <a href="#" className="text-sm hover:text-blue-400 transition-colors" 
                        style={{ color: '#B8C5D6' }}>
                        {topic}
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}