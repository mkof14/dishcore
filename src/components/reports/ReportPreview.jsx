import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format, differenceInDays } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Target, Activity, Moon, Zap, Droplet } from "lucide-react";

export default function ReportPreview({ report }) {
  if (!report) return null;

  const { measurements, mealLogs, wearableData, profile, customGoals, config, period } = report;

  // Calculate summary stats
  const latestMeasurement = measurements[0];
  const earliestMeasurement = measurements[measurements.length - 1];
  const weightChange = (latestMeasurement?.weight || 0) - (earliestMeasurement?.weight || 0);
  const waistChange = (latestMeasurement?.waist || 0) - (earliestMeasurement?.waist || 0);

  // Nutrition averages
  const avgCalories = mealLogs.reduce((sum, log) => sum + (log.calories || 0), 0) / period;
  const avgProtein = mealLogs.reduce((sum, log) => sum + (log.protein || 0), 0) / period;
  const avgCarbs = mealLogs.reduce((sum, log) => sum + (log.carbs || 0), 0) / period;
  const avgFat = mealLogs.reduce((sum, log) => sum + (log.fat || 0), 0) / period;

  // Wearable averages
  const avgSteps = wearableData.reduce((sum, w) => sum + (w.steps || 0), 0) / (wearableData.length || 1);
  const avgSleep = wearableData.reduce((sum, w) => sum + (w.sleep_hours || 0), 0) / (wearableData.length || 1);
  const avgActiveMin = wearableData.reduce((sum, w) => sum + (w.active_minutes || 0), 0) / (wearableData.length || 1);

  // Weight trend data
  const weightData = measurements.slice().reverse().map(m => ({
    date: format(new Date(m.date), 'MMM d'),
    weight: m.weight
  }));

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="gradient-card border-0 p-8 rounded-3xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            DishCore Health Report
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {format(new Date(report.generatedAt), 'MMMM d, yyyy')} • {period} Day Analysis
          </p>
          <Badge className="mt-3">
            {report.user.full_name} ({report.user.email})
          </Badge>
        </div>
      </Card>

      {/* Body Section */}
      {config.sections.includes('body') && measurements.length > 0 && (
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            📏 Body Metrics
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Current Weight</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {latestMeasurement?.weight?.toFixed(1)} kg
              </p>
              <div className="flex items-center gap-1 mt-2">
                {weightChange < 0 ? (
                  <><TrendingDown className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">{weightChange.toFixed(1)} kg</span></>
                ) : weightChange > 0 ? (
                  <><TrendingUp className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-orange-400">+{weightChange.toFixed(1)} kg</span></>
                ) : (
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>No change</span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Waist</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {latestMeasurement?.waist?.toFixed(0)} cm
              </p>
              <div className="flex items-center gap-1 mt-2">
                {waistChange < 0 ? (
                  <span className="text-sm text-green-400">{waistChange.toFixed(0)} cm</span>
                ) : waistChange > 0 ? (
                  <span className="text-sm text-orange-400">+{waistChange.toFixed(0)} cm</span>
                ) : (
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>No change</span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>BMI</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {latestMeasurement?.bmi?.toFixed(1)}
              </p>
            </div>
          </div>

          {weightData.length > 1 && (
            <div>
              <p className="text-sm mb-3 font-medium" style={{ color: 'var(--text-primary)' }}>Weight Trend</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip contentStyle={{ background: 'var(--surface)', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="weight" stroke="#A855F7" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      )}

      {/* Nutrition Section */}
      {config.sections.includes('nutrition') && mealLogs.length > 0 && (
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            🍽️ Nutrition Summary
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <Zap className="w-5 h-5 mb-2" style={{ color: 'var(--accent-from)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Avg Calories</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {Math.round(avgCalories)}
              </p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <Activity className="w-5 h-5 mb-2 text-blue-400" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Avg Protein</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {Math.round(avgProtein)}g
              </p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Avg Carbs</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {Math.round(avgCarbs)}g
              </p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Avg Fat</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {Math.round(avgFat)}g
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Activity Section */}
      {config.sections.includes('activity') && wearableData.length > 0 && (
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            🏃 Activity & Sleep
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <Activity className="w-5 h-5 mb-2" style={{ color: 'var(--accent-from)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Avg Steps</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {Math.round(avgSteps).toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <Moon className="w-5 h-5 mb-2 text-purple-400" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Avg Sleep</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {avgSleep.toFixed(1)}h
              </p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <Zap className="w-5 h-5 mb-2 text-orange-400" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Avg Active Min</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {Math.round(avgActiveMin)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Goals Section */}
      {config.sections.includes('goals') && customGoals && customGoals.length > 0 && (
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            🎯 Goals Progress
          </h3>
          <div className="space-y-4">
            {customGoals.map(goal => {
              const progress = ((goal.current_value - goal.start_value) / (goal.target_value - goal.start_value)) * 100;
              const progressClamped = Math.min(Math.max(progress, 0), 100);
              
              return (
                <div key={goal.id} className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>{goal.title}</h4>
                    <Badge>{progressClamped.toFixed(0)}%</Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </span>
                  </div>
                  <Progress value={progressClamped} className="h-2" />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Insights Section */}
      {config.sections.includes('insights') && (
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            🧠 Key Insights
          </h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <strong>Protein Intake:</strong> Averaging {Math.round(avgProtein)}g daily, 
                {avgProtein >= (profile?.target_protein || 150) ? ' exceeding' : ' below'} your target of {profile?.target_protein || 150}g
              </p>
            </div>
            {wearableData.length > 0 && (
              <>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <strong>Activity:</strong> Averaging {Math.round(avgSteps).toLocaleString()} steps per day
                    {avgSteps >= 8000 ? ' - excellent activity level!' : ' - aim for 8,000+ for optimal health'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <strong>Sleep:</strong> Averaging {avgSleep.toFixed(1)} hours per night
                    {avgSleep >= 7 ? ' - meeting recommendations' : ' - aim for 7-9 hours'}
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}