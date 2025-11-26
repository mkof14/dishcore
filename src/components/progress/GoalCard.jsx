import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Calendar } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function GoalCard({ goal, periodData }) {
  // Calculate current value from period data
  let currentValue = goal.current_value || 0;
  
  if (goal.metric === 'protein') {
    const recentProtein = periodData.slice(-7).reduce((sum, d) => sum + d.protein, 0) / 7;
    currentValue = Math.round(recentProtein);
  } else if (goal.metric === 'weight') {
    const latestWeight = periodData.filter(d => d.weight).slice(-1)[0]?.weight;
    currentValue = latestWeight || currentValue;
  } else if (goal.metric === 'steps') {
    const avgSteps = periodData.slice(-7).reduce((sum, d) => sum + d.steps, 0) / 7;
    currentValue = Math.round(avgSteps);
  } else if (goal.metric === 'sleep') {
    const avgSleep = periodData.slice(-7).reduce((sum, d) => sum + d.sleep, 0) / 7;
    currentValue = parseFloat(avgSleep.toFixed(1));
  }

  const progress = ((currentValue - goal.start_value) / (goal.target_value - goal.start_value)) * 100;
  const progressClamped = Math.min(Math.max(progress, 0), 100);
  const isCompleted = currentValue >= goal.target_value;
  
  const daysRemaining = differenceInDays(new Date(goal.target_date), new Date());
  const daysTotal = differenceInDays(new Date(goal.target_date), new Date(goal.start_date));
  const daysElapsed = daysTotal - daysRemaining;

  return (
    <Card className="gradient-card border-0 p-5 rounded-2xl">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {goal.title}
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {goal.description}
          </p>
        </div>
        {isCompleted && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            ✓ Complete
          </Badge>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Progress
          </span>
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {currentValue} / {goal.target_value} {goal.unit}
          </span>
        </div>
        <Progress value={progressClamped} className="h-2" />
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {progressClamped.toFixed(0)}% complete
        </p>
      </div>

      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>Day {daysElapsed}/{daysTotal}</span>
        </div>
      </div>
    </Card>
  );
}