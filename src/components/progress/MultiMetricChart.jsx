import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function MultiMetricChart({ data, title }) {
  const [visibleMetrics, setVisibleMetrics] = useState({
    weight: true,
    bodyFat: true,
    muscleMass: false,
    waist: false
  });

  const metrics = [
    { key: 'weight', label: 'Weight (kg)', color: '#3B82F6', yAxisId: 'left' },
    { key: 'bodyFat', label: 'Body Fat %', color: '#F59E0B', yAxisId: 'left' },
    { key: 'muscleMass', label: 'Muscle Mass (kg)', color: '#10B981', yAxisId: 'left' },
    { key: 'waist', label: 'Waist (cm)', color: '#8B5CF6', yAxisId: 'right' }
  ];

  const toggleMetric = (key) => {
    setVisibleMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredData = data.filter(d => 
    metrics.some(m => visibleMetrics[m.key] && d[m.key] > 0)
  );

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>

      <div className="flex flex-wrap gap-4 mb-4">
        {metrics.map(metric => (
          <label key={metric.key} className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={visibleMetrics[metric.key]}
              onCheckedChange={() => toggleMetric(metric.key)}
            />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: metric.color }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {metric.label}
              </span>
            </div>
          </label>
        ))}
      </div>

      {filteredData.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={filteredData}>
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
            {metrics.map(metric => 
              visibleMetrics[metric.key] && (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name={metric.label}
                  yAxisId={metric.yAxisId}
                />
              )
            )}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-12">
          <p style={{ color: 'var(--text-muted)' }}>
            No data available. Log body measurements to see trends.
          </p>
        </div>
      )}
    </Card>
  );
}