import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Star, Heart, Activity, Apple, Flame, Droplet, Leaf } from "lucide-react";

const RDI = {
  vitamin_d: 800, vitamin_c: 90, vitamin_b12: 2.4, iron: 18,
  calcium: 1000, magnesium: 400, potassium: 3500, omega3: 1600, zinc: 11
};

const calculateFoodScore = (dish) => {
  let score = 50; // Base score
  
  // Nutrient density
  if (dish.calories > 0) {
    const proteinDensity = (dish.protein * 4) / dish.calories;
    const fiberDensity = (dish.fiber || 0) / (dish.calories / 100);
    score += Math.min(15, proteinDensity * 30);
    score += Math.min(10, fiberDensity * 5);
  }
  
  // Micronutrient richness
  const microCount = Object.keys(dish.micronutrients || {}).length;
  score += Math.min(15, microCount * 2);
  
  // Low sugar bonus
  if (dish.sugar && dish.sugar < 10) score += 10;
  
  return Math.min(100, Math.round(score));
};

const getAntiInflammatoryScore = (dish) => {
  let score = 50;
  
  // Omega-3 bonus
  if (dish.micronutrients?.omega3 > 500) score += 15;
  
  // Fiber bonus
  if (dish.fiber > 5) score += 10;
  
  // Low sugar bonus
  if (dish.sugar < 10) score += 15;
  
  // Antioxidant-rich foods
  const hasVitaminC = (dish.micronutrients?.vitamin_c || 0) > 30;
  const hasVitaminE = (dish.micronutrients?.vitamin_e || 0) > 5;
  if (hasVitaminC || hasVitaminE) score += 10;
  
  return Math.min(100, score);
};

export default function RecipeNutritionCard({ dish, compact = false }) {
  const healthScore = dish.health_score || calculateFoodScore(dish);
  const antiInflamScore = getAntiInflammatoryScore(dish);
  const micronutrients = dish.micronutrients || {};
  
  const rdiCoverage = Object.entries(micronutrients)
    .filter(([key]) => RDI[key])
    .map(([key, value]) => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
      rdi: RDI[key],
      percentage: Math.round((value / RDI[key]) * 100)
    }))
    .sort((a, b) => b.percentage - a.percentage);

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent-from)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Health Score
            </span>
          </div>
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {healthScore}/100
          </span>
        </div>
        <Progress value={healthScore} className="h-2" />
        
        {rdiCoverage.slice(0, 3).length > 0 && (
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Top Nutrients</p>
            <div className="flex flex-wrap gap-2">
              {rdiCoverage.slice(0, 3).map(nutrient => (
                <Badge key={nutrient.name} variant="outline" className="text-xs">
                  {nutrient.name}: {nutrient.percentage}% RDI
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scores */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Health Score
            </span>
          </div>
          <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {healthScore}
          </div>
          <Progress value={healthScore} className="h-2" />
        </Card>

        <Card className="p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-400" />
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Anti-Inflammatory
            </span>
          </div>
          <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {antiInflamScore}
          </div>
          <Progress value={antiInflamScore} className="h-2" />
        </Card>
      </div>

      {/* Macros */}
      <div>
        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Macronutrients
        </h4>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
            <Flame className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--accent-from)' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Calories</p>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{dish.calories}</p>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
            <Activity className="w-5 h-5 mx-auto mb-1 text-blue-400" />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Protein</p>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{dish.protein}g</p>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
            <Apple className="w-5 h-5 mx-auto mb-1 text-orange-400" />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Carbs</p>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{dish.carbs}g</p>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
            <Droplet className="w-5 h-5 mx-auto mb-1 text-purple-400" />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fat</p>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{dish.fat}g</p>
          </div>
        </div>
      </div>

      {/* RDI Coverage */}
      {rdiCoverage.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Leaf className="w-4 h-4 text-green-400" />
            Daily Value Coverage
          </h4>
          <div className="space-y-2">
            {rdiCoverage.slice(0, 6).map(nutrient => (
              <div key={nutrient.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {nutrient.name}
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {nutrient.percentage}% DV
                  </span>
                </div>
                <Progress value={Math.min(nutrient.percentage, 100)} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}