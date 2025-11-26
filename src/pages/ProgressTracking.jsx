import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Target, Calendar, Download, Award } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import InteractiveHealthChart from '../components/progress/InteractiveHealthChart';
import GoalTracker from '../components/progress/GoalTracker';
import { toast } from 'sonner';

export default function ProgressTracking() {
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState('month');

  const { data: measurements = [] } = useQuery({
    queryKey: ['body-measurements'],
    queryFn: () => base44.entities.BodyMeasurement.list('-date', 90),
  });

  const { data: mealLogs = [] } = useQuery({
    queryKey: ['all-meal-logs'],
    queryFn: () => base44.entities.MealLog.list('-date', 90),
  });

  const { data: waterLogs = [] } = useQuery({
    queryKey: ['water-logs-progress'],
    queryFn: () => base44.entities.WaterLog.list('-date', 90),
  });

  const { data: wearableData = [] } = useQuery({
    queryKey: ['wearable-data-progress'],
    queryFn: () => base44.entities.WearableData.list('-date', 90),
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['body-goals'],
    queryFn: () => base44.entities.BodyGoal.filter({ is_active: true }),
  });

  const createGoalMutation = useMutation({
    mutationFn: (goal) => base44.entities.BodyGoal.create(goal),
    onSuccess: () => {
      queryClient.invalidateQueries(['body-goals']);
      toast.success('Goal created');
    },
  });

  // Aggregate daily data
  const getDailyData = () => {
    const dailyMap = {};
    
    // Weight data
    measurements.forEach(m => {
      const date = format(new Date(m.date), 'MMM dd');
      if (!dailyMap[date]) dailyMap[date] = { date };
      dailyMap[date].weight = m.weight;
      dailyMap[date].bmi = m.bmi;
    });

    // Nutrition data
    const mealsByDate = {};
    mealLogs.forEach(log => {
      const date = format(new Date(log.date), 'MMM dd');
      if (!mealsByDate[date]) {
        mealsByDate[date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      mealsByDate[date].calories += log.calories || 0;
      mealsByDate[date].protein += log.protein || 0;
      mealsByDate[date].carbs += log.carbs || 0;
      mealsByDate[date].fat += log.fat || 0;
    });

    Object.keys(mealsByDate).forEach(date => {
      if (!dailyMap[date]) dailyMap[date] = { date };
      Object.assign(dailyMap[date], mealsByDate[date]);
    });

    // Water data
    const waterByDate = {};
    waterLogs.forEach(log => {
      const date = format(new Date(log.date), 'MMM dd');
      waterByDate[date] = (waterByDate[date] || 0) + (log.amount || 0);
    });

    Object.keys(waterByDate).forEach(date => {
      if (!dailyMap[date]) dailyMap[date] = { date };
      dailyMap[date].water = waterByDate[date];
    });

    // Activity data
    wearableData.forEach(w => {
      const date = format(new Date(w.date), 'MMM dd');
      if (!dailyMap[date]) dailyMap[date] = { date };
      dailyMap[date].steps = w.steps;
      dailyMap[date].activeMinutes = w.active_minutes;
      dailyMap[date].sleep = w.sleep_hours;
    });

    return Object.values(dailyMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const dailyData = getDailyData();

  // Calculate statistics
  const getStats = () => {
    const latestMeasurement = measurements[0];
    const oldestMeasurement = measurements[measurements.length - 1];
    const weightChange = latestMeasurement && oldestMeasurement 
      ? (latestMeasurement.weight - oldestMeasurement.weight).toFixed(1)
      : 0;

    const totalCalories = mealLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const avgCalories = mealLogs.length ? (totalCalories / mealLogs.length).toFixed(0) : 0;

    const totalSteps = wearableData.reduce((sum, w) => sum + (w.steps || 0), 0);
    const avgSteps = wearableData.length ? Math.round(totalSteps / wearableData.length) : 0;

    return { weightChange, avgCalories, avgSteps };
  };

  const stats = getStats();

  const exportReport = () => {
    const csv = [
      ['Date', 'Weight', 'Calories', 'Protein', 'Steps', 'Water'],
      ...dailyData.map(d => [
        d.date,
        d.weight || '',
        d.calories || '',
        d.protein || '',
        d.steps || '',
        d.water || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Progress Tracking
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Comprehensive health metrics and insights
            </p>
          </div>
          <Button onClick={exportReport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <TrendingUp className="w-8 h-8 mb-3 text-blue-500" />
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Weight Change</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stats.weightChange > 0 ? '+' : ''}{stats.weightChange}kg
            </p>
          </Card>
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <Calendar className="w-8 h-8 mb-3 text-green-500" />
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Avg Daily Calories</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stats.avgCalories}
            </p>
          </Card>
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <Award className="w-8 h-8 mb-3 text-purple-500" />
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Avg Daily Steps</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stats.avgSteps.toLocaleString()}
            </p>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="body">Body Metrics</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <InteractiveHealthChart
                data={dailyData}
                title="Weight Progress"
                dataKey="weight"
                goal={goals[0]?.target_weight}
                unit="kg"
                chartType="line"
                color="#3B82F6"
              />
              <InteractiveHealthChart
                data={dailyData}
                title="Daily Calories"
                dataKey="calories"
                unit=" kcal"
                chartType="bar"
                color="#10B981"
              />
            </div>
          </TabsContent>

          <TabsContent value="body" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <InteractiveHealthChart
                data={dailyData}
                title="Weight Trend"
                dataKey="weight"
                goal={goals[0]?.target_weight}
                unit="kg"
                chartType="area"
                color="#3B82F6"
              />
              <InteractiveHealthChart
                data={dailyData}
                title="BMI Trend"
                dataKey="bmi"
                unit=""
                chartType="line"
                color="#8B5CF6"
              />
            </div>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <InteractiveHealthChart
                data={dailyData}
                title="Calorie Intake"
                dataKey="calories"
                unit=" kcal"
                chartType="bar"
                color="#10B981"
              />
              <InteractiveHealthChart
                data={dailyData}
                title="Protein Intake"
                dataKey="protein"
                unit="g"
                chartType="area"
                color="#F59E0B"
              />
              <InteractiveHealthChart
                data={dailyData}
                title="Macronutrients"
                dataKey="carbs"
                dataKey2="fat"
                unit="g"
                chartType="line"
                color="#3B82F6"
                color2="#EF4444"
              />
              <InteractiveHealthChart
                data={dailyData}
                title="Water Intake"
                dataKey="water"
                unit="ml"
                chartType="bar"
                color="#06B6D4"
              />
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <InteractiveHealthChart
                data={dailyData}
                title="Daily Steps"
                dataKey="steps"
                unit=" steps"
                chartType="bar"
                color="#8B5CF6"
              />
              <InteractiveHealthChart
                data={dailyData}
                title="Active Minutes"
                dataKey="activeMinutes"
                unit=" min"
                chartType="area"
                color="#10B981"
              />
              <InteractiveHealthChart
                data={dailyData}
                title="Sleep Duration"
                dataKey="sleep"
                unit=" hrs"
                chartType="line"
                color="#6366F1"
              />
            </div>
          </TabsContent>

          <TabsContent value="goals">
            <GoalTracker
              goals={goals}
              onAddGoal={(goal) => createGoalMutation.mutate(goal)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}