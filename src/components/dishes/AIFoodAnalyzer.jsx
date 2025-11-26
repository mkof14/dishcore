import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export default function AIFoodAnalyzer({ open, onClose, onFoodAnalyzed, initialFoodName = "" }) {
  const [foodName, setFoodName] = useState(initialFoodName);
  const [portionSize, setPortionSize] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeFoodWithAI = async () => {
    if (!foodName.trim()) {
      toast.error("Please enter a food name");
      return;
    }

    setAnalyzing(true);

    try {
      const prompt = `Analyze the following food and provide comprehensive nutritional information:

Food: ${foodName}
Portion: ${portionSize || "1 serving"}

Provide detailed nutritional data including:
1. Macronutrients (calories, protein, carbs, fat, fiber, sugar)
2. Micronutrients (vitamins A, C, D, E, K, B6, B12, folate, calcium, iron, magnesium, potassium, zinc, omega-3)
3. Food category (protein, grains, vegetables, fruits, dairy, legumes, nuts_seeds, beverages, snacks, desserts, mixed_dish)
4. Health score (0-100 based on nutritional density)
5. Brief nutritional summary
6. Typical allergens
7. Cuisine type if applicable

Return accurate values based on USDA nutritional database standards.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            calories: { type: "number" },
            protein: { type: "number" },
            carbs: { type: "number" },
            fat: { type: "number" },
            fiber: { type: "number" },
            sugar: { type: "number" },
            sodium: { type: "number" },
            micronutrients: {
              type: "object",
              properties: {
                vitamin_a: { type: "number" },
                vitamin_c: { type: "number" },
                vitamin_d: { type: "number" },
                vitamin_e: { type: "number" },
                vitamin_k: { type: "number" },
                vitamin_b6: { type: "number" },
                vitamin_b12: { type: "number" },
                folate: { type: "number" },
                calcium: { type: "number" },
                iron: { type: "number" },
                magnesium: { type: "number" },
                potassium: { type: "number" },
                zinc: { type: "number" },
                omega3: { type: "number" }
              }
            },
            food_category: { type: "string" },
            health_score: { type: "number" },
            ai_summary: { type: "string" },
            allergens: { type: "array", items: { type: "string" } },
            cuisine_type: { type: "string" }
          }
        }
      });

      setAnalyzing(false);
      onFoodAnalyzed(result);
      onClose();
      toast.success("Food analyzed successfully!");
      
    } catch (error) {
      setAnalyzing(false);
      toast.error("Failed to analyze food. Please try again.");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            AI Nutritional Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
              Food Name *
            </label>
            <Input
              placeholder="e.g., Grilled Chicken Breast, Apple, Greek Yogurt"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
              Portion Size (Optional)
            </label>
            <Input
              placeholder="e.g., 100g, 1 medium, 1 cup"
              value={portionSize}
              onChange={(e) => setPortionSize(e.target.value)}
              style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
            />
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <strong>💡 AI-Powered:</strong> Our AI analyzes foods using nutritional databases to provide 
              comprehensive macro and micronutrient information instantly.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={analyzing}
              style={{ borderColor: 'var(--border)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={analyzeFoodWithAI}
              disabled={analyzing || !foodName.trim()}
              className="flex-1 gradient-accent text-white border-0"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}