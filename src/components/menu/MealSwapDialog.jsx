import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, ArrowRight, Flame, Activity } from "lucide-react";
import { toast } from "sonner";

export default function MealSwapDialog({ open, onClose, meal, date, planId }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: dishes = [] } = useQuery({
    queryKey: ['dishes'],
    queryFn: () => base44.entities.Dish.list('-created_date', 200),
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ planId, updatedPlan }) => {
      return await base44.entities.MealPlan.update(planId, updatedPlan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mealPlans']);
      queryClient.invalidateQueries(['activeMealPlan']);
      toast.success('Meal swapped successfully!');
      onClose();
    },
  });

  const generateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Given the current meal:
Name: ${meal.dish_name}
Type: ${meal.meal_type}
Calories: ${meal.calories}
Protein: ${meal.protein}g
Carbs: ${meal.carbs}g
Fat: ${meal.fat}g

User Profile:
- Goal: ${profile?.goal || 'balanced nutrition'}
- Diet Type: ${profile?.diet_type || 'balanced'}
- Allergies: ${profile?.allergies?.join(', ') || 'none'}
- Foods to Avoid: ${profile?.foods_to_avoid?.join(', ') || 'none'}

Available Dishes: ${JSON.stringify(dishes.map(d => ({
  id: d.id,
  name: d.name,
  meal_type: d.meal_type,
  calories: d.calories,
  protein: d.protein,
  carbs: d.carbs,
  fat: d.fat,
  cuisine_type: d.cuisine_type
})))}

Suggest 3-5 optimal meal swaps from available dishes. Consider:
1. Similar meal type
2. Similar nutritional values (±20% calories)
3. User's dietary preferences and restrictions
4. Variety in cuisine types

Return ONLY valid JSON (no markdown):
{
  "suggestions": [
    {
      "dish_id": "id",
      "dish_name": "name",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "reason": "why this is a good swap",
      "nutritional_match": number (0-100, how close nutritionally),
      "preference_match": number (0-100, how well it matches user preferences)
    }
  ]
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  dish_id: { type: "string" },
                  dish_name: { type: "string" },
                  calories: { type: "number" },
                  protein: { type: "number" },
                  carbs: { type: "number" },
                  fat: { type: "number" },
                  reason: { type: "string" },
                  nutritional_match: { type: "number" },
                  preference_match: { type: "number" }
                }
              }
            }
          }
        }
      });

      setSuggestions(result.suggestions || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate suggestions');
    }
    setIsGenerating(false);
  };

  const handleSwap = async (suggestion) => {
    const { data: plans } = await queryClient.fetchQuery({
      queryKey: ['mealPlans'],
      queryFn: () => base44.entities.MealPlan.list('-created_date', 10),
    });

    const currentPlan = plans.find(p => p.id === planId);
    if (!currentPlan) {
      toast.error('Plan not found');
      return;
    }

    const updatedDays = currentPlan.days.map(day => {
      if (day.date === date) {
        const updatedMeals = day.meals.map(m => {
          if (m.dish_name === meal.dish_name && m.meal_type === meal.meal_type) {
            return {
              ...m,
              dish_id: suggestion.dish_id,
              dish_name: suggestion.dish_name,
              calories: suggestion.calories,
              protein: suggestion.protein,
              carbs: suggestion.carbs,
              fat: suggestion.fat
            };
          }
          return m;
        });

        const newTotalCalories = updatedMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
        const newTotalProtein = updatedMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
        const newTotalCarbs = updatedMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
        const newTotalFat = updatedMeals.reduce((sum, m) => sum + (m.fat || 0), 0);

        return {
          ...day,
          meals: updatedMeals,
          total_calories: newTotalCalories,
          total_protein: newTotalProtein,
          total_carbs: newTotalCarbs,
          total_fat: newTotalFat
        };
      }
      return day;
    });

    updatePlanMutation.mutate({
      planId,
      updatedPlan: { ...currentPlan, days: updatedDays }
    });
  };

  React.useEffect(() => {
    if (open && suggestions.length === 0) {
      generateSuggestions();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" 
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--text-primary)' }}>
            🔄 Smart Meal Swap
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Current Meal */}
          <Card className="gradient-card border-0 p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Current Meal</p>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {meal.dish_name}
                </h3>
                <div className="flex gap-3 mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {meal.calories} kcal
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    P: {meal.protein}g
                  </span>
                </div>
              </div>
              <Badge className="capitalize">{meal.meal_type}</Badge>
            </div>
          </Card>

          {/* Suggestions */}
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: 'var(--accent-from)' }} />
              <p style={{ color: 'var(--text-muted)' }}>AI is analyzing optimal swaps...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  AI-Recommended Swaps
                </h3>
              </div>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="gradient-card border-0 p-4 rounded-2xl hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          {suggestion.dish_name}
                        </h4>
                        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                          {suggestion.reason}
                        </p>
                        <div className="flex gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {suggestion.calories} kcal
                            <span className={suggestion.calories < meal.calories ? 'text-green-500' : 'text-orange-500'}>
                              ({suggestion.calories > meal.calories ? '+' : ''}{suggestion.calories - meal.calories})
                            </span>
                          </span>
                          <span>P: {suggestion.protein}g</span>
                          <span>C: {suggestion.carbs}g</span>
                          <span>F: {suggestion.fat}g</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">
                            {suggestion.nutritional_match}% Nutritional Match
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.preference_match}% Preference Match
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSwap(suggestion)}
                        disabled={updatePlanMutation.isPending}
                        className="gradient-accent text-white border-0"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Swap
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              No suggestions available
            </p>
          )}

          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={generateSuggestions}
              disabled={isGenerating}
              className="flex-1 gradient-accent text-white border-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Regenerate Suggestions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}