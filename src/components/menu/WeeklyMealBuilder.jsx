import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Calendar, ShoppingCart, TrendingUp, X } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WeeklyMealBuilder({ open, onClose }) {
  const [planName, setPlanName] = useState('My Weekly Plan');
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mealGrid, setMealGrid] = useState({});
  const queryClient = useQueryClient();

  const { data: dishes = [] } = useQuery({
    queryKey: ['dishes-for-planning'],
    queryFn: () => base44.entities.Dish.list('-created_date', 500),
  });

  const createPlanMutation = useMutation({
    mutationFn: (planData) => base44.entities.MealPlan.create(planData),
    onSuccess: () => {
      queryClient.invalidateQueries(['mealPlans']);
      toast.success('Meal plan created!');
      onClose();
      setMealGrid({});
    },
  });

  const filteredDishes = dishes.filter(dish => 
    dish.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addMealToSlot = (dayIndex, mealType, dish) => {
    const key = `${dayIndex}-${mealType}`;
    setMealGrid(prev => ({
      ...prev,
      [key]: dish
    }));
    setSelectedSlot(null);
    setSearchQuery('');
  };

  const removeMeal = (dayIndex, mealType) => {
    const key = `${dayIndex}-${mealType}`;
    setMealGrid(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const calculateDayTotals = (dayIndex) => {
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    MEAL_TYPES.forEach(mealType => {
      const meal = mealGrid[`${dayIndex}-${mealType}`];
      if (meal) {
        calories += meal.calories || 0;
        protein += meal.protein || 0;
        carbs += meal.carbs || 0;
        fat += meal.fat || 0;
      }
    });
    return { calories, protein, carbs, fat };
  };

  const handleSavePlan = () => {
    const days = DAYS_OF_WEEK.map((_, dayIndex) => {
      const meals = MEAL_TYPES.map(mealType => {
        const dish = mealGrid[`${dayIndex}-${mealType}`];
        return dish ? {
          meal_type: mealType,
          dish_id: dish.id,
          dish_name: dish.name,
          calories: dish.calories,
          protein: dish.protein,
          carbs: dish.carbs,
          fat: dish.fat
        } : null;
      }).filter(Boolean);

      const totals = calculateDayTotals(dayIndex);
      return {
        date: format(addDays(weekStart, dayIndex), 'yyyy-MM-dd'),
        meals,
        total_calories: totals.calories,
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_fat: totals.fat
      };
    });

    createPlanMutation.mutate({
      name: planName,
      start_date: format(weekStart, 'yyyy-MM-dd'),
      end_date: format(addDays(weekStart, 6), 'yyyy-MM-dd'),
      days,
      is_active: false
    });
  };

  const totalMealsAdded = Object.keys(mealGrid).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Calendar className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            Build Weekly Meal Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Plan name..."
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="flex-1"
            />
            <Badge variant="outline">{totalMealsAdded} meals added</Badge>
          </div>

          {/* Weekly Grid */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {DAYS_OF_WEEK.map((day, dayIndex) => {
              const dayTotals = calculateDayTotals(dayIndex);
              return (
                <Card key={dayIndex} className="p-3" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                  <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                    {day}
                  </h4>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                    {format(addDays(weekStart, dayIndex), 'MMM d')}
                  </p>

                  <div className="space-y-2">
                    {MEAL_TYPES.map(mealType => {
                      const key = `${dayIndex}-${mealType}`;
                      const meal = mealGrid[key];

                      return (
                        <div key={mealType}>
                          <p className="text-xs mb-1 capitalize" style={{ color: 'var(--text-muted)' }}>
                            {mealType}
                          </p>
                          {meal ? (
                            <div className="p-2 rounded-lg relative group"
                              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                {meal.name}
                              </p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {meal.calories} kcal
                              </p>
                              <button
                                onClick={() => removeMeal(dayIndex, mealType)}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center bg-red-500 text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedSlot({ dayIndex, mealType })}
                              className="w-full p-2 rounded-lg border-2 border-dashed flex items-center justify-center hover:border-blue-400 transition-colors"
                              style={{ borderColor: 'var(--border)' }}
                            >
                              <Plus className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {dayTotals.calories > 0 && (
                    <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                        <span>Total:</span>
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                          {dayTotals.calories} kcal
                        </span>
                      </div>
                      <div className="flex justify-between mt-1" style={{ color: 'var(--text-muted)' }}>
                        <span>P: {dayTotals.protein}g</span>
                        <span>C: {dayTotals.carbs}g</span>
                        <span>F: {dayTotals.fat}g</span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Recipe Selection */}
          {selectedSlot && (
            <Card className="p-4" style={{ background: 'var(--background)', border: '2px solid var(--accent-from)' }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Select {selectedSlot.mealType} for {DAYS_OF_WEEK[selectedSlot.dayIndex]}
                </h4>
                <Button size="sm" variant="ghost" onClick={() => setSelectedSlot(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <Input
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {filteredDishes.slice(0, 20).map(dish => (
                  <button
                    key={dish.id}
                    onClick={() => addMealToSlot(selectedSlot.dayIndex, selectedSlot.mealType, dish)}
                    className="p-3 rounded-lg text-left hover:border-blue-400 transition-colors"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {dish.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span>{dish.calories} kcal</span>
                      <span>•</span>
                      <span>P: {dish.protein}g</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSavePlan}
              disabled={totalMealsAdded === 0}
              className="flex-1 gradient-accent text-white border-0"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Save Plan ({totalMealsAdded} meals)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}