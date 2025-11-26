import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Target, Plus, TrendingUp, TrendingDown, Minus,
  Activity, Apple, Droplet, Moon, Zap, Brain, Award
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { format, subDays, differenceInDays } from "date-fns";
import { motion } from "framer-motion";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import { toast } from "sonner";

export default function Progress() {
  const [period, setPeriod] = useState(30);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['mealLogs'],
    queryFn: () => base44.entities.MealLog.list('-date', 200),
  });

  const { data: measurements = [] } = useQuery({
    queryKey: ['bodyMeasurements'],
    queryFn: () => base44.entities.BodyMeasurement.list('-date', 100),
  });

  const { data: wearableData = [] } = useQuery({
    queryKey: ['wearableData'],
    queryFn: () => base44.entities.WearableData.list('-date', 100),
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
  });

  const { data: waterLogs = [] } = useQuery({
    queryKey: ['waterLogs'],
    queryFn: () => base44.entities.WaterLog.list('-date', 100),
  });

  // Generate AI insights
  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const recentData = periodData.slice(-7);
      const avgScore = recentData.reduce((sum, d) => sum + d.dishCoreScore, 0) / recentData.length;
      const avgProtein = recentData.reduce((sum, d) => sum + d.protein, 0) / recentData.length;
      const avgCalories = recentData.reduce((sum, d) => sum + d.calories, 0) / recentData.length;
      
      const prompt = `Analyze this nutrition data and provide 3 actionable insights:
      
Average DishCore Score: ${avgScore.toFixed(1)}/100
Average Daily Protein: ${avgProtein.toFixed(1)}g (Target: ${profile?.target_protein || 150}g)
Average Daily Calories: ${avgCalories.toFixed(0)} (Target: ${profile?.target_calories || 2000})
Recent Weight Trend: ${recentData[0]?.weight ? `${recentData[0].weight}kg → ${recentData[recentData.length-1].weight}kg` : 'No data'}

Provide specific, actionable advice in 3 bullet points.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      return result;
    },
    onSuccess: (data) => {
      toast.success('AI insights generated!');
    },
  });

  // Calculate comprehensive period data
  const periodData = [...Array(period)].map((_, i) => {
    const date = format(subDays(new Date(), period - 1 - i), 'yyyy-MM-dd');
    const dayLogs = logs.filter(log => log.date === date);
    const wearable = wearableData.find(w => w.date === date);
    const measurement = measurements.find(m => m.date === date);
    const water = waterLogs.find(w => w.date === date);

    const calories = dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const protein = dayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
    const carbs = dayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
    const fat = dayLogs.reduce((sum, log) => sum + (log.fat || 0), 0);

    // DishCore Score calculation
    const targetProtein = profile?.target_protein || 150;
    const targetCalories = profile?.target_calories || 2000;
    const proteinScore = Math.min(30, (protein / targetProtein) * 30);
    const calorieDeviation = Math.abs(calories - targetCalories) / targetCalories;
    const calorieScore = Math.max(0, 25 * (1 - calorieDeviation));
    const waterScore = Math.min(15, ((water?.cups || 0) / 8) * 15);
    const mealCount = dayLogs.filter(log => ['breakfast', 'lunch', 'dinner'].includes(log.meal_type)).length;
    const timingScore = Math.min(15, (mealCount / 3) * 15);
    const sleepBonus = wearable?.sleep_hours >= 7 ? 15 : (wearable?.sleep_hours / 7) * 15 || 0;
    const dishCoreScore = Math.round(proteinScore + calorieScore + waterScore + timingScore + sleepBonus);

    return {
      date: format(new Date(date), 'MMM d'),
      fullDate: date,
      calories,
      protein,
      carbs,
      fat,
      weight: measurement?.weight,
      waist: measurement?.waist,
      bodyFat: measurement?.body_fat_percentage,
      muscleMass: measurement?.muscle_mass,
      steps: wearable?.steps || 0,
      sleep: wearable?.sleep_hours || 0,
      heartRate: wearable?.heart_rate_avg || 0,
      activeMinutes: wearable?.active_minutes || 0,
      waterCups: water?.cups || 0,
      dishCoreScore,
      targetCalories: targetCalories,
      targetProtein: targetProtein
    };
  });

  // Calculate stats
  const latestWeight = measurements[0]?.weight;
  const oldestWeight = measurements[measurements.length - 1]?.weight;
  const weightChange = latestWeight && oldestWeight ? latestWeight - oldestWeight : 0;
  
  const avgScore = periodData.reduce((sum, d) => sum + d.dishCoreScore, 0) / periodData.length;
  const avgProtein = periodData.reduce((sum, d) => sum + d.protein, 0) / periodData.length;
  const avgCalories = periodData.reduce((sum, d) => sum + d.calories, 0) / periodData.length;
  const avgWater = periodData.reduce((sum, d) => sum + d.waterCups, 0) / periodData.length;

  const activeGoals = goals.filter(g => g.status === 'active');

  // Calculate goal progress
  const goalProgress = activeGoals.map(goal => {
    const relevantData = periodData.filter(d => d[goal.metric]);
    const currentValue = relevantData[relevantData.length - 1]?.[goal.metric] || goal.start_value;
    const progress = ((currentValue - goal.start_value) / (goal.target_value - goal.start_value)) * 100;
    const daysRemaining = goal.target_date ? differenceInDays(new Date(goal.target_date), new Date()) : 0;
    
    return {
      ...goal,
      currentValue,
      progress: Math.min(Math.max(progress, 0), 100),
      daysRemaining,
      onTrack: progress >= 50 && daysRemaining > 0
    };
  });

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div 
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = createPageUrl('Dashboard')}
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Progress Tracking
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                Comprehensive health metrics & AI-powered insights
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={period === 7 ? 'default' : 'outline'}
              onClick={() => setPeriod(7)}
              className={period === 7 ? 'gradient-accent text-white border-0' : ''}
              style={period !== 7 ? { borderColor: 'var(--border)' } : {}}
            >
              7 Days
            </Button>
            <Button
              variant={period === 30 ? 'default' : 'outline'}
              onClick={() => setPeriod(30)}
              className={period === 30 ? 'gradient-accent text-white border-0' : ''}
              style={period !== 30 ? { borderColor: 'var(--border)' } : {}}
            >
              30 Days
            </Button>
            <Button
              variant={period === 90 ? 'default' : 'outline'}
              onClick={() => setPeriod(90)}
              className={period === 90 ? 'gradient-accent text-white border-0' : ''}
              style={period !== 90 ? { borderColor: 'var(--border)' } : {}}
            >
              90 Days
            </Button>
          </div>
        </motion.div>

        {/* Key Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              {weightChange !== 0 && (
                weightChange > 0 ? 
                  <TrendingUp className="w-5 h-5 text-red-400" /> :
                  <TrendingDown className="w-5 h-5 text-green-400" />
              )}
            </div>
            <h3 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {latestWeight?.toFixed(1) || '--'} kg
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Weight {weightChange !== 0 && `(${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg)`}
            </p>
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {avgScore.toFixed(0)}
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Avg DishCore Score
            </p>
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
                <Apple className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {avgProtein.toFixed(0)}g
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Avg Daily Protein
            </p>
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(45, 163, 255, 0.2)' }}>
                <Droplet className="w-6 h-6 text-cyan-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {avgWater.toFixed(1)}
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Avg Daily Water (cups)
            </p>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Brain className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
              AI Progress Insights
            </h2>
            <Button
              onClick={() => generateInsightsMutation.mutate()}
              disabled={generateInsightsMutation.isPending}
              size="sm"
              className="gradient-accent text-white border-0"
            >
              {generateInsightsMutation.isPending ? 'Analyzing...' : 'Generate Insights'}
            </Button>
          </div>
          {generateInsightsMutation.data ? (
            <div className="prose prose-invert max-w-none">
              <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                {generateInsightsMutation.data}
              </p>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>
              Click "Generate Insights" to get AI-powered analysis of your progress
            </p>
          )}
        </Card>

        {/* Tabs for different metrics */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="body">Body Metrics</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                DishCore Score Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={periodData}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  />
                  <Area type="monotone" dataKey="dishCoreScore" stroke="#8B5CF6" fillOpacity={1} fill="url(#scoreGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Weight & Waist Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={periodData.filter(d => d.weight || d.waist)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" />
                  <YAxis yAxisId="left" stroke="var(--text-muted)" />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={2} name="Weight (kg)" />
                  <Line yAxisId="right" type="monotone" dataKey="waist" stroke="#F59E0B" strokeWidth={2} name="Waist (cm)" />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Daily Calorie Intake vs Target
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={periodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Bar dataKey="calories" fill="#3B82F6" name="Actual Calories" />
                  <Line type="monotone" dataKey="targetCalories" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Macronutrient Balance
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={periodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="protein" stroke="#22C55E" strokeWidth={2} name="Protein (g)" />
                  <Line type="monotone" dataKey="carbs" stroke="#F59E0B" strokeWidth={2} name="Carbs (g)" />
                  <Line type="monotone" dataKey="fat" stroke="#EF4444" strokeWidth={2} name="Fat (g)" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Body Metrics Tab */}
          <TabsContent value="body" className="space-y-6">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Body Composition
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={periodData.filter(d => d.bodyFat || d.muscleMass)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="bodyFat" stroke="#EF4444" strokeWidth={2} name="Body Fat %" />
                  <Line type="monotone" dataKey="muscleMass" stroke="#22C55E" strokeWidth={2} name="Muscle Mass (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Daily Activity
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={periodData.filter(d => d.steps > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Bar dataKey="steps" fill="#3B82F6" name="Steps" />
                  <Bar dataKey="activeMinutes" fill="#8B5CF6" name="Active Minutes" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Sleep & Heart Rate
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={periodData.filter(d => d.sleep > 0 || d.heartRate > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" />
                  <YAxis yAxisId="left" stroke="var(--text-muted)" />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sleep" fill="#8B5CF6" name="Sleep (hours)" />
                  <Line yAxisId="right" type="monotone" dataKey="heartRate" stroke="#EF4444" strokeWidth={2} name="Heart Rate (bpm)" />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            {goalProgress.length > 0 ? (
              <>
                {goalProgress.map(goal => (
                  <Card key={goal.id} className="gradient-card border-0 p-6 rounded-3xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                          <Target className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
                          {goal.title}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                          {goal.description}
                        </p>
                      </div>
                      {goal.onTrack ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <Award className="w-5 h-5" />
                          <span className="text-sm font-medium">On Track</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-400">
                          <Minus className="w-5 h-5" />
                          <span className="text-sm font-medium">Needs Focus</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {goal.progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full" style={{ background: 'var(--bg-surface-alt)' }}>
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${goal.progress}%`,
                            background: goal.onTrack ? 'linear-gradient(90deg, #22C55E, #10B981)' : 'linear-gradient(90deg, #F59E0B, #D97706)'
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-3">
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Start</p>
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {goal.start_value} {goal.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Current</p>
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {goal.currentValue.toFixed(1)} {goal.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Target</p>
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {goal.target_value} {goal.unit}
                          </p>
                        </div>
                      </div>

                      {goal.daysRemaining > 0 && (
                        <p className="text-xs text-center pt-2" style={{ color: 'var(--text-muted)' }}>
                          {goal.daysRemaining} days remaining
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </>
            ) : (
              <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
                <Target className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  No active goals
                </h3>
                <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
                  Set goals to track your progress more effectively
                </p>
                <Button
                  onClick={() => window.location.href = createPageUrl('Goals')}
                  className="gradient-accent text-white border-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Goal
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}