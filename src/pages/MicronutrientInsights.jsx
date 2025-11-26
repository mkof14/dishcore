import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, TrendingUp, AlertCircle, CheckCircle, Apple, Pill } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { MicronutrientAnalyzer } from "../components/ai/MicronutrientAnalyzer";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function MicronutrientInsights() {
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const { data: recentLogs = [] } = useQuery({
    queryKey: ['recentMealLogs'],
    queryFn: () => base44.entities.MealLog.list('-date', 100),
  });

  useEffect(() => {
    if (profile && recentLogs.length > 0) {
      loadAnalysis();
    }
  }, [profile, recentLogs]);

  const loadAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await MicronutrientAnalyzer.analyzeMicronutrients(recentLogs, profile);
      setAnalysis(result);

      const recs = await MicronutrientAnalyzer.generateMicronutrientRecommendations(result, profile);
      setRecommendations(recs);
      
      toast.success('Analysis complete');
    } catch (error) {
      console.error(error);
      toast.error('Analysis failed');
    }
    setIsLoading(false);
  };

  if (isLoading || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" style={{ color: 'var(--accent-from)' }} />
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Analyzing Micronutrients...
          </h3>
        </div>
      </div>
    );
  }

  const radarData = Object.keys(analysis.averages).map(nutrient => ({
    nutrient: nutrient.replace(/_/g, ' '),
    value: Math.min(100, (analysis.averages[nutrient] / analysis.rdas[nutrient]) * 100)
  }));

  const trendData = analysis.dailyEstimates.map(day => ({
    date: day.date.slice(5),
    ...Object.keys(analysis.averages).reduce((acc, nutrient) => {
      acc[nutrient] = Math.round((day[nutrient] / analysis.rdas[nutrient]) * 100);
      return acc;
    }, {})
  }));

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = createPageUrl('Dashboard')}
              className="w-12 h-12 rounded-2xl btn-secondary flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Micronutrient Analysis
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                Detailed vitamin & mineral insights from your meals
              </p>
            </div>
          </div>
          <Button onClick={loadAnalysis} disabled={isLoading} className="gradient-accent text-white border-0">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Refresh
          </Button>
        </div>

        {/* Overall Score */}
        <Card className="gradient-card border-0 p-8 rounded-3xl text-center">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Overall Micronutrient Score
          </h2>
          <div className="text-7xl font-bold mb-4 gradient-text">
            {analysis.overallScore}%
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            {analysis.adequate.length} of {Object.keys(analysis.averages).length} nutrients in optimal range
          </p>
        </Card>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Deficient</h3>
                <p className="text-2xl font-bold text-red-500">{analysis.deficiencies.length}</p>
              </div>
            </div>
            {analysis.deficiencies.length > 0 && (
              <div className="space-y-2">
                {analysis.deficiencies.slice(0, 3).map((d, idx) => (
                  <div key={idx} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    • {d.nutrient.replace(/_/g, ' ')}: {Math.round(d.percentage)}%
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Adequate</h3>
                <p className="text-2xl font-bold text-green-500">{analysis.adequate.length}</p>
              </div>
            </div>
            {analysis.adequate.length > 0 && (
              <div className="space-y-2">
                {analysis.adequate.slice(0, 3).map((a, idx) => (
                  <div key={idx} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    • {a.nutrient.replace(/_/g, ' ')}: {Math.round(a.percentage)}%
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Excess</h3>
                <p className="text-2xl font-bold text-blue-500">{analysis.excess.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Visualizations */}
        <Tabs defaultValue="radar">
          <TabsList>
            <TabsTrigger value="radar">Radar View</TabsTrigger>
            <TabsTrigger value="bars">Bar Chart</TabsTrigger>
            <TabsTrigger value="trends">7-Day Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="radar">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="nutrient" stroke="#9CA3AF" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
                  <Radar name="Intake %" dataKey="value" stroke="#00E38C" fill="#00E38C" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="bars">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={Object.entries(analysis.averages).map(([nutrient, value]) => ({
                  nutrient: nutrient.replace(/_/g, ' '),
                  percentage: Math.round((value / analysis.rdas[nutrient]) * 100)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="nutrient" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="percentage" fill="#00E38C" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  {Object.keys(analysis.averages).slice(0, 5).map((nutrient, idx) => (
                    <Line key={nutrient} type="monotone" dataKey={nutrient} stroke={`hsl(${idx * 60}, 70%, 50%)`} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recommendations */}
        {recommendations && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Personalized Recommendations
            </h2>

            {recommendations.priority_nutrients?.map((nutrient, idx) => (
              <Card key={idx} className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Apple className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
                  {nutrient.nutrient.replace(/_/g, ' ')}
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                      🥗 Recommended Foods
                    </h4>
                    <ul className="space-y-2">
                      {nutrient.recommended_foods?.map((food, i) => (
                        <li key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          • {food}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                      🍽️ Meal Ideas
                    </h4>
                    <ul className="space-y-2">
                      {nutrient.meal_ideas?.map((meal, i) => (
                        <li key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          • {meal}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {nutrient.supplement_suggestion && (
                  <div className="mt-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                    <div className="flex items-start gap-3">
                      <Pill className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-semibold text-blue-400 mb-1">Supplement Note</h5>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {nutrient.supplement_suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}

            {recommendations.dietary_adjustments && (
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  🎯 Dietary Adjustments
                </h3>
                <ul className="space-y-3">
                  {recommendations.dietary_adjustments.map((adjustment, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full gradient-accent flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">{idx + 1}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)' }}>{adjustment}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {recommendations.sample_day_menu && (
              <Card className="gradient-card border-0 p-6 rounded-3xl bg-gradient-to-br from-green-500/10 to-teal-500/10">
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  📋 Sample Day Menu
                </h3>
                <p className="whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                  {recommendations.sample_day_menu}
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}