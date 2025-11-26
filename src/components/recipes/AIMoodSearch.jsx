import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Heart, Coffee, Salad, Pizza } from "lucide-react";
import { toast } from "sonner";

const MOOD_PROMPTS = [
  { id: 'comfort', label: 'Comfort Food', icon: Heart, prompt: 'cozy comfort food that makes you feel good' },
  { id: 'energize', label: 'Boost Energy', icon: Coffee, prompt: 'energizing meals with sustained energy' },
  { id: 'light', label: 'Light & Fresh', icon: Salad, prompt: 'light, fresh, and healthy meals' },
  { id: 'indulge', label: 'Treat Myself', icon: Pizza, prompt: 'delicious indulgent meals worth the calories' },
];

export default function AIMoodSearch({ dishes, onResults }) {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);

  const handleMoodSearch = async (mood) => {
    setSelectedMood(mood.id);
    setIsSearching(true);

    try {
      const dishesData = dishes.map(d => ({
        id: d.id,
        name: d.name,
        description: d.description,
        cuisine_type: d.cuisine_type,
        calories: d.calories,
        protein: d.protein,
        carbs: d.carbs,
        fat: d.fat,
        tags: d.tags,
        meal_type: d.meal_type,
        health_score: d.health_score
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Given this mood/craving: "${mood.prompt}", analyze these recipes and return the IDs of recipes that best match this mood. Consider flavor profiles, nutritional content, and general appeal for this mood state.

Available recipes: ${JSON.stringify(dishesData.slice(0, 50))}

Return a list of recipe IDs that match this mood, ordered by relevance (most relevant first). Include 5-8 recipes.`,
        response_json_schema: {
          type: "object",
          properties: {
            recipe_ids: {
              type: "array",
              items: { type: "string" }
            },
            explanation: { type: "string" }
          }
        }
      });

      const matchedDishes = dishes.filter(d => 
        result.recipe_ids?.includes(d.id)
      );

      onResults(matchedDishes, `${mood.label}: ${result.explanation}`);
      toast.success(`Found ${matchedDishes.length} recipes for your mood`);
    } catch (error) {
      toast.error("Mood search failed");
      console.error(error);
    }

    setIsSearching(false);
    setSelectedMood(null);
  };

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          What are you in the mood for?
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {MOOD_PROMPTS.map((mood) => {
          const Icon = mood.icon;
          return (
            <Button
              key={mood.id}
              onClick={() => handleMoodSearch(mood)}
              disabled={isSearching}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              style={{ 
                borderColor: selectedMood === mood.id ? 'var(--accent-from)' : 'var(--border)',
                background: selectedMood === mood.id ? 'rgba(45, 163, 255, 0.1)' : 'transparent'
              }}
            >
              {isSearching && selectedMood === mood.id ? (
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-from)' }} />
              ) : (
                <Icon className="w-6 h-6" style={{ color: 'var(--accent-from)' }} />
              )}
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {mood.label}
              </span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}