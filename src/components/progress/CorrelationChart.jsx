import React from "react";
import { Card } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function CorrelationChart({ title, data, xKey, yKey, xLabel, yLabel, color }) {
  if (data.length === 0) {
    return (
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          Not enough data to show correlation. Keep tracking!
        </p>
      </Card>
    );
  }

  // Calculate correlation coefficient
  const n = data.length;
  const sumX = data.reduce((sum, d) => sum + d[xKey], 0);
  const sumY = data.reduce((sum, d) => sum + d[yKey], 0);
  const sumXY = data.reduce((sum, d) => sum + d[xKey] * d[yKey], 0);
  const sumX2 = data.reduce((sum, d) => sum + d[xKey] ** 2, 0);
  const sumY2 = data.reduce((sum, d) => sum + d[yKey] ** 2, 0);

  const correlation = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2));

  const getCorrelationLabel = (r) => {
    const abs = Math.abs(r);
    if (abs >= 0.7) return 'Strong';
    if (abs >= 0.4) return 'Moderate';
    if (abs >= 0.2) return 'Weak';
    return 'Very Weak';
  };

  const correlationLabel = getCorrelationLabel(correlation);
  const direction = correlation > 0 ? 'positive' : 'negative';

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <div className="text-right">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Correlation</p>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {correlationLabel} {direction}
          </p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey={xKey} 
            name={xLabel} 
            stroke="var(--text-muted)"
            label={{ value: xLabel, position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            dataKey={yKey} 
            name={yLabel} 
            stroke="var(--text-muted)"
            label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: '12px',
              color: 'var(--text-primary)'
            }} 
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Scatter data={data} fill={color} />
        </ScatterChart>
      </ResponsiveContainer>

      <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
        {Math.abs(correlation) >= 0.4 
          ? `${correlationLabel} ${direction} relationship detected between ${xLabel.toLowerCase()} and ${yLabel.toLowerCase()}`
          : `${correlationLabel} correlation - keep tracking for more insights`
        }
      </p>
    </Card>
  );
}