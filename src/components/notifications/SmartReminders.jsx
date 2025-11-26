import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { showMealReminder, showNotification } from "./PushNotifications";

export function useSmartReminders() {
  const { data: mealLogs = [] } = useQuery({
    queryKey: ['recentLogs'],
    queryFn: () => base44.entities.MealLog.list('-date', 30),
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0];
    }
  });

  useEffect(() => {
    const settings = {
      mealReminders: localStorage.getItem('dishcore-meal-reminders') === 'true',
      waterReminders: localStorage.getItem('dishcore-water-reminders') === 'true'
    };

    if (!settings.mealReminders && !settings.waterReminders) return;

    // Analyze meal patterns
    const mealPatterns = analyzeMealPatterns(mealLogs);
    
    // Schedule smart reminders based on patterns
    if (settings.mealReminders) {
      Object.entries(mealPatterns).forEach(([mealType, avgTime]) => {
        if (avgTime) {
          const now = new Date();
          const reminderTime = new Date(avgTime);
          
          // Check if it's close to meal time (within 30 min window)
          const timeDiff = Math.abs(now.getTime() - reminderTime.getTime()) / 60000; // minutes
          
          if (timeDiff <= 30 && timeDiff >= 0) {
            showMealReminder(mealType);
          }
        }
      });
    }

    // Water reminders every 2 hours
    if (settings.waterReminders) {
      const hour = new Date().getHours();
      if (hour >= 8 && hour <= 20 && hour % 2 === 0) {
        showNotification("Stay Hydrated! 💧", {
          body: "Time for a glass of water",
          tag: `water-reminder-${hour}`
        });
      }
    }

  }, [mealLogs, profile]);

  return null;
}

function analyzeMealPatterns(logs) {
  const patterns = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  };

  logs.forEach(log => {
    if (log.meal_type && log.created_date) {
      const time = new Date(log.created_date);
      patterns[log.meal_type]?.push(time.getHours() * 60 + time.getMinutes());
    }
  });

  // Calculate average time for each meal
  const avgPatterns = {};
  Object.entries(patterns).forEach(([type, times]) => {
    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const avgTime = new Date();
      avgTime.setHours(Math.floor(avg / 60), Math.round(avg % 60), 0, 0);
      avgPatterns[type] = avgTime;
    }
  });

  return avgPatterns;
}

// Predictive meal suggestions
export function usePredictiveSuggestions() {
  const { data: mealLogs = [] } = useQuery({
    queryKey: ['recentLogs'],
    queryFn: () => base44.entities.MealLog.list('-date', 60),
  });

  const getSuggestion = () => {
    const now = new Date();
    const hour = now.getHours();

    // Analyze what user usually eats at this time
    const similarTimeLogs = mealLogs.filter(log => {
      const logTime = new Date(log.created_date);
      return Math.abs(logTime.getHours() - hour) <= 1;
    });

    if (similarTimeLogs.length === 0) return null;

    // Find most common dishes
    const dishCounts = {};
    similarTimeLogs.forEach(log => {
      const key = log.dish_name || 'Unknown';
      dishCounts[key] = (dishCounts[key] || 0) + 1;
    });

    const mostCommon = Object.entries(dishCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (!mostCommon) return null;

    return {
      suggestion: mostCommon[0],
      confidence: (mostCommon[1] / similarTimeLogs.length * 100).toFixed(0),
      timeRange: `${hour}:00 - ${hour+1}:00`
    };
  };

  return getSuggestion;
}