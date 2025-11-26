import React from "react";
import { Card } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, LineChart, Line, Legend } from "recharts";
import { Brain, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdvancedCorrelations({ mealLogs, wearableData, measurements }) {
  // Calculate DishCore Score for each day
  const calculateScore = (logs, date) => {
    const dayLogs = logs.filter(l => l.date === date);
    if (dayLogs.length === 0) return 0;
    
    const protein = dayLogs.reduce((sum, l) => sum + (l.protein || 0), 0);
    const calories = dayLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
    
    return Math.min(100, (protein / 150 * 30) + (calories > 0 && calories < 2500 ? 40 : 20) + (dayLogs.length * 10));
  };

  // Merge all data by date
  const mergedData = mealLogs.reduce((acc, log) => {
    if (!acc[log.date]) {
      const wearable = wearableData.find(w => w.date === log.date);
      const measurement = measurements.find(m => m.date === log.date);
      
      acc[log.date] = {
        date: log.date,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        steps: wearable?.steps || 0,
        sleep: wearable?.sleep_hours || 0,
        hrv: wearable?.heart_rate_variability || 0,
        recovery: wearable?.recovery_score || 0,
        weight: measurement?.weight || 0,
        score: 0
      };
    }
    
    acc[log.date].calories += log.calories || 0;
    acc[log.date].protein += log.protein || 0;
    acc[log.date].carbs += log.carbs || 0;
    acc[log.date].fat += log.fat || 0;
    
    return acc;
  }, {});

  const correlationData = Object.values(mergedData).map(d => ({
    ...d,
    score: calculateScore(mealLogs, d.date)
  })).filter(d => d.score > 0);

  // Calculate correlations
  const calculateCorrelation = (x, y) => {
    if (x.length < 3) return 0;
    
    const meanX = x.reduce((a, b) => a + b) / x.length;
    const meanY = y.reduce((a, b) => a + b) / y.length;
    
    const num = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
    const denX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0));
    const denY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0));
    
    return denX && denY ? num / (denX * denY) : 0;
  };

  const correlations = [
    {
      name: 'Protein → Score',
      value: calculateCorrelation(
        correlationData.map(d => d.protein),
        correlationData.map(d => d.score)
      ),
      color: '#3B82F6'
    },
    {
      name: 'Sleep → Score',
      value: calculateCorrelation(
        correlationData.filter(d => d.sleep > 0).map(d => d.sleep),
        correlationData.filter(d => d.sleep > 0).map(d => d.score)
      ),
      color: '#8B5CF6'
    },
    {
      name: 'Activity → Score',
      value: calculateCorrelation(
        correlationData.filter(d => d.steps > 0).map(d => d.steps),
        correlationData.filter(d => d.steps > 0).map(d => d.score)
      ),
      color: '#10B981'
    },
    {
      name: 'HRV → Score',
      value: calculateCorrelation(
        correlationData.filter(d => d.hrv > 0).map(d => d.hrv),
        correlationData.filter(d => d.hrv > 0).map(d => d.score)
      ),
      color: '#EF4444'
    }
  ].filter(c => !isNaN(c.value));

  const getStrength = (r) => {
    const abs = Math.abs(r);
    if (abs > 0.7) return { text: 'Strong', color: '#10B981' };
    if (abs > 0.4) return { text: 'Moderate', color: '#F59E0B' };
    return { text: 'Weak', color: '#6B7280' };
  };

  return (
    <div className="space-y-6">
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Correlation Analysis
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              How different factors influence your DishCore Score
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {correlations.map(corr => {
            const strength = getStrength(corr.value);
            return (
              <div key={corr.name} className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{corr.name}</p>
                <p className="text-2xl font-bold mb-2" style={{ color: corr.color }}>
                  {corr.value.toFixed(3)}
                </p>
                <Badge style={{ background: `${strength.color}20`, color: strength.color }}>
                  {strength.text}
                </Badge>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Protein vs Score */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Protein Intake vs DishCore Score
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="protein" name="Protein (g)" stroke="var(--text-muted)" />
                <YAxis dataKey="score" name="Score" stroke="var(--text-muted)" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px'
                  }}
                />
                <Scatter data={correlationData} fill="#3B82F6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Sleep vs Score */}
          {correlationData.filter(d => d.sleep > 0).length > 0 && (
            <div>
              <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Sleep vs DishCore Score
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="sleep" name="Sleep (h)" stroke="var(--text-muted)" />
                  <YAxis dataKey="score" name="Score" stroke="var(--text-muted)" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px'
                    }}
                  />
                  <Scatter data={correlationData.filter(d => d.sleep > 0)} fill="#8B5CF6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </Card>

      {/* Multi-Factor Trend */}
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
          Multi-Factor Health Trends
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={correlationData.slice(-30)}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="var(--text-muted)" />
            <YAxis yAxisId="left" stroke="var(--text-muted)" />
            <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px'
              }}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="score" stroke="#00A3E3" strokeWidth={2} name="DishCore Score" />
            <Line yAxisId="left" dataKey="protein" stroke="#3B82F6" strokeWidth={2} name="Protein (g)" />
            <Line yAxisId="right" dataKey="sleep" stroke="#8B5CF6" strokeWidth={2} name="Sleep (h)" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}