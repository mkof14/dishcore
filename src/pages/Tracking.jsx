
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, startOfDay, subDays } from "date-fns";
import { Plus, Calendar, Flame, Droplet, Activity, Apple, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { createPageUrl } from "@/utils";
import AddMealDialog from "../components/tracking/AddMealDialog";
import MealLogCard from "../components/tracking/MealLogCard";
import WaterTracker from "../components/tracking/WaterTracker";
import VoiceInput from "../components/tracking/VoiceInput";
import QuickLog from "../components/tracking/QuickLog";
import PredictiveInsights from "../components/ai/PredictiveInsights";

export default function Tracking() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const { data: todayLogs = [], isLoading } = useQuery({
    queryKey: ['mealLogs', selectedDate],
    queryFn: () => base44.entities.MealLog.filter({ date: selectedDate }, '-created_date'),
  });

  const { data: weekLogs = [] } = useQuery({
    queryKey: ['weekLogs'],
    queryFn: async () => {
      const logs = await base44.entities.MealLog.list('-date', 50);
      return logs.filter(log => {
        const logDate = new Date(log.date);
        const weekAgo = subDays(new Date(), 7);
        return logDate >= weekAgo;
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MealLog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['mealLogs', selectedDate]); // Invalidate specific date logs
      queryClient.invalidateQueries(['weekLogs']);
    },
  });

  const todayCalories = todayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const todayProtein = todayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const todayCarbs = todayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
  const todayFat = todayLogs.reduce((sum, log) => sum + (log.fat || 0), 0);

  const targetCalories = profile?.target_calories || 2000;
  const targetProtein = profile?.target_protein || 150;
  const targetCarbs = profile?.target_carbs || 200;
  const targetFat = profile?.target_fat || 65;

  const mealsByType = {
    breakfast: todayLogs.filter(log => log.meal_type === 'breakfast'),
    lunch: todayLogs.filter(log => log.meal_type === 'lunch'),
    dinner: todayLogs.filter(log => log.meal_type === 'dinner'),
    snack: todayLogs.filter(log => log.meal_type === 'snack')
  };

  const weekStats = weekLogs.reduce((acc, log) => {
    const date = log.date;
    if (!acc[date]) {
      acc[date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    acc[date].calories += log.calories || 0;
    acc[date].protein += log.protein || 0;
    acc[date].carbs += log.carbs || 0;
    acc[date].fat += log.fat || 0;
    return acc;
  }, {});

  const handleVoiceFoodDetected = (foodData) => {
    setEditingLog({
      date: selectedDate,
      meal_type: foodData.meal_type || 'snack', // Default to snack if not specified
      dish_name: foodData.name,
      calories: foodData.calories,
      protein: foodData.protein,
      carbs: foodData.carbs,
      fat: foodData.fat,
      portion_size: foodData.portion_size
    });
    setShowAddDialog(true);
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = createPageUrl('Dashboard')}
              className="w-12 h-12 rounded-2xl btn-secondary flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Food Tracking
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                Log your meals and track your nutrition
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 rounded-xl"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)'
              }}
            />
            <Button
              onClick={() => {
                setEditingLog(null);
                setShowAddDialog(true);
              }}
              className="gradient-accent text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Meal
            </Button>
          </div>
        </div>

        {/* Voice Input & Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="gradient-card border-0 p-6 rounded-3xl flex flex-col items-center justify-center">
            <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              🎤 Voice Log
            </h3>
            <VoiceInput onFoodDetected={handleVoiceFoodDetected} />
            <p className="text-xs mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
              Say: "200g chicken breast and rice for lunch"
            </p>
          </Card>
          
          <div className="md:col-span-2">
            <QuickLog onLogged={() => queryClient.invalidateQueries(['mealLogs', selectedDate])} />
          </div>
        </div>

        {/* Predictive AI Insights */}
        <PredictiveInsights />

        {/* Daily Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="gradient-card border-0 p-5 rounded-3xl col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Calories</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {Math.round(todayCalories)}
                </p>
              </div>
            </div>
            <Progress value={(todayCalories / targetCalories) * 100} className="h-2" />
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              {targetCalories - Math.round(todayCalories)} left
            </p>
          </Card>

          <Card className="gradient-card border-0 p-5 rounded-3xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Protein</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {Math.round(todayProtein)}g
                </p>
              </div>
            </div>
            <Progress value={(todayProtein / targetProtein) * 100} className="h-2" />
          </Card>

          <Card className="gradient-card border-0 p-5 rounded-3xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(251, 146, 60, 0.2)' }}>
                <Apple className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Carbs</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {Math.round(todayCarbs)}g
                </p>
              </div>
            </div>
            <Progress value={(todayCarbs / targetCarbs) * 100} className="h-2" />
          </Card>

          <Card className="gradient-card border-0 p-5 rounded-3xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(168, 85, 247, 0.2)' }}>
                <Droplet className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fat</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {Math.round(todayFat)}g
                </p>
              </div>
            </div>
            <Progress value={(todayFat / targetFat) * 100} className="h-2" />
          </Card>

          <WaterTracker date={selectedDate} />
        </div>

        {/* Meals by Type */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                🌅 Breakfast
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingLog({ meal_type: 'breakfast', date: selectedDate });
                  setShowAddDialog(true);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {mealsByType.breakfast.length > 0 ? (
              <div className="space-y-3">
                {mealsByType.breakfast.map(log => (
                  <MealLogCard
                    key={log.id}
                    log={log}
                    onEdit={(log) => {
                      setEditingLog(log);
                      setShowAddDialog(true);
                    }}
                    onDelete={() => deleteMutation.mutate(log.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                No breakfast logged
              </p>
            )}
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                ☀️ Lunch
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingLog({ meal_type: 'lunch', date: selectedDate });
                  setShowAddDialog(true);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {mealsByType.lunch.length > 0 ? (
              <div className="space-y-3">
                {mealsByType.lunch.map(log => (
                  <MealLogCard
                    key={log.id}
                    log={log}
                    onEdit={(log) => {
                      setEditingLog(log);
                      setShowAddDialog(true);
                    }}
                    onDelete={() => deleteMutation.mutate(log.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                No lunch logged
              </p>
            )}
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                🌙 Dinner
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingLog({ meal_type: 'dinner', date: selectedDate });
                  setShowAddDialog(true);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {mealsByType.dinner.length > 0 ? (
              <div className="space-y-3">
                {mealsByType.dinner.map(log => (
                  <MealLogCard
                    key={log.id}
                    log={log}
                    onEdit={(log) => {
                      setEditingLog(log);
                      setShowAddDialog(true);
                    }}
                    onDelete={() => deleteMutation.mutate(log.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                No dinner logged
              </p>
            )}
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                🍎 Snacks
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingLog({ meal_type: 'snack', date: selectedDate });
                  setShowAddDialog(true);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {mealsByType.snack.length > 0 ? (
              <div className="space-y-3">
                {mealsByType.snack.map(log => (
                  <MealLogCard
                    key={log.id}
                    log={log}
                    onEdit={(log) => {
                      setEditingLog(log);
                      setShowAddDialog(true);
                    }}
                    onDelete={() => deleteMutation.mutate(log.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                No snacks logged
              </p>
            )}
          </Card>
        </div>

        {/* Weekly Overview */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            📊 Weekly Overview
          </h3>
          <div className="space-y-3">
            {Object.entries(weekStats).reverse().slice(0, 7).map(([date, stats]) => (
              <div key={date} className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: 'var(--bg-surface-alt)' }}>
                <div className="w-32">
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {format(new Date(date), 'EEE, MMM d')}
                  </p>
                </div>
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Calories</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {Math.round(stats.calories)}
                      </span>
                    </div>
                    <Progress value={(stats.calories / targetCalories) * 100} className="h-2" />
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    P: {Math.round(stats.protein)}g • C: {Math.round(stats.carbs)}g • F: {Math.round(stats.fat)}g
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <AddMealDialog
        open={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setEditingLog(null);
          // Invalidate queries after adding/editing a meal to reflect changes
          queryClient.invalidateQueries(['mealLogs', selectedDate]);
          queryClient.invalidateQueries(['weekLogs']);
        }}
        log={editingLog}
        date={selectedDate}
      />
    </div>
  );
}
