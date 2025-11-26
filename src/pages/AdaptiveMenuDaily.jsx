import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Activity, Moon, Footprints, ArrowLeft, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { PersonalizedAIEngine } from "../components/ai/PersonalizedAIEngine";

export default function AdaptiveMenuDaily() {
  const [todayMenu, setTodayMenu] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const { data: recentLogs = [] } = useQuery({
    queryKey: ['recentMealLogs'],
    queryFn: () => base44.entities.MealLog.list('-date', 50),
  });

  const { data: wearableData = [] } = useQuery({
    queryKey: ['wearableData'],
    queryFn: () => base44.entities.WearableData.list('-date', 14),
  });

  const { data: existingMenu } = useQuery({
    queryKey: ['adaptiveMenu', today],
    queryFn: () => base44.entities.AdaptiveMenu.filter({ date: today }),
  });

  useEffect(() => {
    if (existingMenu && existingMenu.length > 0) {
      setTodayMenu(existingMenu[0]);
    } else if (profile && wearableData.length > 0) {
      generateMenu();
    }
  }, [existingMenu, profile, wearableData]);

  const generateMenu = async () => {
    setIsGenerating(true);
    try {
      const yesterdayLogs = recentLogs.filter(l => l.date === yesterday);
      const yesterdayData = wearableData.find(w => w.date === yesterday);
      
      const yesterdayCalories = yesterdayLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
      const yesterdayProtein = yesterdayLogs.reduce((sum, l) => sum + (l.protein || 0), 0);

      const prompt = `Generate TODAY'S adaptive menu based on comprehensive data analysis.

YESTERDAY'S PERFORMANCE:
- Calories: ${yesterdayCalories} (target: ${profile?.target_calories || 2000})
- Protein: ${yesterdayProtein}g (target: ${profile?.target_protein || 150}g)
- Steps: ${yesterdayData?.steps || 0} (typical: 8000)
- Sleep: ${yesterdayData?.sleep_hours || 0}h (recommended: 7-8h)
- Active Minutes: ${yesterdayData?.active_minutes || 0} min
- Calories Burned: ${yesterdayData?.calories_burned || 0} kcal

USER PROFILE:
- Goal: ${profile?.goal}
- Diet: ${profile?.diet_type}
- Activity Level: ${profile?.activity_level}
- Allergies: ${profile?.allergies?.join(', ') || 'none'}

AI ADAPTIVE LOGIC:
1. If yesterday's calories were ${yesterdayCalories > (profile?.target_calories || 2000) ? 'HIGH' : 'LOW'}, adjust today by ${Math.abs(yesterdayCalories - (profile?.target_calories || 2000))} kcal
2. If sleep was ${yesterdayData?.sleep_hours < 7 ? 'POOR' : 'GOOD'}, ${yesterdayData?.sleep_hours < 7 ? 'increase energy-dense carbs' : 'maintain balance'}
3. If activity was ${yesterdayData?.active_minutes > 60 ? 'HIGH' : 'LOW'}, ${yesterdayData?.active_minutes > 60 ? 'boost recovery protein' : 'standard portions'}
4. If protein was ${yesterdayProtein < (profile?.target_protein || 150) ? 'LOW' : 'ADEQUATE'}, ${yesterdayProtein < (profile?.target_protein || 150) ? 'prioritize protein sources' : 'maintain intake'}

Generate a complete day menu with breakfast, lunch, dinner, and snacks optimized for TODAY based on yesterday's data.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            adaptation_reason: { type: "string" },
            yesterday_analysis: { type: "string" },
            today_strategy: { type: "string" },
            meals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  meal_type: { type: "string" },
                  dish_name: { type: "string" },
                  calories: { type: "number" },
                  protein: { type: "number" },
                  carbs: { type: "number" },
                  fat: { type: "number" },
                  why_this_meal: { type: "string" }
                }
              }
            },
            total_calories: { type: "number" },
            total_protein: { type: "number" }
          }
        }
      });

      const menu = {
        date: today,
        adaptation_reason: result.adaptation_reason,
        meals: result.meals,
        is_accepted: false
      };

      const saved = await base44.entities.AdaptiveMenu.create(menu);
      setTodayMenu({ ...result, id: saved.id });
      toast.success('Adaptive menu generated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate menu');
    }
    setIsGenerating(false);
  };

  const acceptMenuMutation = useMutation({
    mutationFn: () => base44.entities.AdaptiveMenu.update(todayMenu.id, { is_accepted: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adaptiveMenu']);
      toast.success('Menu accepted!');
    },
  });

  const yesterdayData = wearableData.find(w => w.date === yesterday);
  const yesterdayLogs = recentLogs.filter(l => l.date === yesterday);
  const yesterdayCalories = yesterdayLogs.reduce((sum, l) => sum + (l.calories || 0), 0);

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" style={{ color: 'var(--accent-from)' }} />
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Analyzing Your Data & Generating Adaptive Menu...
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Factoring in yesterday's meals, activity, and sleep quality
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = createPageUrl('Dashboard')}
              className="w-12 h-12 rounded-2xl btn-secondary flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Today's Adaptive Menu
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <Button onClick={generateMenu} disabled={isGenerating} className="gradient-accent text-white border-0">
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </div>

        {/* Yesterday's Summary */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            📊 Yesterday's Data
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-orange-500" />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Calories</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {yesterdayCalories}
              </p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Footprints className="w-4 h-4 text-blue-500" />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Steps</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {yesterdayData?.steps || 0}
              </p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-4 h-4 text-purple-500" />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sleep</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {yesterdayData?.sleep_hours || 0}h
              </p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Active</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {yesterdayData?.active_minutes || 0}m
              </p>
            </div>
          </div>
        </Card>

        {todayMenu && (
          <>
            {/* Adaptation Insight */}
            <Card className="gradient-card border-0 p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                🧠 AI Adaptation Strategy
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                {todayMenu.adaptation_reason}
              </p>
            </Card>

            {/* Today's Meals */}
            <div className="space-y-4">
              {todayMenu.meals?.map((meal, idx) => (
                <Card key={idx} className="gradient-card border-0 p-6 rounded-3xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {meal.meal_type === 'breakfast' ? '🌅' : 
                           meal.meal_type === 'lunch' ? '☀️' : 
                           meal.meal_type === 'dinner' ? '🌙' : '🍎'}
                        </span>
                        <h3 className="text-lg font-bold capitalize" style={{ color: 'var(--text-primary)' }}>
                          {meal.meal_type}
                        </h3>
                      </div>
                      <p className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-from)' }}>
                        {meal.dish_name}
                      </p>
                      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        {meal.why_this_meal}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Calories</p>
                      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{meal.calories}</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Protein</p>
                      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{meal.protein}g</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Carbs</p>
                      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{meal.carbs}g</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fat</p>
                      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{meal.fat}g</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Accept Menu */}
            {!todayMenu.is_accepted && (
              <Card className="gradient-card border-0 p-6 rounded-3xl text-center">
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Ready to follow this adaptive menu today?
                </p>
                <Button
                  onClick={() => acceptMenuMutation.mutate()}
                  className="gradient-accent text-white border-0"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept & Start Following
                </Button>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}