import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Heart, Clock, Flame, Star, ArrowRight, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function RecommendationEngine({ onRecipeClick, limit = 6, showRefresh = true }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [rationale, setRationale] = useState('');

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

  const { data: recentLogs = [] } = useQuery({
    queryKey: ['recentMealLogs'],
    queryFn: async () => {
      const logs = await base44.entities.MealLog.list('-created_date', 20);
      return logs;
    },
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favoriteRecipes'],
    queryFn: () => base44.entities.FavoriteRecipe.list(),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['dishReviews'],
    queryFn: () => base44.entities.DishReview.list(),
  });

  const { data: wearableData = [] } = useQuery({
    queryKey: ['recentWearable'],
    queryFn: () => base44.entities.WearableData.list('-date', 7),
  });

  React.useEffect(() => {
    if (dishes.length > 0 && recommendations.length === 0) {
      generateRecommendations();
    }
  }, [dishes]);

  const generateRecommendations = async () => {
    if (dishes.length === 0) {
      toast.error('No recipes available for recommendations');
      return;
    }

    setIsGenerating(true);

    try {
      // Gather user context
      const recentDishes = recentLogs
        .map(log => dishes.find(d => d.id === log.dish_id))
        .filter(Boolean)
        .slice(0, 10);

      const favoriteDishes = favorites
        .map(fav => dishes.find(d => d.id === fav.dish_id))
        .filter(Boolean);

      const userReviews = reviews.filter(r => r.created_by);

      // Calculate wearable insights
      const avgSteps = wearableData.reduce((sum, d) => sum + (d.steps || 0), 0) / (wearableData.length || 1);
      const avgActiveMinutes = wearableData.reduce((sum, d) => sum + (d.active_minutes || 0), 0) / (wearableData.length || 1);
      const avgSleep = wearableData.reduce((sum, d) => sum + (d.sleep_hours || 0), 0) / (wearableData.length || 1);
      const latestRecovery = wearableData[0]?.recovery_score || 70;

      // Calculate average macros from recent logs
      const avgMacros = recentDishes.length > 0 ? {
        protein: recentDishes.reduce((sum, d) => sum + (d.protein || 0), 0) / recentDishes.length,
        carbs: recentDishes.reduce((sum, d) => sum + (d.carbs || 0), 0) / recentDishes.length,
        fat: recentDishes.reduce((sum, d) => sum + (d.fat || 0), 0) / recentDishes.length,
      } : null;

      const prompt = `You are a nutrition AI analyzing user eating patterns to recommend recipes.

USER PROFILE:
${profile ? `
- Goal: ${profile.goal || 'General Health'}
- Diet Type: ${profile.diet_type || 'Balanced'}
- Activity Level: ${profile.activity_level || 'Moderate'}
- Dietary Restrictions: ${profile.dietary_restrictions?.join(', ') || 'None'}
- Allergies: ${profile.allergies?.join(', ') || 'None'}
- Disliked Ingredients: ${profile.disliked_ingredients?.join(', ') || 'None'}
- Favorite Cuisines: ${profile.favorite_cuisines?.join(', ') || 'Various'}
- Target Macros: ${profile.target_protein || 'N/A'}g protein, ${profile.target_carbs || 'N/A'}g carbs, ${profile.target_fat || 'N/A'}g fat
` : 'No profile data available'}

WEARABLE DATA (Last 7 Days):
- Average Steps: ${Math.round(avgSteps)} steps/day
- Average Active Minutes: ${Math.round(avgActiveMinutes)} min/day
- Average Sleep: ${avgSleep.toFixed(1)} hours/night
- Current Recovery Score: ${latestRecovery}/100

RECENT EATING PATTERNS (Last 10 meals):
${recentDishes.length > 0 ? recentDishes.map(d => `- ${d.name} (${d.calories}cal, ${d.protein}g protein)`).join('\n') : 'No recent logs'}
${avgMacros ? `\nAverage: ${avgMacros.protein.toFixed(0)}g protein, ${avgMacros.carbs.toFixed(0)}g carbs, ${avgMacros.fat.toFixed(0)}g fat` : ''}

FAVORITE RECIPES:
${favoriteDishes.length > 0 ? favoriteDishes.map(d => `- ${d.name} (${d.cuisine_type || 'Unknown'} cuisine)`).join('\n') : 'No favorites yet'}

AVAILABLE RECIPES (${dishes.length} total):
${dishes.slice(0, 50).map(d => `- ${d.name} | ${d.calories}cal | P:${d.protein}g C:${d.carbs}g F:${d.fat}g | ${d.cuisine_type || 'Various'} | Tags: ${d.tags?.join(', ') || 'none'}`).join('\n')}

TASK: Recommend ${limit} recipes that:
1. Align with user's goals and dietary preferences
2. Support their current activity level and recovery needs based on wearable data
3. Provide nutritional variety from recent meals
4. Match taste preferences based on favorites
5. Avoid allergens and disliked ingredients
6. Consider energy needs based on steps and active minutes
7. Offer cuisine diversity

Return recipe names EXACTLY as they appear in the available recipes list, with a brief rationale for each.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recipe_name: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            overall_rationale: { type: "string" }
          }
        }
      });

      // Match recommendations to actual dishes
      const recommendedDishes = result.recommendations
        .map(rec => {
          const dish = dishes.find(d => 
            d.name.toLowerCase() === rec.recipe_name.toLowerCase() ||
            d.name.toLowerCase().includes(rec.recipe_name.toLowerCase())
          );
          return dish ? { ...dish, reason: rec.reason } : null;
        })
        .filter(Boolean)
        .slice(0, limit);

      setRecommendations(recommendedDishes);
      setRationale(result.overall_rationale);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      // Fallback to simple recommendations
      const fallbackRecs = dishes
        .filter(d => !recentLogs.some(log => log.dish_id === d.id))
        .sort((a, b) => (b.health_score || 50) - (a.health_score || 50))
        .slice(0, limit);
      setRecommendations(fallbackRecs);
      setRationale('Showing top-rated healthy recipes');
    }

    setIsGenerating(false);
  };

  if (isGenerating) {
    return (
      <Card className="gradient-card border-0 p-8 rounded-3xl">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-center font-medium" style={{ color: 'var(--text-primary)' }}>
            Analyzing your preferences...
          </p>
        </div>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Recommended for You
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {rationale}
            </p>
          </div>
        </div>
        {showRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={generateRecommendations}
            disabled={isGenerating}
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((dish, idx) => {
          const totalTime = (dish.prep_time || 0) + (dish.cook_time || 0);
          
          return (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                className="gradient-card border-0 p-4 rounded-2xl hover:scale-105 transition-all cursor-pointer"
                onClick={() => onRecipeClick && onRecipeClick(dish)}
                style={{ borderColor: 'var(--accent-from)', borderWidth: '1px' }}
              >
                {dish.image_url && (
                  <img
                    src={dish.image_url}
                    alt={dish.name}
                    className="w-full h-32 object-cover rounded-xl mb-3"
                  />
                )}
                
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                    {dish.name}
                  </h4>
                  {dish.health_score && (
                    <Badge className="gradient-accent text-white border-0 text-xs flex-shrink-0">
                      {dish.health_score}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  {totalTime > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {totalTime}m
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {dish.calories}
                  </div>
                  {dish.avgRating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {dish.avgRating.toFixed(1)}
                    </div>
                  )}
                </div>

                {dish.reason && (
                  <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
                    💡 {dish.reason}
                  </p>
                )}

                <div className="flex flex-wrap gap-1">
                  {dish.tags?.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {onRecipeClick && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/recipe-discovery'}
            className="text-sm"
            style={{ color: 'var(--accent-from)' }}
          >
            View All Recipes
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </Card>
  );
}