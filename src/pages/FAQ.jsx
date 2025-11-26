import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  User,
  Ruler,
  Utensils,
  Sparkles,
  Share2,
  Settings,
  Activity,
  Target,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqData = [
  {
    category: "Getting Started",
    icon: HelpCircle,
    questions: [
      {
        q: "What is DishCore and how does it work?",
        a: "DishCore analyzes your data (height, weight, measurements, preferences, goals) and creates adaptive menus, recommendations, and reports. Every day the system becomes more accurate by adapting to your lifestyle."
      },
      {
        q: "Where should I start in DishCore?",
        a: "1. Fill out your profile\n2. Enter measurements\n3. Set your goal\n4. Confirm nutrition and preferences\n5. Go to Dashboard\n6. Get your first adaptive menu"
      },
      {
        q: "Can I use DishCore without updating data daily?",
        a: "Yes. The minimum is once per week. However, daily updates provide accurate forecasts and better menus."
      },
      {
        q: "On which devices does DishCore work?",
        a: "Web, mobile browser, and desktop. iOS/Android native apps are planned for the future."
      },
      {
        q: "What languages are available in DishCore?",
        a: "We support 10+ languages: EN, UA, RU, ES, FR, DE, IT, CN, JP, PT."
      },
      {
        q: "How do I change units (kg/lbs, cm/inches)?",
        a: "Go to Settings → Units. Changes are applied immediately to all functions and calculations."
      },
      {
        q: "Can I switch to a different goal (weight loss, muscle gain)?",
        a: "Yes, at any time. All menus will be recalculated automatically."
      }
    ]
  },
  {
    category: "Profile & Body Measurements",
    icon: User,
    questions: [
      {
        q: "What measurements should I enter?",
        a: "Required: Weight, Height, Waist\nOptional: Hips, Chest, Neck, Body Fat %\n\nWaist is the most important measurement after weight."
      },
      {
        q: "Why is waist the main measurement?",
        a: "Because it reflects metabolic health better than weight. Waist shows how fat changes around organs—this is important for health predictions."
      },
      {
        q: "How often should I update measurements?",
        a: "• Weight: 2-3 times per week\n• Waist: once per week\n• Others: once every 1-2 weeks"
      },
      {
        q: "How does DishCore use my data?",
        a: "To calculate: calories, macros, portions, DishCore Score, adaptive menu, and Studio analytics. Your data is never shared with third parties."
      },
      {
        q: "What if my measurements fluctuate?",
        a: "This is normal. DishCore looks at trends, not individual days. Daily fluctuations from water, food, and hormones are expected."
      }
    ]
  },
  {
    category: "Goals & Progress",
    icon: Target,
    questions: [
      {
        q: "What goals are available?",
        a: "• Weight Loss\n• Maintenance\n• Muscle Gain\n• Fitness & Tone\n• Health Improvement"
      },
      {
        q: "What is Progress Tracking?",
        a: "A dynamic dashboard with: graphs, progress bars, status indicators, trends, and daily scores."
      },
      {
        q: "Why don't I see progress?",
        a: "Common reasons:\n1. No measurement updates\n2. Not enough menu data\n3. Strong water fluctuations\n4. Initial adaptation period\n\nGive it 7-14 days for trends to stabilize."
      },
      {
        q: "How quickly should I expect changes?",
        a: "Typically 7-14 days. DishCore assesses movement by trends, not by one day. Sustainable progress is gradual."
      }
    ]
  },
  {
    category: "Adaptive Menu & Nutrition",
    icon: Utensils,
    questions: [
      {
        q: "How does the adaptive menu work?",
        a: "The system considers: your goals, macros, measurements, preferences, allergen restrictions, trends, and DishCore Studio Score. Menus are recalculated every time you update data."
      },
      {
        q: "Can I manually change dishes?",
        a: "Yes: Swap, Edit, Replace, or View Alternatives. The system learns your preferences over time."
      },
      {
        q: "How does DishCore choose portion sizes?",
        a: "Portions are formed based on: your energy density, activity levels, body profile, previous days' menus, and trend stability."
      },
      {
        q: "What is Dish Quality Score?",
        a: "A score evaluating: composition, protein profile, fiber, satiety, timing window, and impact on stability."
      },
      {
        q: "Can I use only dinners or only lunches?",
        a: "Yes. Through Filters → Meal Type, you can customize your meal plan structure."
      },
      {
        q: "Can I connect different world cuisines?",
        a: "Yes: Italian, Japanese, Asian, American, French, Mediterranean, Ukrainian, Mexican, Middle Eastern, and more."
      },
      {
        q: "What if a dish is unpopular or doesn't suit me?",
        a: "Enable filters or create personal preferences. Mark dishes as 'never suggest again' or adjust your profile to refine suggestions."
      }
    ]
  },
  {
    category: "DishCore Studio™",
    icon: Sparkles,
    questions: [
      {
        q: "What is DishCore Studio™?",
        a: "Premium analytics including: Metabolism Map, Studio Score, Weekly Insights, Trends & Curves, Variability Analysis, and Food Signatures."
      },
      {
        q: "How is Studio Score calculated?",
        a: "Based on: stability, nutrition, goal alignment, routine, dish quality, activity, and measurements. Score ranges from 0-100."
      },
      {
        q: "Why might my Score drop?",
        a: "Common reasons:\n• Sleep deficit\n• High stress\n• Frequent calorie fluctuations\n• Skipped meals\n• Activity below normal"
      },
      {
        q: "Where can I see improvement recommendations?",
        a: "In the Weekly Insights section. It shows the week's issues and what to fix."
      },
      {
        q: "Why do I have two Scores: daily and weekly?",
        a: "Because: daily reflects the moment, weekly shows the trend. Weekly is more meaningful for progress."
      }
    ]
  },
  {
    category: "Tracking & Tools",
    icon: Activity,
    questions: [
      {
        q: "What can I track manually?",
        a: "• Water\n• Steps\n• Sleep\n• Mood\n• Portions\n• Activity\n• Symptoms\n• Energy levels\n• Cravings"
      },
      {
        q: "What is Food Scanner for?",
        a: "You photograph your plate → the system recognizes the dish and estimates calories and macros using AI."
      },
      {
        q: "How does Restaurant Mode work?",
        a: "You select cuisine type or dish → DishCore suggests: approximate values, healthier versions, and optimal choices."
      },
      {
        q: "How does Grocery List work?",
        a: "DishCore generates an ingredient list for the week. You can download as PDF or share with others."
      },
      {
        q: "Can I save my own dishes?",
        a: "Yes—in Dish Library → Create Dish. Add your own recipes with custom ingredients and nutrition."
      },
      {
        q: "Are wearables supported?",
        a: "Coming soon: Apple Health, Garmin, Fitbit, Oura. Integration will enable automatic step, sleep, and activity tracking."
      }
    ]
  },
  {
    category: "Reports",
    icon: Share2,
    questions: [
      {
        q: "What reports are available?",
        a: "• Daily Report\n• Weekly Report\n• Studio Analysis\n• Menu Breakdown\n• Macro Dashboard\n• Custom date ranges"
      },
      {
        q: "Can I download reports?",
        a: "Yes: Download PDF, Copy to clipboard, Share link, or Export as JSON (optional)."
      },
      {
        q: "Not all data appears in reports. What should I do?",
        a: "Check:\n• Are measurements filled in?\n• Are dishes logged for the day?\n• Is activity entered?\n\nReports require minimum data to generate."
      }
    ]
  },
  {
    category: "Settings & Interface",
    icon: Settings,
    questions: [
      {
        q: "Where do I change theme (light/dark)?",
        a: "Settings → Appearance. Or use the theme toggle button (sun/moon icon) in the top-right corner."
      },
      {
        q: "Can I change color scheme?",
        a: "The DishCore Premium theme allows choosing: dark blue, deep graphite, clean light, or minimal white."
      },
      {
        q: "How do I change language?",
        a: "Settings → Language. Select from 10+ supported languages. Changes apply immediately."
      },
      {
        q: "How do I update my profile?",
        a: "My Profile → Edit. You can change any information except account email."
      },
      {
        q: "My data disappeared. What should I do?",
        a: "Most likely:\n• Wrong account\n• Wrong email\n• Browser cache issue\n\nSolution: Log out and log back in. If the problem persists, contact support."
      }
    ]
  },
  {
    category: "Account & Privacy",
    icon: Shield,
    questions: [
      {
        q: "Can I delete my data?",
        a: "Yes. Settings → Privacy → Delete Data. All personal information will be permanently removed within 30 days."
      },
      {
        q: "Is my data used for advertising?",
        a: "No. No data sharing with third parties. Your information is used exclusively for your personalized experience."
      },
      {
        q: "Can I use DishCore without registration?",
        a: "No, because personal calculations require an account with your unique data."
      },
      {
        q: "Can I connect a second account?",
        a: "Yes, but data is not merged between accounts. Each account is independent."
      },
      {
        q: "How do I recover access?",
        a: "Through email login or passwordless authentication. Click 'Forgot Password' on the login page."
      }
    ]
  },
  {
    category: "Troubleshooting",
    icon: Ruler,
    questions: [
      {
        q: "My dishes are not updating.",
        a: "Check:\n• Were measurements updated?\n• Is your goal set?\n• Language/units correct?\n• Filters not too restrictive?\n\nTry regenerating the menu or clearing filters."
      },
      {
        q: "Photo in Food Scanner is not recognized.",
        a: "Common reasons:\n• Strong light or shadows\n• Very mixed dishes\n• Unusual angle\n\nTip: Take 2-3 photos from different angles. Use natural lighting when possible."
      },
      {
        q: "Predictions look strange.",
        a: "This is normal for the first 7 days—the system is learning. Give it 2 weeks of consistent data for accurate predictions."
      },
      {
        q: "Nothing works / white screen.",
        a: "Try:\n• Refresh the page\n• Disable VPN\n• Open in another browser\n• Clear cache\n• Check internet connection"
      },
      {
        q: "How do I report a problem?",
        a: "Settings → Support → Report Issue. Include a description of the problem and screenshots if possible."
      },
      {
        q: "App is running slow.",
        a: "Quick fixes:\n• Close other tabs\n• Clear browser cache\n• Disable browser extensions\n• Restart browser\n• Try incognito mode"
      },
      {
        q: "Data not syncing between devices.",
        a: "Ensure:\n• Logged into the same account\n• Internet connection is stable\n• Force sync from Settings\n• Log out and back in if issue persists"
      },
      {
        q: "DishCore Score seems incorrect.",
        a: "Score reflects the full day, not just one meal. Check:\n• All meals logged?\n• Hydration tracked?\n• Sleep entered?\n\nView Score breakdown in Studio for details."
      }
    ]
  }
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openQuestions, setOpenQuestions] = useState([]);

  const toggleQuestion = (categoryIdx, questionIdx) => {
    const key = `${categoryIdx}-${questionIdx}`;
    setOpenQuestions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const filteredFAQ = faqData
    .filter(cat => selectedCategory === "all" || cat.category === selectedCategory)
    .map(category => ({
      ...category,
      questions: category.questions.filter(
        q =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-5xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("LearningCenter")}>
            <Button variant="outline" size="icon" style={{ borderColor: 'var(--border)' }}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Frequently Asked Questions
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Quick answers to common questions — 50+ topics covered
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
              style={{ color: 'var(--text-muted)' }} />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base rounded-2xl"
              style={{ 
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-soft)'
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            onClick={() => setSelectedCategory("all")}
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            className={selectedCategory === "all" ? "gradient-accent text-white border-0" : ""}
            style={selectedCategory !== "all" ? { borderColor: 'var(--border)' } : {}}
          >
            All
          </Button>
          {faqData.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                variant={selectedCategory === cat.category ? "default" : "outline"}
                size="sm"
                className={selectedCategory === cat.category ? "gradient-accent text-white border-0" : ""}
                style={selectedCategory !== cat.category ? { borderColor: 'var(--border)' } : {}}
              >
                <Icon className="w-4 h-4 mr-2" />
                {cat.category}
              </Button>
            );
          })}
        </div>

        <div className="space-y-6">
          {filteredFAQ.map((category, catIdx) => {
            const Icon = category.icon;
            return (
              <div key={category.category}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {category.category}
                  </h2>
                  <span className="text-sm px-3 py-1 rounded-full" 
                    style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-muted)' }}>
                    {category.questions.length} questions
                  </span>
                </div>

                <Card className="gradient-card border-0 rounded-3xl overflow-hidden">
                  {category.questions.map((item, qIdx) => {
                    const isOpen = openQuestions.includes(`${catIdx}-${qIdx}`);
                    return (
                      <div
                        key={qIdx}
                        className={qIdx !== category.questions.length - 1 ? "border-b" : ""}
                        style={{ borderColor: 'var(--border-soft)' }}
                      >
                        <button
                          onClick={() => toggleQuestion(catIdx, qIdx)}
                          className="w-full p-6 text-left flex items-start justify-between gap-4 hover:bg-opacity-50 transition-all"
                          style={{ background: isOpen ? 'var(--bg-surface-alt)' : 'transparent' }}
                        >
                          <span className="font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
                            {item.q}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 flex-shrink-0 mt-0.5" 
                              style={{ color: 'var(--accent-from)' }} />
                          ) : (
                            <ChevronDown className="w-5 h-5 flex-shrink-0 mt-0.5" 
                              style={{ color: 'var(--text-muted)' }} />
                          )}
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="px-6 pb-6">
                                {item.a.split('\n').map((line, idx) => (
                                  <p key={idx} className="leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    {line}
                                  </p>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </Card>
              </div>
            );
          })}

          {filteredFAQ.length === 0 && (
            <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
              <HelpCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                No questions found
              </h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Try adjusting your search or browse all categories
              </p>
            </Card>
          )}
        </div>

        <Card className="gradient-card border-0 p-8 rounded-3xl text-center mt-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
          <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Still have questions?
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to={createPageUrl("KnowledgeBase")}>
              <Button variant="outline" style={{ borderColor: 'var(--border)' }}>
                Browse Knowledge Base
              </Button>
            </Link>
            <Button className="gradient-accent text-white border-0">
              Contact Support
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}