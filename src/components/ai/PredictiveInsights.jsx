import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Lightbulb, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { format, startOfWeek, subDays } from "date-fns";

export default function PredictiveInsights() {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: recentLogs = [] } = useQuery({
    queryKey: ['recentLogsForPrediction'],
    queryFn: async () => {
      const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      return await base44.entities.MealLog.filter({ 
        date: { $gte: sevenDaysAgo } 
      });
    },
  });

  const { data: todayLogs = [] } = useQuery({
    queryKey: ['todayLogs', today],
    queryFn: () => base44.entities.MealLog.filter({ date: today }),
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfileForPrediction'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  // Analyze patterns
  const insights = React.useMemo(() => {
    const predictions = [];

    // Check if user usually logs meals at this time
    const currentHour = new Date().getHours();
    const missedBreakfast = currentHour >= 10 && !todayLogs.some(log => log.meal_type === 'breakfast');
    const missedLunch = currentHour >= 15 && !todayLogs.some(log => log.meal_type === 'lunch');

    if (missedBreakfast) {
      predictions.push({
        type: 'reminder',
        icon: AlertCircle,
        title: 'Missed Breakfast?',
        message: 'You usually log breakfast by now. Don\'t forget to eat!',
        action: 'Log Now'
      });
    }

    if (missedLunch) {
      predictions.push({
        type: 'reminder',
        icon: AlertCircle,
        title: 'Lunch Time Check',
        message: 'It\'s past your usual lunch time. Have you eaten?',
        action: 'Log Meal'
      });
    }

    // Protein tracking
    const todayProtein = todayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
    const targetProtein = profile?.target_protein || 150;
    const proteinRemaining = targetProtein - todayProtein;

    if (currentHour >= 18 && proteinRemaining > 40) {
      predictions.push({
        type: 'nutrition',
        icon: TrendingUp,
        title: 'Protein Alert',
        message: `You need ${Math.round(proteinRemaining)}g more protein today. Consider adding lean protein to dinner.`,
        action: 'View High-Protein Meals'
      });
    }

    // Pattern recognition
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 1) { // Monday
      const lastMondays = recentLogs.filter(log => new Date(log.date).getDay() === 1);
      const avgMondayCalories = lastMondays.reduce((sum, log) => sum + (log.calories || 0), 0) / lastMondays.length || 0;
      
      if (avgMondayCalories < 1500) {
        predictions.push({
          type: 'pattern',
          icon: Lightbulb,
          title: 'Monday Pattern Detected',
          message: 'You tend to undereat on Mondays. Make sure to fuel properly!',
          action: null
        });
      }
    }

    // Evening prediction
    if (currentHour >= 19) {
      const todayCalories = todayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
      const targetCalories = profile?.target_calories || 2000;
      const remaining = targetCalories - todayCalories;

      if (remaining > 500) {
        predictions.push({
          type: 'prediction',
          icon: Clock,
          title: 'Evening Forecast',
          message: `You have ${Math.round(remaining)} calories left for dinner. Plan accordingly!`,
          action: 'See Dinner Ideas'
        });
      }
    }

    return predictions;
  }, [recentLogs, todayLogs, profile]);

  if (insights.length === 0) return null;

  return (
    <div className="space-y-3">
      {insights.map((insight, idx) => {
        const Icon = insight.icon;
        return (
          <Card key={idx} className="gradient-card border-0 p-4 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                  {insight.title}
                </h4>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {insight.message}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}