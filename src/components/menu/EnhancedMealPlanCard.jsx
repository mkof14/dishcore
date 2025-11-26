import React, { useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, ChevronDown, ChevronUp, Check, Trash2, ShoppingCart, 
  Flame, Activity, Apple, Droplet 
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import MealSlot from "./MealSlot";

export default function EnhancedMealPlanCard({ plan, onActivate, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(plan.is_active);
  const queryClient = useQueryClient();

  const updatePlanMutation = useMutation({
    mutationFn: (updatedPlan) => base44.entities.MealPlan.update(plan.id, updatedPlan),
    onSuccess: () => {
      queryClient.invalidateQueries(['mealPlans']);
      toast.success('Meal plan updated');
    }
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // Extract day indices from droppableId (format: "day-0", "day-1", etc.)
    const sourceDayIndex = parseInt(source.droppableId.split('-')[1]);
    const destDayIndex = parseInt(destination.droppableId.split('-')[1]);

    const updatedDays = [...plan.days];
    
    // Remove from source
    const [movedMeal] = updatedDays[sourceDayIndex].meals.splice(source.index, 1);
    
    // Add to destination
    updatedDays[destDayIndex].meals.splice(destination.index, 0, movedMeal);

    // Recalculate totals for both days
    [sourceDayIndex, destDayIndex].forEach(dayIndex => {
      const day = updatedDays[dayIndex];
      day.total_calories = day.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
      day.total_protein = day.meals.reduce((sum, m) => sum + (m.protein || 0), 0);
      day.total_carbs = day.meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
      day.total_fat = day.meals.reduce((sum, m) => sum + (m.fat || 0), 0);
    });

    updatePlanMutation.mutate({ ...plan, days: updatedDays });
  };

  const handleRemoveMeal = (dayIndex, mealIndex) => {
    const updatedDays = [...plan.days];
    updatedDays[dayIndex].meals.splice(mealIndex, 1);
    
    // Recalculate totals
    const day = updatedDays[dayIndex];
    day.total_calories = day.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    day.total_protein = day.meals.reduce((sum, m) => sum + (m.protein || 0), 0);
    day.total_carbs = day.meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
    day.total_fat = day.meals.reduce((sum, m) => sum + (m.fat || 0), 0);

    updatePlanMutation.mutate({ ...plan, days: updatedDays });
  };

  const handleAddMeal = (dayIndex, mealData) => {
    const updatedDays = [...plan.days];
    updatedDays[dayIndex].meals.push(mealData);
    
    // Recalculate totals
    const day = updatedDays[dayIndex];
    day.total_calories = day.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    day.total_protein = day.meals.reduce((sum, m) => sum + (m.protein || 0), 0);
    day.total_carbs = day.meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
    day.total_fat = day.meals.reduce((sum, m) => sum + (m.fat || 0), 0);

    updatePlanMutation.mutate({ ...plan, days: updatedDays });
  };

  const handleGenerateGroceryList = () => {
    // Navigate to grocery list page with plan ID
    window.location.href = createPageUrl('GroceryList') + `?planId=${plan.id}`;
  };

  const totalCalories = plan.days?.reduce((sum, day) => sum + (day.total_calories || 0), 0) || 0;
  const avgCaloriesPerDay = plan.days?.length > 0 ? Math.round(totalCalories / plan.days.length) : 0;

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {plan.name}
            </h3>
            {plan.is_active && (
              <Badge className="gradient-accent text-white border-0">
                <Check className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {plan.days?.length || 0} days
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4" />
              {avgCaloriesPerDay} cal/day avg
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateGroceryList}
            variant="outline"
            size="sm"
            style={{ borderColor: 'var(--border)' }}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Shopping List
          </Button>
          {!plan.is_active && (
            <Button onClick={onActivate} variant="outline" size="sm">
              Activate
            </Button>
          )}
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="sm"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button onClick={onDelete} variant="ghost" size="sm">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {plan.rationale && (
        <p className="text-sm mb-4 p-3 rounded-xl" 
          style={{ background: 'var(--background)', color: 'var(--text-secondary)' }}>
          {plan.rationale}
        </p>
      )}

      {isExpanded && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-4 mt-6">
            {plan.days?.map((day, dayIndex) => (
              <Card key={dayIndex} className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {format(new Date(day.date), 'EEEE, MMM d')}
                  </h4>
                  <div className="flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {day.total_calories || 0} cal
                    </div>
                    <div>P: {day.total_protein || 0}g</div>
                    <div>C: {day.total_carbs || 0}g</div>
                    <div>F: {day.total_fat || 0}g</div>
                  </div>
                </div>

                <Droppable droppableId={`day-${dayIndex}`}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2 min-h-[100px] p-2 rounded-xl transition-colors"
                      style={{
                        background: snapshot.isDraggingOver ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                      }}
                    >
                      {day.meals?.map((meal, mealIndex) => (
                        <MealSlot
                          key={mealIndex}
                          meal={meal}
                          mealIndex={mealIndex}
                          onRemove={() => handleRemoveMeal(dayIndex, mealIndex)}
                          onAdd={(mealData) => handleAddMeal(dayIndex, mealData)}
                        />
                      ))}
                      {provided.placeholder}
                      <MealSlot
                        meal={null}
                        mealIndex={day.meals?.length || 0}
                        onAdd={(mealData) => handleAddMeal(dayIndex, mealData)}
                      />
                    </div>
                  )}
                </Droppable>
              </Card>
            ))}
          </div>
        </DragDropContext>
      )}
    </Card>
  );
}