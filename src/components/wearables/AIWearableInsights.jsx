import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Heart, Moon, Activity, Zap, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const INSIGHT_CATEGORIES = {
  recovery: { icon: Zap, color: 'green', label: 'Recovery' },
  sleep: { icon: Moon, color: 'purple', label: 'Sleep Quality' },
  activity: { icon: Activity, color: 'blue', label: 'Activity' },
  stress: { icon: Heart, color: 'red', label: 'Stress Management' },
  nutrition: { icon: TrendingUp, color: 'orange', label: 'Nutrition Timing' }
};

export default function AIWearableInsights({ wearableData, recentDays = 7 }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const { data: historicalData = [] } = useQuery({
    queryKey: ['wearableHistory', recentDays],
    queryFn: () => base44.entities.WearableData.list('-date', recentDays),
  });

  const { data: mealLogs = [] } = useQuery({
    queryKey: ['recentMealLogs', recentDays],
    queryFn: () => base44.entities.MealLog.list('-date', recentDays * 3),
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  React.useEffect(() => {
    if (historicalData.length > 0 && insights.length === 0) {
      generateInsights();
    }
  }, [historicalData]);

  const generateInsights = async () => {
    if (historicalData.length < 3) {
      toast.error('Need at least 3 days of data for insights');
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare data summary
      const avgMetrics = {
        steps: Math.round(historicalData.reduce((sum, d) => sum + (d.steps || 0), 0) / historicalData.length),
        sleep_hours: (historicalData.reduce((sum, d) => sum + (d.sleep_hours || 0), 0) / historicalData.length).toFixed(1),
        heart_rate_avg: Math.round(historicalData.reduce((sum, d) => sum + (d.heart_rate_avg || 0), 0) / historicalData.length),
        heart_rate_variability: Math.round(historicalData.reduce((sum, d) => sum + (d.heart_rate_variability || 0), 0) / historicalData.length),
        active_minutes: Math.round(historicalData.reduce((sum, d) => sum + (d.active_minutes || 0), 0) / historicalData.length),
        recovery_score: Math.round(historicalData.reduce((sum, d) => sum + (d.recovery_score || 0), 0) / historicalData.length),
        stress_level: Math.round(historicalData.reduce((sum, d) => sum + (d.stress_level || 0), 0) / historicalData.length),
      };

      // Calculate trends
      const recentAvg = historicalData.slice(0, 3).reduce((sum, d) => sum + (d.steps || 0), 0) / 3;
      const olderAvg = historicalData.slice(-3).reduce((sum, d) => sum + (d.steps || 0), 0) / 3;
      const stepTrend = recentAvg > olderAvg ? 'increasing' : 'decreasing';

      const prompt = `You are an AI health analyst specializing in wearable data interpretation.

WEARABLE DATA ANALYSIS (Last ${recentDays} days):
Average Metrics:
- Steps: ${avgMetrics.steps}/day (Trend: ${stepTrend})
- Sleep: ${avgMetrics.sleep_hours}h/night
- Heart Rate: ${avgMetrics.heart_rate_avg} bpm
- HRV: ${avgMetrics.heart_rate_variability} ms
- Active Minutes: ${avgMetrics.active_minutes}/day
- Recovery Score: ${avgMetrics.recovery_score}/100
- Stress Level: ${avgMetrics.stress_level}/10

RECENT PATTERNS:
${historicalData.slice(0, 3).map(d => `- ${d.date}: ${d.steps} steps, ${d.sleep_hours}h sleep, Recovery: ${d.recovery_score}`).join('\n')}

USER PROFILE:
- Goal: ${profile?.goal || 'General Health'}
- Activity Level: ${profile?.activity_level || 'Moderate'}
- Age: ${profile?.age || 'N/A'}
- Target Calories: ${profile?.target_calories || '2000'}/day

MEAL TIMING PATTERNS:
${mealLogs.slice(0, 10).map(log => `- ${log.date} ${log.meal_type}: ${log.calories}cal at logged time`).join('\n')}

TASK: Provide personalized health insights and actionable recommendations:

1. RECOVERY INSIGHT: Analyze recovery patterns and sleep quality
2. ACTIVITY INSIGHT: Evaluate activity levels and intensity
3. STRESS INSIGHT: Identify stress patterns and management needs
4. SLEEP INSIGHT: Assess sleep duration and quality metrics
5. NUTRITION TIMING: Suggest optimal meal timing based on activity patterns

For each insight:
- Identify specific patterns or concerns
- Rate severity/importance (low/medium/high)
- Provide clear, actionable recommendations
- Suggest target adjustments if needed

Return structured insights with categories, findings, and recommendations.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string", enum: ["recovery", "sleep", "activity", "stress", "nutrition"] },
                  title: { type: "string" },
                  finding: { type: "string" },
                  severity: { type: "string", enum: ["low", "medium", "high"] },
                  trend: { type: "string", enum: ["positive", "negative", "neutral"] }
                }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  action: { type: "string" },
                  expected_impact: { type: "string" },
                  priority: { type: "string", enum: ["low", "medium", "high"] }
                }
              }
            },
            target_adjustments: {
              type: "object",
              properties: {
                calories: { type: "number" },
                protein: { type: "number" },
                sleep_goal: { type: "number" },
                activity_minutes: { type: "number" }
              }
            }
          }
        }
      });

      setInsights(result.insights || []);
      setRecommendations(result.recommendations || []);
      
      if (result.target_adjustments) {
        toast.success('AI insights generated with personalized recommendations');
      }
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast.error('Failed to generate insights');
    }

    setIsGenerating(false);
  };

  if (isGenerating) {
    return (
      <Card className="gradient-card border-0 p-8 rounded-3xl">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-center font-medium" style={{ color: 'var(--text-primary)' }}>
            Analyzing your health patterns...
          </p>
        </div>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              AI Health Insights
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Get personalized insights from your wearable data
            </p>
          </div>
          <Button
            onClick={generateInsights}
            className="gradient-accent text-white border-0"
            disabled={historicalData.length < 3}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Insights
          </Button>
        </div>
      </Card>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'negative': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                AI Health Insights
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Based on {recentDays} days of wearable data
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateInsights}
            disabled={isGenerating}
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => {
            const category = INSIGHT_CATEGORIES[insight.category] || INSIGHT_CATEGORIES.activity;
            const Icon = category.icon;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="gradient-card border-0 p-4 rounded-2xl h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 text-${category.color}-400`} />
                      <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {insight.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(insight.trend)}
                      <Badge className={`text-xs ${getSeverityColor(insight.severity)}`}>
                        {insight.severity}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {insight.finding}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {recommendations.length > 0 && (
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Personalized Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-xl flex items-start gap-3"
                style={{ background: 'var(--background)' }}
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  rec.priority === 'high' ? 'bg-red-400' : 
                  rec.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {rec.action}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {rec.category}
                    </Badge>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Expected Impact: {rec.expected_impact}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}