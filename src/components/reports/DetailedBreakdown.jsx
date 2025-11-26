import React from "react";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Utensils, Activity, Moon, Droplet, Target } from "lucide-react";

export default function DetailedBreakdown({ mealLogs, wearableData, profile }) {
  // Daily nutrition aggregation
  const dailyNutrition = mealLogs.reduce((acc, log) => {
    if (!acc[log.date]) {
      acc[log.date] = {
        date: log.date,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        water: 0,
        meals: 0
      };
    }
    
    acc[log.date].calories += log.calories || 0;
    acc[log.date].protein += log.protein || 0;
    acc[log.date].carbs += log.carbs || 0;
    acc[log.date].fat += log.fat || 0;
    acc[log.date].fiber += log.fiber || 0;
    
    if (log.meal_type === 'water') {
      acc[log.date].water += 250;
    } else {
      acc[log.date].meals += 1;
    }
    
    return acc;
  }, {});

  const nutritionArray = Object.values(dailyNutrition).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  ).slice(-30);

  // Macro distribution
  const totalProtein = nutritionArray.reduce((sum, d) => sum + d.protein, 0);
  const totalCarbs = nutritionArray.reduce((sum, d) => sum + d.carbs, 0);
  const totalFat = nutritionArray.reduce((sum, d) => sum + d.fat, 0);

  const macroDistribution = [
    { name: 'Protein', value: totalProtein, color: '#3B82F6' },
    { name: 'Carbs', value: totalCarbs, color: '#FB923C' },
    { name: 'Fat', value: totalFat, color: '#A855F7' }
  ];

  // Activity overview
  const activityData = wearableData.slice(-30).map(w => ({
    date: w.date,
    steps: w.steps || 0,
    active_minutes: w.active_minutes || 0,
    calories_burned: w.calories_burned || 0
  }));

  // Sleep analysis
  const sleepData = wearableData.slice(-30).map(w => ({
    date: w.date,
    total: w.sleep_hours || 0,
    deep: w.sleep_stages?.deep_sleep || 0,
    rem: w.sleep_stages?.rem_sleep || 0,
    light: w.sleep_stages?.light_sleep || 0,
    quality: w.sleep_quality || 0
  })).filter(d => d.total > 0);

  // Averages
  const avgCalories = nutritionArray.reduce((sum, d) => sum + d.calories, 0) / nutritionArray.length;
  const avgProtein = nutritionArray.reduce((sum, d) => sum + d.protein, 0) / nutritionArray.length;
  const avgSteps = activityData.reduce((sum, d) => sum + d.steps, 0) / (activityData.length || 1);
  const avgSleep = sleepData.reduce((sum, d) => sum + d.total, 0) / (sleepData.length || 1);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="gradient-card border-0 p-5 rounded-2xl">
          <Utensils className="w-5 h-5 mb-2" style={{ color: 'var(--accent-from)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg Calories</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {Math.round(avgCalories)}
          </p>
        </Card>
        
        <Card className="gradient-card border-0 p-5 rounded-2xl">
          <Activity className="w-5 h-5 mb-2 text-blue-400" />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg Protein</p>
          <p className="text-2xl font-bold text-blue-400">
            {Math.round(avgProtein)}g
          </p>
        </Card>

        <Card className="gradient-card border-0 p-5 rounded-2xl">
          <Activity className="w-5 h-5 mb-2 text-green-400" />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg Steps</p>
          <p className="text-2xl font-bold text-green-400">
            {Math.round(avgSteps).toLocaleString()}
          </p>
        </Card>

        <Card className="gradient-card border-0 p-5 rounded-2xl">
          <Moon className="w-5 h-5 mb-2 text-purple-400" />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg Sleep</p>
          <p className="text-2xl font-bold text-purple-400">
            {avgSleep.toFixed(1)}h
          </p>
        </Card>
      </div>

      {/* Nutrition Trends */}
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Daily Nutrition Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={nutritionArray}>
            <defs>
              <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00A3E3" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00A3E3" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="var(--text-muted)" />
            <YAxis stroke="var(--text-muted)" />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px'
              }}
            />
            <Legend />
            <Area type="monotone" dataKey="calories" stroke="#00A3E3" fillOpacity={1} fill="url(#colorCalories)" name="Calories" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Macros Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Macronutrient Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={macroDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {macroDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Daily Macros Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={nutritionArray.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px'
                }}
              />
              <Legend />
              <Bar dataKey="protein" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Protein" />
              <Bar dataKey="carbs" fill="#FB923C" radius={[4, 4, 0, 0]} name="Carbs" />
              <Bar dataKey="fat" fill="#A855F7" radius={[4, 4, 0, 0]} name="Fat" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Activity Trends */}
      {activityData.length > 0 && (
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Activity Patterns
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px'
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="steps" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Steps" />
              <Area type="monotone" dataKey="active_minutes" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Active Minutes" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Sleep Patterns */}
      {sleepData.length > 0 && (
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Sleep Quality & Stages
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sleepData.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px'
                }}
              />
              <Legend />
              <Bar dataKey="deep" stackId="a" fill="#8B5CF6" name="Deep Sleep" />
              <Bar dataKey="rem" stackId="a" fill="#3B82F6" name="REM Sleep" />
              <Bar dataKey="light" stackId="a" fill="#06B6D4" name="Light Sleep" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}