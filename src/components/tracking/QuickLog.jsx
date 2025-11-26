import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Clock, Zap, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function QuickLog({ onLogged }) {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Get frequently logged meals
  const { data: recentLogs = [] } = useQuery({
    queryKey: ['recentMealLogs'],
    queryFn: () => base44.entities.MealLog.list('-created_date', 20),
  });

  // Get user's favorite dishes
  const { data: favoriteDishes = [] } = useQuery({
    queryKey: ['favoriteDishes'],
    queryFn: async () => {
      const dishes = await base44.entities.Dish.list('-rating', 10);
      return dishes.filter(d => d.rating >= 4);
    },
  });

  // Get yesterday's meals for repeat
  const { data: yesterdayLogs = [] } = useQuery({
    queryKey: ['yesterdayLogs'],
    queryFn: async () => {
      const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
      return await base44.entities.MealLog.filter({ date: yesterday });
    },
  });

  const logMealMutation = useMutation({
    mutationFn: (mealData) => base44.entities.MealLog.create(mealData),
    onSuccess: () => {
      queryClient.invalidateQueries(['mealLogs']);
      toast.success('Meal logged!');
      if (onLogged) onLogged();
    },
  });

  const quickLogDish = (dish, mealType = 'snack') => {
    logMealMutation.mutate({
      date: today,
      meal_type: mealType,
      dish_name: dish.name,
      dish_id: dish.id,
      calories: dish.calories,
      protein: dish.protein,
      carbs: dish.carbs,
      fat: dish.fat,
      portion_size: 1
    });
  };

  const repeatYesterday = () => {
    yesterdayLogs.forEach(log => {
      logMealMutation.mutate({
        ...log,
        id: undefined,
        date: today,
        created_date: undefined,
        updated_date: undefined
      });
    });
    toast.success(`Repeated ${yesterdayLogs.length} meals from yesterday!`);
  };

  // Get most frequent meals
  const frequentMeals = recentLogs
    .reduce((acc, log) => {
      const existing = acc.find(m => m.dish_name === log.dish_name);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ ...log, count: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div className="space-y-4">
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Zap className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
          Quick Log
        </h3>

        {/* Repeat Yesterday */}
        {yesterdayLogs.length > 0 && (
          <Button
            onClick={repeatYesterday}
            className="w-full mb-4 gradient-accent text-white border-0"
          >
            <Clock className="w-4 h-4 mr-2" />
            Repeat Yesterday ({yesterdayLogs.length} meals)
          </Button>
        )}

        {/* Favorites */}
        {favoriteDishes.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Star className="w-4 h-4" style={{ color: 'var(--accent-from)' }} />
              Favorites
            </p>
            <div className="grid grid-cols-2 gap-2">
              {favoriteDishes.slice(0, 4).map((dish) => (
                <Button
                  key={dish.id}
                  onClick={() => quickLogDish(dish)}
                  variant="outline"
                  className="text-xs h-auto py-2"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {dish.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Frequently Logged */}
        {frequentMeals.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Frequently Logged
            </p>
            <div className="space-y-2">
              {frequentMeals.map((meal, idx) => (
                <button
                  key={idx}
                  onClick={() => quickLogDish(meal)}
                  className="w-full text-left p-3 rounded-xl hover:scale-105 transition-transform"
                  style={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border-soft)' }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        {meal.dish_name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {meal.calories} kcal • Logged {meal.count}x
                      </p>
                    </div>
                    <Plus className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}