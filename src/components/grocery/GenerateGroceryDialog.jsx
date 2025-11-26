import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function GenerateGroceryDialog({ open, onClose, selectedRecipes = [] }) {
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: plans = [] } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list('-created_date', 10),
    enabled: open,
  });

  const { data: dishes = [] } = useQuery({
    queryKey: ['dishes'],
    queryFn: () => base44.entities.Dish.list('-created_date', 200),
    enabled: open && selectedRecipes.length > 0,
  });

  const togglePlan = (planId) => {
    setSelectedPlans(prev =>
      prev.includes(planId)
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  };

  const generateList = async () => {
    if (selectedPlans.length === 0 && selectedRecipes.length === 0) {
      toast.error('Please select at least one meal plan or recipe');
      return;
    }

    setIsGenerating(true);

    try {
      // Gather all ingredients
      let allIngredients = [];

      // From selected plans
      const selectedPlanData = plans.filter(p => selectedPlans.includes(p.id));
      for (const plan of selectedPlanData) {
        if (plan.days) {
          for (const day of plan.days) {
            if (day.meals) {
              for (const meal of day.meals) {
                // Fetch the actual dish to get ingredients
                if (meal.dish_id) {
                  const dish = await base44.entities.Dish.filter({ id: meal.dish_id });
                  if (dish[0]?.ingredients) {
                    allIngredients.push(...dish[0].ingredients);
                  }
                }
              }
            }
          }
        }
      }

      // From selected recipes
      const selectedDishes = dishes.filter(d => selectedRecipes.includes(d.id));
      for (const dish of selectedDishes) {
        if (dish.ingredients) {
          allIngredients.push(...dish.ingredients);
        }
      }

      if (allIngredients.length === 0) {
        toast.error('No ingredients found in selected items');
        setIsGenerating(false);
        return;
      }

      const prompt = `You are a professional grocery shopping assistant. Analyze these ingredients from multiple recipes and meal plans:

${JSON.stringify(allIngredients)}

Create an organized, consolidated grocery shopping list with the following:

CONSOLIDATION RULES:
1. Combine duplicate items (e.g., multiple "onions" entries)
2. Sum up quantities intelligently (e.g., "2 cups + 1 cup = 3 cups")
3. Group similar items (e.g., "red onion" and "yellow onion" as "onions - red & yellow")
4. Convert to practical shopping quantities (e.g., "1/4 cup flour" becomes part of "1 bag flour")

CATEGORIZATION BY STORE AISLES:
- produce: Fresh vegetables and fruits
- meat_seafood: All proteins (meat, poultry, fish, tofu)
- dairy_eggs: Milk, cheese, yogurt, butter, eggs
- bakery: Bread, tortillas, fresh baked goods
- pantry_staples: Flour, sugar, oil, spices, canned goods
- frozen: Frozen vegetables, ice cream, frozen meals
- beverages: Water, juice, soda, coffee, tea
- condiments_sauces: Ketchup, mayo, soy sauce, vinegar
- snacks: Chips, crackers, nuts
- other: Items that don't fit above categories

For each item provide:
- Consolidated name (user-friendly)
- Combined quantity with unit
- Category (store aisle)
- checked: false (not purchased yet)
- notes: Any prep notes or alternatives (optional)

Be practical: If recipe calls for "1 clove garlic", suggest "1 head garlic" since that's how it's sold.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  quantity: { type: "string" },
                  category: { type: "string" },
                  checked: { type: "boolean" },
                  notes: { type: "string" }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });

      const listName = selectedPlans.length > 0
        ? `Grocery List - ${selectedPlanData[0]?.name || 'Meal Plans'}`
        : `Grocery List - ${selectedDishes.length} Recipes`;

      await base44.entities.GroceryList.create({
        name: listName,
        meal_plan_id: selectedPlans[0] || null,
        items: result.items
      });

      queryClient.invalidateQueries(['groceryLists']);
      toast.success(`Shopping list created with ${result.items.length} items!`);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate grocery list');
    }

    setIsGenerating(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-soft)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ShoppingCart className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            Generate Smart Grocery List
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            AI will consolidate ingredients, combine quantities, and organize by store aisles
          </p>

          {/* Selected Recipes */}
          {selectedRecipes.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Selected Recipes ({selectedRecipes.length})
              </h4>
              <Card className="p-4 rounded-2xl" style={{ background: 'var(--bg-page)' }}>
                {dishes
                  .filter(d => selectedRecipes.includes(d.id))
                  .map(dish => (
                    <div key={dish.id} className="flex items-center gap-2 py-2">
                      <div className="w-2 h-2 rounded-full gradient-accent" />
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {dish.name}
                      </span>
                    </div>
                  ))}
              </Card>
            </div>
          )}

          {/* Select Meal Plans */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Or Select Meal Plans
            </h4>
            {plans.length > 0 ? (
              <div className="space-y-2">
                {plans.map(plan => (
                  <Card
                    key={plan.id}
                    className="p-4 rounded-2xl cursor-pointer transition-all"
                    style={{
                      background: selectedPlans.includes(plan.id) ? 'var(--bg-page)' : 'var(--bg-surface-alt)',
                      border: `1px solid ${selectedPlans.includes(plan.id) ? 'var(--accent-from)' : 'var(--border-soft)'}`
                    }}
                    onClick={() => togglePlan(plan.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedPlans.includes(plan.id)}
                        onCheckedChange={() => togglePlan(plan.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {plan.name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {plan.days?.length || 0} days • {plan.days?.reduce((sum, d) => sum + (d.meals?.length || 0), 0) || 0} meals
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                No meal plans available
              </p>
            )}
          </div>

          {/* Features */}
          <Card className="p-4 rounded-2xl" style={{ background: 'var(--bg-page)' }}>
            <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              ✨ AI Features:
            </h4>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>✓ Consolidates duplicate ingredients</li>
              <li>✓ Combines quantities intelligently</li>
              <li>✓ Organizes by grocery store aisles</li>
              <li>✓ Converts to practical shopping units</li>
              <li>✓ Groups similar items together</li>
            </ul>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={generateList}
              className="flex-1 gradient-accent text-white border-0"
              disabled={isGenerating || (selectedPlans.length === 0 && selectedRecipes.length === 0)}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate List
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}