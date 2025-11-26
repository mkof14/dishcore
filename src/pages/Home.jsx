import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Apple, Scale, Utensils, HelpCircle, Coffee, Activity, Sparkles, Heart, Sun, Brain } from "lucide-react";
import { motion } from "framer-motion";

const mainCategories = [];

const studioCategories = [
  {
    icon: Sparkles,
    iconColor: "#8B5CF6",
    iconBg: "rgba(139, 92, 246, 0.2)",
    title: "Longevity & Anti-Aging",
    link: createPageUrl("Studio"),
  },
  {
    icon: Scale,
    iconColor: "#3B82F6",
    iconBg: "rgba(59, 130, 246, 0.2)",
    title: "Weight Loss",
    link: createPageUrl("BodyGoals"),
  },
  {
    icon: Apple,
    iconColor: "#10B981",
    iconBg: "rgba(16, 185, 129, 0.2)",
    title: "Nutrition & Diet",
    link: createPageUrl("MenuPlanner"),
  },
  {
    icon: Activity,
    iconColor: "#F59E0B",
    iconBg: "rgba(245, 158, 11, 0.2)",
    title: "Fitness & Performance",
    link: createPageUrl("WearablesSettings"),
  },
  {
    icon: Utensils,
    iconColor: "#14B8A6",
    iconBg: "rgba(20, 184, 166, 0.2)",
    title: "Recipes & Cooking",
    link: createPageUrl("DishLibrary"),
  },
  {
    icon: Heart,
    iconColor: "#EF4444",
    iconBg: "rgba(239, 68, 68, 0.2)",
    title: "Critical Health",
    link: createPageUrl("BodyMeasurements"),
  },
  {
    icon: Sun,
    iconColor: "#F97316",
    iconBg: "rgba(249, 115, 22, 0.2)",
    title: "Everyday Wellness",
    link: createPageUrl("Tracking"),
  },
  {
    icon: Brain,
    iconColor: "#6366F1",
    iconBg: "rgba(99, 102, 241, 0.2)",
    title: "Mental Wellness",
    link: createPageUrl("AIAssistant"),
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden" style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 80px)' }}>
        
        {/* Premium Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[900px] opacity-30"
            style={{ 
              background: 'radial-gradient(ellipse at center top, rgba(45, 163, 255, 0.15) 0%, rgba(251, 191, 36, 0.08) 50%, transparent 80%)',
              filter: 'blur(100px)',
            }} 
          />
          <div className="absolute inset-0">
            {[...Array(80)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: i % 3 === 0 ? '#FF8533' : i % 3 === 1 ? '#FFB84D' : '#2DA3FF',
                  opacity: Math.random() * 0.5 + 0.2,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${Math.random() * 2 + 2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Welcome Header */}
        <section className="relative py-8 px-4 z-10 text-center">
          <motion.p 
            className="text-3xl md:text-4xl font-bold tracking-wider uppercase"
            style={{ color: 'var(--text-primary)' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Welcome to DishCore
          </motion.p>
        </section>

        {/* SECTION 1: DishCore Services - Hero with Dashboard */}
        <section className="relative py-12 md:py-20 px-4 z-10">
          <div className="max-w-[1440px] mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Left - Text & CTA */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-8"
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1]">
                  <span style={{ color: 'var(--text-primary)' }}>Stay healthy, fit &<br/>inspired with DishCore</span>
                </h1>
                
                <p className="text-xl md:text-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  The AI-powered nutrition platform for personalized,<br className="hidden md:block" />
                  healthy eating and staying fit.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link to={createPageUrl("Dashboard")}>
                    <Button className="px-10 py-7 text-lg rounded-full font-semibold text-white border-0 hover:scale-105 transition-transform"
                      style={{ 
                        background: 'linear-gradient(135deg, #2DA3FF, #0A84FF)',
                        boxShadow: '0 8px 30px rgba(45, 163, 255, 0.4)',
                      }}>
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
                
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  7-day free trial. Cancel anytime.
                </p>
              </motion.div>

              {/* Right - Dashboard Mockup */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="relative"
              >
                <div 
                  className="absolute -inset-4 rounded-[32px] opacity-40 blur-3xl"
                  style={{ 
                    background: 'radial-gradient(circle at center, rgba(45, 163, 255, 0.5) 0%, transparent 70%)',
                  }} 
                />
                
                <div className="relative rounded-[32px] p-6 md:p-8 space-y-5"
                  style={{
                    background: 'var(--bg-card, rgba(13, 31, 54, 0.7))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-soft)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                  }}>
                  
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6917c77b0e566a8b7a19860e/992333ee8_DishCore3.png"
                      alt="DishCore"
                      className="w-10 h-10"
                    />
                    <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>DishCore</span>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                      Good morning, DNA! 👋
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Here's a health DNA News
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 rounded-full" style={{ background: '#FF6600' }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Eating</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Link to={createPageUrl("Tracking")}>
                        <button className="w-full p-4 rounded-2xl text-left transition-all hover:scale-105 flex items-center gap-3"
                          style={{ 
                            background: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid rgba(59, 130, 246, 0.3)'
                          }}>
                          <Coffee className="w-5 h-5 text-blue-400" />
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Breakfast</span>
                        </button>
                      </Link>
                      
                      <Link to={createPageUrl("Tracking")}>
                        <button className="w-full p-4 rounded-2xl text-left transition-all hover:scale-105 flex items-center gap-3"
                          style={{ 
                            background: 'rgba(139, 92, 246, 0.15)',
                            border: '1px solid rgba(139, 92, 246, 0.3)'
                          }}>
                          <Utensils className="w-5 h-5 text-purple-400" />
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Log Meal</span>
                        </button>
                      </Link>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 rounded-full" style={{ background: '#FF6600' }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>New multi-dish</span>
                    </div>
                  </div>
                  
                  <div className="relative rounded-2xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop"
                      alt="Healthy meal"
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>

                  <Link to={createPageUrl("Tracking")}>
                    <div className="rounded-2xl p-4 cursor-pointer hover:scale-105 transition-transform"
                      style={{ 
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-soft)'
                      }}>
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Hydration</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        2/8 cups • Keep going!
                      </p>
                    </div>
                  </Link>

                  <Link to={createPageUrl("Analytics")}>
                    <div className="rounded-2xl p-4 cursor-pointer hover:scale-105 transition-transform"
                      style={{ 
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-soft)'
                      }}>
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Nutritive Overcap</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Calories: 1250 • Protein: 85g
                      </p>
                    </div>
                  </Link>
                  
                  <Link to={createPageUrl("WearablesSettings")}>
                    <div className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
                      style={{ 
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-soft)'
                      }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(45, 163, 255, 0.2)' }}>
                        <Activity className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>
                          Connect Your Wearable Device
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Your daily health data sync
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>DishCore</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        AI-driven health technology
                      </p>
                    </div>
                    <Link to={createPageUrl("Dashboard")}>
                      <Button className="px-6 py-2 text-sm rounded-full text-white border-0 hover:scale-105 transition-transform"
                        style={{ 
                          background: 'linear-gradient(135deg, #2DA3FF, #0A84FF)',
                        }}>
                        Explore
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>



        {/* SECTION 2: DishCore Studio */}
        <section className="relative py-20 px-4 z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                DishCore Studio™
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Harness the power of AI to transform your nutritional journey.
              </p>
              <Link to={createPageUrl("Studio")}>
                <Button className="px-10 py-6 text-lg rounded-full font-semibold text-white border-0 hover:scale-105 transition-transform"
                  style={{ 
                    background: 'linear-gradient(135deg, #2DA3FF, #0A84FF)',
                    boxShadow: '0 8px 30px rgba(45, 163, 255, 0.4)',
                  }}>
                  Explore Studio
                </Button>
              </Link>
            </motion.div>

            {/* AI Intelligence Block */}
            <motion.div
              className="rounded-3xl p-8 md:p-12 mb-12"
              style={{
                background: 'var(--bg-card, rgba(13, 31, 54, 0.6))',
                border: '1px solid var(--border-soft)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                AI-Powered Nutrition Intelligence
              </h3>
              <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Discover how DishCore's intelligent AI adapts to your needs, creating personalized menus and tracking your nutrition with advanced precision.
              </p>
            </motion.div>

            {/* Health Categories Title */}
            <h3 className="text-3xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
              Health Categories
            </h3>
            
            {/* Studio Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {studioCategories.map((category, idx) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={category.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                  >
                    <Link to={category.link}>
                      <div className="p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 cursor-pointer"
                        style={{ 
                          background: 'var(--bg-card, rgba(13, 31, 54, 0.6))',
                          border: '1px solid var(--border-soft)',
                        }}>
                        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-300"
                          style={{ 
                            background: category.iconBg,
                          }}>
                          <Icon className="w-8 h-8" style={{ color: category.iconColor }} />
                        </div>
                        <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                          {category.title}
                        </h4>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="h-20" />
      </div>
  );
}