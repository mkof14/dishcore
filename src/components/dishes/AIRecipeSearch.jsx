import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AIRecipeSearch({ dishes, onResults }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    try {
      const prompt = `User query: "${query}"

Available dishes: ${JSON.stringify(dishes.map(d => ({
  id: d.id,
  name: d.name,
  description: d.description,
  calories: d.calories,
  protein: d.protein,
  carbs: d.carbs,
  fat: d.fat,
  meal_type: d.meal_type,
  cuisine_type: d.cuisine_type,
  prep_time: d.prep_time,
  cook_time: d.cook_time,
  difficulty: d.difficulty,
  tags: d.tags,
  allergens: d.allergens,
  ingredients: d.ingredients,
  spicy_level: d.spicy_level
})))}

Analyze the user's query and return matching dish IDs ranked by relevance.
Consider:
- Nutritional requirements (calories, protein, carbs, fat)
- Dietary restrictions (vegan, vegetarian, gluten-free, etc.)
- Cooking time constraints
- Cuisine preferences
- Ingredients mentioned
- Meal type
- Difficulty level

Return ONLY valid JSON (no markdown):
{
  "matched_dish_ids": ["id1", "id2", ...],
  "search_interpretation": "brief explanation of what you understood from the query"
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            matched_dish_ids: {
              type: "array",
              items: { type: "string" }
            },
            search_interpretation: { type: "string" }
          }
        }
      });

      const matchedDishes = dishes.filter(d => 
        result.matched_dish_ids.includes(d.id)
      );

      onResults(matchedDishes, result.search_interpretation);
      toast.success(`Found ${matchedDishes.length} recipes`);
    } catch (error) {
      console.error(error);
      toast.error('Search failed. Try a different query.');
    }
    setIsSearching(false);
  };

  const quickSearches = [
    'quick vegan dinners under 500 calories',
    'high-protein snacks',
    'easy breakfast recipes under 30 minutes',
    'low-carb dinner ideas',
    'gluten-free lunch options'
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Try: 'quick vegan dinners under 500 calories' or 'high-protein breakfast'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
          style={{
            background: 'var(--background)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)'
          }}
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="gradient-accent text-white border-0"
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickSearches.map((qs, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            onClick={() => {
              setQuery(qs);
              setTimeout(() => handleSearch(), 100);
            }}
            disabled={isSearching}
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            {qs}
          </Button>
        ))}
      </div>
    </div>
  );
}