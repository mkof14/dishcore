import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, ChefHat, Clock, Heart, Filter, Sparkles, Calendar,
  Leaf, Apple, Wheat, Flame, TrendingUp, Star, Award
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";
import NutritionalInsights from "../components/nutrition/NutritionalInsights";
import AdvancedRecipeFilters from "../components/recipes/AdvancedRecipeFilters";
import RecipeNutritionCard from "../components/recipes/RecipeNutritionCard";
import RecipeReviews from "../components/recipes/RecipeReviews";
import RecommendationEngine from "../components/recommendations/RecommendationEngine";
import IngredientSearch from "../components/recipes/IngredientSearch";
import SmartRecipeMatcher from "../components/recipes/SmartRecipeMatcher";

export default function RecipeDiscovery() {
  const [searchTerm, setSearchTerm] = useState('');
  const [mealType, setMealType] = useState('all');
  const [prepTime, setPrepTime] = useState([0, 120]);
  const [calorieRange, setCalorieRange] = useState([0, 1000]);
  const [proteinMin, setProteinMin] = useState(0);
  const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    vegan: false,
    gluten_free: false,
    dairy_free: false,
    keto: false,
    low_carb: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchIngredients, setSearchIngredients] = useState([]);
  const [generatePlanDialog, setGeneratePlanDialog] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    sortBy: 'health_score',
    minHealthScore: 0,
    minRating: 0,
    targetMicronutrients: [],
    maxCalories: 1000,
    minProtein: 0,
    minFiber: 0,
    antiInflammatory: false
  });

  const queryClient = useQueryClient();

  const { data: dishes = [] } = useQuery({
    queryKey: ['dishes'],
    queryFn: () => base44.entities.Dish.list('-created_date', 200),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favoriteRecipes'],
    queryFn: () => base44.entities.FavoriteRecipe.list(),
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const { data: allReviews = [] } = useQuery({
    queryKey: ['allDishReviews'],
    queryFn: () => base44.entities.DishReview.list(),
  });

  const { data: todayLogs = [] } = useQuery({
    queryKey: ['todayMealLogs'],
    queryFn: () => base44.entities.MealLog.filter({ 
      date: new Date().toISOString().split('T')[0] 
    }),
  });

  // Calculate user deficiencies
  const userDeficiencies = React.useMemo(() => {
    const RDI = {
      vitamin_d: 800, vitamin_c: 90, vitamin_b12: 2.4, iron: 18,
      calcium: 1000, magnesium: 400, potassium: 3500, omega3: 1600, zinc: 11
    };
    
    const todayMicros = {};
    todayLogs.forEach(log => {
      const dish = dishes.find(d => d.id === log.dish_id);
      if (dish?.micronutrients) {
        Object.entries(dish.micronutrients).forEach(([key, value]) => {
          todayMicros[key] = (todayMicros[key] || 0) + value;
        });
      }
    });

    const deficiencies = [];
    Object.entries(RDI).forEach(([nutrient, target]) => {
      const intake = todayMicros[nutrient] || 0;
      if (intake < target * 0.5) {
        deficiencies.push(nutrient);
      }
    });

    return deficiencies;
  }, [todayLogs, dishes]);

  const addFavoriteMutation = useMutation({
    mutationFn: (dish) => base44.entities.FavoriteRecipe.create({
      dish_id: dish.id,
      dish_name: dish.name,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['favoriteRecipes']);
      toast.success('Added to favorites!');
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (favoriteId) => base44.entities.FavoriteRecipe.delete(favoriteId),
    onSuccess: () => {
      queryClient.invalidateQueries(['favoriteRecipes']);
      toast.success('Removed from favorites');
    },
  });

  const isFavorite = (dishId) => {
    return favorites.some(f => f.dish_id === dishId);
  };

  const getFavoriteId = (dishId) => {
    return favorites.find(f => f.dish_id === dishId)?.id;
  };

  // Calculate health scores and ratings
  const enrichedDishes = React.useMemo(() => {
    return dishes.map(dish => {
      const dishReviews = allReviews.filter(r => r.dish_id === dish.id);
      const avgRating = dishReviews.length > 0
        ? dishReviews.reduce((sum, r) => sum + r.rating, 0) / dishReviews.length
        : 0;

      // Calculate health score if not present
      let healthScore = dish.health_score || 50;
      if (!dish.health_score && dish.calories > 0) {
        const proteinDensity = (dish.protein * 4) / dish.calories;
        const fiberDensity = (dish.fiber || 0) / (dish.calories / 100);
        const microCount = Object.keys(dish.micronutrients || {}).length;
        
        healthScore = 50;
        healthScore += Math.min(15, proteinDensity * 30);
        healthScore += Math.min(10, fiberDensity * 5);
        healthScore += Math.min(15, microCount * 2);
        if (dish.sugar && dish.sugar < 10) healthScore += 10;
        healthScore = Math.min(100, Math.round(healthScore));
      }

      return {
        ...dish,
        avgRating,
        reviewCount: dishReviews.length,
        calculatedHealthScore: healthScore
      };
    });
  }, [dishes, allReviews]);

  const filteredRecipes = enrichedDishes.filter(dish => {
    if (searchTerm && !dish.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Ingredient search
    if (searchIngredients.length > 0) {
      const dishIngredients = (dish.ingredients || [])
        .map(ing => ing.name?.toLowerCase() || '')
        .join(' ');
      const hasAllIngredients = searchIngredients.every(ingredient =>
        dishIngredients.includes(ingredient.toLowerCase())
      );
      if (!hasAllIngredients) {
        return false;
      }
    }
    if (mealType !== 'all' && dish.meal_type !== mealType) {
      return false;
    }
    const totalTime = (dish.prep_time || 0) + (dish.cook_time || 0);
    if (totalTime < prepTime[0] || totalTime > prepTime[1]) {
      return false;
    }
    if (dish.calories < calorieRange[0] || dish.calories > calorieRange[1]) {
      return false;
    }
    if (dish.protein < proteinMin) {
      return false;
    }
    if (dietaryFilters.vegetarian && !dish.tags?.includes('vegetarian')) {
      return false;
    }
    if (dietaryFilters.vegan && !dish.tags?.includes('vegan')) {
      return false;
    }
    if (dietaryFilters.gluten_free && !dish.allergens?.includes('gluten')) {
      return false;
    }
    if (dietaryFilters.dairy_free && !dish.allergens?.includes('dairy')) {
      return false;
    }
    if (dietaryFilters.keto && !dish.tags?.includes('keto')) {
      return false;
    }
    if (dietaryFilters.low_carb && dish.carbs > 30) {
      return false;
    }

    // Advanced filters
    if (dish.calculatedHealthScore < advancedFilters.minHealthScore) {
      return false;
    }
    if (dish.avgRating < advancedFilters.minRating) {
      return false;
    }
    if (dish.calories > advancedFilters.maxCalories) {
      return false;
    }
    if (dish.protein < advancedFilters.minProtein) {
      return false;
    }
    if ((dish.fiber || 0) < advancedFilters.minFiber) {
      return false;
    }
    if (advancedFilters.antiInflammatory) {
      const omega3 = dish.micronutrients?.omega3 || 0;
      const fiber = dish.fiber || 0;
      if (omega3 < 200 && fiber < 5) return false;
    }
    if (advancedFilters.targetMicronutrients?.length > 0) {
      const hasSomeTarget = advancedFilters.targetMicronutrients.some(micro => {
        const value = dish.micronutrients?.[micro] || 0;
        const RDI_VALUES = {
          vitamin_d: 800, vitamin_c: 90, vitamin_b12: 2.4, iron: 18,
          calcium: 1000, magnesium: 400, potassium: 3500, omega3: 1600, zinc: 11
        };
        return value > (RDI_VALUES[micro] || 0) * 0.2;
      });
      if (!hasSomeTarget) return false;
    }

    return true;
  }).sort((a, b) => {
    // Sort logic
    switch (advancedFilters.sortBy) {
      case 'health_score':
        return b.calculatedHealthScore - a.calculatedHealthScore;
      case 'nutrient_density':
        return (b.protein + (b.fiber || 0)) - (a.protein + (a.fiber || 0));
      case 'rating':
        return b.avgRating - a.avgRating;
      case 'anti_inflammatory':
        return (b.micronutrients?.omega3 || 0) - (a.micronutrients?.omega3 || 0);
      case 'protein':
        return b.protein - a.protein;
      case 'fiber':
        return (b.fiber || 0) - (a.fiber || 0);
      case 'calories':
        return a.calories - b.calories;
      default:
        return 0;
    }
  });

  const handleGeneratePlan = async () => {
    const favoriteDishes = dishes.filter(d => isFavorite(d.id));
    if (favoriteDishes.length < 7) {
      toast.error('Add at least 7 favorite recipes to generate a meal plan');
      return;
    }

    try {
      const mealPlan = {
        name: `Favorites Meal Plan - ${new Date().toLocaleDateString()}`,
        start_date: new Date().toISOString().split('T')[0],
        is_active: true,
        days: []
      };

      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        const dayDishes = favoriteDishes.sort(() => Math.random() - 0.5).slice(0, 3);
        
        mealPlan.days.push({
          date: dateStr,
          meals: dayDishes.map((dish, idx) => ({
            meal_type: ['breakfast', 'lunch', 'dinner'][idx],
            dish_id: dish.id,
            dish_name: dish.name,
            calories: dish.calories,
            protein: dish.protein,
            carbs: dish.carbs,
            fat: dish.fat
          }))
        });
      }

      await base44.entities.MealPlan.create(mealPlan);
      queryClient.invalidateQueries(['mealPlans']);
      toast.success('Meal plan generated from favorites!');
      setGeneratePlanDialog(false);
    } catch (error) {
      toast.error('Failed to generate meal plan');
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <ChefHat className="w-8 h-8" />
              Recipe Discovery
            </h1>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
              Find recipes with detailed nutritional insights
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setGeneratePlanDialog(true)}
              disabled={favorites.length < 7}
              style={{ borderColor: 'var(--border)' }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Generate Meal Plan
            </Button>
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              style={{ borderColor: 'var(--border)' }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Basic Filters
            </Button>
            <Button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="gradient-accent text-white border-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Advanced
            </Button>
          </div>
        </div>

        {/* Recommendations */}
        <RecommendationEngine 
          onRecipeClick={setSelectedRecipe}
          limit={6}
        />

        {/* Ingredient Search */}
        <IngredientSearch onSearch={setSearchIngredients} />

        {/* Smart Recipe Matcher */}
        <SmartRecipeMatcher 
          dishes={enrichedDishes}
          onRecipeClick={setSelectedRecipe}
        />

        {/* Search Bar */}
        <Card className="gradient-card border-0 p-4 rounded-3xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: 'var(--text-muted)' }} />
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 text-lg"
              style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
            />
          </div>
        </Card>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <AdvancedRecipeFilters
            filters={advancedFilters}
            onFilterChange={setAdvancedFilters}
            userDeficiencies={userDeficiencies}
            onClose={() => setShowAdvancedFilters(false)}
          />
        )}

        {/* Basic Filters Panel */}
        {showFilters && (
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Filter Recipes
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                  Meal Type
                </label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Meals</SelectItem>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                  Prep Time: {prepTime[0]}-{prepTime[1]} min
                </label>
                <Slider
                  value={prepTime}
                  onValueChange={setPrepTime}
                  max={120}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                  Calories: {calorieRange[0]}-{calorieRange[1]}
                </label>
                <Slider
                  value={calorieRange}
                  onValueChange={setCalorieRange}
                  max={1000}
                  step={50}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                  Minimum Protein: {proteinMin}g
                </label>
                <Slider
                  value={[proteinMin]}
                  onValueChange={(val) => setProteinMin(val[0])}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-secondary)' }}>
                  Dietary Preferences
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.keys(dietaryFilters).map(filter => (
                    <label key={filter} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={dietaryFilters[filter]}
                        onCheckedChange={(checked) => 
                          setDietaryFilters(prev => ({ ...prev, [filter]: checked }))
                        }
                      />
                      <span className="text-sm capitalize" style={{ color: 'var(--text-primary)' }}>
                        {filter.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setMealType('all');
                  setPrepTime([0, 120]);
                  setCalorieRange([0, 1000]);
                  setProteinMin(0);
                  setDietaryFilters({
                    vegetarian: false,
                    vegan: false,
                    gluten_free: false,
                    dairy_free: false,
                    keto: false,
                    low_carb: false,
                  });
                }}
              >
                Reset Filters
              </Button>
            </div>
          </Card>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p style={{ color: 'var(--text-muted)' }}>
            {filteredRecipes.length} recipes found
          </p>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/favorites'}>
            <Heart className="w-4 h-4 mr-2 fill-red-500 text-red-500" />
            {favorites.length} Favorites
          </Button>
        </div>

        {/* Recipes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe, idx) => {
            const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
            const favorite = isFavorite(recipe.id);

            return (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="gradient-card border-0 p-5 rounded-3xl hover:scale-105 transition-transform cursor-pointer">
                  <div 
                    onClick={() => setSelectedRecipe(recipe)}
                    className="mb-4"
                  >
                    {recipe.image_url && (
                      <img
                        src={recipe.image_url}
                        alt={recipe.name}
                        className="w-full h-48 object-cover rounded-2xl mb-4"
                      />
                    )}
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                      {recipe.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                      {totalTime > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {totalTime} min
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        {recipe.calories} cal
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-green-500" />
                        {recipe.calculatedHealthScore}
                      </div>
                      {recipe.avgRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {recipe.avgRating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags?.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant={favorite ? 'default' : 'outline'}
                    size="sm"
                    className={`w-full ${favorite ? 'gradient-accent text-white border-0' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (favorite) {
                        removeFavoriteMutation.mutate(getFavoriteId(recipe.id));
                      } else {
                        addFavoriteMutation.mutate(recipe);
                      }
                    }}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${favorite ? 'fill-current' : ''}`} />
                    {favorite ? 'Favorited' : 'Add to Favorites'}
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredRecipes.length === 0 && (
          <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
            <ChefHat className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              No recipes found
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Try adjusting your filters
            </p>
          </Card>
        )}
      </div>

      {/* Recipe Detail Dialog with Nutritional Insights */}
      {selectedRecipe && (
        <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedRecipe.name}</span>
                {selectedRecipe.health_score && (
                  <Badge className="gradient-accent text-white border-0">
                    <Award className="w-3 h-3 mr-1" />
                    Score: {selectedRecipe.health_score}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedRecipe.image_url && (
                <img
                  src={selectedRecipe.image_url}
                  alt={selectedRecipe.name}
                  className="w-full h-64 object-cover rounded-2xl"
                />
              )}
              
              {/* Basic Nutrition */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Calories</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedRecipe.calories}
                  </p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Protein</p>
                  <p className="text-lg font-bold text-blue-500">{selectedRecipe.protein}g</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Carbs</p>
                  <p className="text-lg font-bold text-orange-500">{selectedRecipe.carbs}g</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fat</p>
                  <p className="text-lg font-bold text-purple-500">{selectedRecipe.fat}g</p>
                </div>
              </div>

              {/* Recipe Nutrition Card */}
              <RecipeNutritionCard dish={selectedRecipe} />

              {/* Reviews Section */}
              <RecipeReviews dishId={selectedRecipe.id} dishName={selectedRecipe.name} />

              {selectedRecipe.description && (
                <p style={{ color: 'var(--text-secondary)' }}>{selectedRecipe.description}</p>
              )}
              {selectedRecipe.ingredients && (
                <div>
                  <h4 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Ingredients</h4>
                  <ul className="space-y-1">
                    {selectedRecipe.ingredients.map((ing, idx) => (
                      <li key={idx} style={{ color: 'var(--text-secondary)' }}>
                        • {ing.amount} {ing.unit} {ing.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedRecipe.cooking_instructions && (
                <div>
                  <h4 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Instructions</h4>
                  <ol className="space-y-2">
                    {selectedRecipe.cooking_instructions.map((step, idx) => (
                      <li key={idx} style={{ color: 'var(--text-secondary)' }}>
                        {idx + 1}. {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Generate Plan Dialog */}
      <Dialog open={generatePlanDialog} onOpenChange={setGeneratePlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Meal Plan from Favorites</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p style={{ color: 'var(--text-secondary)' }}>
              Create a 7-day meal plan using your {favorites.length} favorite recipes.
            </p>
            {favorites.length < 7 && (
              <p className="text-sm text-orange-500">
                You need at least 7 favorite recipes to generate a meal plan.
              </p>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setGeneratePlanDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGeneratePlan}
                disabled={favorites.length < 7}
                className="flex-1 gradient-accent text-white border-0"
              >
                Generate Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}