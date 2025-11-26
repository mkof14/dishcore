import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Search } from "lucide-react";

export default function IngredientSearch({ onSearch }) {
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState('');

  const addIngredient = () => {
    if (input.trim() && !ingredients.includes(input.trim().toLowerCase())) {
      const newIngredients = [...ingredients, input.trim().toLowerCase()];
      setIngredients(newIngredients);
      onSearch(newIngredients);
      setInput('');
    }
  };

  const removeIngredient = (ingredient) => {
    const newIngredients = ingredients.filter(i => i !== ingredient);
    setIngredients(newIngredients);
    onSearch(newIngredients);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addIngredient();
    }
  };

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        Search by Ingredients
      </h3>
      
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
            style={{ color: 'var(--text-muted)' }} />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add ingredients (e.g., chicken, tomatoes)"
            className="pl-10"
            style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
          />
        </div>
        <Button onClick={addIngredient} className="gradient-accent text-white border-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ingredients.map(ingredient => (
            <Badge 
              key={ingredient}
              className="px-3 py-1 text-sm"
              style={{ background: 'var(--accent-from)', color: 'white' }}
            >
              {ingredient}
              <button
                onClick={() => removeIngredient(ingredient)}
                className="ml-2 hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}