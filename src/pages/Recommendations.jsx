import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  TrendingUp, 
  Heart, 
  Zap, 
  Clock, 
  Sun,
  Moon,
  Flame,
  Droplet,
  Loader2
} from "lucide-react";
import { format, startOfDay } from "date-fns";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const { data: todayLogs = [] } = useQuery({
    queryKey: ['mealLogs', today],
    queryFn: () => base44.entities.MealLog.filter({ date: today }),
  });

  const { data: recentLogs = [] } = useQuery({
    queryKey: ['recentLogs'],
    queryFn: () => base44.entities.MealLog.list('-date', 20),
  });

  const todayCalories = todayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const todayProtein = todayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const todayCarbs = todayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
  const todaySodium = todayLogs.reduce((sum, log) => sum + (log.sodium || 0), 0);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const prompt = `You are a professional nutritionist analyzing the user's food data. Provide personalized recommendations.

User Profile:
${JSON.stringify(profile, null, 2)}

Today's Intake:
- Calories: ${todayCalories}
- Protein: ${todayProtein}g
- Carbs: ${todayCarbs}g

Recent Meal Patterns:
${JSON.stringify(recentLogs.slice(0, 10), null, 2)}

Generate comprehensive recommendations in the following JSON format (no markdown, no backticks):
{
  "daily_tip": "A short actionable tip for today",
  "protein_status": "Analysis of protein intake",
  "hydration_reminder": "Water intake suggestion",
  "meal_timing": "Advice on meal timing",
  "nutrient_focus": "Which nutrients to focus on",
  "recipe_suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "swap_suggestions": [
    {"from": "less healthy food", "to": "healthier alternative", "reason": "why"}
  ],
  "weekly_goals": ["goal1", "goal2", "goal3"],
  "motivational_message": "Encouraging message based on their progress"
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            daily_tip: { type: "string" },
            protein_status: { type: "string" },
            hydration_reminder: { type: "string" },
            meal_timing: { type: "string" },
            nutrient_focus: { type: "string" },
            recipe_suggestions: { type: "array", items: { type: "string" } },
            swap_suggestions: { type: "array" },
            weekly_goals: { type: "array", items: { type: "string" } },
            motivational_message: { type: "string" }
          }
        }
      });

      setRecommendations(result);
    } catch (error) {
      console.error(error);
    }
    setIsGenerating(false);
  };

  const quickInsights = [
    {
      icon: Flame,
      title: "Calorie Balance",
      value: todayCalories > 0 ? `${Math.round(todayCalories)} kcal today` : "No meals logged yet",
      color: "text-orange-500",
      bg: "rgba(251, 146, 60, 0.2)"
    },
    {
      icon: Zap,
      title: "Protein Target",
      value: profile?.target_protein ? `${Math.round(todayProtein)}/${profile.target_protein}g` : "Set your target",
      color: "text-blue-500",
      bg: "rgba(59, 130, 246, 0.2)"
    },
    {
      icon: Heart,
      title: "Diet Type",
      value: profile?.diet_type ? profile.diet_type.replace(/_/g, ' ') : "Not set",
      color: "text-red-500",
      bg: "rgba(239, 68, 68, 0.2)"
    },
    {
      icon: TrendingUp,
      title: "Goal",
      value: profile?.goal ? profile.goal.replace(/_/g, ' ') : "Set your goal",
      color: "text-green-500",
      bg: "rgba(34, 197, 94, 0.2)"
    }
  ];

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Smart Recommendations
            </h1>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
              Personalized nutrition insights powered by AI
            </p>
          </div>
          <Button
            onClick={generateRecommendations}
            disabled={isGenerating}
            className="gradient-accent text-white border-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Recommendations
              </>
            )}
          </Button>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickInsights.map((insight, idx) => (
            <Card key={idx} className="gradient-card border-0 p-5 rounded-3xl">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center`}
                  style={{ background: insight.bg }}>
                  <insight.icon className={`w-5 h-5 ${insight.color}`} />
                </div>
              </div>
              <h3 className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                {insight.title}
              </h3>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {insight.value}
              </p>
            </Card>
          ))}
        </div>

        {!recommendations && !isGenerating && (
          <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-accent flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Get Your Personalized Recommendations
            </h3>
            <p className="mb-6 max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              Our AI will analyze your eating patterns, goals, and preferences to provide
              tailored nutrition advice and meal suggestions.
            </p>
            <Button
              onClick={generateRecommendations}
              className="gradient-accent text-white border-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Now
            </Button>
          </Card>
        )}

        {recommendations && (
          <div className="space-y-6">
            {/* Daily Tip */}
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center flex-shrink-0">
                  <Sun className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    💡 Today's Tip
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {recommendations.daily_tip}
                  </p>
                </div>
              </div>
            </Card>

            {/* Key Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Zap className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
                  Protein Status
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {recommendations.protein_status}
                </p>
              </Card>

              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Droplet className="w-5 h-5 text-blue-500" />
                  Hydration
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {recommendations.hydration_reminder}
                </p>
              </Card>

              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Clock className="w-5 h-5 text-purple-500" />
                  Meal Timing
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {recommendations.meal_timing}
                </p>
              </Card>

              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Heart className="w-5 h-5 text-red-500" />
                  Nutrient Focus
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {recommendations.nutrient_focus}
                </p>
              </Card>
            </div>

            {/* Recipe Suggestions */}
            {recommendations.recipe_suggestions && recommendations.recipe_suggestions.length > 0 && (
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  🍽️ Recipe Suggestions
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {recommendations.recipe_suggestions.map((recipe, idx) => (
                    <div key={idx} className="p-4 rounded-2xl"
                      style={{ background: 'var(--background)' }}>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {recipe}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Swap Suggestions */}
            {recommendations.swap_suggestions && recommendations.swap_suggestions.length > 0 && (
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  🔄 Smart Swaps
                </h3>
                <div className="space-y-4">
                  {recommendations.swap_suggestions.map((swap, idx) => (
                    <div key={idx} className="p-4 rounded-2xl"
                      style={{ background: 'var(--background)' }}>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="px-3 py-1 rounded-full text-sm"
                          style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--text-primary)' }}>
                          {swap.from}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>→</span>
                        <span className="px-3 py-1 rounded-full text-sm gradient-accent text-white">
                          {swap.to}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {swap.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Weekly Goals */}
            {recommendations.weekly_goals && recommendations.weekly_goals.length > 0 && (
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  🎯 This Week's Goals
                </h3>
                <div className="space-y-3">
                  {recommendations.weekly_goals.map((goal, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full gradient-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-white">{idx + 1}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)' }}>{goal}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Motivational Message */}
            <Card className="gradient-card border-0 p-8 rounded-3xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-accent flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {recommendations.motivational_message}
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}