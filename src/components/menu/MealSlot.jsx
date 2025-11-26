import React, { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Plus, X, Clock, Flame } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function MealSlot({ meal, mealIndex, onRemove, onAdd }) {
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: dishes = [] } = useQuery({
    queryKey: ['dishes'],
    queryFn: () => base44.entities.Dish.list('-created_date', 200),
    enabled: showRecipeSelector
  });

  const filteredDishes = dishes.filter(dish => 
    dish.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!meal?.meal_type || dish.meal_type === meal?.meal_type || !dish.meal_type)
  );

  const handleSelectRecipe = (dish) => {
    onAdd({
      meal_type: meal?.meal_type || 'lunch',
      dish_id: dish.id,
      dish_name: dish.name,
      calories: dish.calories,
      protein: dish.protein,
      carbs: dish.carbs,
      fat: dish.fat
    });
    setShowRecipeSelector(false);
    setSearchTerm("");
  };

  if (!meal) {
    return (
      <>
        <Card 
          className="p-4 rounded-2xl border-2 border-dashed cursor-pointer hover:border-blue-500 transition-colors"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          onClick={() => setShowRecipeSelector(true)}
        >
          <div className="flex items-center justify-center gap-2 text-center py-8">
            <Plus className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Add meal
            </span>
          </div>
        </Card>

        <Dialog open={showRecipeSelector} onOpenChange={setShowRecipeSelector}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Select a Recipe</DialogTitle>
            </DialogHeader>
            <div className="mb-4">
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredDishes.map(dish => {
                const totalTime = (dish.prep_time || 0) + (dish.cook_time || 0);
                return (
                  <Card
                    key={dish.id}
                    className="p-3 cursor-pointer hover:bg-blue-500/10 transition-colors"
                    onClick={() => handleSelectRecipe(dish)}
                  >
                    <div className="flex items-start gap-3">
                      {dish.image_url && (
                        <img
                          src={dish.image_url}
                          alt={dish.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                          {dish.name}
                        </h4>
                        <div className="flex flex-wrap gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <div className="flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {dish.calories} cal
                          </div>
                          <div>Protein: {dish.protein}g</div>
                          {totalTime > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {totalTime} min
                            </div>
                          )}
                        </div>
                        {dish.tags && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {dish.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
              {filteredDishes.length === 0 && (
                <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  No recipes found
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Draggable draggableId={`meal-${mealIndex}`} index={mealIndex}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="p-4 rounded-2xl relative"
          style={{
            ...provided.draggableProps.style,
            background: snapshot.isDragging ? 'rgba(59, 130, 246, 0.1)' : 'var(--surface)',
            border: `1px solid ${snapshot.isDragging ? '#3B82F6' : 'var(--border)'}`,
            boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0, 0, 0, 0.2)' : 'none'
          }}
        >
          <div className="flex items-start gap-3">
            <div {...provided.dragHandleProps} className="mt-1 cursor-grab active:cursor-grabbing">
              <GripVertical className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {meal.dish_name}
                  </h4>
                  <Badge variant="secondary" className="mt-1 text-xs capitalize">
                    {meal.meal_type}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  {meal.calories} cal
                </div>
                <div>P: {meal.protein}g</div>
                <div>C: {meal.carbs}g</div>
                <div>F: {meal.fat}g</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </Draggable>
  );
}