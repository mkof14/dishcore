import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";
import { TrendingUp, Brain } from "lucide-react";

export default function AdvancedCorrelation({ wearableData, scoreData }) {
  const [selectedMetric, setSelectedMetric] = useState('hrv');

  const mergedData = wearableData.map(w => {
    const scoreEntry = scoreData.find(s => s.date === w.date);
    return {
      date: w.date,
      hrv: w.heart_rate_variability,
      deep_sleep: w.sleep_stages?.deep_sleep,
      recovery: w.recovery_score,
      stress: w.stress_level,
      score: scoreEntry?.dishCoreScore || 0
    };
  }).filter(d => d.score > 0 && d[selectedMetric] > 0);

  const calculateCorrelation = (metric) => {
    if (mergedData.length < 3) return null;
    
    const x = mergedData.map(d => d[metric]);
    const y = mergedData.map(d => d.score);
    
    const meanX = x.reduce((a, b) => a + b) / x.length;
    const meanY = y.reduce((a, b) => a + b) / y.length;
    
    const num = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
    const denX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0));
    const denY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0));
    
    return denX && denY ? num / (denX * denY) : 0;
  };

  const metrics = [
    { key: 'hrv', label: 'Heart Rate Variability', unit: 'ms', color: '#EF4444' },
    { key: 'deep_sleep', label: 'Deep Sleep', unit: 'hours', color: '#8B5CF6' },
    { key: 'recovery', label: 'Recovery Score', unit: 'score', color: '#10B981' },
    { key: 'stress', label: 'Stress Level', unit: 'level', color: '#F59E0B' }
  ];

  const correlation = calculateCorrelation(selectedMetric);
  const currentMetric = metrics.find(m => m.key === selectedMetric);

  const getCorrelationStrength = (r) => {
    const abs = Math.abs(r);
    if (abs > 0.7) return { text: 'Strong', color: '#10B981' };
    if (abs > 0.4) return { text: 'Moderate', color: '#F59E0B' };
    return { text: 'Weak', color: '#64748B' };
  };

  const strength = correlation ? getCorrelationStrength(correlation) : null;

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Advanced Health Correlations
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            How wearable metrics impact your DishCore Score
          </p>
        </div>
      </div>

      <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
        <TabsList className="grid grid-cols-4 mb-4">
          {metrics.map(m => (
            <TabsTrigger key={m.key} value={m.key} className="text-xs">
              {m.label.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {metrics.map(metric => (
          <TabsContent key={metric.key} value={metric.key}>
            {mergedData.length > 0 ? (
              <>
                {correlation && (
                  <div className="mb-4 p-4 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Correlation Strength
                      </p>
                      <span className="text-sm font-bold" style={{ color: strength.color }}>
                        {strength.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" style={{ color: metric.color }} />
                      <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        r = {correlation.toFixed(3)}
                      </p>
                    </div>
                  </div>
                )}

                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey={metric.key} 
                      name={metric.label}
                      stroke="var(--text-muted)"
                      label={{ value: `${metric.label} (${metric.unit})`, position: 'bottom' }}
                    />
                    <YAxis 
                      dataKey="score" 
                      name="DishCore Score"
                      stroke="var(--text-muted)"
                      label={{ value: 'DishCore Score', angle: -90, position: 'left' }}
                    />
                    <ZAxis range={[60, 400]} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px'
                      }}
                      formatter={(value, name) => [
                        value,
                        name === metric.key ? metric.label : 'DishCore Score'
                      ]}
                    />
                    <Scatter 
                      data={mergedData} 
                      fill={metric.color}
                      fillOpacity={0.6}
                    />
                  </ScatterChart>
                </ResponsiveContainer>

                <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <strong>💡 Insight:</strong> {
                      correlation > 0.5 
                        ? `Higher ${metric.label.toLowerCase()} strongly correlates with better DishCore Scores. Focus on improving this metric!`
                        : correlation < -0.5
                        ? `Lower ${metric.label.toLowerCase()} correlates with better scores. Work on reducing this metric.`
                        : `${metric.label} shows moderate correlation. Multiple factors influence your score.`
                    }
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p style={{ color: 'var(--text-muted)' }}>
                  Not enough data to calculate correlation. Keep tracking!
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}