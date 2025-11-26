import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Camera } from "lucide-react";
import { toast } from "sonner";
import { updateUserProgress } from "../gamification/progressUtils";

export default function AddMealDialog({ open, onClose, log, date }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDish, setSelectedDish] = useState(null);
  const [formData, setFormData] = useState({
    date: date,
    meal_type: 'lunch',
    dish_name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    portion_size: 1,
    notes: ''
  });

  const { data: dishes = [] } = useQuery({
    queryKey: ['dishes'],
    queryFn: () => base44.entities.Dish.list(),
    enabled: open
  });

  useEffect(() => {
    if (log) {
      setFormData({ ...log, date });
      if (log.dish_id) {
        const foundDish = dishes.find(dish => dish.id === log.dish_id);
        if (foundDish) {
          setSelectedDish(foundDish);
        }
      }
    } else {
      setFormData({
        date,
        meal_type: log?.meal_type || 'lunch',
        dish_name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        portion_size: 1,
        notes: ''
      });
      setSelectedDish(null);
    }
  }, [log, date, open, dishes]);

  const filteredDishes = dishes.filter(dish =>
    dish.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saveMealMutation = useMutation({
    mutationFn: async (mealData) => {
      if (log?.id) {
        return await base44.entities.MealLog.update(log.id, mealData);
      } else {
        return await base44.entities.MealLog.create(mealData);
      }
    },
    onSuccess: async (_, mealData) => {
      queryClient.invalidateQueries(['mealLogs']);
      queryClient.invalidateQueries(['weekLogs']);
      
      if (!log?.id) {
        const isHealthy = selectedDish?.health_score > 70;
        const result = await updateUserProgress(null, { 
          type: 'meal_logged',
          isHealthy,
          mealType: mealData.meal_type
        });
        
        queryClient.invalidateQueries(['userProgress']);
        toast.success('Meal logged!');
      } else {
        toast.success('Meal updated!');
      }
      
      onClose();
    },
  });

  const handleDishSelect = (dish) => {
    setSelectedDish(dish);
    setFormData(prev => ({
      ...prev,
      dish_id: dish.id,
      dish_name: dish.name,
      calories: dish.calories * prev.portion_size,
      protein: dish.protein * prev.portion_size,
      carbs: dish.carbs * prev.portion_size,
      fat: dish.fat * prev.portion_size,
      image_url: dish.image_url
    }));
  };

  const handlePortionChange = (portion) => {
    const portionNum = parseFloat(portion) || 1;
    if (selectedDish) {
      setFormData(prev => ({
        ...prev,
        portion_size: portionNum,
        calories: selectedDish.calories * portionNum,
        protein: selectedDish.protein * portionNum,
        carbs: selectedDish.carbs * portionNum,
        fat: selectedDish.fat * portionNum
      }));
    } else {
      setFormData(prev => ({ ...prev, portion_size: portionNum }));
    }
  };

  const handleSubmit = () => {
    if (!formData.dish_name || !formData.calories) {
      toast.error('Please select a dish or enter meal details');
      return;
    }
    saveMealMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--text-primary)' }}>
            {log?.id ? 'Edit Meal' : 'Log Meal'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Meal Type</Label>
              <Select
                value={formData.meal_type}
                onValueChange={(val) => setFormData(prev => ({ ...prev, meal_type: val }))}
              >
                <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Portion Size</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.portion_size}
                onChange={(e) => handlePortionChange(e.target.value)}
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div>
            <Label style={{ color: 'var(--text-secondary)' }}>Search from Dish Library</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-muted)' }} />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search dishes..."
                className="pl-10"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            
            {searchTerm && (
              <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
                {filteredDishes.map(dish => (
                  <button
                    key={dish.id}
                    onClick={() => handleDishSelect(dish)}
                    className="w-full p-3 rounded-xl text-left hover:opacity-80 transition-opacity"
                    style={{
                      background: selectedDish?.id === dish.id ? 'var(--accent-from)' : 'var(--background)',
                      border: '1px solid var(--border)',
                      color: selectedDish?.id === dish.id ? 'white' : 'var(--text-primary)'
                    }}
                  >
                    <div className="font-semibold">{dish.name}</div>
                    <div className="text-sm" style={{
                      color: selectedDish?.id === dish.id ? 'white' : 'var(--text-muted)'
                    }}>
                      {dish.calories} kcal • P: {dish.protein}g • C: {dish.carbs}g • F: {dish.fat}g
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <Label style={{ color: 'var(--text-secondary)' }}>Or enter manually</Label>
          </div>

          <div>
            <Label style={{ color: 'var(--text-secondary)' }}>Dish Name</Label>
            <Input
              value={formData.dish_name}
              onChange={(e) => setFormData(prev => ({ ...prev, dish_name: e.target.value }))}
              className="mt-2"
              style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Calories</Label>
              <Input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData(prev => ({ ...prev, calories: parseFloat(e.target.value) }))}
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Protein (g)</Label>
              <Input
                type="number"
                value={formData.protein}
                onChange={(e) => setFormData(prev => ({ ...prev, protein: parseFloat(e.target.value) }))}
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Carbs (g)</Label>
              <Input
                type="number"
                value={formData.carbs}
                onChange={(e) => setFormData(prev => ({ ...prev, carbs: parseFloat(e.target.value) }))}
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Fat (g)</Label>
              <Input
                type="number"
                value={formData.fat}
                onChange={(e) => setFormData(prev => ({ ...prev, fat: parseFloat(e.target.value) }))}
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saveMealMutation.isPending}
              className="flex-1 gradient-accent text-white border-0"
            >
              {saveMealMutation.isPending ? 'Saving...' : (log?.id ? 'Update' : 'Log Meal')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}