import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Heart, Target } from "lucide-react";
import DishCard from "../dishes/DishCard";
import { motion } from "framer-motion";

export default function PersonalizedRecommendations({ dishes, onDishSelect }) {
  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const { data: mealLogs = [] } = useQuery({
    queryKey: ['recentMealLogs'],
    queryFn: () => base44.entities.MealLog.list('-created_date', 30),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favoriteRecipes'],
    queryFn: () => base44.entities.FavoriteRecipe.list(),
  });

  // Calculate personalized recommendations
  const getRecommendations = () => {
    if (!profile || dishes.length === 0) return [];

    const scoredDishes = dishes.map(dish => {
      let score = 0;

      // Goal alignment
      if (profile.goal === 'lose_weight' && dish.calories <= 500) score += 3;
      if (profile.goal === 'muscle_building' && dish.protein >= 30) score += 3;
      if (profile.goal === 'gain_weight' && dish.calories >= 600) score += 2;

      // Diet type match
      if (profile.diet_type === 'keto' && dish.carbs <= 20) score += 3;
      if (profile.diet_type === 'high_protein' && dish.protein >= 30) score += 3;
      if (profile.diet_type === 'low_carb' && dish.carbs <= 30) score += 2;
      if (profile.diet_type === 'vegan' && dish.tags?.includes('vegan')) score += 3;
      if (profile.diet_type === 'vegetarian' && dish.tags?.includes('vegetarian')) score += 2;

      // Dietary restrictions
      const hasRestrictionIssue = profile.dietary_restrictions?.some(restriction => {
        if (restriction === 'gluten_free') return dish.allergens?.includes('gluten');
        if (restriction === 'dairy_free') return dish.allergens?.includes('dairy');
        if (restriction === 'nut_free') return dish.allergens?.includes('nuts');
        return false;
      });
      if (hasRestrictionIssue) score -= 10;

      // Favorite cuisines
      if (profile.favorite_cuisines?.includes(dish.cuisine_type)) score += 2;

      // Cooking time preference
      const totalTime = (dish.prep_time || 0) + (dish.cook_time || 0);
      if (profile.meal_prep_time === 'quick_15' && totalTime <= 15) score += 2;
      if (profile.meal_prep_time === 'moderate_30' && totalTime <= 30) score += 1;

      // Past behavior - recently logged similar dishes
      const loggedSimilar = mealLogs.some(log => 
        log.dish_id === dish.id || log.cuisine_type === dish.cuisine_type
      );
      if (loggedSimilar) score += 1;

      // Favorited
      if (favorites.some(fav => fav.dish_id === dish.id)) score += 2;

      // Health score
      if (dish.health_score >= 80) score += 2;
      if (dish.health_score >= 90) score += 1;

      return { ...dish, recommendationScore: score };
    });

    return scoredDishes
      .filter(dish => dish.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 6);
  };

  const recommendations = getRecommendations();

  if (recommendations.length === 0) return null;

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          Recommended for You
        </h3>
        <Badge className="gradient-accent text-white border-0 ml-auto">
          Personalized
        </Badge>
      </div>

      {profile && (
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.goal && (
            <Badge style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA' }}>
              <Target className="w-3 h-3 mr-1" />
              {profile.goal.replace('_', ' ')}
            </Badge>
          )}
          {profile.diet_type && (
            <Badge style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#A78BFA' }}>
              {profile.diet_type.replace('_', ' ')}
            </Badge>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((dish, index) => (
          <motion.div
            key={dish.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <DishCard
              dish={dish}
              onView={onDishSelect}
              compact
            />
          </motion.div>
        ))}
      </div>
    </Card>
  );
}