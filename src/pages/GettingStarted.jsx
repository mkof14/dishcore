import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Ruler,
  Target,
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  FileText,
  Activity,
  Utensils,
  PartyPopper
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    id: 1,
    title: "Set Up Your Profile",
    icon: User,
    description: "Your main personal profile. It tells DishCore who you are, your age, sex, height, weight, and preferred units.",
    details: [
      "Enter your age",
      "Choose your sex",
      "Set your height",
      "Set your starting weight",
      "Choose your units (kg/lbs, cm/inch)",
      "Select your language"
    ],
    why: "All recommendations, menus, and reports become more accurate with correct profile info.",
    tips: [
      "Updating age yearly improves calculations",
      "If unsure about exact weight — approximate is OK"
    ],
    actionLink: createPageUrl("Profile"),
    actionText: "Open My Profile"
  },
  {
    id: 2,
    title: "Add Body Measurements",
    icon: Ruler,
    description: "Your key physical indicators: weight, waist, hips, chest, neck, body fat (optional).",
    details: [
      "Add weight (today)",
      "Measure waist (at the narrowest point)",
      "Measure hips and chest (optional but helpful)",
      "Add neck (optional)",
      "If you know body fat % — add it"
    ],
    why: "These values influence calorie targets, menu adaptation, progress tracking, metabolism analysis, and DishCore Studio insights.",
    tips: [
      "Update weight 1–3 times per week",
      "Waist updates let you track real body changes even when weight is stable"
    ],
    actionLink: createPageUrl("BodyMeasurements"),
    actionText: "Open Body Measurements"
  },
  {
    id: 3,
    title: "Set Your Goals",
    icon: Target,
    description: "Your desired direction: lose weight, maintain, gain muscle, improve health, or balance energy.",
    details: [
      "Select your main goal",
      "Choose your pace (slow, medium, fast)",
      "Confirm"
    ],
    why: "Your goals control daily calories, dish suggestions, meal composition, and training recommendations.",
    tips: [
      "Slow pace = more sustainable progress",
      "You can switch goals any time"
    ],
    actionLink: createPageUrl("BodyGoals"),
    actionText: "Open Body Goals"
  },
  {
    id: 4,
    title: "Explore Your Dashboard",
    icon: LayoutDashboard,
    description: "Your home screen with key daily indicators.",
    details: [
      "DishCore Score",
      "Daily calorie target",
      "Progress ring",
      "Trends",
      "Alerts & recommendations"
    ],
    why: "It gives you a big-picture overview of your health direction.",
    tips: [
      "Read your score explanation",
      "Check recommended actions for today"
    ],
    actionLink: createPageUrl("Dashboard"),
    actionText: "Go to Dashboard"
  },
  {
    id: 5,
    title: "Discover DishCore Studio™",
    icon: Sparkles,
    description: "A deeper, more advanced layer of your DishCore experience.",
    details: [
      "DishCore Score engine",
      "Metabolism Map",
      "Adaptive Menu Engine",
      "Weekly Insights",
      "Advanced reports",
      "Trend analytics"
    ],
    why: "Studio reveals how your body responds to food and lifestyle patterns.",
    tips: [
      "Open Studio",
      "Look at the Score",
      "Explore your trends",
      "View your Weekly Insight"
    ],
    actionLink: createPageUrl("Studio"),
    actionText: "Open DishCore Studio™"
  },
  {
    id: 6,
    title: "Build Your Menu for the Week",
    icon: CalendarDays,
    description: "A personalized weekly meal plan adapted to your goals and body.",
    details: [
      "Review suggested meals for today",
      "Swap dishes you don't like",
      "Try filters: high protein, low carb, budget, quick meals",
      "Save the weekly plan"
    ],
    why: "Menu Planner is where your everyday healthy routine is built.",
    tips: [
      "You can regenerate menus anytime",
      "DishCore adapts your meals as your data changes"
    ],
    actionLink: createPageUrl("MenuPlanner"),
    actionText: "Go to Menu Planner"
  },
  {
    id: 7,
    title: "Learn About Reports",
    icon: FileText,
    description: "A summary of your performance, habits, progress, and menu indicators.",
    details: [
      "DishCore Score changes",
      "Total calories",
      "Macro balance",
      "Body measurements",
      "Menu adherence",
      "Recommendations"
    ],
    why: "Reports help you understand patterns and share progress with healthcare professionals.",
    tips: [
      "Copy report",
      "Download as PDF",
      "Share with coach/doctor"
    ],
    actionLink: createPageUrl("Reports"),
    actionText: "Open Reports & Share"
  },
  {
    id: 8,
    title: "Track Your Lifestyle",
    icon: Activity,
    description: "Track steps, sleep, water, mood, symptoms, food intake, and wearables.",
    details: [
      "Steps",
      "Sleep",
      "Water",
      "Mood",
      "Symptoms",
      "Food intake",
      "Wearables (Apple Health, Fitbit)"
    ],
    why: "Tracking improves the accuracy of the Adaptive Menu and Studio Score.",
    tips: [
      "Connect wearables for automatic tracking",
      "Log daily for best results"
    ],
    actionLink: createPageUrl("Tracking"),
    actionText: "Open Tracking"
  },
  {
    id: 9,
    title: "Explore Extra Tools",
    icon: Utensils,
    description: "Discover powerful features to enhance your experience.",
    details: [
      "Dish Library (all dishes)",
      "Food Scanner (photo-based)",
      "Restaurant Mode",
      "Grocery List",
      "Achievements",
      "Community"
    ],
    why: "These tools make healthy living easier and more engaging.",
    tips: [
      "Food Scanner analyzes photos instantly",
      "Join community challenges for motivation"
    ],
    actionLink: createPageUrl("DishLibrary"),
    actionText: "View Extra Tools"
  },
  {
    id: 10,
    title: "Congratulations!",
    icon: PartyPopper,
    description: "You've finished the introduction. DishCore is now tuned to you — enjoy the journey.",
    details: [
      "Your profile is complete",
      "You know how to navigate DishCore",
      "You understand the key features",
      "You're ready to track and optimize your health"
    ],
    why: "You now have all the tools to succeed on your health journey.",
    tips: [
      "Check Dashboard daily",
      "Log meals consistently",
      "Review weekly reports",
      "Adjust goals as you progress"
    ],
    actionLink: createPageUrl("Dashboard"),
    actionText: "Go to Dashboard"
  }
];

