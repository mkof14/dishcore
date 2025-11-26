import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Award, Target, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function WeeklySummaryReport({ data }) {
  const {
    weightChange,
    avgCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    avgSteps,
    goalsAchieved,
    mealsLogged,
    consistency
  } = data;

  const macroData = [
    { name: 'Protein', value: totalProtein, color: '#3B82F6' },
    { name: 'Carbs', value: totalCarbs, color: '#10B981' },
    { name: 'Fat', value: totalFat, color: '#F59E0B' }
  ];

  const getConsistencyColor = (percent) => {
    if (percent >= 80) return 'text-green-500';
    if (percent >= 60) return 'text-blue-500';
    if (percent >= 40) return 'text-yellow-500';
    return 'text-orange-500';
  };

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Weekly Summary
        </h3>
        <Badge className="bg-blue-500/20 text-blue-400">
          This Week
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Metrics */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Weight Change</span>
              {weightChange < 0 ? (
                <TrendingDown className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingUp className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {weightChange > 0 ? '+' : ''}{weightChange}kg
            </p>
          </div>

          <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Avg Daily Calories</span>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {avgCalories} kcal
            </p>
          </div>

          <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Avg Daily Steps</span>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {avgSteps.toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Goals Achieved</span>
            </div>
            <p className="text-2xl font-bold text-yellow-500">
              {goalsAchieved}
            </p>
          </div>
        </div>

        {/* Right Column - Insights */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Macro Distribution
            </h4>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {macroData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {item.name}: {item.value}g
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
              <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Tracking Consistency
              </h4>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 rounded-full" style={{ background: 'var(--background)' }}>
                  <div
                    className="h-full rounded-full gradient-accent"
                    style={{ width: `${consistency}%` }}
                  />
                </div>
              </div>
              <span className={`text-xl font-bold ${getConsistencyColor(consistency)}`}>
                {consistency}%
              </span>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              {mealsLogged} meals logged this week
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              💡 AI Insight
            </h4>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {consistency >= 80
                ? "Excellent consistency! Keep up the great work with your tracking."
                : consistency >= 60
                ? "Good progress! Try logging meals more consistently for better insights."
                : "Increase your meal logging to get personalized recommendations."}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}