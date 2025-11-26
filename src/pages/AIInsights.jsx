import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Target,
  Activity,
  Moon,
  Utensils,
  Heart,
  Loader2,
  RefreshCw,
  Calendar,
  ArrowLeft
} from "lucide-react";
import { PersonalizedAIEngine } from "../components/ai/PersonalizedAIEngine";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { Progress } from "@/components/ui/progress";

export default function AIInsights() {
  const [insights, setInsights] = useState(null);
  const [userContext, setUserContext] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const context = await PersonalizedAIEngine.gatherUserContext();
      setUserContext(context);

      const [recommendations, metabolismInsights] = await Promise.all([
        PersonalizedAIEngine.generateSmartRecommendations(context),
        PersonalizedAIEngine.generateMetabolismInsights(context)
      ]);

      setInsights({
        recommendations,
        metabolism: metabolismInsights
      });
      setLastUpdated(new Date());
      toast.success('AI insights updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate insights');
    }
    setIsLoading(false);
  };

  if (isLoading && !insights) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Analyzing Your Data...
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Processing nutrition patterns, activity, sleep, and goals
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = createPageUrl('Dashboard')}
              className="w-12 h-12 rounded-2xl btn-secondary flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                AI Personalized Insights
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                Advanced analysis based on your complete health data
                {lastUpdated && ` • Updated ${lastUpdated.toLocaleTimeString()}`}
              </p>
            </div>
          </div>
          <Button
            onClick={loadInsights}
            disabled={isLoading}
            className="gradient-accent text-white border-0"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" />Refresh</>
            )}
          </Button>
        </div>

        {/* User Context Overview */}
        {userContext && (
          <div className="grid md:grid-cols-5 gap-4">
            <Card className="gradient-card border-0 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Adherence Score</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {userContext.analytics.adherenceScore}%
              </p>
            </Card>

            <Card className="gradient-card border-0 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Avg Steps</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {userContext.analytics.avgSteps.toLocaleString()}
              </p>
            </Card>

            <Card className="gradient-card border-0 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Avg Sleep</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {userContext.analytics.avgSleep}h
              </p>
            </Card>

            <Card className="gradient-card border-0 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Weight Trend</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {userContext.analytics.weightTrend > 0 ? '+' : ''}{userContext.analytics.weightTrend}kg
              </p>
            </Card>

            <Card className="gradient-card border-0 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Consistency</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {userContext.analytics.consistency}%
              </p>
            </Card>
          </div>
        )}

        {insights && (
          <>
            {/* Priority Action */}
            <Card className="gradient-card border-0 p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    🎯 Priority Action Right Now
                  </h2>
                  <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                    {insights.recommendations.priority_action}
                  </p>
                </div>
              </div>
            </Card>

            {/* Next Meal Suggestion */}
            {insights.recommendations.next_meal_suggestion && (
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                      <Utensils className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Recommended Next Meal
                      </h3>
                      <p className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-from)' }}>
                        {insights.recommendations.next_meal_suggestion.meal_name}
                      </p>
                      <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                        {insights.recommendations.next_meal_suggestion.why}
                      </p>
                      <div className="flex gap-4">
                        <div className="px-4 py-2 rounded-xl" style={{ background: 'var(--background)' }}>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Calories</p>
                          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                            {insights.recommendations.next_meal_suggestion.calories} kcal
                          </p>
                        </div>
                        <div className="px-4 py-2 rounded-xl" style={{ background: 'var(--background)' }}>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Protein</p>
                          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                            {insights.recommendations.next_meal_suggestion.protein}g
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Immediate Tips */}
            {insights.recommendations.immediate_tips && insights.recommendations.immediate_tips.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {insights.recommendations.immediate_tips.map((tip, idx) => (
                  <Card key={idx} className="gradient-card border-0 p-5 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">{idx + 1}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)' }}>{tip}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Hydration & Movement */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Heart className="w-5 h-5 text-blue-500" />
                  Hydration Reminder
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {insights.recommendations.hydration_reminder}
                </p>
              </Card>

              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Activity className="w-5 h-5 text-orange-500" />
                  Movement Suggestion
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {insights.recommendations.movement_suggestion}
                </p>
              </Card>
            </div>

            {/* Metabolism Insights */}
            {insights.metabolism && (
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Brain className="w-6 h-6" style={{ color: 'var(--accent-from)' }} />
                  Metabolic Health Analysis
                </h2>
                <p className="mb-6 text-lg" style={{ color: 'var(--text-secondary)' }}>
                  {insights.metabolism.overall_metabolic_health}
                </p>

                <div className="space-y-4">
                  {insights.metabolism.zones?.map((zone, idx) => (
                    <div key={idx} className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                          {zone.zone}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold" style={{ color: 'var(--accent-from)' }}>
                            {zone.score}%
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            zone.status === 'excellent' ? 'bg-green-500/20 text-green-400' :
                            zone.status === 'good' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            {zone.status}
                          </span>
                        </div>
                      </div>
                      <Progress value={zone.score} className="h-2 mb-3" />
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {zone.insight}
                      </p>
                      <p className="text-sm font-medium" style={{ color: 'var(--accent-from)' }}>
                        💡 {zone.recommendation}
                      </p>
                    </div>
                  ))}
                </div>

                {insights.metabolism.key_improvements && (
                  <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                    <h4 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                      🎯 Key Improvements to Focus On
                    </h4>
                    <ul className="space-y-2">
                      {insights.metabolism.key_improvements.map((improvement, idx) => (
                        <li key={idx} className="flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--accent-from)' }}>•</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}

            {/* Evening Prep & Motivation */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Calendar className="w-5 h-5 text-purple-500" />
                  Evening Preparation
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {insights.recommendations.evening_prep}
                </p>
              </Card>

              <Card className="gradient-card border-0 p-6 rounded-3xl bg-gradient-to-br from-green-500/10 to-teal-500/10">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Heart className="w-5 h-5 text-green-500" />
                  Your Progress
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {insights.recommendations.progress_recognition}
                </p>
              </Card>
            </div>

            {/* Motivational Message */}
            <Card className="gradient-card border-0 p-8 rounded-3xl text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {insights.recommendations.motivational_insight}
              </p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}