import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Loader2, ChefHat } from "lucide-react";
import { toast } from "sonner";

export default function DiscoverFromLogs({ dishes, onResults }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: recentLogs = [] } = useQuery({
    queryKey: ['recentMealLogs'],
    queryFn: () => base44.entities.MealLog.list('-date', 100),
  });

  const handleDiscover = async () => {
    if (recentLogs.length === 0) {
      toast.error('No meal logs found. Start logging meals first!');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Extract unique ingredients from logs
      const dishNames = [...new Set(recentLogs.map(l => l.dish_name).filter(Boolean))];
      
      const prompt = `Based on these recently logged meals: ${dishNames.join(', ')}

Available recipes: ${JSON.stringify(dishes.map(d => ({
  id: d.id,
  name: d.name,
  description: d.description,
  ingredients: d.ingredients,
  cuisine_type: d.cuisine_type,
  meal_type: d.meal_type
})))}

TASK:
1. Identify common ingredients from the logged meal names
2. Find recipes that use similar ingredients or flavor profiles
3. Suggest recipes the user might enjoy based on their eating patterns

Return matching recipe IDs and explain your reasoning.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            matched_dish_ids: {
              type: "array",
              items: { type: "string" }
            },
            common_ingredients: {
              type: "array",
              items: { type: "string" }
            },
            reasoning: { type: "string" }
          }
        }
      });

      const matchedDishes = dishes.filter(d => 
        result.matched_dish_ids.includes(d.id)
      );

      onResults(matchedDishes, result.reasoning, result.common_ingredients);
      toast.success(`Found ${matchedDishes.length} recipes based on your habits!`);
    } catch (error) {
      console.error(error);
      toast.error('Discovery failed. Try again.');
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button
          onClick={handleDiscover}
          disabled={isAnalyzing || recentLogs.length === 0}
          className="gradient-accent text-white border-0"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ChefHat className="w-4 h-4 mr-2" />
          )}
          Discover from My Meals
        </Button>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {recentLogs.length} meals logged
        </span>
      </div>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        Find recipes based on ingredients and patterns from your meal history
      </p>
    </div>
  );
}