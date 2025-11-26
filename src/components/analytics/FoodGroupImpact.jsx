import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Apple, Drumstick, Wheat, Milk } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function FoodGroupImpact({ logs, wearableData, profile }) {
  // Categorize foods into groups
  const categorizeFoods = () => {
    const groups = {
      protein: { foods: [], avgScore: 0, count: 0, icon: Drumstick, color: "#3B82F6" },
      carbs: { foods: [], avgScore: 0, count: 0, icon: Wheat, color: "#FB923C" },
      vegetables: { foods: [], avgScore: 0, count: 0, icon: Apple, color: "#10B981" },
      dairy: { foods: [], avgScore: 0, count: 0, icon: Milk, color: "#A855F7" },
    };

    logs.forEach(log => {
      const protein = log.protein || 0;
      const carbs = log.carbs || 0;
      const dishName = log.dish_name?.toLowerCase() || '';

      // Simple categorization
      if (dishName.includes('chicken') || dishName.includes('beef') || dishName.includes('fish') || 
          dishName.includes('eggs') || dishName.includes('tofu') || protein > 20) {
        groups.protein.foods.push(log);
      } else if (dishName.includes('rice') || dishName.includes('pasta') || dishName.includes('bread') ||
                 dishName.includes('potato') || carbs > 40) {
        groups.carbs.foods.push(log);
      } else if (dishName.includes('salad') || dishName.includes('vegetables') || dishName.includes('broccoli') ||
                 dishName.includes('spinach') || (carbs < 20 && protein < 15)) {
        groups.vegetables.foods.push(log);
      } else if (dishName.includes('yogurt') || dishName.includes('cheese') || dishName.includes('milk')) {
        groups.dairy.foods.push(log);
      }
    });

    // Calculate DishCore Score for each group
    Object.keys(groups).forEach(groupKey => {
      const group = groups[groupKey];
      const dates = [...new Set(group.foods.map(f => f.date))];
      
      let totalScore = 0;
      dates.forEach(date => {
        const dayLogs = logs.filter(log => log.date === date);
        const totalProtein = dayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
        const totalCalories = dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
        const targetProtein = profile?.target_protein || 150;
        const targetCalories = profile?.target_calories || 2000;
        
        const proteinScore = Math.min(30, (totalProtein / targetProtein) * 30);
        const calorieDeviation = Math.abs(totalCalories - targetCalories) / targetCalories;
        const calorieScore = Math.max(0, 25 * (1 - calorieDeviation));
        
        totalScore += Math.round(proteinScore + calorieScore + 30);
      });

      group.avgScore = dates.length > 0 ? totalScore / dates.length : 0;
      group.count = group.foods.length;
    });

    return groups;
  };

  const foodGroups = categorizeFoods();

  // Calculate baseline score (days without specific food group)
  const calculateBaselineScore = () => {
    const allDates = [...new Set(logs.map(log => log.date))];
    let totalScore = 0;
    
    allDates.forEach(date => {
      const dayLogs = logs.filter(log => log.date === date);
      const totalProtein = dayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
      const totalCalories = dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
      const targetProtein = profile?.target_protein || 150;
      const targetCalories = profile?.target_calories || 2000;
      
      const proteinScore = Math.min(30, (totalProtein / targetProtein) * 30);
      const calorieDeviation = Math.abs(totalCalories - targetCalories) / targetCalories;
      const calorieScore = Math.max(0, 25 * (1 - calorieDeviation));
      
      totalScore += Math.round(proteinScore + calorieScore + 30);
    });

    return allDates.length > 0 ? totalScore / allDates.length : 60;
  };

  const baselineScore = calculateBaselineScore();

  const chartData = Object.entries(foodGroups)
    .filter(([_, group]) => group.count > 0)
    .map(([name, group]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      impact: group.avgScore - baselineScore,
      score: group.avgScore,
      count: group.count,
      color: group.color
    }))
    .sort((a, b) => b.impact - a.impact);

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        🍽️ Food Group Impact on Score
      </h3>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        How different food groups affect your DishCore Score
      </p>

      {chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--surface)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '12px' 
                }}
                formatter={(value) => [`${value > 0 ? '+' : ''}${value.toFixed(1)} points`, 'Impact']}
              />
              <Bar dataKey="impact" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="space-y-3 mt-6">
            {chartData.map((item, idx) => {
              const Icon = foodGroups[item.name.toLowerCase()]?.icon;
              return (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl" 
                  style={{ background: 'var(--bg-surface-alt)' }}>
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-5 h-5" style={{ color: item.color }} />}
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {item.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {item.count} meals logged
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {item.impact > 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-bold text-green-400">
                            +{item.impact.toFixed(1)}
                          </span>
                        </>
                      ) : item.impact < 0 ? (
                        <>
                          <TrendingDown className="w-4 h-4 text-orange-400" />
                          <span className="text-sm font-bold text-orange-400">
                            {item.impact.toFixed(1)}
                          </span>
                        </>
                      ) : (
                        <>
                          <Minus className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            Neutral
                          </span>
                        </>
                      )}
                    </div>
                    <Badge className="mt-1 text-xs">
                      Score: {item.score.toFixed(0)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <strong>💡 Insight:</strong> {chartData[0]?.impact > 5 
                ? `${chartData[0].name} foods show the strongest positive impact on your score. Consider including them more often!`
                : chartData[chartData.length - 1]?.impact < -5
                ? `${chartData[chartData.length - 1].name} foods may be affecting your score negatively. Consider reducing frequency or portion sizes.`
                : 'All food groups show relatively balanced impact on your score. Keep maintaining this variety!'}
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p style={{ color: 'var(--text-muted)' }}>
            Log more meals to see food group impact analysis
          </p>
        </div>
      )}
    </Card>
  );
}