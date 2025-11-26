import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Lightbulb, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

const RDI = {
  vitamin_a: 900,
  vitamin_c: 90,
  vitamin_d: 600,
  vitamin_e: 15,
  vitamin_k: 120,
  vitamin_b6: 1.7,
  vitamin_b12: 2.4,
  folate: 400,
  calcium: 1000,
  iron: 18,
  magnesium: 400,
  potassium: 3500,
  zinc: 11,
  omega3: 1000
};

const FOOD_SOURCES = {
  vitamin_c: ["Oranges", "Bell peppers", "Strawberries", "Broccoli", "Kiwi"],
  vitamin_d: ["Salmon", "Egg yolks", "Fortified milk", "Mushrooms", "Sardines"],
  vitamin_b12: ["Beef", "Fish", "Eggs", "Dairy", "Fortified cereals"],
  iron: ["Red meat", "Spinach", "Lentils", "Tofu", "Quinoa"],
  calcium: ["Dairy", "Sardines", "Kale", "Almonds", "Fortified tofu"],
  magnesium: ["Pumpkin seeds", "Spinach", "Dark chocolate", "Avocado", "Almonds"],
  potassium: ["Bananas", "Sweet potato", "Spinach", "Avocado", "Salmon"],
  omega3: ["Salmon", "Walnuts", "Chia seeds", "Flaxseeds", "Mackerel"],
  zinc: ["Oysters", "Beef", "Pumpkin seeds", "Lentils", "Chickpeas"]
};

export default function DeficiencyAlerts({ logs, periodData, profile }) {
  const { data: dishes = [] } = useQuery({
    queryKey: ['dishes'],
    queryFn: () => base44.entities.Dish.list(),
  });

  // Calculate period micronutrient totals
  const periodMicronutrients = {};
  
  logs.forEach(log => {
    const dish = dishes.find(d => d.name === log.dish_name);
    if (dish?.micronutrients) {
      Object.entries(dish.micronutrients).forEach(([nutrient, value]) => {
        periodMicronutrients[nutrient] = (periodMicronutrients[nutrient] || 0) + (value || 0);
      });
    }
  });

  const daysCount = periodData.length;
  
  // Calculate deficiencies
  const criticalDeficiencies = [];
  const moderateDeficiencies = [];
  
  Object.entries(RDI).forEach(([nutrient, rdi]) => {
    const avgDaily = (periodMicronutrients[nutrient] || 0) / daysCount;
    const userGoal = profile?.micronutrient_goals?.[nutrient] || rdi;
    const percentOfRDI = (avgDaily / userGoal) * 100;
    
    const deficiency = {
      nutrient,
      label: nutrient.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      avgDaily: Math.round(avgDaily),
      target: Math.round(userGoal),
      percentOfRDI: Math.round(percentOfRDI),
      foodSources: FOOD_SOURCES[nutrient] || []
    };
    
    if (percentOfRDI < 40) {
      criticalDeficiencies.push(deficiency);
    } else if (percentOfRDI < 70) {
      moderateDeficiencies.push(deficiency);
    }
  });

  if (criticalDeficiencies.length === 0 && moderateDeficiencies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Critical Deficiencies */}
      {criticalDeficiencies.length > 0 && (
        <Card className="gradient-card border-0 p-6 rounded-3xl border-2 border-red-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Critical Nutrient Deficiencies
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Below 40% of recommended daily intake
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {criticalDeficiencies.map((def, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-2xl"
                style={{ background: 'var(--background)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {def.label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Average: {def.avgDaily} / {def.target} per day
                    </p>
                  </div>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    {def.percentOfRDI}% RDI
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
                    <Lightbulb className="w-3 h-3 inline mr-1" />
                    Best Food Sources:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {def.foodSources.map((food, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-400">
                        {food}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => window.location.href = createPageUrl('RecipeDiscovery') + `?nutrient=${def.nutrient}`}
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  Find {def.label}-Rich Recipes
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Moderate Deficiencies */}
      {moderateDeficiencies.length > 0 && (
        <Card className="gradient-card border-0 p-6 rounded-3xl border-2 border-yellow-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Nutrients Below Optimal
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                40-70% of recommended daily intake
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {moderateDeficiencies.map((def, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl"
                style={{ background: 'var(--background)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {def.label}
                  </p>
                  <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                    {def.percentOfRDI}%
                  </Badge>
                </div>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                  {def.avgDaily} / {def.target}
                </p>
                <div className="flex flex-wrap gap-1">
                  {def.foodSources.slice(0, 3).map((food, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400">
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}