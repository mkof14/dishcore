
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, TrendingUp, TrendingDown, Copy, Download, Share2, Sparkles } from "lucide-react";
import { format, subDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from "sonner";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import ShareScoreDialog from "../components/sharing/ShareScoreDialog";

function calculateDishCoreScore(profile, logs, measurements, wearableData) {
  if (!profile || !logs || logs.length === 0) return { total: 50, components: {} };

  const todayLogs = logs.filter(log => log.date === format(new Date(), 'yyyy-MM-dd'));
  const todayWearable = wearableData?.find(w => w.date === format(new Date(), 'yyyy-MM-dd'));
  
  const totalProtein = todayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const totalCalories = todayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const targetCalories = profile.target_calories || 2000;
  const targetProtein = profile.target_protein || 150;

  // Base nutrition scores
  const proteinScore = Math.min(30, (totalProtein / targetProtein) * 30);
  const calorieDeviation = Math.abs(totalCalories - targetCalories) / targetCalories;
  const calorieScore = Math.max(0, 25 * (1 - calorieDeviation));
  const mealCount = todayLogs.filter(log => ['breakfast', 'lunch', 'dinner'].includes(log.meal_type)).length;
  const timingScore = Math.min(15, (mealCount / 3) * 15);
  const waterLogs = todayLogs.filter(log => log.meal_type === 'water');
  const waterScore = Math.min(10, (waterLogs.length / 8) * 10);

  // Wearable bonuses
  let sleepBonus = 0;
  let activityBonus = 0;
  if (todayWearable) {
    sleepBonus = todayWearable.sleep_hours >= 7 ? 10 : (todayWearable.sleep_hours / 7) * 10;
    activityBonus = todayWearable.steps >= 8000 ? 10 : (todayWearable.steps / 8000) * 10;
  }

  const components = {
    proteinAdequacy: Math.round(proteinScore),
    wholeFoods: Math.round(calorieScore), // This is calorie balance
    mealTiming: Math.round(timingScore),
    hydration: Math.round(waterScore),
    sleepQuality: Math.round(sleepBonus),
    activityLevel: Math.round(activityBonus)
  };

  const score = proteinScore + calorieScore + timingScore + waterScore + sleepBonus + activityBonus;
  return { total: Math.round(score), components };
}

export default function StudioScore() {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

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

  const { data: wearableData = [] } = useQuery({
    queryKey: ['wearableData'],
    queryFn: () => base44.entities.WearableData.list('-date', 30),
  });

  const scoreData = calculateDishCoreScore(profile, logs, measurements, wearableData);
  const score = scoreData.total;

  useEffect(() => {
    let current = 0;
    const target = score;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnimatedScore(target);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const getScoreLabel = (score) => {
    if (score >= 80) return 'OPTIMAL';
    if (score >= 60) return 'GOOD';
    if (score >= 40) return 'FAIR';
    return 'NEEDS WORK';
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-green-400 to-teal-500';
    if (score >= 60) return 'from-blue-400 to-green-500';
    if (score >= 40) return 'from-orange-400 to-yellow-500';
    return 'from-red-400 to-orange-500';
  };

  const last7Days = [...Array(7)].map((_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const dayLogs = logs.filter(log => log.date === date);
    const dayWearable = wearableData.filter(w => w.date === date);
    const dayScore = calculateDishCoreScore(profile, dayLogs, measurements, dayWearable);
    return {
      date: format(new Date(date), 'EEE'),
      score: dayScore.total
    };
  });

  const handleExport = () => {
    const csvData = [
      ['Component', 'Score', 'Max'],
      ['Protein Adequacy', scoreData.components?.proteinAdequacy || 0, 30],
      ['Whole Foods', scoreData.components?.wholeFoods || 0, 25],
      ['Meal Timing', scoreData.components?.mealTiming || 0, 15],
      ['Hydration', scoreData.components?.hydration || 0, 10],
      ['Sleep Quality', scoreData.components?.sleepQuality || 0, 10],
      ['Activity Level', scoreData.components?.activityLevel || 0, 10],
      ['', '', ''],
      ['Total Score', score, 100]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dishcore-score-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Score report exported!');
  };

  const hasWearableData = wearableData.length > 0;

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = createPageUrl('StudioHub')}
              className="w-12 h-12 rounded-2xl btn-secondary flex items-center justify-center hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl font-bold">
                <span style={{ 
                  background: 'linear-gradient(135deg, #4CAF50, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  DishCore Score
                </span>
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>
                {hasWearableData ? 'Enhanced with wearable data' : 'Unified nutrition quality index'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShareDialogOpen(true)}
              className="btn-secondary p-3 rounded-xl"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button onClick={handleExport} className="btn-secondary p-3 rounded-xl">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Main Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="gradient-card border-0 rounded-3xl p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20">
              <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br ${getScoreGradient(animatedScore)} rounded-full blur-3xl animate-pulse`} />
            </div>
            <h3 className="text-xl font-semibold mb-8 relative z-10">Today's Score</h3>
            <div className="text-center relative z-10">
              <div className={`text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b ${getScoreGradient(animatedScore)} mb-4`}>
                {animatedScore}
              </div>
              <p className={`text-lg uppercase tracking-wider font-semibold ${
                animatedScore >= 80 ? 'text-green-400' : 
                animatedScore >= 60 ? 'text-blue-400' : 
                animatedScore >= 40 ? 'text-orange-400' : 'text-red-400'
              }`}>
                {getScoreLabel(animatedScore)}
              </p>
            </div>
          </motion.div>

          {/* Breakdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="gradient-card border-0 rounded-3xl p-8"
          >
            <h3 className="text-xl font-semibold mb-6">Score Breakdown</h3>
            <div className="space-y-4">
              {[
                { label: 'Protein Adequacy', value: scoreData.components?.proteinAdequacy || 0, max: 30, icon: '🥩' },
                { label: 'Calorie Balance', value: scoreData.components?.wholeFoods || 0, max: 25, icon: '⚖️' },
                { label: 'Meal Timing', value: scoreData.components?.mealTiming || 0, max: 15, icon: '⏰' },
                { label: 'Hydration', value: scoreData.components?.hydration || 0, max: 10, icon: '💧' },
                { label: 'Sleep Quality', value: scoreData.components?.sleepQuality || 0, max: 10, icon: '😴', wearable: true },
                { label: 'Activity Level', value: scoreData.components?.activityLevel || 0, max: 10, icon: '🏃', wearable: true }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                      {item.wearable && !hasWearableData && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                          Connect wearable
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-semibold">{item.value}/{item.max}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-alt)' }}>
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / item.max) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="gradient-card border-0 rounded-3xl p-8 md:col-span-2"
          >
            <h3 className="text-xl font-semibold mb-6">Weekly Score Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--surface)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '12px',
                    color: 'var(--text-primary)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="url(#scoreLineGradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#00E38C', r: 6 }}
                />
                <defs>
                  <linearGradient id="scoreLineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4CAF50" />
                    <stop offset="100%" stopColor="#FFA500" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="gradient-card border-0 rounded-3xl p-8 md:col-span-2"
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
              Recommendations
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                  <span className="text-2xl">💪</span>
                </div>
                <h4 className="font-semibold mb-2">Boost Protein</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Add 20g more protein in dinner to reach daily target</p>
              </div>
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
                  <span className="text-2xl">💧</span>
                </div>
                <h4 className="font-semibold mb-2">Hydration</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Drink 2 more glasses of water before evening</p>
              </div>
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
                  <span className="text-2xl">🥗</span>
                </div>
                <h4 className="font-semibold mb-2">Fiber Intake</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Include more vegetables in your next meal</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <ShareScoreDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        score={score}
        scoreComponents={scoreData.components}
        period="week"
      />
    </div>
  );
}
