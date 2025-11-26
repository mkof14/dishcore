import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Sparkles, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NutrientAnalysis({ logs, profile, period = 7 }) {
  const [expanded, setExpanded] = useState(false);

  // Calculate daily averages
  const avgCalories = logs.reduce((sum, log) => sum + (log.calories || 0), 0) / period;
  const avgProtein = logs.reduce((sum, log) => sum + (log.protein || 0), 0) / period;
  const avgCarbs = logs.reduce((sum, log) => sum + (log.carbs || 0), 0) / period;
  const avgFat = logs.reduce((sum, log) => sum + (log.fat || 0), 0) / period;

  // Targets
  const targetProtein = profile?.target_protein || 150;
  const targetCarbs = profile?.target_carbs || 200;
  const targetFat = profile?.target_fat || 65;
  const targetCalories = profile?.target_calories || 2000;
  const targetFiber = profile?.target_fiber || 30;

  // Estimate fiber (rough approximation)
  const estimatedFiber = (avgCarbs * 0.15);

  // Analyze deficiencies/excesses
  const nutrients = [
    {
      name: "Protein",
      current: avgProtein,
      target: targetProtein,
      unit: "g",
      type: avgProtein < targetProtein * 0.85 ? "deficient" : avgProtein > targetProtein * 1.15 ? "excess" : "good",
      priority: "high"
    },
    {
      name: "Carbohydrates",
      current: avgCarbs,
      target: targetCarbs,
      unit: "g",
      type: avgCarbs < targetCarbs * 0.85 ? "deficient" : avgCarbs > targetCarbs * 1.15 ? "excess" : "good",
      priority: "medium"
    },
    {
      name: "Fats",
      current: avgFat,
      target: targetFat,
      unit: "g",
      type: avgFat < targetFat * 0.85 ? "deficient" : avgFat > targetFat * 1.15 ? "excess" : "good",
      priority: "medium"
    },
    {
      name: "Fiber",
      current: estimatedFiber,
      target: targetFiber,
      unit: "g",
      type: estimatedFiber < targetFiber * 0.8 ? "deficient" : "good",
      priority: "high"
    },
    {
      name: "Calories",
      current: avgCalories,
      target: targetCalories,
      unit: "kcal",
      type: Math.abs(avgCalories - targetCalories) / targetCalories > 0.1 ? "attention" : "good",
      priority: "high"
    }
  ];

  const deficiencies = nutrients.filter(n => n.type === "deficient");
  const excesses = nutrients.filter(n => n.type === "excess");
  const needsAttention = nutrients.filter(n => n.type === "attention");

  const getRecommendation = (nutrient) => {
    if (nutrient.name === "Protein" && nutrient.type === "deficient") {
      return {
        text: `Add ${Math.round(nutrient.target - nutrient.current)}g protein daily`,
        foods: ["Greek yogurt (+20g)", "Chicken breast (+30g)", "Lentils (+18g)", "Eggs (+12g)"]
      };
    }
    if (nutrient.name === "Fiber" && nutrient.type === "deficient") {
      return {
        text: `Increase fiber by ${Math.round(nutrient.target - nutrient.current)}g daily`,
        foods: ["Oats (+8g)", "Berries (+5g)", "Broccoli (+5g)", "Chia seeds (+10g)"]
      };
    }
    if (nutrient.name === "Fats" && nutrient.type === "excess") {
      return {
        text: `Reduce fat intake by ${Math.round(nutrient.current - nutrient.target)}g daily`,
        foods: ["Choose lean proteins", "Limit fried foods", "Reduce oil/butter", "Watch portion sizes"]
      };
    }
    if (nutrient.name === "Carbohydrates" && nutrient.type === "deficient") {
      return {
        text: `Add ${Math.round(nutrient.target - nutrient.current)}g carbs daily`,
        foods: ["Sweet potato (+25g)", "Quinoa (+40g)", "Banana (+27g)", "Brown rice (+45g)"]
      };
    }
    return null;
  };

  const issuesCount = deficiencies.length + excesses.length + needsAttention.length;

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              AI Nutrient Analysis
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {period} day average
            </p>
          </div>
        </div>
        {issuesCount > 0 && (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            {issuesCount} insights
          </Badge>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {nutrients.map(nutrient => (
          <div 
            key={nutrient.name}
            className="p-3 rounded-xl relative overflow-hidden"
            style={{ background: 'var(--bg-surface-alt)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {nutrient.name}
              </p>
              {nutrient.type === "good" ? (
                <CheckCircle2 className="w-3 h-3 text-green-400" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-orange-400" />
              )}
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {Math.round(nutrient.current)}{nutrient.unit}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {nutrient.current < nutrient.target ? (
                <TrendingDown className="w-3 h-3 text-orange-400" />
              ) : nutrient.current > nutrient.target * 1.1 ? (
                <TrendingUp className="w-3 h-3 text-blue-400" />
              ) : (
                <CheckCircle2 className="w-3 h-3 text-green-400" />
              )}
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {((nutrient.current / nutrient.target) * 100).toFixed(0)}% of target
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Issues & Recommendations */}
      {issuesCount > 0 && (
        <div>
          <Button
            onClick={() => setExpanded(!expanded)}
            variant="ghost"
            className="w-full justify-between mb-3"
          >
            <span className="text-sm font-semibold">View Recommendations</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </Button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {deficiencies.map((nutrient, idx) => {
                  const rec = getRecommendation(nutrient);
                  if (!rec) return null;
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            {nutrient.name} Deficiency
                          </p>
                          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                            {rec.text}
                          </p>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                              Try adding:
                            </p>
                            {rec.foods.map((food, i) => (
                              <div key={i} className="text-xs px-2 py-1 rounded bg-white/5 inline-block mr-2">
                                {food}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {excesses.map((nutrient, idx) => {
                  const rec = getRecommendation(nutrient);
                  if (!rec) return null;
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            {nutrient.name} Excess
                          </p>
                          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                            {rec.text}
                          </p>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                              Suggestions:
                            </p>
                            {rec.foods.map((food, i) => (
                              <div key={i} className="text-xs px-2 py-1 rounded bg-white/5 inline-block mr-2">
                                {food}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {issuesCount === 0 && (
        <div className="text-center py-6">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
          <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Excellent Balance!
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Your nutrition is well-balanced across all macronutrients
          </p>
        </div>
      )}
    </Card>
  );
}