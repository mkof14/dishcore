import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Target } from "lucide-react";
import { format, startOfDay } from "date-fns";

export default function SmartRecipeMatcher({ dishes, onRecipeClick }) {
  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const { data: todayLogs = [] } = useQuery({
    queryKey: ['todayMealLogs'],
    queryFn: () => base44.entities.MealLog.filter({ date: today }),
  });

  const { data: wearableData = [] } = useQuery({
    queryKey: ['todayWearable'],
    queryFn: async () => {
      const data = await base44.entities.WearableData.filter({ date: today });
      return data;
    },
  });

  if (!profile) return null;

  // Calculate today's intake
  const todayIntake = {
    calories: todayLogs.reduce((sum, log) => sum + (log.calories || 0), 0),
    protein: todayLogs.reduce((sum, log) => sum + (log.protein || 0), 0),
    carbs: todayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0),
    fat: todayLogs.reduce((sum, log) => sum + (log.fat || 0), 0),
  };

  // Calculate gaps
  const gaps = {
    calories: (profile.target_calories || 2000) - todayIntake.calories,
    protein: (profile.target_protein || 150) - todayIntake.protein,
    carbs: (profile.target_carbs || 200) - todayIntake.carbs,
    fat: (profile.target_fat || 65) - todayIntake.fat,
  };

  // Adjust targets based on wearable data
  let adjustedGaps = { ...gaps };
  if (wearableData.length > 0) {
    const latestWearable = wearableData[0];
    const activeCalories = (latestWearable.active_minutes || 0) * 5;
    adjustedGaps.calories += activeCalories;
  }

  // Find matching recipes
  const matchedRecipes = dishes
    .filter(dish => dish.calories <= adjustedGaps.calories && dish.calories > 0)
    .map(dish => {
      // Calculate match score
      const proteinMatch = Math.abs(dish.protein - adjustedGaps.protein) / adjustedGaps.protein;
      const carbsMatch = Math.abs(dish.carbs - adjustedGaps.carbs) / adjustedGaps.carbs;
      const fatMatch = Math.abs(dish.fat - adjustedGaps.fat) / adjustedGaps.fat;
      const score = 100 - ((proteinMatch + carbsMatch + fatMatch) / 3) * 100;
      
      return { ...dish, matchScore: Math.max(0, score) };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  if (matchedRecipes.length === 0) return null;

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-green-500 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Smart Match for Your Goals
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Based on today's intake and your targets
            </p>
          </div>
        </div>

        <div className="mb-4 p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Calories Left</p>
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {Math.round(adjustedGaps.calories)}
              </p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Protein</p>
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {Math.round(adjustedGaps.protein)}g
              </p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Carbs</p>
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {Math.round(adjustedGaps.carbs)}g
              </p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Fat</p>
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {Math.round(adjustedGaps.fat)}g
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {matchedRecipes.map(recipe => (
            <button
              key={recipe.id}
              onClick={() => onRecipeClick(recipe)}
              className="w-full p-4 rounded-2xl text-left hover:scale-[1.02] transition-transform"
              style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {recipe.name}
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {recipe.calories} kcal • P: {recipe.protein}g • C: {recipe.carbs}g • F: {recipe.fat}g
                  </p>
                </div>
                <div className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                  {Math.round(recipe.matchScore)}% match
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}