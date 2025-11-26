import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Zap, Activity, Moon } from "lucide-react";
import { format, subDays } from "date-fns";

export default function FoodImpactAnalysis({ mealLogs, wearableData, profile }) {
  const [selectedFood, setSelectedFood] = useState(null);

  // Get unique dishes from meal logs
  const uniqueDishes = [...new Set(mealLogs.map(log => log.dish_name))].filter(Boolean);

  // Calculate DishCore Score for a given date
  const calculateScore = (date) => {
    const dayLogs = mealLogs.filter(log => log.date === date);
    if (dayLogs.length === 0) return 0;
    
    const totalProtein = dayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
    const totalCalories = dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const targetProtein = profile?.target_protein || 150;
    const targetCalories = profile?.target_calories || 2000;
    
    const proteinScore = Math.min(30, (totalProtein / targetProtein) * 30);
    const calorieDeviation = Math.abs(totalCalories - targetCalories) / targetCalories;
    const calorieScore = Math.max(0, 25 * (1 - calorieDeviation));
    
    return Math.round(proteinScore + calorieScore + 30);
  };

  // Analyze impact of selected food
  const analyzeFoodImpact = (dishName) => {
    const daysWithFood = mealLogs
      .filter(log => log.dish_name === dishName)
      .map(log => log.date);

    const daysWithoutFood = [...new Set(mealLogs.map(log => log.date))]
      .filter(date => !daysWithFood.includes(date))
      .slice(0, 10);

    const avgScoreWith = daysWithFood.reduce((sum, date) => sum + calculateScore(date), 0) / (daysWithFood.length || 1);
    const avgScoreWithout = daysWithoutFood.reduce((sum, date) => sum + calculateScore(date), 0) / (daysWithoutFood.length || 1);

    const avgSleepWith = daysWithFood.reduce((sum, date) => {
      const wearable = wearableData.find(w => w.date === date);
      return sum + (wearable?.sleep_hours || 0);
    }, 0) / (daysWithFood.length || 1);

    const avgSleepWithout = daysWithoutFood.reduce((sum, date) => {
      const wearable = wearableData.find(w => w.date === date);
      return sum + (wearable?.sleep_hours || 0);
    }, 0) / (daysWithoutFood.length || 1);

    const avgStepsWith = daysWithFood.reduce((sum, date) => {
      const wearable = wearableData.find(w => w.date === date);
      return sum + (wearable?.steps || 0);
    }, 0) / (daysWithFood.length || 1);

    const avgStepsWithout = daysWithoutFood.reduce((sum, date) => {
      const wearable = wearableData.find(w => w.date === date);
      return sum + (wearable?.steps || 0);
    }, 0) / (daysWithoutFood.length || 1);

    return {
      dishName,
      daysConsumed: daysWithFood.length,
      scoreImpact: avgScoreWith - avgScoreWithout,
      sleepImpact: avgSleepWith - avgSleepWithout,
      stepsImpact: avgStepsWith - avgStepsWithout,
      avgScoreWith,
      avgScoreWithout,
      avgSleepWith,
      avgStepsWith
    };
  };

  const impact = selectedFood ? analyzeFoodImpact(selectedFood) : null;

  return (
    <div className="space-y-6">
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          🍽️ Food Impact Analysis
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Analyze how specific foods correlate with your health metrics
        </p>

        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
            Select Food to Analyze
          </label>
          <Select value={selectedFood || ''} onValueChange={setSelectedFood}>
            <SelectTrigger style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
              <SelectValue placeholder="Choose a food..." />
            </SelectTrigger>
            <SelectContent>
              {uniqueDishes.slice(0, 20).map(dish => (
                <SelectItem key={dish} value={dish}>{dish}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {impact && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                Consumed on {impact.daysConsumed} days
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl" 
                  style={{ background: 'var(--surface)' }}>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" style={{ color: 'var(--accent-from)' }} />
                    <span className="text-sm font-medium">DishCore Score Impact</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {impact.scoreImpact > 0 ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-bold text-green-400">
                          +{impact.scoreImpact.toFixed(1)} points
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-bold text-orange-400">
                          {impact.scoreImpact.toFixed(1)} points
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl" 
                  style={{ background: 'var(--surface)' }}>
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium">Sleep Quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {impact.sleepImpact > 0 ? (
                      <span className="text-sm font-bold text-green-400">
                        +{impact.sleepImpact.toFixed(1)}h avg
                      </span>
                    ) : impact.sleepImpact < 0 ? (
                      <span className="text-sm font-bold text-orange-400">
                        {impact.sleepImpact.toFixed(1)}h avg
                      </span>
                    ) : (
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>No change</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl" 
                  style={{ background: 'var(--surface)' }}>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium">Activity Level</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {impact.stepsImpact > 0 ? (
                      <span className="text-sm font-bold text-green-400">
                        +{Math.round(impact.stepsImpact)} steps
                      </span>
                    ) : impact.stepsImpact < 0 ? (
                      <span className="text-sm font-bold text-orange-400">
                        {Math.round(impact.stepsImpact)} steps
                      </span>
                    ) : (
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>No change</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <strong>Insight:</strong> {impact.scoreImpact > 5 
                  ? `${impact.dishName} correlates with significantly higher DishCore Scores (+${impact.scoreImpact.toFixed(1)}). Consider including it more often!`
                  : impact.scoreImpact < -5
                  ? `${impact.dishName} may be affecting your score negatively (${impact.scoreImpact.toFixed(1)}). Consider alternatives or reduce frequency.`
                  : `${impact.dishName} has neutral impact on your score. Continue eating as desired.`
                }
              </p>
            </div>
          </div>
        )}

        {!impact && !selectedFood && (
          <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            Select a food above to see its impact on your health metrics
          </p>
        )}
      </Card>
    </div>
  );
}