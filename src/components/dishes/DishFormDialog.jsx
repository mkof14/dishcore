
import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Upload, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { updateUserProgress } from "../gamification/progressUtils";

export default function DishFormDialog({ open, onClose, dish }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    difficulty: 'medium',
    meal_type: 'lunch',
    cuisine_type: '',
    spicy_level: 'none',
    image_url: '',
    ingredients: [],
    cooking_instructions: [],
    is_custom: true
  });
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: '', amount: '', unit: 'g' });
  const [newInstruction, setNewInstruction] = useState('');

  useEffect(() => {
    if (dish) {
      setFormData({
        ...dish,
        ingredients: dish.ingredients || [],
        cooking_instructions: dish.cooking_instructions || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        prep_time: 0,
        cook_time: 0,
        servings: 1,
        difficulty: 'medium',
        meal_type: 'lunch',
        cuisine_type: '',
        spicy_level: 'none',
        image_url: '',
        ingredients: [],
        cooking_instructions: [],
        is_custom: true
      });
    }
  }, [dish, open]);

  const saveDishMutation = useMutation({
    mutationFn: async (dishData) => {
      if (dish?.id) {
        return await base44.entities.Dish.update(dish.id, dishData);
      } else {
        return await base44.entities.Dish.create(dishData);
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries(['dishes']);
      
      // Award points for creating a recipe
      if (!dish) { // Only if a new dish is being created
        const result = await updateUserProgress(null, { type: 'recipe_created' }); // userId is null for now, progressUtils will derive it
        if (result.pointsEarned) {
          toast.success(`Recipe created! +${result.pointsEarned} points`);
        }
        if (result.newBadges?.length > 0) {
          toast.success('New badge unlocked! 🎉');
        }
        queryClient.invalidateQueries(['userProgress']);
      } else {
        toast.success('Recipe updated!');
      }
      
      onClose();
    },
    onError: (error) => {
        toast.error(`Failed to save recipe: ${error.message || 'Unknown error'}`);
    }
  });

  const handleGenerateImage = async () => {
    if (!formData.name) {
      toast.error('Please enter a dish name first');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Professional food photography of ${formData.name}, appetizing, high quality, on a white plate, natural lighting, restaurant style`
      });
      setFormData(prev => ({ ...prev, image_url: result.url }));
      toast.success('Image generated!');
    } catch (error) {
      toast.error('Failed to generate image');
    }
    setIsGeneratingImage(false);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.calories) {
      toast.error('Please fill in required fields');
      return;
    }
    saveDishMutation.mutate(formData);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addIngredient = () => {
    if (!newIngredient.name || !newIngredient.amount) {
      toast.error('Please fill in ingredient details');
      return;
    }
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...newIngredient }]
    }));
    setNewIngredient({ name: '', amount: '', unit: 'g' });
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const addInstruction = () => {
    if (!newInstruction.trim()) {
      toast.error('Please enter an instruction');
      return;
    }
    setFormData(prev => ({
      ...prev,
      cooking_instructions: [...prev.cooking_instructions, newInstruction]
    }));
    setNewInstruction('');
  };

  const removeInstruction = (index) => {
    setFormData(prev => ({
      ...prev,
      cooking_instructions: prev.cooking_instructions.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" 
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--text-primary)' }}>
            {dish ? 'Edit Recipe' : 'Create Custom Recipe'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3" style={{ background: 'var(--background)' }}>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-4">
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Recipe Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="mt-2"
                rows={3}
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Image URL</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={formData.image_url}
                  onChange={(e) => updateField('image_url', e.target.value)}
                  placeholder="Enter image URL or generate with AI"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <Button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="gradient-accent text-white border-0"
                >
                  {isGeneratingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Servings</Label>
                <Input
                  type="number"
                  value={formData.servings}
                  onChange={(e) => updateField('servings', parseInt(e.target.value))}
                  className="mt-2"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Prep Time (min)</Label>
                <Input
                  type="number"
                  value={formData.prep_time}
                  onChange={(e) => updateField('prep_time', parseInt(e.target.value))}
                  className="mt-2"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Cook Time (min)</Label>
                <Input
                  type="number"
                  value={formData.cook_time}
                  onChange={(e) => updateField('cook_time', parseInt(e.target.value))}
                  className="mt-2"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Calories (kcal) *</Label>
                <Input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => updateField('calories', parseFloat(e.target.value))}
                  className="mt-2"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Protein (g)</Label>
                <Input
                  type="number"
                  value={formData.protein}
                  onChange={(e) => updateField('protein', parseFloat(e.target.value))}
                  className="mt-2"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Carbs (g)</Label>
                <Input
                  type="number"
                  value={formData.carbs}
                  onChange={(e) => updateField('carbs', parseFloat(e.target.value))}
                  className="mt-2"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Fat (g)</Label>
                <Input
                  type="number"
                  value={formData.fat}
                  onChange={(e) => updateField('fat', parseFloat(e.target.value))}
                  className="mt-2"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Meal Type</Label>
                <Select value={formData.meal_type} onValueChange={(val) => updateField('meal_type', val)}>
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
                <Label style={{ color: 'var(--text-secondary)' }}>Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(val) => updateField('difficulty', val)}>
                  <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Spicy Level</Label>
                <Select value={formData.spicy_level} onValueChange={(val) => updateField('spicy_level', val)}>
                  <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="very_hot">Very Hot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Cuisine Type</Label>
              <Input
                value={formData.cuisine_type}
                onChange={(e) => updateField('cuisine_type', e.target.value)}
                placeholder="e.g. Italian, Mexican, Asian"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </TabsContent>

          <TabsContent value="ingredients" className="space-y-4 pt-4">
            <div className="p-4 rounded-2xl space-y-3" style={{ background: 'var(--background)' }}>
              <Label style={{ color: 'var(--text-secondary)' }}>Add Ingredient</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ingredient name"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  className="flex-1"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <Input
                  placeholder="Amount"
                  value={newIngredient.amount}
                  onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
                  className="w-24"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <Select value={newIngredient.unit} onValueChange={(val) => setNewIngredient({ ...newIngredient, unit: val })}>
                  <SelectTrigger className="w-24" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="l">l</SelectItem>
                    <SelectItem value="cup">cup</SelectItem>
                    <SelectItem value="tbsp">tbsp</SelectItem>
                    <SelectItem value="tsp">tsp</SelectItem>
                    <SelectItem value="piece">piece</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addIngredient} className="gradient-accent text-white border-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'var(--background)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {ingredient.name} - {ingredient.amount} {ingredient.unit}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeIngredient(index)}
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {formData.ingredients.length === 0 && (
                <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  No ingredients added yet
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="instructions" className="space-y-4 pt-4">
            <div className="p-4 rounded-2xl space-y-3" style={{ background: 'var(--background)' }}>
              <Label style={{ color: 'var(--text-secondary)' }}>Add Instruction Step</Label>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Describe the cooking step..."
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  rows={2}
                  className="flex-1"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <Button onClick={addInstruction} className="gradient-accent text-white border-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {formData.cooking_instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--background)' }}>
                  <div className="w-6 h-6 rounded-full gradient-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <p className="flex-1" style={{ color: 'var(--text-primary)' }}>{instruction}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeInstruction(index)}
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {formData.cooking_instructions.length === 0 && (
                <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  No instructions added yet
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

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
            onClick={handleSubmit}
            disabled={saveDishMutation.isPending}
            className="flex-1 gradient-accent text-white border-0"
          >
            {saveDishMutation.isPending ? 'Saving...' : (dish ? 'Update Recipe' : 'Create Recipe')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
