import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Dumbbell, Flame, Clock } from "lucide-react";

const WORKOUT_COLORS = {
  running: "#EF4444",
  walking: "#10B981",
  cycling: "#3B82F6",
  swimming: "#06B6D4",
  strength_training: "#8B5CF6",
  yoga: "#EC4899",
  hiit: "#F59E0B",
  cardio: "#14B8A6",
  sports: "#6366F1",
  other: "#64748B"
};

const WORKOUT_LABELS = {
  running: "Running",
  walking: "Walking",
  cycling: "Cycling",
  swimming: "Swimming",
  strength_training: "Strength",
  yoga: "Yoga",
  hiit: "HIIT",
  cardio: "Cardio",
  sports: "Sports",
  other: "Other"
};

export default function WorkoutAnalysis({ data }) {
  const allWorkouts = data.flatMap(d => 
    (d.workout_sessions || []).map(w => ({
      ...w,
      date: d.date
    }))
  );

  if (allWorkouts.length === 0) {
    return (
      <Card className="gradient-card border-0 p-8 rounded-3xl text-center">
        <Dumbbell className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          No Workouts Logged
        </h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Connect your wearable to automatically track workout sessions
        </p>
      </Card>
    );
  }

  const workoutsByType = allWorkouts.reduce((acc, w) => {
    acc[w.type] = (acc[w.type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(workoutsByType).map(([type, count]) => ({
    name: WORKOUT_LABELS[type] || type,
    value: count,
    color: WORKOUT_COLORS[type] || "#64748B"
  }));

  const totalDuration = allWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const totalCalories = allWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const avgDuration = totalDuration / allWorkouts.length;
  const avgCalories = totalCalories / allWorkouts.length;

  const intensityData = [
    { name: 'Low', count: allWorkouts.filter(w => w.intensity === 'low').length },
    { name: 'Moderate', count: allWorkouts.filter(w => w.intensity === 'moderate').length },
    { name: 'High', count: allWorkouts.filter(w => w.intensity === 'high').length },
    { name: 'Peak', count: allWorkouts.filter(w => w.intensity === 'peak').length }
  ].filter(d => d.count > 0);

  return (
    <div className="space-y-6">
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Dumbbell className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
          Workout Summary
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total Sessions</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {allWorkouts.length}
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg Duration</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {Math.round(avgDuration)} min
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg Calories</p>
            </div>
            <p className="text-2xl font-bold text-orange-400">
              {Math.round(avgCalories)}
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total Time</p>
            <p className="text-2xl font-bold text-purple-400">
              {Math.round(totalDuration / 60)}h
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Workout Types Distribution
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Intensity Distribution
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={intensityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#00E38C" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Recent Workouts
        </h3>
        <div className="space-y-3">
          {allWorkouts.slice(-5).reverse().map((workout, idx) => (
            <div key={idx} className="p-4 rounded-xl flex items-center justify-between"
              style={{ background: 'var(--bg-surface-alt)' }}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" 
                  style={{ background: WORKOUT_COLORS[workout.type] }} />
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {WORKOUT_LABELS[workout.type] || workout.type}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {workout.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {workout.duration} min
                </p>
                <Badge className="text-xs mt-1">
                  {workout.intensity}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}