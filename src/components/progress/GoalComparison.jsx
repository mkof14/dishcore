import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, Target, CheckCircle2, AlertCircle } from "lucide-react";

export default function GoalComparison({ data, goals, metric = 'weight' }) {
  const activeGoal = goals.find(g => g.status === 'active' && g.metric === metric);
  
  if (!activeGoal) {
    return (
      <Card className="gradient-card border-0 p-6 rounded-3xl text-center">
        <Target className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-muted)' }}>
          Set a goal to see comparative analysis
        </p>
      </Card>
    );
  }

  const currentValue = data[data.length - 1]?.[metric] || 0;
  const targetValue = activeGoal.target_value;
  const startValue = activeGoal.start_value || data[0]?.[metric] || 0;
  const progress = ((currentValue - startValue) / (targetValue - startValue)) * 100;
  const isOnTrack = Math.abs(currentValue - targetValue) / Math.abs(targetValue - startValue) < 0.5;

  const chartData = data.map(d => ({
    ...d,
    current: d[metric],
    target: targetValue,
    projected: startValue + ((targetValue - startValue) * ((data.indexOf(d) + 1) / data.length))
  }));

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          🎯 Goal Progress: {activeGoal.title}
        </h3>
        {isOnTrack ? (
          <Badge className="bg-green-500/20 text-green-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            On Track
          </Badge>
        ) : (
          <Badge className="bg-orange-500/20 text-orange-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Needs Attention
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Current</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {currentValue.toFixed(1)}
          </p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Target</p>
          <p className="text-2xl font-bold gradient-text">
            {targetValue.toFixed(1)}
          </p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Remaining</p>
          <div className="flex items-center gap-2">
            {currentValue < targetValue ? (
              <TrendingDown className="w-5 h-5 text-orange-400" />
            ) : (
              <TrendingUp className="w-5 h-5 text-green-400" />
            )}
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {Math.abs(targetValue - currentValue).toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      <Progress value={Math.min(Math.abs(progress), 100)} className="h-3 mb-6" />

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E38C" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00E38C" stopOpacity={0} />
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
          
          <ReferenceLine y={targetValue} stroke="#00E38C" strokeDasharray="5 5" label="Target" />
          
          <Area
            type="monotone"
            dataKey="projected"
            fill="url(#areaGradient)"
            stroke="none"
            name="Expected Progress"
          />
          
          <Line
            type="monotone"
            dataKey="current"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ r: 5 }}
            name="Actual Progress"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <strong>📈 Analysis:</strong> {isOnTrack 
            ? `Great work! You're ${Math.abs(progress).toFixed(0)}% towards your goal. Keep up the consistency!`
            : progress > 100 
            ? `You've exceeded your goal by ${(progress - 100).toFixed(0)}%! Consider setting a new target.`
            : `You're ${Math.abs(progress).toFixed(0)}% towards your goal. ${progress < 50 ? 'Stay focused and consistent!' : 'You\'re past halfway - keep pushing!'}`
          }
        </p>
      </div>
    </Card>
  );
}