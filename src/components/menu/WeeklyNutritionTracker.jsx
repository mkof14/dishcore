import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function WeeklyNutritionTracker({ plan, profile }) {
  if (!plan || !plan.days) return null;

  const chartData = plan.days.map((day, index) => ({
    name: `Day ${index + 1}`,
    calories: day.total_calories || 0,
    protein: day.total_protein || 0,
    carbs: day.total_carbs || 0,
    fat: day.total_fat || 0,
    target_calories: profile?.target_calories || 2000,
    target_protein: profile?.target_protein || 150
  }));

  const weeklyTotals = {
    calories: plan.days.reduce((sum, day) => sum + (day.total_calories || 0), 0),
    protein: plan.days.reduce((sum, day) => sum + (day.total_protein || 0), 0),
    carbs: plan.days.reduce((sum, day) => sum + (day.total_carbs || 0), 0),
    fat: plan.days.reduce((sum, day) => sum + (day.total_fat || 0), 0)
  };

  const weeklyAverages = {
    calories: Math.round(weeklyTotals.calories / plan.days.length),
    protein: Math.round(weeklyTotals.protein / plan.days.length),
    carbs: Math.round(weeklyTotals.carbs / plan.days.length),
    fat: Math.round(weeklyTotals.fat / plan.days.length)
  };

  const getComparisonIcon = (actual, target) => {
    const diff = ((actual - target) / target) * 100;
    if (Math.abs(diff) < 5) return <Minus className="w-4 h-4 text-yellow-500" />;
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getComparisonText = (actual, target) => {
    const diff = Math.round(((actual - target) / target) * 100);
    if (Math.abs(diff) < 5) return 'On target';
    if (diff > 0) return `${diff}% above target`;
    return `${Math.abs(diff)}% below target`;
  };

  return (
    <div className="space-y-6">
      {/* Weekly Averages */}
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Target className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
          Weekly Nutrition Goals
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Avg Calories/Day</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {weeklyAverages.calories}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {getComparisonIcon(weeklyAverages.calories, profile?.target_calories || 2000)}
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {getComparisonText(weeklyAverages.calories, profile?.target_calories || 2000)}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Avg Protein/Day</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {weeklyAverages.protein}g
            </p>
            <div className="flex items-center gap-2 mt-2">
              {getComparisonIcon(weeklyAverages.protein, profile?.target_protein || 150)}
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {getComparisonText(weeklyAverages.protein, profile?.target_protein || 150)}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Avg Carbs/Day</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {weeklyAverages.carbs}g
            </p>
            <Badge variant="outline" className="mt-2">
              {Math.round((weeklyAverages.carbs * 4 / weeklyAverages.calories) * 100)}% of calories
            </Badge>
          </div>

          <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Avg Fat/Day</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {weeklyAverages.fat}g
            </p>
            <Badge variant="outline" className="mt-2">
              {Math.round((weeklyAverages.fat * 9 / weeklyAverages.calories) * 100)}% of calories
            </Badge>
          </div>
        </div>
      </Card>

      {/* Daily Calorie Trend */}
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Daily Calorie Distribution
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" />
            <YAxis stroke="var(--text-muted)" />
            <Tooltip
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
            />
            <Legend />
            <Line type="monotone" dataKey="calories" stroke="#00A3E3" strokeWidth={2} name="Actual" />
            <Line type="monotone" dataKey="target_calories" stroke="#FF6B6B" strokeWidth={2} strokeDasharray="5 5" name="Target" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Macronutrient Breakdown */}
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Weekly Macronutrient Breakdown
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" />
            <YAxis stroke="var(--text-muted)" />
            <Tooltip
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
            />
            <Legend />
            <Bar dataKey="protein" fill="#3B82F6" name="Protein (g)" />
            <Bar dataKey="carbs" fill="#10B981" name="Carbs (g)" />
            <Bar dataKey="fat" fill="#F59E0B" name="Fat (g)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}