import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Plus, X, Loader2, Save, Target, Zap } from "lucide-react";
import { toast } from "sonner";

const CUISINES = [
  "Italian", "Chinese", "Japanese", "Mexican", "Indian", "Thai", 
  "French", "Greek", "Spanish", "Korean", "Vietnamese", "Lebanese",
  "Turkish", "Brazilian", "Moroccan", "Any"
];

const DIETARY_RESTRICTIONS = [
  "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", 
  "Paleo", "Low-Carb", "High-Protein", "Diabetic-Friendly"
];

export default function AIRecipeGenerator({ open, onClose }) {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [cuisine, setCuisine] = useState("Any");
  const [restrictions, setRestrictions] = useState([]);
  const [preferences, setPreferences] = useState("");
  const [recipeCount, setRecipeCount] = useState(5);
  const [useNutritionalTargets, setUseNutritionalTargets] = useState(true);
  const [customTargets, setCustomTargets] = useState({
    calories: 500,
    protein: 30,
    carbs: 50,
    fat: 20
  });
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (ing) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const toggleRestriction = (restriction) => {
    setRestrictions(prev => 
      prev.includes(restriction) 
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const generateRecipes = async () => {
    if (ingredients.length === 0) {
      toast.error("Please add at least one ingredient");
      return;
    }

    setIsGenerating(true);
    try {
      const targetCalories = useNutritionalTargets && profile?.target_calories 
        ? Math.round(profile.target_calories / 3)
        : customTargets.calories;
      const targetProtein = useNutritionalTargets && profile?.target_protein 
        ? Math.round(profile.target_protein / 3)
        : customTargets.protein;
      const targetCarbs = useNutritionalTargets && profile?.target_carbs 
        ? Math.round(profile.target_carbs / 3)
        : customTargets.carbs;
      const targetFat = useNutritionalTargets && profile?.target_fat 
        ? Math.round(profile.target_fat / 3)
        : customTargets.fat;

      const profileRestrictions = profile?.dietary_restrictions || [];
      const profileAllergies = profile?.allergies || [];
      const profileDislikes = profile?.disliked_ingredients || [];
      
      const prompt = `Generate ${recipeCount} creative and nutritious recipes based on the following:

AVAILABLE INGREDIENTS TO USE:
${ingredients.join(", ")}

CUISINE PREFERENCE: ${cuisine}

USER DIETARY PROFILE:
- Diet Type: ${profile?.diet_type || 'balanced'}
- Primary Goal: ${profile?.goal || 'balanced nutrition'}
- Dietary Restrictions: ${[...profileRestrictions, ...restrictions].join(", ") || "None"}
- Allergies (MUST AVOID): ${profileAllergies.join(", ") || "None"}
- Disliked Ingredients (AVOID): ${profileDislikes.join(", ") || "None"}

NUTRITIONAL TARGETS PER RECIPE:
- Calories: ${targetCalories} kcal (±50)
- Protein: ${targetProtein}g (±5g)
- Carbs: ${targetCarbs}g (±10g)
- Fat: ${targetFat}g (±5g)

ADDITIONAL PREFERENCES:
${preferences || "None"}

CRITICAL REQUIREMENTS:
1. Use MOST of the provided ingredients as main components
2. STRICTLY avoid all allergies and respect dietary restrictions
3. Hit nutritional targets as closely as possible
4. Match cuisine style if specified
5. Provide complete nutritional data including fiber, sugar, sodium
6. Include detailed step-by-step instructions
7. Suggest only common pantry staples if additional ingredients needed
8. Ensure recipes are practical and achievable
9. Make recipes delicious and satisfying

For each recipe, provide:
- Creative, appetizing name
- Brief description highlighting key flavors
- Full ingredient list with precise quantities
- Step-by-step cooking instructions (numbered)
- Prep time and cook time (in minutes)
- Difficulty level (easy/medium/hard)
- Meal type (breakfast/lunch/dinner/snack)
- Complete nutritional info (calories, protein, carbs, fat, fiber, sugar, sodium)
- Number of servings

Return exactly ${recipeCount} diverse recipe options that meet the criteria.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recipes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  cuisine_type: { type: "string" },
                  meal_type: { type: "string" },
                  difficulty: { type: "string" },
                  prep_time: { type: "number" },
                  cook_time: { type: "number" },
                  servings: { type: "number" },
                  ingredients: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        amount: { type: "string" },
                        unit: { type: "string" }
                      }
                    }
                  },
                  cooking_instructions: {
                    type: "array",
                    items: { type: "string" }
                  },
                  calories: { type: "number" },
                  protein: { type: "number" },
                  carbs: { type: "number" },
                  fat: { type: "number" },
                  fiber: { type: "number" },
                  sugar: { type: "number" },
                  sodium: { type: "number" }
                }
              }
            }
          }
        }
      });

      setGeneratedRecipes(result.recipes || []);
      toast.success(`Generated ${result.recipes?.length || 0} personalized recipes!`);
    } catch (error) {
      toast.error("Failed to generate recipes");
      console.error(error);
    }
    setIsGenerating(false);
  };

  const saveMutation = useMutation({
    mutationFn: (recipe) => base44.entities.Dish.create({
      ...recipe,
      tags: [...restrictions, ...(profile?.dietary_restrictions || []), 'ai-generated'],
      is_custom: true,
      rating: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['dishes']);
      toast.success('Recipe saved to library!');
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error('Failed to save recipe');
    }
  });

  const [savedRecipes, setSavedRecipes] = useState([]);

  const handleSaveRecipe = (recipe) => {
    if (savedRecipes.includes(recipe.name)) {
      toast.info('Recipe already saved');
      return;
    }
    saveMutation.mutate(recipe);
    setSavedRecipes(prev => [...prev, recipe.name]);
  };

  const resetForm = () => {
    setIngredients([]);
    setCurrentIngredient("");
    setCuisine("Any");
    setRestrictions([]);
    setPreferences("");
    setGeneratedRecipes([]);
    setSavedRecipes([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" 
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-soft)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            AI Recipe Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {generatedRecipes.length === 0 && (
            <>
              {/* Ingredients */}
              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Available Ingredients *</Label>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                  Add ingredients you have on hand
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., chicken breast, tomatoes..."
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                    style={{
                      background: 'var(--bg-surface-alt)',
                      borderColor: 'var(--border-soft)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <Button onClick={addIngredient} className="gradient-accent text-white border-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {ingredients.map(ing => (
                    <Badge key={ing} className="px-3 py-1" 
                      style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-primary)', border: '1px solid var(--border-soft)' }}>
                      {ing}
                      <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => removeIngredient(ing)} />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Nutritional Targets */}
              <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-surface-alt)', borderColor: 'var(--border-soft)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" style={{ color: 'var(--accent-from)' }} />
                    <Label style={{ color: 'var(--text-secondary)' }}>Nutritional Targets</Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUseNutritionalTargets(!useNutritionalTargets)}
                    style={{ color: useNutritionalTargets ? 'var(--accent-from)' : 'var(--text-muted)' }}
                  >
                    {useNutritionalTargets ? 'Use Profile Targets' : 'Use Custom Targets'}
                  </Button>
                </div>
                
                {useNutritionalTargets && profile ? (
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-page)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Calories</p>
                      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                        {Math.round((profile.target_calories || 2000) / 3)}
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-page)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Protein</p>
                      <p className="font-bold text-blue-400">{Math.round((profile.target_protein || 150) / 3)}g</p>
                    </div>
                    <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-page)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Carbs</p>
                      <p className="font-bold text-orange-400">{Math.round((profile.target_carbs || 200) / 3)}g</p>
                    </div>
                    <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-page)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fat</p>
                      <p className="font-bold text-purple-400">{Math.round((profile.target_fat || 65) / 3)}g</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs" style={{ color: 'var(--text-muted)' }}>Calories: {customTargets.calories}</Label>
                      <Slider
                        value={[customTargets.calories]}
                        onValueChange={(v) => setCustomTargets({...customTargets, calories: v[0]})}
                        min={200}
                        max={1000}
                        step={50}
                        className="mt-2"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs" style={{ color: 'var(--text-muted)' }}>Protein: {customTargets.protein}g</Label>
                        <Slider
                          value={[customTargets.protein]}
                          onValueChange={(v) => setCustomTargets({...customTargets, protein: v[0]})}
                          min={10}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-xs" style={{ color: 'var(--text-muted)' }}>Carbs: {customTargets.carbs}g</Label>
                        <Slider
                          value={[customTargets.carbs]}
                          onValueChange={(v) => setCustomTargets({...customTargets, carbs: v[0]})}
                          min={10}
                          max={150}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-xs" style={{ color: 'var(--text-muted)' }}>Fat: {customTargets.fat}g</Label>
                        <Slider
                          value={[customTargets.fat]}
                          onValueChange={(v) => setCustomTargets({...customTargets, fat: v[0]})}
                          min={5}
                          max={80}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cuisine */}
              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Cuisine Type</Label>
                <Select value={cuisine} onValueChange={setCuisine}>
                  <SelectTrigger className="mt-2" style={{ background: 'var(--bg-surface-alt)', borderColor: 'var(--border-soft)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUISINES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dietary Restrictions */}
              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Additional Dietary Restrictions</Label>
                {profile?.dietary_restrictions && profile.dietary_restrictions.length > 0 && (
                  <p className="text-xs mt-1 mb-2" style={{ color: 'var(--text-muted)' }}>
                    From profile: {profile.dietary_restrictions.join(', ')}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {DIETARY_RESTRICTIONS.map(r => (
                    <Badge
                      key={r}
                      className="cursor-pointer px-3 py-1"
                      style={restrictions.includes(r) 
                        ? { background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))', color: 'white' }
                        : { background: 'var(--bg-surface-alt)', color: 'var(--text-primary)', border: '1px solid var(--border-soft)' }
                      }
                      onClick={() => toggleRestriction(r)}
                    >
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Recipe Count */}
              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>
                  Number of Recipes: {recipeCount}
                </Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    value={[recipeCount]}
                    onValueChange={(v) => setRecipeCount(v[0])}
                    min={3}
                    max={20}
                    step={1}
                    className="flex-1"
                  />
                  <Badge className="gradient-accent text-white border-0 px-3 py-1">
                    {recipeCount} recipes
                  </Badge>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Generate 3-20 recipes at once
                </p>
              </div>

              {/* Additional Preferences */}
              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Additional Preferences (Optional)</Label>
                <Textarea
                  placeholder="e.g., spicy, quick meals, kid-friendly, one-pot..."
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  className="mt-2"
                  style={{
                    background: 'var(--bg-surface-alt)',
                    borderColor: 'var(--border-soft)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={generateRecipes}
                  disabled={isGenerating || ingredients.length === 0}
                  className="flex-1 gradient-accent text-white border-0"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating {recipeCount} Recipes...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate {recipeCount} Recipes
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Generated Recipes */}
          {generatedRecipes.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  Generated Recipes ({generatedRecipes.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      generatedRecipes.forEach(recipe => handleSaveRecipe(recipe));
                    }}
                    className="gradient-accent text-white border-0"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save All {generatedRecipes.length}
                  </Button>
                  <Button variant="outline" onClick={resetForm} style={{ borderColor: 'var(--border-soft)' }}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate New
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {generatedRecipes.map((recipe, idx) => (
                  <div key={idx} className="p-6 rounded-2xl border" 
                    style={{ background: 'var(--bg-surface-alt)', borderColor: 'var(--border-soft)' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                          {recipe.name}
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {recipe.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA' }}>
                            {recipe.cuisine_type}
                          </Badge>
                          <Badge style={{ background: 'rgba(251, 146, 60, 0.2)', color: '#FB923C' }}>
                            {recipe.difficulty}
                          </Badge>
                          <Badge style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#A78BFA' }}>
                            {recipe.prep_time + recipe.cook_time} min
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSaveRecipe(recipe)}
                        className="gradient-accent text-white border-0"
                        disabled={saveMutation.isPending || savedRecipes.includes(recipe.name)}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {savedRecipes.includes(recipe.name) ? 'Saved ✓' : saveMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                    </div>

                    {/* Nutrition Info */}
                    <div className="grid grid-cols-4 gap-3 mb-4 p-4 rounded-xl" 
                      style={{ background: 'var(--bg-page)' }}>
                      <div className="text-center">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Calories</p>
                        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                          {Math.round(recipe.calories)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Protein</p>
                        <p className="text-lg font-bold text-blue-400">{Math.round(recipe.protein)}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Carbs</p>
                        <p className="text-lg font-bold text-orange-400">{Math.round(recipe.carbs)}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fat</p>
                        <p className="text-lg font-bold text-purple-400">{Math.round(recipe.fat)}g</p>
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div className="mb-4">
                      <h5 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Ingredients ({recipe.servings} servings):
                      </h5>
                      <ul className="grid grid-cols-2 gap-2">
                        {recipe.ingredients?.map((ing, i) => (
                          <li key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            • {ing.amount} {ing.unit} {ing.name}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Instructions */}
                    <div>
                      <h5 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Preparation Steps:
                      </h5>
                      <ol className="space-y-2">
                        {recipe.cooking_instructions?.map((step, i) => (
                          <li key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <span className="font-semibold mr-2">{i + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}