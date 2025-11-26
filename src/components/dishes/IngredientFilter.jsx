import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

export default function IngredientFilter({ selectedIngredients, onIngredientsChange }) {
  const [inputValue, setInputValue] = useState('');

  const addIngredient = () => {
    if (inputValue.trim() && !selectedIngredients.includes(inputValue.trim().toLowerCase())) {
      onIngredientsChange([...selectedIngredients, inputValue.trim().toLowerCase()]);
      setInputValue('');
    }
  };

  const removeIngredient = (ingredient) => {
    onIngredientsChange(selectedIngredients.filter(i => i !== ingredient));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Add ingredient (e.g., chicken, tomato)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
          style={{
            background: 'var(--background)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)'
          }}
        />
        <Button
          onClick={addIngredient}
          variant="outline"
          style={{ borderColor: 'var(--border)' }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {selectedIngredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIngredients.map((ingredient) => (
            <Badge
              key={ingredient}
              className="px-3 py-1 flex items-center gap-2"
              style={{ background: 'var(--accent-from)', color: 'white' }}
            >
              {ingredient}
              <button onClick={() => removeIngredient(ingredient)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}