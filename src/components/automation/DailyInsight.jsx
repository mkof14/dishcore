import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Droplets, Activity } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function DailyInsight() {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsight();
  }, []);

  const generateInsight = async () => {
    try {
      // Get recent data
      const measurements = await base44.entities.BodyMeasurement.list('-date', 7);
      const logs = await base44.entities.MealLog.list('-date', 7);
      
      const prompt = `Based on this user's last 7 days of data, provide a single actionable wellness tip in 1-2 sentences. 
      Focus on: hydration, protein intake, meal timing, or consistency.
      
      Recent measurements: ${measurements.length} entries
      Recent meals logged: ${logs.length} entries
      
      Be encouraging, specific, and actionable.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      
      setInsight(response);
    } catch (error) {
      setInsight('Stay consistent with your tracking! Logging meals and measurements helps you understand your progress.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg animate-pulse">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
            💡 AI Tip of the Day
          </h3>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
            {insight}
          </p>
          <Button 
            size="sm" 
            variant="outline"
            onClick={generateInsight}
            className="text-xs"
          >
            Refresh Tip
          </Button>
        </div>
      </div>
    </Card>
  );
}