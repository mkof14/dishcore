import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Wine, Coffee, UtensilsCrossed, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AIPairingSuggestions({ dish, allDishes = [] }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateSuggestions = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      
      const prompt = `You are an expert chef and nutritionist. Suggest 3-5 complementary dishes or drinks that would pair perfectly with this main dish:

MAIN DISH: ${dish.name}
- Cuisine: ${dish.cuisine_type || 'any'}
- Type: ${dish.meal_type || 'meal'}
- Calories: ${dish.calories} kcal
- Protein: ${dish.protein}g | Carbs: ${dish.carbs}g | Fat: ${dish.fat}g
- Spice Level: ${dish.spicy_level || 'none'}
- Description: ${dish.description || 'N/A'}
- Ingredients: ${dish.ingredients?.map(i => typeof i === 'string' ? i : i.name).join(', ') || 'N/A'}

AVAILABLE DISHES IN LIBRARY: ${JSON.stringify(allDishes.map(d => ({
  id: d.id,
  name: d.name,
  meal_type: d.meal_type,
  cuisine_type: d.cuisine_type,
  calories: d.calories,
  protein: d.protein,
  carbs: d.carbs,
  fat: d.fat
})))}

INSTRUCTIONS:
1. Suggest 3-5 complementary items (sides, drinks, appetizers, desserts, or accompaniments)
2. First, check if any dishes from the user's library would make perfect pairings and prioritize those
3. If no suitable pairings exist in the library, suggest new items that would complement perfectly
4. For drinks, suggest specific beverages (e.g., "Mango Lassi", "Iced Green Tea", "Chardonnay")
5. Consider cultural authenticity (e.g., suggest naan with Indian curry, miso soup with sushi)
6. Balance nutrition (if main is high carb, suggest protein-rich sides)
7. Consider flavor profiles (spicy dishes pair with cooling elements)
8. Include preparation difficulty and time estimates
9. Provide estimated nutritional info for suggested items

For each suggestion:
- Name and category (side, drink, dessert, etc.)
- Why it pairs well (flavor, nutrition, cultural pairing)
- Estimated nutritional values
- Whether it exists in user's library (include dish_id if yes)
- Preparation notes`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            pairings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  category: { type: "string" },
                  pairing_reason: { type: "string" },
                  nutrition_benefits: { type: "string" },
                  estimated_calories: { type: "number" },
                  estimated_protein: { type: "number" },
                  estimated_carbs: { type: "number" },
                  estimated_fat: { type: "number" },
                  from_library: { type: "boolean" },
                  dish_id: { type: "string" },
                  prep_time: { type: "number" },
                  difficulty: { type: "string" }
                }
              }
            },
            overall_rationale: { type: "string" }
          }
        }
      });

      setSuggestions(result.pairings || []);
      return result;
    },
    onSuccess: () => {
      setIsLoading(false);
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to generate pairing suggestions');
      setIsLoading(false);
    }
  });

  const getCategoryIcon = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes('drink') || cat.includes('beverage')) return Wine;
    if (cat.includes('dessert') || cat.includes('sweet')) return Coffee;
    return UtensilsCrossed;
  };

  if (suggestions.length === 0 && !isLoading) {
    return (
      <div className="p-6 rounded-2xl text-center" style={{ background: 'var(--bg-page)' }}>
        <Sparkles className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--accent-from)' }} />
        <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Discover Perfect Pairings
        </h4>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Get AI-powered suggestions for dishes and drinks that complement this recipe
        </p>
        <Button
          onClick={() => generateSuggestions.mutate()}
          className="gradient-accent text-white border-0"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Pairings
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 rounded-2xl text-center" style={{ background: 'var(--bg-page)' }}>
        <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin" style={{ color: 'var(--accent-from)' }} />
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
          Generating perfect pairings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          Recommended Pairings
        </h4>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => generateSuggestions.mutate()}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {suggestions.map((pairing, idx) => {
          const CategoryIcon = getCategoryIcon(pairing.category);
          return (
            <Card key={idx} className="p-4 rounded-2xl" 
              style={{ 
                background: 'var(--bg-surface)', 
                border: '1px solid var(--border-soft)' 
              }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
                  <CategoryIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h5 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {pairing.name}
                      </h5>
                      <Badge 
                        variant="outline" 
                        className="mt-1"
                        style={{ 
                          fontSize: '10px',
                          borderColor: 'var(--border-soft)', 
                          color: 'var(--text-muted)' 
                        }}
                      >
                        {pairing.category}
                      </Badge>
                    </div>
                    {pairing.from_library && (
                      <Badge className="gradient-accent text-white border-0 text-xs">
                        In Library
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {pairing.pairing_reason}
                  </p>

                  {/* Nutrition */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="flex items-center gap-1">
                      <span style={{ color: 'var(--text-muted)' }}>Calories:</span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {pairing.estimated_calories} kcal
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span style={{ color: 'var(--text-muted)' }}>Protein:</span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {pairing.estimated_protein}g
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span style={{ color: 'var(--text-muted)' }}>Carbs:</span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {pairing.estimated_carbs}g
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span style={{ color: 'var(--text-muted)' }}>Fat:</span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {pairing.estimated_fat}g
                      </span>
                    </div>
                  </div>

                  {/* Time & Difficulty */}
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {pairing.prep_time && (
                      <span>⏱️ {pairing.prep_time} min</span>
                    )}
                    {pairing.difficulty && (
                      <span className="capitalize">🔥 {pairing.difficulty}</span>
                    )}
                  </div>

                  {pairing.nutrition_benefits && (
                    <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: 'var(--border-soft)', color: 'var(--text-muted)' }}>
                      💡 {pairing.nutrition_benefits}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Combined Nutrition */}
      {suggestions.length > 0 && (
        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-page)' }}>
          <h5 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            💫 Complete Meal Nutrition (Main + All Pairings)
          </h5>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {dish.calories + suggestions.reduce((sum, p) => sum + (p.estimated_calories || 0), 0)}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Calories</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-500">
                {dish.protein + suggestions.reduce((sum, p) => sum + (p.estimated_protein || 0), 0)}g
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Protein</p>
            </div>
            <div>
              <p className="text-lg font-bold text-orange-500">
                {dish.carbs + suggestions.reduce((sum, p) => sum + (p.estimated_carbs || 0), 0)}g
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Carbs</p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-500">
                {dish.fat + suggestions.reduce((sum, p) => sum + (p.estimated_fat || 0), 0)}g
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fat</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}