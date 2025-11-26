import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Shuffle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SurpriseMeButton({ dishes, onResults }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const handleSurprise = async () => {
    if (dishes.length === 0) {
      toast.error('No recipes available');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Surprise recipe suggestion task!

USER PROFILE:
- Goal: ${profile?.goal || 'not specified'}
- Diet: ${profile?.diet_type || 'balanced'}
- Activity Level: ${profile?.activity_level || 'moderate'}
- Favorite Cuisines: ${profile?.favorite_cuisines?.join(', ') || 'any'}
- Allergies: ${profile?.allergies?.join(', ') || 'none'}
- Disliked Ingredients: ${profile?.disliked_ingredients?.join(', ') || 'none'}

AVAILABLE RECIPES: ${JSON.stringify(dishes.map(d => ({
  id: d.id,
  name: d.name,
  description: d.description,
  cuisine_type: d.cuisine_type,
  meal_type: d.meal_type,
  calories: d.calories,
  protein: d.protein,
  difficulty: d.difficulty,
  tags: d.tags
})))}

TASK:
Select 3-5 diverse recipes that:
1. Match user's dietary preferences and restrictions
2. Provide variety (different cuisines/meal types)
3. Are interesting and might introduce new flavors
4. Align with user's fitness goals

Be creative but practical!`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            surprise_dish_ids: {
              type: "array",
              items: { type: "string" }
            },
            why_these: { type: "string" }
          }
        }
      });

      const surpriseDishes = dishes.filter(d => 
        result.surprise_dish_ids.includes(d.id)
      );

      onResults(surpriseDishes, result.why_these);
      toast.success(`🎉 ${surpriseDishes.length} surprise recipes for you!`);
    } catch (error) {
      console.error(error);
      toast.error('Surprise generation failed');
    }
    setIsGenerating(false);
  };

  return (
    <Button
      onClick={handleSurprise}
      disabled={isGenerating}
      variant="outline"
      style={{ borderColor: 'var(--accent-from)', color: 'var(--accent-from)' }}
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Shuffle className="w-4 h-4 mr-2" />
      )}
      Surprise Me!
    </Button>
  );
}