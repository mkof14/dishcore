import React from "react";
import { Card } from "@/components/ui/card";
import { Activity, Zap, TrendingUp, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";

/**
 * Calculates adjusted nutritional targets based on activity data
 * Now includes AI-driven adjustments based on recovery, sleep quality, and stress
 */
const calculateAdjustedTargets = (baseTargets, wearableData) => {
  if (!wearableData || !baseTargets) return baseTargets;

  const adjustments = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  // Adjust based on steps (every 1000 steps = ~50 cal)
  if (wearableData.steps) {
    const extraSteps = Math.max(0, wearableData.steps - 5000);
    adjustments.calories += Math.round((extraSteps / 1000) * 50);
  }

  // Adjust based on active minutes (1 min = ~5-8 cal depending on intensity)
  if (wearableData.active_minutes) {
    adjustments.calories += Math.round(wearableData.active_minutes * 6);
  }

  // Adjust based on workout sessions
  if (wearableData.workout_sessions?.length > 0) {
    wearableData.workout_sessions.forEach(workout => {
      adjustments.calories += workout.calories || 0;
    });
  }

  // Use calories burned from device if available
  if (wearableData.calories_burned) {
    adjustments.calories = Math.max(adjustments.calories, wearableData.calories_burned - 1800);
  }

  // AI-DRIVEN ADJUSTMENTS based on recovery and sleep
  let recoveryMultiplier = 1.0;
  
  // If poor recovery, reduce calorie adjustment slightly
  if (wearableData.recovery_score && wearableData.recovery_score < 50) {
    recoveryMultiplier = 0.85; // Reduce by 15%
  }
  
  // If excellent recovery, can handle slightly more
  if (wearableData.recovery_score && wearableData.recovery_score > 80) {
    recoveryMultiplier = 1.1; // Increase by 10%
  }
  
  // Sleep quality adjustment
  if (wearableData.sleep_hours) {
    if (wearableData.sleep_hours < 6) {
      recoveryMultiplier *= 0.9; // Poor sleep reduces adjustment
      adjustments.protein += 5; // Increase protein for recovery
    } else if (wearableData.sleep_hours > 8) {
      recoveryMultiplier *= 1.05; // Great sleep allows more
    }
  }
  
  // Stress level adjustment
  if (wearableData.stress_level) {
    if (wearableData.stress_level > 7) {
      recoveryMultiplier *= 0.95; // High stress reduces adjustment
      adjustments.carbs += 10; // Slightly increase carbs for energy
    }
  }
  
  // Apply recovery multiplier to calorie adjustment
  adjustments.calories = Math.round(adjustments.calories * recoveryMultiplier);

  // Adjust macros proportionally
  const calorieIncrease = adjustments.calories;
  if (calorieIncrease > 0) {
    adjustments.protein += Math.round(calorieIncrease * 0.25 / 4); // 25% from protein
    adjustments.carbs += Math.round(calorieIncrease * 0.50 / 4);   // 50% from carbs
    adjustments.fat += Math.round(calorieIncrease * 0.25 / 9);     // 25% from fat
  }

  return {
    calories: baseTargets.target_calories + adjustments.calories,
    protein: baseTargets.target_protein + adjustments.protein,
    carbs: baseTargets.target_carbs + adjustments.carbs,
    fat: baseTargets.target_fat + adjustments.fat,
    adjustments,
    recovery_adjusted: recoveryMultiplier !== 1.0
  };
};

export default function DynamicTargetAdjuster({ profile, wearableData, currentIntake }) {
  if (!wearableData) return null;

  const baseTargets = {
    target_calories: profile?.target_calories || 2000,
    target_protein: profile?.target_protein || 150,
    target_carbs: profile?.target_carbs || 200,
    target_fat: profile?.target_fat || 65
  };

  const adjusted = calculateAdjustedTargets(baseTargets, wearableData);
  const hasAdjustment = adjusted.adjustments.calories > 0;

  if (!hasAdjustment) return null;

  const caloriesPercent = Math.min((currentIntake.calories / adjusted.calories) * 100, 100);
  const proteinPercent = Math.min((currentIntake.protein / adjusted.protein) * 100, 100);

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Activity-Adjusted Targets
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Based on your activity today
            </p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          +{adjusted.adjustments.calories} cal
        </div>
      </div>

      <div className="space-y-4">
        {/* Calories */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: 'var(--accent-from)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Calories
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {Math.round(currentIntake.calories)} / {adjusted.calories}
              </span>
              <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                (base: {baseTargets.target_calories})
              </span>
            </div>
          </div>
          <Progress value={caloriesPercent} className="h-2" />
        </div>

        {/* Protein */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Protein
            </span>
            <div className="text-right">
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {Math.round(currentIntake.protein)}g / {adjusted.protein}g
              </span>
              {adjusted.adjustments.protein > 0 && (
                <span className="text-xs ml-2 text-orange-400">
                  +{adjusted.adjustments.protein}g
                </span>
              )}
            </div>
          </div>
          <Progress value={proteinPercent} className="h-2" />
        </div>

        {/* Info */}
        <div className="p-3 rounded-xl flex items-start gap-2" 
          style={{ background: 'rgba(251, 146, 60, 0.1)' }}>
          <Info className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Your targets have been {adjusted.recovery_adjusted ? 'intelligently adjusted' : 'increased'} based on {wearableData.steps?.toLocaleString()} steps
            {wearableData.active_minutes > 0 && `, ${wearableData.active_minutes} active minutes`}
            {adjusted.recovery_adjusted && wearableData.recovery_score && `, and recovery score (${wearableData.recovery_score}/100)`}.
          </p>
        </div>
      </div>
    </Card>
  );
}

export { calculateAdjustedTargets };