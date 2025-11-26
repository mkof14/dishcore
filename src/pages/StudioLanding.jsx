import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Zap, 
  Target, 
  TrendingUp, 
  Calendar,
  Sparkles,
  Activity,
  Brain,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

const FeatureCard = ({ icon: Icon, title, description, gradient, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.05, y: -5 }}
    transition={{ type: "spring", stiffness: 300 }}
    onClick={onClick}
    className="cursor-pointer"
  >
    <Card className="gradient-card border-0 p-6 rounded-3xl relative overflow-hidden group h-full">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div 
          className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl"
          style={{ background: gradient }}
        />
      </div>
      <div className="relative z-10">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-xl"
          style={{ background: gradient }}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
        <div className="flex items-center gap-2" style={{ color: 'var(--accent-from)' }}>
          <span className="text-sm font-semibold">Explore</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Card>
  </motion.div>
);

export default function StudioLanding() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "DishCore Score",
      description: "Real-time metabolic health score based on nutrition, activity, and lifestyle data",
      gradient: "linear-gradient(135deg, #4CAF50, #8BC34A)",
      path: "StudioScore"
    },
    {
      icon: Activity,
      title: "Metabolism Map",
      description: "Visual breakdown of your body zones—waist, muscle, energy, skin",
      gradient: "linear-gradient(135deg, #FF5722, #FF9800)",
      path: "StudioMetabolism"
    },
    {
      icon: Brain,
      title: "AI Insights",
      description: "Personalized recommendations powered by advanced AI analysis",
      gradient: "linear-gradient(135deg, #2196F3, #00BCD4)",
      path: "AIInsights"
    },
    {
      icon: Calendar,
      title: "Daily Menu Engine",
      description: "Adaptive meal plans that adjust daily based on your activity and goals",
      gradient: "linear-gradient(135deg, #9C27B0, #E91E63)",
      path: "AdaptiveMenuDaily"
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Track your transformation with detailed charts and insights",
      gradient: "linear-gradient(135deg, #00BCD4, #009688)",
      path: "Analytics"
    },
    {
      icon: Zap,
      title: "Smart Predictions",
      description: "AI forecasts your future progress and suggests optimizations",
      gradient: "linear-gradient(135deg, #FFC107, #FF5722)",
      path: "StudioForecast"
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute top-20 left-20 w-64 h-64 rounded-full"
            style={{ background: 'radial-gradient(circle, #4CAF50 0%, transparent 70%)', filter: 'blur(60px)' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, #FFA500 0%, transparent 70%)', filter: 'blur(80px)' }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Logo + Title */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6917c77b0e566a8b7a19860e/992333ee8_DishCore3.png"
                alt="DishCore Studio"
                className="w-20 h-20 md:w-24 md:h-24 object-contain"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
              <h1 className="text-4xl md:text-6xl font-bold">
                <span style={{ 
                  background: 'linear-gradient(135deg, #4CAF50, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  DishCore Studio™
                </span>
              </h1>
            </div>

            <motion.p
              className="text-xl md:text-2xl mb-4"
              style={{ color: 'var(--text-secondary)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Adaptive Nutrition Intelligence
            </motion.p>

            <motion.p
              className="text-base md:text-lg mb-8 max-w-2xl mx-auto"
              style={{ color: 'var(--text-muted)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              A revolutionary approach to personalized health—powered by AI, designed for transformation
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => navigate(createPageUrl('StudioHub'))}
                className="gradient-accent text-white border-0 px-8 py-6 text-lg font-semibold shadow-2xl hover:scale-105 transition-transform"
              >
                Enter Studio
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => navigate(createPageUrl('Dashboard'))}
                variant="outline"
                className="px-8 py-6 text-lg font-semibold"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                Back to Dashboard
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6" style={{ color: 'var(--accent-from)' }} />
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Studio Features
            </h2>
            <Sparkles className="w-6 h-6" style={{ color: 'var(--accent-from)' }} />
          </div>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Advanced tools to optimize your health journey
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
            >
              <FeatureCard
                {...feature}
                onClick={() => navigate(createPageUrl(feature.path))}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
        >
          <Card className="gradient-card border-0 p-8 md:p-12 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ 
                background: 'linear-gradient(135deg, #4CAF50, #FFA500)',
              }} />
            </div>
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Ready to Transform Your Health?
              </h2>
              <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
                Join thousands using DishCore Studio to achieve their wellness goals
              </p>
              <Button
                onClick={() => navigate(createPageUrl('StudioHub'))}
                className="gradient-accent text-white border-0 px-10 py-6 text-xl font-bold shadow-2xl hover:scale-105 transition-transform"
              >
                Start Your Journey
                <Sparkles className="w-6 h-6 ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}