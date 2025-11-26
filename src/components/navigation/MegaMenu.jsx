import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MENU_SECTIONS = {
  products: {
    title: "Products",
    items: [
      { name: "DishCore Studio™", link: createPageUrl("Studio") },
      { name: "AI Menu Planner", link: createPageUrl("MenuPlanner") },
      { name: "Dish Library", link: createPageUrl("DishLibrary") },
      { name: "AI DishCore Advisor", link: createPageUrl("AIAssistant") },
      { name: "Food Scanner", link: createPageUrl("FoodScanner") },
      { name: "Analytics Dashboard", link: createPageUrl("Analytics") },
      { name: "Restaurant Mode", link: createPageUrl("RestaurantMode") },
      { name: "Wearable Sync", link: createPageUrl("WearablesSettings") }
    ]
  },
  solutions: {
    title: "Solutions",
    items: [
      { name: "Weight Loss", link: createPageUrl("KnowledgeBase") },
      { name: "Sports Nutrition", link: createPageUrl("KnowledgeBase") },
      { name: "Anti-Aging", link: createPageUrl("KnowledgeBase") },
      { name: "Healthy Lifestyle", link: createPageUrl("KnowledgeBase") },
      { name: "Plant-Based Nutrition", link: createPageUrl("KnowledgeBase") },
      { name: "Meal Prep", link: createPageUrl("KnowledgeBase") },
      { name: "Balanced Nutrition", link: createPageUrl("KnowledgeBase") },
      { name: "Medical Diets", link: createPageUrl("KnowledgeBase") }
    ]
  },
  resources: {
    title: "Resources",
    items: [
      { name: "Knowledge Base", link: createPageUrl("KnowledgeBase") },
      { name: "Learning Center", link: createPageUrl("LearningCenter") },
      { name: "FAQs", link: createPageUrl("FAQ") },
      { name: "Getting Started", link: createPageUrl("GettingStarted") }
    ]
  },
  company: {
    title: "Company",
    items: [
      { name: "About", link: createPageUrl("About") },
      { name: "Contact", link: "#contact" },
      { name: "Careers", link: "#careers" },
      { name: "Press Kit", link: "#press" }
    ]
  }
};

export default function MegaMenu() {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <div className="relative">
      <div className="flex items-center gap-8">
        {Object.entries(MENU_SECTIONS).map(([key, section]) => (
          <div
            key={key}
            className="relative"
            onMouseEnter={() => setActiveSection(key)}
            onMouseLeave={() => setActiveSection(null)}
          >
            <button className="flex items-center gap-2 py-2 transition-colors hover:opacity-80"
              style={{ color: 'var(--text-primary)' }}>
              {section.title}
              <ChevronDown className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {activeSection === key && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-64 p-4 rounded-2xl shadow-xl z-50"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)' }}
                >
                  <div className="space-y-2">
                    {section.items.map((item, idx) => (
                      <Link
                        key={idx}
                        to={item.link}
                        className="block px-4 py-2 rounded-lg transition-colors hover:bg-white/5"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}