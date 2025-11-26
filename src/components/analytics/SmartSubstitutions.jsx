import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";

export default function SmartSubstitutions({ logs, profile }) {
  // Analyze frequently eaten foods
  const foodFrequency = {};
  logs.forEach(log => {
    const name = log.dish_name;
    if (name) {
      foodFrequency[name] = (foodFrequency[name] || 0) + 1;
    }
  });

  // Get top foods
  const topFoods = Object.entries(foodFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name]) => {
      const foodLogs = logs.filter(l => l.dish_name === name);
      const avgProtein = foodLogs.reduce((sum, l) => sum + (l.protein || 0), 0) / foodLogs.length;
      const avgCarbs = foodLogs.reduce((sum, l) => sum + (l.carbs || 0), 0) / foodLogs.length;
      const avgFat = foodLogs.reduce((sum, l) => sum + (l.fat || 0), 0) / foodLogs.length;
      const avgCalories = foodLogs.reduce((sum, l) => sum + (l.calories || 0), 0) / foodLogs.length;
      
      return { name, avgProtein, avgCarbs, avgFat, avgCalories, count: foodLogs.length };
    });

  // Generate substitution suggestions based on goals
  const targetProtein = profile?.target_protein || 150;
  const avgProteinIntake = logs.reduce((sum, log) => sum + (log.protein || 0), 0) / Math.max(logs.length, 1);
  const needsMoreProtein = avgProteinIntake < targetProtein * 0.85;

  const getSubstitution = (food) => {
    const name = food.name.toLowerCase();
    
    // High-protein substitutions
    if (needsMoreProtein) {
      if (name.includes('rice') || name.includes('pasta')) {
        return {
          substitute: 'Quinoa or Lentil Pasta',
          reason: 'Higher protein content',
          proteinBoost: 8,
          benefit: 'Adds 8g protein per serving'
        };
      }
      if (name.includes('cereal') || name.includes('oatmeal')) {
        return {
          substitute: 'Greek Yogurt with Granola',
          reason: 'Significantly higher protein',
          proteinBoost: 15,
          benefit: 'Adds 15g protein, improves satiety'
        };
      }
      if (name.includes('bread') || name.includes('toast')) {
        return {
          substitute: 'Protein Bread or Egg White Omelet',
          reason: 'More protein per calorie',
          proteinBoost: 10,
          benefit: 'Better macro balance'
        };
      }
    }

    // Lower calorie alternatives
    if (food.avgCalories > 500) {
      if (name.includes('fried') || name.includes('burger')) {
        return {
          substitute: 'Grilled version or Lean protein bowl',
          reason: 'Lower calories, healthier fats',
          caloriesSaved: 200,
          benefit: 'Saves ~200 calories, better nutrition'
        };
      }
    }

    // High-carb foods when excess
    const avgCarbs = logs.reduce((sum, log) => sum + (log.carbs || 0), 0) / Math.max(logs.length, 1);
    const targetCarbs = profile?.target_carbs || 200;
    if (avgCarbs > targetCarbs * 1.15 && food.avgCarbs > 50) {
      return {
        substitute: 'Cauliflower rice or Zucchini noodles',
        reason: 'Lower carb alternative',
        carbsReduced: 30,
        benefit: 'Reduces carbs by ~30g'
      };
    }

    return null;
  };

  const suggestions = topFoods
    .map(food => ({ food, substitution: getSubstitution(food) }))
    .filter(s => s.substitution !== null)
    .slice(0, 5);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Smart Food Substitutions
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Optimize your frequently eaten foods
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((item, idx) => (
          <div key={idx} className="p-4 rounded-2xl relative overflow-hidden" 
            style={{ background: 'var(--bg-surface-alt)' }}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {item.food.name}
                    </p>
                    <Badge className="text-xs">
                      {item.food.count}x eaten
                    </Badge>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {Math.round(item.food.avgCalories)} cal · {Math.round(item.food.avgProtein)}g protein
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="w-4 h-4" style={{ color: 'var(--accent-from)' }} />
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {item.substitution.substitute}
                </p>
              </div>

              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {item.substitution.benefit}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <strong>💡 Pro Tip:</strong> Making just 2-3 of these substitutions weekly can significantly improve your macro balance and help you reach your goals faster.
        </p>
      </div>
    </Card>
  );
}