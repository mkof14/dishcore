import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function MicronutrientDisplay({ micronutrients, profile }) {
  if (!micronutrients) return null;

  const micronutrientTargets = profile?.micronutrient_goals || {
    vitamin_d: 600,
    vitamin_c: 90,
    vitamin_b12: 2.4,
    iron: 18,
    calcium: 1000,
    magnesium: 400,
    potassium: 3500,
    omega3: 250,
    zinc: 11
  };

  const nutrients = [
    { key: 'vitamin_a', label: 'Vitamin A', unit: 'IU', target: 3000, color: '#FB923C' },
    { key: 'vitamin_c', label: 'Vitamin C', unit: 'mg', target: micronutrientTargets.vitamin_c, color: '#F59E0B' },
    { key: 'vitamin_d', label: 'Vitamin D', unit: 'IU', target: micronutrientTargets.vitamin_d, color: '#EAB308' },
    { key: 'vitamin_e', label: 'Vitamin E', unit: 'mg', target: 15, color: '#84CC16' },
    { key: 'vitamin_k', label: 'Vitamin K', unit: 'mcg', target: 120, color: '#22C55E' },
    { key: 'vitamin_b6', label: 'Vitamin B6', unit: 'mg', target: 1.7, color: '#10B981' },
    { key: 'vitamin_b12', label: 'Vitamin B12', unit: 'mcg', target: micronutrientTargets.vitamin_b12, color: '#14B8A6' },
    { key: 'folate', label: 'Folate', unit: 'mcg', target: 400, color: '#06B6D4' },
    { key: 'calcium', label: 'Calcium', unit: 'mg', target: micronutrientTargets.calcium, color: '#0EA5E9' },
    { key: 'iron', label: 'Iron', unit: 'mg', target: micronutrientTargets.iron, color: '#3B82F6' },
    { key: 'magnesium', label: 'Magnesium', unit: 'mg', target: micronutrientTargets.magnesium, color: '#6366F1' },
    { key: 'potassium', label: 'Potassium', unit: 'mg', target: micronutrientTargets.potassium, color: '#8B5CF6' },
    { key: 'zinc', label: 'Zinc', unit: 'mg', target: micronutrientTargets.zinc, color: '#A855F7' },
    { key: 'omega3', label: 'Omega-3', unit: 'mg', target: micronutrientTargets.omega3, color: '#C026D3' }
  ];

  const displayedNutrients = nutrients.filter(n => micronutrients[n.key] > 0);

  if (displayedNutrients.length === 0) return null;

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        🔬 Micronutrient Profile
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        {displayedNutrients.map(nutrient => {
          const value = micronutrients[nutrient.key] || 0;
          const percentage = (value / nutrient.target) * 100;
          const isSufficient = percentage >= 20;

          return (
            <div key={nutrient.key} className="p-4 rounded-2xl" style={{ background: 'var(--bg-surface-alt)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {nutrient.label}
                  </span>
                  {isSufficient ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                  )}
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {value.toFixed(1)}{nutrient.unit}
                </span>
              </div>
              <Progress value={Math.min(percentage, 100)} className="h-2 mb-1" />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {percentage.toFixed(0)}% of daily target ({nutrient.target}{nutrient.unit})
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <strong>💡 Insight:</strong> This food provides {displayedNutrients.length} essential micronutrients. 
          {displayedNutrients.filter(n => (micronutrients[n.key] / n.target) * 100 >= 20).length > 3 
            ? " Excellent nutritional density!" 
            : " Consider pairing with complementary foods for better balance."}
        </p>
      </div>
    </Card>
  );
}