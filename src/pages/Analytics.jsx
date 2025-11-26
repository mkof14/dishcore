
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays } from "date-fns";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, TrendingDown, Award, Activity, Moon, Zap, Droplet, Brain, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion } from "framer-motion";
import NutrientAnalysis from "../components/analytics/NutrientAnalysis";
import FoodGroupImpact from "../components/analytics/FoodGroupImpact";
import SmartSubstitutions from "../components/analytics/SmartSubstitutions";
import MicronutrientTrends from "../components/analytics/MicronutrientTrends"; // New import
import DeficiencyAlerts from "../components/analytics/DeficiencyAlerts";     // New import
import SEOHead from "../components/SEOHead";
import ShareButton from "../components/ShareButton";

// Calculate DishCore Score
function calculateDishCoreScore(profile, logs, date) {
  const dayLogs = logs.filter(log => log.date === date);
  if (dayLogs.length === 0) return 0;
  
  const totalProtein = dayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const totalCalories = dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const targetCalories = profile?.target_calories || 2000;
  const targetProtein = profile?.target_protein || 150;
  
  // Score components (example logic, adjust as needed for real algorithm)
  let proteinScore = 0;
  if (totalProtein >= targetProtein) {
    proteinScore = 30; // Max score for hitting protein target
  } else {
    proteinScore = Math.min(30, (totalProtein / targetProtein) * 30); // Proportional score
  }

  let calorieScore = 0;
  const calorieDeviation = Math.abs(totalCalories - targetCalories) / targetCalories;
  if (calorieDeviation <= 0.15) { // Within 15% of target
    calorieScore = 25;
  } else {
    calorieScore = Math.max(0, 25 * (1 - calorieDeviation * 2)); // Penalize more for larger deviations
  }
  
  const waterLogs = dayLogs.filter(log => log.meal_type === 'water');
  const totalWaterMl = waterLogs.length * 250;
  const targetWaterMl = profile?.target_water || 2000;
  let waterScore = 0;
  if (totalWaterMl >= targetWaterMl) {
    waterScore = 15;
  } else {
    waterScore = Math.min(15, (totalWaterMl / targetWaterMl) * 15);
  }
  
  // Base score for logging any meals, plus a consistency bonus
  const mealsLogged = dayLogs.filter(log => !['water', 'activity', 'sleep'].includes(log.meal_type)).length;
  const consistencyScore = mealsLogged > 0 ? 30 : 0;

  return Math.round(proteinScore + calorieScore + waterScore + consistencyScore);
}

