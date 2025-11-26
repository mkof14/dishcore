import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Heart, Moon, Activity, Zap, TrendingUp, TrendingDown } from "lucide-react";

export default function DetailedMetricsChart({ data, metric }) {
  const metricConfig = {
    hrv: {
      title: "Heart Rate Variability (HRV)",
      key: "heart_rate_variability",
      color: "#EF4444",
      icon: Heart,
      unit: "ms",
      description: "Higher HRV indicates better recovery and lower stress"
    },
    sleep_stages: {
      title: "Sleep Stages Breakdown",
      keys: ["deep_sleep", "rem_sleep", "light_sleep", "awake"],
      colors: ["#8B5CF6", "#3B82F6", "#06B6D4", "#F59E0B"],
      icon: Moon,
      unit: "hours",
      description: "Deep and REM sleep are most restorative"
    },
    stress: {
      title: "Stress & Recovery",
      keys: ["stress_level", "recovery_score"],
      colors: ["#F59E0B", "#10B981"],
      icon: Zap,
      description: "Lower stress and higher recovery indicate better readiness"
    }
  };

  const config = metricConfig[metric];
  if (!config) return null;

  const Icon = config.icon;

  const chartData = data.map(d => {
    if (metric === "sleep_stages") {
      return {
        date: d.date,
        deep_sleep: d.sleep_stages?.deep_sleep || 0,
        rem_sleep: d.sleep_stages?.rem_sleep || 0,
        light_sleep: d.sleep_stages?.light_sleep || 0,
        awake: d.sleep_stages?.awake || 0
      };
    }
    return d;
  }).filter(d => Object.values(d).some(v => typeof v === 'number' && v > 0));

  if (chartData.length === 0) {
    return (
      <Card className="gradient-card border-0 p-6 rounded-3xl text-center">
        <Icon className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-muted)' }}>No {config.title.toLowerCase()} data available</p>
      </Card>
    );
  }

  const getAverage = (key) => {
    const values = chartData.map(d => d[key]).filter(v => v > 0);
    return values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 0;
  };

  const getTrend = (key) => {
    const values = chartData.map(d => d[key]).filter(v => v > 0);
    if (values.length < 2) return null;
    const recent = values.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, values.length);
    const older = values.slice(0, Math.min(7, values.length)).reduce((a, b) => a + b, 0) / Math.min(7, values.length);
    return recent > older ? 'up' : 'down';
  };

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
            style={{ background: `${config.color}20` }}>
            <Icon className="w-5 h-5" style={{ color: config.color }} />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {config.title}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {config.description}
            </p>
          </div>
        </div>
      </div>

      {metric === "sleep_stages" ? (
        <>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Deep</p>
              <p className="text-xl font-bold text-purple-400">{getAverage('deep_sleep')}h</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>REM</p>
              <p className="text-xl font-bold text-blue-400">{getAverage('rem_sleep')}h</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Light</p>
              <p className="text-xl font-bold text-cyan-400">{getAverage('light_sleep')}h</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Awake</p>
              <p className="text-xl font-bold text-orange-400">{getAverage('awake')}h</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
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
              <Bar dataKey="deep_sleep" stackId="a" fill="#8B5CF6" name="Deep Sleep" />
              <Bar dataKey="rem_sleep" stackId="a" fill="#3B82F6" name="REM Sleep" />
              <Bar dataKey="light_sleep" stackId="a" fill="#06B6D4" name="Light Sleep" />
              <Bar dataKey="awake" stackId="a" fill="#F59E0B" name="Awake" />
            </BarChart>
          </ResponsiveContainer>
        </>
      ) : metric === "stress" ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Avg Stress</p>
                {getTrend('stress_level') && (
                  getTrend('stress_level') === 'up' ? 
                    <TrendingUp className="w-4 h-4 text-orange-400" /> :
                    <TrendingDown className="w-4 h-4 text-green-400" />
                )}
              </div>
              <p className="text-2xl font-bold text-orange-400">{getAverage('stress_level')}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Avg Recovery</p>
                {getTrend('recovery_score') && (
                  getTrend('recovery_score') === 'up' ? 
                    <TrendingUp className="w-4 h-4 text-green-400" /> :
                    <TrendingDown className="w-4 h-4 text-orange-400" />
                )}
              </div>
              <p className="text-2xl font-bold text-green-400">{getAverage('recovery_score')}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="stress_level" stroke="#F59E0B" strokeWidth={2} name="Stress Level" />
              <Line type="monotone" dataKey="recovery_score" stroke="#10B981" strokeWidth={2} name="Recovery Score" />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Average HRV</p>
              {getTrend(config.key) && (
                <Badge className={getTrend(config.key) === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}>
                  {getTrend(config.key) === 'up' ? 'Improving' : 'Declining'}
                </Badge>
              )}
            </div>
            <p className="text-3xl font-bold" style={{ color: config.color }}>
              {getAverage(config.key)} {config.unit}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
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
              <Line 
                type="monotone" 
                dataKey={config.key} 
                stroke={config.color} 
                strokeWidth={3} 
                dot={{ r: 4 }}
                name={`HRV (${config.unit})`}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </Card>
  );
}