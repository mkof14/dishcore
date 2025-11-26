import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import MealPlanCard from "../components/menu/MealPlanCard";
import EnhancedMealPlanCard from "../components/menu/EnhancedMealPlanCard";
import GeneratePlanDialog from "../components/menu/GeneratePlanDialog";
import WeeklyMealBuilder from "../components/menu/WeeklyMealBuilder";

const MEAL_TIMING_MAP = {
  'regular': ['breakfast', 'lunch', 'dinner'],
  'frequent': ['breakfast', 'snack', 'lunch', 'snack', 'dinner'],
  'intermittent': ['lunch', 'dinner']
};

const MACRO_RATIOS = {
  'balanced': { protein: 30, carbs: 40, fat: 30 },
  'high_protein': { protein: 40, carbs: 35, fat: 25 },
  'low_carb': { protein: 40, carbs: 20, fat: 40 },
  'keto': { protein: 25, carbs: 5, fat: 70 }
};

export default function MenuPlanner() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showBuilderDialog, setShowBuilderDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list('-created_date'),
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const activatePlanMutation = useMutation({
    mutationFn: async (planId) => {
      await Promise.all(
        plans.map(p => base44.entities.MealPlan.update(p.id, { is_active: false }))
      );
      return await base44.entities.MealPlan.update(planId, { is_active: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      queryClient.invalidateQueries({ queryKey: ['activeMealPlan'] });
      toast.success('Meal plan activated!');
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id) => base44.entities.MealPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      toast.success('Meal plan deleted!');
    },
  });

  const handleGeneratePlan = async (preferences) => {
    setIsGenerating(true);
    setShowDialog(false);

    try {
      const dishes = await base44.entities.Dish.list('-created_date', 500);
      
      if (dishes.length === 0) {
        toast.error('Please add some dishes to your library first');
        setIsGenerating(false);
        return;
      }

      const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      const mealTypes = MEAL_TIMING_MAP[preferences.meal_timing] || MEAL_TIMING_MAP.regular;
      const macroRatios = MACRO_RATIOS[preferences.macro_balance] || MACRO_RATIOS.balanced;
      
      const prompt = `Generate a ${preferences.duration}-day comprehensive personalized meal plan.

USER PROFILE:
- Primary Goal: ${profile?.goal || 'balanced nutrition'}
- Diet Type: ${profile?.diet_type || 'balanced'}
- Target Calories: ${profile?.target_calories || 2000} kcal/day
- Target Protein: ${profile?.target_protein || 150}g/day
- Target Carbs: ${profile?.target_carbs || 200}g/day
- Target Fat: ${profile?.target_fat || 65}g/day
- Activity Level: ${profile?.activity_level || 'moderately_active'}
- Strict Allergies: ${profile?.allergies?.join(', ') || 'none'}
- Foods to Avoid: ${profile?.foods_to_avoid?.join(', ') || 'none'}
- Dietary Restrictions: ${profile?.dietary_restrictions?.join(', ') || 'none'}
- Favorite Cuisines: ${profile?.favorite_cuisines?.join(', ') || 'any'}

PREFERENCES:
- Budget: ${preferences.budget} (low=simple ingredients, high=premium options)
- Variety: ${preferences.variety} (minimal=repeat favorites, maximum=all different)
- Cooking Complexity: ${preferences.cooking_complexity}
- Meal Timing: ${preferences.meal_timing} (${mealTypes.length} meals per day: ${mealTypes.join(', ')})
- Macro Balance: ${preferences.macro_balance} (${macroRatios.protein}% protein, ${macroRatios.carbs}% carbs, ${macroRatios.fat}% fat)
${preferences.focus_areas.length > 0 ? `- Health Focus: ${preferences.focus_areas.join(', ')}` : ''}
${preferences.custom_notes ? `- Custom Instructions: ${preferences.custom_notes}` : ''}

AVAILABLE DISHES: ${JSON.stringify(dishes.map(d => ({
  id: d.id,
  name: d.name,
  calories: d.calories,
  protein: d.protein,
  carbs: d.carbs,
  fat: d.fat,
  fiber: d.fiber,
  sugar: d.sugar,
  meal_type: d.meal_type,
  cuisine_type: d.cuisine_type,
  prep_time: d.prep_time,
  cook_time: d.cook_time,
  difficulty: d.difficulty,
  allergens: d.allergens,
  tags: d.tags,
  spicy_level: d.spicy_level
})))}

CRITICAL REQUIREMENTS:
1. SAFETY FIRST: Absolutely avoid ALL allergens listed
2. Meet daily calorie targets (±8%)
3. Hit protein targets (±5g)
4. Balance carbs and fats according to macro ratio
5. Respect ALL dietary restrictions
6. Consider budget (low: basic ingredients, high: premium options)
7. Apply variety preference appropriately
8. Match cooking complexity to user preference
9. Distribute meals according to meal timing preference
10. Optimize prep/cook time for user's lifestyle
11. Include fiber-rich foods (25-35g/day)
12. Limit added sugars
13. Ensure meal progression throughout the day (light → substantial → moderate)
14. Consider activity level for portion sizes
15. Include favorite cuisines when possible
16. Address health focus areas through ingredient selection

For each day, provide:
- Complete meal breakdown with ${mealTypes.length} meals
- Detailed nutritional analysis
- Total daily macros
- Explain WHY each dish was chosen
- Note any health benefits related to focus areas

Return comprehensive JSON with plan name, detailed rationale, and ${preferences.duration} days of meals.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            rationale: { type: "string" },
            health_benefits: { type: "string" },
            days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  day_notes: { type: "string" },
                  meals: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        meal_type: { type: "string" },
                        dish_id: { type: "string" },
                        dish_name: { type: "string" },
                        calories: { type: "number" },
                        protein: { type: "number" },
                        carbs: { type: "number" },
                        fat: { type: "number" },
                        fiber: { type: "number" },
                        selection_reason: { type: "string" }
                      }
                    }
                  },
                  total_calories: { type: "number" },
                  total_protein: { type: "number" },
                  total_carbs: { type: "number" },
                  total_fat: { type: "number" },
                  total_fiber: { type: "number" },
                  macro_distribution: { type: "string" },
                  health_score: { type: "number" }
                }
              }
            }
          }
        }
      });

      const planWithDates = {
        name: result.name,
        rationale: result.rationale,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(addDays(startDate, preferences.duration - 1), 'yyyy-MM-dd'),
        days: result.days.map((day, index) => ({
          ...day,
          date: format(addDays(startDate, index), 'yyyy-MM-dd')
        })),
        is_active: false
      };

      await base44.entities.MealPlan.create(planWithDates);
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      toast.success(`${preferences.duration}-day personalized meal plan generated!`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate meal plan');
    }

    setIsGenerating(false);
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
                AI Menu Planner
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                Personalized meal planning powered by advanced AI
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowBuilderDialog(true)}
              variant="outline"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Build Manually
            </Button>
            <Button
              onClick={() => setShowDialog(true)}
              disabled={isGenerating}
              className="gradient-accent text-white border-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Plan
                </>
              )}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2].map(i => (
              <Card key={i} className="gradient-card border-0 rounded-3xl h-64 animate-pulse" />
            ))}
          </div>
        ) : plans.length > 0 ? (
          <div className="space-y-6">
            {plans.map(plan => (
              <EnhancedMealPlanCard
                key={plan.id}
                plan={plan}
                onActivate={() => activatePlanMutation.mutate(plan.id)}
                onDelete={() => deletePlanMutation.mutate(plan.id)}
              />
            ))}
          </div>
        ) : (
          <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--accent-from)' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No meal plans yet
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
              Generate your first AI-powered personalized meal plan with advanced nutritional optimization
            </p>
            <Button
              onClick={() => setShowDialog(true)}
              className="gradient-accent text-white border-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Your First Plan
            </Button>
          </Card>
        )}
      </div>

      <GeneratePlanDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onGenerate={handleGeneratePlan}
        profile={profile}
      />

      <WeeklyMealBuilder
        open={showBuilderDialog}
        onClose={() => setShowBuilderDialog(false)}
      />
    </div>
  );
}