export default function Analytics() {
  const [period, setPeriod] = useState('week'); // week, month

  const { data: logs = [] } = useQuery({
    queryKey: ['allMealLogs'],
    queryFn: () => base44.entities.MealLog.list('-date', 200),
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const { data: measurements = [] } = useQuery({
    queryKey: ['bodyMeasurements'],
    queryFn: () => base44.entities.BodyMeasurement.list('-date', 50),
  });

  const { data: wearableData = [] } = useQuery({
    queryKey: ['wearableData'],
    queryFn: () => base44.entities.WearableData.list('-date', 30),
  });

  const daysCount = period === 'week' ? 7 : 30;
  const periodData = [...Array(daysCount)].map((_, i) => {
    const date = format(subDays(new Date(), daysCount - 1 - i), 'yyyy-MM-dd');
    const dayLogs = logs.filter(log => log.date === date);
    const waterLogs = dayLogs.filter(log => log.meal_type === 'water');
    const wearable = wearableData.find(w => w.date === date);
    
    return {
      date: format(new Date(date), period === 'week' ? 'EEE' : 'MMM d'),
      fullDate: date,
      calories: dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0),
      protein: dayLogs.reduce((sum, log) => sum + (log.protein || 0), 0),
      carbs: dayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0),
      fat: dayLogs.reduce((sum, log) => sum + (log.fat || 0), 0),
      meals: dayLogs.filter(log => !['water', 'activity', 'sleep'].includes(log.meal_type)).length,
      water: waterLogs.length * 250,
      steps: wearable?.steps || 0,
      sleep: wearable?.sleep_hours || 0,
      activeMinutes: wearable?.active_minutes || 0,
      measurement: measurements.find(m => m.date === date),
      dishCoreScore: calculateDishCoreScore(profile, logs, date)
    };
  });

  // Calculate statistics
  const avgCalories = periodData.reduce((sum, day) => sum + day.calories, 0) / daysCount;
  const avgProtein = periodData.reduce((sum, day) => sum + day.protein, 0) / daysCount;
  const avgCarbs = periodData.reduce((sum, day) => sum + day.carbs, 0) / daysCount;
  const avgFat = periodData.reduce((sum, day) => sum + day.fat, 0) / daysCount;
  const avgWater = periodData.reduce((sum, day) => sum + day.water, 0) / daysCount;
  const avgSleep = periodData.reduce((sum, day) => sum + day.sleep, 0) / daysCount;
  const avgScore = periodData.reduce((sum, day) => sum + day.dishCoreScore, 0) / daysCount;

  // Adherence calculations
  const daysWithLogs = periodData.filter(day => day.meals > 0).length;
  // const trackingAdherence = (daysWithLogs / daysCount) * 100; // Not currently used

  const targetCalories = profile?.target_calories || 2000;
  const targetProtein = profile?.target_protein || 150;
  const targetWater = profile?.target_water || 2000;

  // Advanced Macro Trends
  const macroTrendData = periodData.map(day => ({
    date: day.date,
    proteinPercent: day.calories > 0 ? (day.protein * 4 / day.calories * 100) : 0,
    carbsPercent: day.calories > 0 ? (day.carbs * 4 / day.calories * 100) : 0,
    fatPercent: day.calories > 0 ? (day.fat * 9 / day.calories * 100) : 0
  }));

  // Score Correlations
  const scoreActivityData = periodData.filter(d => d.steps > 0 && d.dishCoreScore > 0).map(d => ({
    steps: d.steps,
    score: d.dishCoreScore,
    date: d.date
  }));

  const scoreSleepData = periodData.filter(d => d.sleep > 0 && d.dishCoreScore > 0).map(d => ({
    sleep: d.sleep,
    score: d.dishCoreScore,
    date: d.date
  }));

  const scoreCaloriesData = periodData.filter(d => d.calories > 0 && d.dishCoreScore > 0).map(d => ({
    calories: d.calories,
    score: d.dishCoreScore,
    date: d.date
  }));

  // Pattern Detection
  const highScoreDays = periodData.filter(d => d.dishCoreScore >= 75);
  // const lowScoreDays = periodData.filter(d => d.dishCoreScore > 0 && d.dishCoreScore < 50); // Not used in current insights, but kept if needed

  // Generate Insights
  const insights = [];

  if (avgScore >= 75) {
    insights.push({ type: 'success', text: `Excellent! Your average DishCore Score is ${avgScore.toFixed(0)}/100. Keep up the great work!` });
  } else if (avgScore >= 50) {
    insights.push({ type: 'info', text: `Your DishCore Score averages ${avgScore.toFixed(0)}/100. Focus on consistency to reach 75+.` });
  } else {
    insights.push({ type: 'warning', text: `DishCore Score is ${avgScore.toFixed(0)}/100. Let's work on improving nutrition quality.` });
  }

  if (highScoreDays.length > 0) {
    const avgProteinOnHighDays = highScoreDays.reduce((sum, d) => sum + d.protein, 0) / highScoreDays.length;
    insights.push({ 
      type: 'success', 
      text: `On days with scores 75+, you average ${avgProteinOnHighDays.toFixed(0)}g protein. Try to maintain this level!` 
    });
  }

  if (scoreActivityData.length > 3) {
    const avgStepsHighScore = scoreActivityData.filter(d => d.score >= 70).reduce((sum, d) => sum + d.steps, 0) / scoreActivityData.filter(d => d.score >= 70).length || 0;
    if (avgStepsHighScore > 8000) {
      insights.push({ 
        type: 'info', 
        text: `Your score tends to be higher on days with ${Math.round(avgStepsHighScore).toLocaleString()}+ steps. Movement matters!` 
      });
    }
  }

  if (scoreSleepData.length > 3) {
    const avgSleepHighScore = scoreSleepData.filter(d => d.score >= 70).reduce((sum, d) => sum + d.sleep, 0) / scoreSleepData.filter(d => d.score >= 70).length || 0;
    if (avgSleepHighScore >= 7) {
      insights.push({ 
        type: 'info', 
        text: `You have higher energy and better scores on days with ${avgSleepHighScore.toFixed(1)}h+ of sleep. Prioritize rest!` 
      });
    }
  }

  const macrosData = [
    { name: 'Protein', value: periodData.reduce((sum, day) => sum + day.protein, 0), color: '#3B82F6' },
    { name: 'Carbs', value: periodData.reduce((sum, day) => sum + day.carbs, 0), color: '#FB923C' },
    { name: 'Fat', value: periodData.reduce((sum, day) => sum + day.fat, 0), color: '#A855F7' }
  ];

  // Export Function - Renamed from handleExport to exportCSV as per outline
  const exportCSV = () => {
    const csvData = [
      ['Date', 'Calories', 'Protein', 'Carbs', 'Fat', 'Water', 'Sleep', 'Steps', 'DishCore Score'],
      ...periodData.map(d => [
        d.fullDate,
        d.calories,
        d.protein,
        d.carbs,
        d.fat,
        d.water,
        d.sleep,
        d.steps,
        d.dishCoreScore
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dishcore-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Data exported successfully!');
  };

  const periodFullDates = periodData.map(p => p.fullDate);
  const filteredLogsForPeriod = logs.filter(l => periodFullDates.includes(l.date));

  return (
    <>
      <SEOHead
        title="Analytics & Insights - DishCore"
        description="Comprehensive nutrition analytics with AI-powered insights, trend analysis, and personalized recommendations"
      />
      
      <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          {/* motion.div wrapper removed, and content adjusted as per outline */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Analytics & Insights
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                Deep dive into your nutrition data
              </p>
            </div>
            <div className="flex gap-3">
              <ShareButton
                title="My DishCore Analytics"
                text="Check out my nutrition progress on DishCore!"
              />
              <Button onClick={exportCSV} variant="outline" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}>
                Export CSV
              </Button>
              {/* Period selector buttons kept and integrated into the new button group */}
              <Button
                variant={period === 'week' ? 'default' : 'outline'}
                onClick={() => setPeriod('week')}
                className={period === 'week' ? 'gradient-accent text-white border-0' : ''}
                style={period !== 'week' ? { borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' } : {}}
              >
                Week
              </Button>
              <Button
                variant={period === 'month' ? 'default' : 'outline'}
                onClick={() => setPeriod('month')}
                className={period === 'month' ? 'gradient-accent text-white border-0' : ''}
                style={period !== 'month' ? { borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' } : {}}
              >
                Month
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="gradient-card border-0 p-5 rounded-3xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>DishCore Score</p>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {avgScore.toFixed(0)}
                  </h3>
                </div>
              </div>
              <Progress value={avgScore} className="h-1.5" />
            </Card>

            <Card className="gradient-card border-0 p-5 rounded-3xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg Protein</p>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {Math.round(avgProtein)}g
                  </h3>
                </div>
              </div>
              <Progress value={(avgProtein / targetProtein) * 100} className="h-1.5" />
            </Card>

            <Card className="gradient-card border-0 p-5 rounded-3xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(14, 165, 233, 0.2)' }}>
                  <Droplet className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg Water</p>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {Math.round(avgWater)}ml
                  </h3>
                </div>
              </div>
              <Progress value={(avgWater / targetWater) * 100} className="h-1.5" />
            </Card>

            <Card className="gradient-card border-0 p-5 rounded-3xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(168, 85, 247, 0.2)' }}>
                  <Moon className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg Sleep</p>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {avgSleep.toFixed(1)}h
                  </h3>
                </div>
              </div>
              <Progress value={(avgSleep / 8) * 100} className="h-1.5" />
            </Card>
          </div>

          {/* Deficiency Alerts - New Component */}
          <DeficiencyAlerts logs={filteredLogsForPeriod} periodData={periodData} profile={profile} />

          {/* Micronutrient Trends - New Component */}
          <MicronutrientTrends periodData={periodData} logs={filteredLogsForPeriod} />

          {/* AI Nutrient Analysis */}
          <NutrientAnalysis logs={filteredLogsForPeriod} profile={profile} period={daysCount} />

          {/* Smart Substitutions */}
          <SmartSubstitutions logs={filteredLogsForPeriod} profile={profile} />

          {/* Food Group Impact */}
          <FoodGroupImpact logs={filteredLogsForPeriod} wearableData={wearableData} profile={profile} />

          {/* AI Insights */}
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Personalized Insights</h3>
            </div>
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div key={idx} className="p-4 rounded-2xl flex items-start gap-3"
                  style={{ background: 'var(--surface)' }}>
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    insight.type === 'success' ? 'bg-green-500' :
                    insight.type === 'warning' ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`} />
                  <p className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>
                    {insight.text}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="trends" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6" style={{ background: 'var(--surface)' }}>
              <TabsTrigger value="trends">Macro Trends</TabsTrigger>
              <TabsTrigger value="correlations">Score Correlations</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-6">
              {/* Macro Percentage Trends */}
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                  📊 Macro Percentage Trends
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={macroTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" label={{ value: '% of Calories', angle: -90, position: 'insideLeft' }} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                    <Legend />
                    <Line type="monotone" dataKey="proteinPercent" stroke="#3B82F6" strokeWidth={3} name="Protein %" />
                    <Line type="monotone" dataKey="carbsPercent" stroke="#FB923C" strokeWidth={3} name="Carbs %" />
                    <Line type="monotone" dataKey="fatPercent" stroke="#A855F7" strokeWidth={3} name="Fat %" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Macros Over Time */}
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                  📈 Daily Macronutrients
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={periodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                    <Legend />
                    <Area type="monotone" dataKey="protein" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Protein (g)" />
                    <Area type="monotone" dataKey="carbs" stackId="1" stroke="#FB923C" fill="#FB923C" fillOpacity={0.6} name="Carbs (g)" />
                    <Area type="monotone" dataKey="fat" stackId="1" stroke="#A855F7" fill="#A855F7" fillOpacity={0.6} name="Fat (g)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            <TabsContent value="correlations" className="space-y-6">
              {/* DishCore Score Trend */}
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                  ⭐ DishCore Score Over Time
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={periodData}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00E38C" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00E38C" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                    <Area type="monotone" dataKey="dishCoreScore" stroke="#00E38C" fillOpacity={1} fill="url(#scoreGradient)" name="Score" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Score vs Activity */}
              {scoreActivityData.length > 0 && (
                <Card className="gradient-card border-0 p-6 rounded-3xl">
                  <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                    🚶 Score vs Activity Correlation
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="steps" name="Steps" stroke="var(--text-muted)" />
                      <YAxis dataKey="score" name="Score" stroke="var(--text-muted)" domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter data={scoreActivityData} fill="#FB923C" />
                    </ScatterChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-center mt-4" style={{ color: 'var(--text-muted)' }}>
                    {scoreActivityData.filter(d => d.steps > 8000 && d.score > 70).length > 0 
                      ? 'Higher activity days correlate with better DishCore Scores' 
                      : 'Track more data to see activity-score patterns'}
                  </p>
                </Card>
              )}

              {/* Score vs Sleep */}
              {scoreSleepData.length > 0 && (
                <Card className="gradient-card border-0 p-6 rounded-3xl">
                  <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                    😴 Score vs Sleep Correlation
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="sleep" name="Sleep (h)" stroke="var(--text-muted)" />
                      <YAxis dataKey="score" name="Score" stroke="var(--text-muted)" domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter data={scoreSleepData} fill="#A855F7" />
                    </ScatterChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-center mt-4" style={{ color: 'var(--text-muted)' }}>
                    {scoreSleepData.filter(d => d.sleep >= 7 && d.score > 70).length > 0 
                      ? 'Better sleep quality correlates with higher DishCore Scores' 
                      : 'Track more sleep data to identify patterns'}
                  </p>
                </Card>
              )}

              {/* Score vs Calories */}
              {scoreCaloriesData.length > 0 && (
                <Card className="gradient-card border-0 p-6 rounded-3xl">
                  <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                    🔥 Score vs Calorie Intake
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="calories" name="Calories" stroke="var(--text-muted)" />
                      <YAxis dataKey="score" name="Score" stroke="var(--text-muted)" domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter data={scoreCaloriesData} fill="#00E38C" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="patterns" className="space-y-6">
              {/* Weekly Pattern */}
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                  📅 Weekly Patterns
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={periodData.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                    <Legend />
                    <Bar dataKey="meals" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Meals Logged" />
                    <Bar dataKey="dishCoreScore" fill="#00E38C" radius={[8, 8, 0, 0]} name="DishCore Score" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Hydration Pattern */}
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                  💧 Hydration Pattern
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={periodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                    <Line type="monotone" dataKey="water" stroke="#0EA5E9" strokeWidth={3} name="Water (ml)" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            <TabsContent value="nutrition" className="space-y-6">
              {/* Macros Distribution */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="gradient-card border-0 p-6 rounded-3xl">
                  <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                    🥗 Macros Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={macrosData} cx="50%" cy="50%" labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100} fill="#8884d8" dataKey="value">
                        {macrosData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="gradient-card border-0 p-6 rounded-3xl">
                  <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                    📊 Daily Macros Breakdown
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={periodData.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="var(--text-muted)" />
                      <YAxis stroke="var(--text-muted)" />
                      <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                      <Legend />
                      <Bar dataKey="protein" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Protein (g)" />
                      <Bar dataKey="carbs" fill="#FB923C" radius={[4, 4, 0, 0]} name="Carbs (g)" />
                      <Bar dataKey="fat" fill="#A855F7" radius={[4, 4, 0, 0]} name="Fat (g)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Calorie Trend */}
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                  📈 Calorie Intake Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={periodData}>
                    <defs>
                      <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00E38C" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00E38C" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                    <Area type="monotone" dataKey="calories" stroke="#00E38C" fillOpacity={1} fill="url(#colorCalories)" name="Calories" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* ShareScoreDialog component and its state were removed as per the outline's changes to the header buttons. */}
      </div>
    </>
  );
}