export default function GettingStarted() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("LearningCenter")}>
            <Button variant="outline" size="icon" style={{ borderColor: 'var(--border)' }}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Getting Started
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Your step-by-step guide to mastering DishCore
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Steps Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="gradient-card border-0 p-4 rounded-3xl sticky top-6">
              <h3 className="font-bold mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>
                Steps ({currentStep + 1}/{steps.length})
              </h3>
              <div className="space-y-2">
                {steps.map((s, idx) => {
                  const StepIcon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setCurrentStep(idx)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                        idx === currentStep ? 'gradient-accent text-white' : ''
                      }`}
                      style={
                        idx !== currentStep
                          ? { background: 'var(--bg-surface-alt)', border: '1px solid var(--border-soft)' }
                          : {}
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          idx === currentStep ? 'bg-white/20' : ''
                        }`}
                        style={
                          idx !== currentStep
                            ? { background: 'var(--bg-surface)' }
                            : {}
                        }>
                          <StepIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate">
                            Step {s.id}
                          </p>
                          <p className="text-xs truncate opacity-80">
                            {s.title}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="gradient-card border-0 p-8 rounded-3xl">
                  
                  {/* Step Header */}
                  <div className="flex items-start gap-6 mb-8">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-2xl flex-shrink-0">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold px-3 py-1 rounded-full"
                          style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-muted)' }}>
                          Step {step.id} of {steps.length}
                        </span>
                      </div>
                      <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                        {step.title}
                      </h2>
                      <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* What to do */}
                  <div className="mb-8">
                    <h3 className="font-bold mb-4 flex items-center gap-2" 
                      style={{ color: 'var(--text-primary)' }}>
                      <Check className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
                      What to do:
                    </h3>
                    <ul className="space-y-3">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-4 rounded-xl"
                          style={{ background: 'var(--bg-surface-alt)' }}>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">{idx + 1}</span>
                          </div>
                          <span style={{ color: 'var(--text-secondary)' }}>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Why it matters */}
                  <div className="mb-8 p-6 rounded-2xl"
                    style={{ background: 'var(--bg-surface-alt)', border: '2px solid var(--border-soft)' }}>
                    <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                      💡 Why this matters
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {step.why}
                    </p>
                  </div>

                  {/* Tips */}
                  {step.tips && step.tips.length > 0 && (
                    <div className="mb-8">
                      <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                        📌 Tips
                      </h3>
                      <ul className="space-y-2">
                        {step.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm"
                            style={{ color: 'var(--text-secondary)' }}>
                            <span>•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex items-center justify-between pt-6 border-t"
                    style={{ borderColor: 'var(--border-soft)' }}>
                    <div className="flex gap-3">
                      <Button
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        variant="outline"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={currentStep === steps.length - 1}
                        variant="outline"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                    <Link to={step.actionLink}>
                      <Button className="gradient-accent text-white border-0">
                        {step.actionText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}