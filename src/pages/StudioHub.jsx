import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Activity, Calendar, MessageSquare, Target, Plus, FileText, ArrowLeft, Sparkles, Zap } from "lucide-react";
import { createPageUrl } from "@/utils";
import { format, subDays } from "date-fns";
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

function calculateDishCoreScore(profile, logs) {
  if (!profile || !logs || logs.length === 0) return 50;
  const todayLogs = logs.filter(log => log.date === format(new Date(), 'yyyy-MM-dd'));
  const totalProtein = todayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const totalCalories = todayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const targetCalories = profile.target_calories || 2000;
  const targetProtein = profile.target_protein || 150;
  const proteinScore = Math.min(30, (totalProtein / targetProtein) * 30);
  const calorieDeviation = Math.abs(totalCalories - targetCalories) / targetCalories;
  const calorieScore = Math.max(0, 25 * (1 - calorieDeviation));
  return Math.round(proteinScore + calorieScore + 30);
}

export default function StudioHub() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['recentMealLogs'],
    queryFn: () => base44.entities.MealLog.list('-date', 100),
  });

  const { data: measurements = [] } = useQuery({
    queryKey: ['bodyMeasurements'],
    queryFn: () => base44.entities.BodyMeasurement.list('-date', 30),
  });

  const { data: adaptiveMenus = [] } = useQuery({
    queryKey: ['adaptiveMenus'],
    queryFn: () => base44.entities.AdaptiveMenu.list('-date', 7),
  });

  const score = calculateDishCoreScore(profile, logs);
  const last7Days = [...Array(7)].map((_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const dayLogs = logs.filter(log => log.date === date);
    return { date, score: calculateDishCoreScore(profile, dayLogs) };
  });
  const scoreTrend = last7Days.length > 1 ? last7Days[last7Days.length - 1].score - last7Days[last7Days.length - 2].score : 0;

  const latestWeight = measurements[0]?.weight || profile?.weight || 0;
  const latestWaist = measurements[0]?.waist || 0;
  const todayWater = logs.filter(log => log.date === format(new Date(), 'yyyy-MM-dd') && log.meal_type === 'water').length * 250;

  const todayMenu = adaptiveMenus.find(m => m.date === format(new Date(), 'yyyy-MM-dd'));

  const quickActions = [
    { title: 'Log Meal', icon: Plus, color: 'from-blue-400 to-blue-600', path: 'Tracking' },
    { title: 'Body Measurements', icon: Activity, color: 'from-purple-400 to-purple-600', path: 'BodyMeasurements' },
    { title: 'Studio Reports', icon: FileText, color: 'from-teal-400 to-teal-600', path: 'StudioReports' },
    { title: 'AI Assistant', icon: MessageSquare, color: 'from-green-400 to-green-600', path: 'AIAssistant' },
    { title: 'Metabolism Map', icon: Target, color: 'from-pink-400 to-pink-600', path: 'StudioMetabolism' }
  ];

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <motion.div 
        className="max-w-7xl mx-auto mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = createPageUrl('Studio')}
              className="w-12 h-12 rounded-2xl btn-secondary flex items-center justify-center hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6917c77b0e566a8b7a19860e/992333ee8_DishCore3.png"
                alt="DishCore Studio"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold">
                  <span style={{ 
                    background: 'linear-gradient(135deg, #4CAF50, #FFA500)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    DishCore Studio™
                  </span>
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Adaptive Nutrition Intelligence</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{user?.full_name || 'User'}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
        
        {/* Main Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* DishCore Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="gradient-card border-0 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h3 className="text-xl font-semibold mb-6">My Score Today</h3>
                <div className="flex items-center gap-8">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-soft)" strokeWidth="8" />
                      <circle 
                        cx="60" cy="60" r="50" fill="none" 
                        stroke="url(#scoreGradient)" 
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(score / 100) * 314} 314`}
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4CAF50" />
                          <stop offset="100%" stopColor="#FFA500" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold gradient-text">{score}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      {scoreTrend > 0 ? (
                        <><TrendingUp className="w-5 h-5 text-green-400" /><span className="text-green-400">+{scoreTrend} from yesterday</span></>
                      ) : scoreTrend < 0 ? (
                        <><TrendingDown className="w-5 h-5 text-orange-400" /><span className="text-orange-400">{scoreTrend} from yesterday</span></>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>No change from yesterday</span>
                      )}
                    </div>
                    <button
                      onClick={() => window.location.href = createPageUrl('StudioScore')}
                      className="btn-primary"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Body Snapshot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="gradient-card border-0 rounded-3xl p-6">
              <h3 className="text-xl font-semibold mb-6">Body Snapshot</h3>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Weight</p>
                  <p className="text-3xl font-bold">{latestWeight.toFixed(1)} <span className="text-lg" style={{ color: 'var(--text-muted)' }}>kg</span></p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Waist</p>
                  <p className="text-3xl font-bold">{latestWaist || '--'} <span className="text-lg" style={{ color: 'var(--text-muted)' }}>cm</span></p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Hydration</p>
                  <p className="text-3xl font-bold">{todayWater} <span className="text-lg" style={{ color: 'var(--text-muted)' }}>ml</span></p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>7-Day Trend</p>
                  <ResponsiveContainer width="100%" height={40}>
                    <LineChart data={last7Days}>
                      <Line type="monotone" dataKey="score" stroke="#00E38C" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Today's Menu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="gradient-card border-0 rounded-3xl p-6">
              <h3 className="text-xl font-semibold mb-6">Today's Adaptive Menu</h3>
              {todayMenu ? (
                <div className="space-y-4">
                  {todayMenu.meals?.slice(0, 3).map((meal, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl" style={{ background: 'var(--bg-surface-alt)' }}>
                      <div>
                        <p className="text-xs uppercase mb-1" style={{ color: 'var(--text-muted)' }}>{meal.meal_type}</p>
                        <p className="font-semibold">{meal.dish_name}</p>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{meal.calories} kcal</p>
                    </div>
                  ))}
                  <button
                    onClick={() => window.location.href = createPageUrl('StudioMenuEngine')}
                    className="w-full gradient-accent text-white border-0 px-6 py-3 rounded-2xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Generate Alternatives
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="mb-4" style={{ color: 'var(--text-muted)' }}>No menu generated yet</p>
                  <button
                    onClick={() => window.location.href = createPageUrl('StudioMenuEngine')}
                    className="btn-primary"
                  >
                    Generate Menu
                  </button>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold px-2">Quick Actions</h3>
          
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.title}
                onClick={() => window.location.href = createPageUrl(action.path)}
                className="w-full gradient-card border-0 rounded-2xl p-4 text-left hover:scale-105 transition-transform"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold">{action.title}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}