import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function NutritionOverlay({ data }) {
  const [selectedMetric, setSelectedMetric] = useState('weight');

  const metrics = {
    weight: { label: 'Weight (kg)', color: '#3B82F6' },
    bodyFat: { label: 'Body Fat %', color: '#F59E0B' },
    dishCoreScore: { label: 'DishCore Score', color: '#00E38C' }
  };

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        📊 Nutrition vs Progress
      </h3>

      <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
        <TabsList className="mb-4">
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="bodyFat">Body Fat</TabsTrigger>
          <TabsTrigger value="dishCoreScore">Score</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedMetric}>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data}>
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
              
              <Bar
                yAxisId="right"
                dataKey="calories"
                fill="#FB923C"
                fillOpacity={0.3}
                name="Calories"
              />
              <Bar
                yAxisId="right"
                dataKey="protein"
                fill="#3B82F6"
                fillOpacity={0.3}
                name="Protein (g)"
              />
              
              <Line
                yAxisId="left"
                type="monotone"
                dataKey={selectedMetric}
                stroke={metrics[selectedMetric].color}
                strokeWidth={3}
                dot={{ r: 5 }}
                name={metrics[selectedMetric].label}
              />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <strong>💡 Insight:</strong> This chart shows how your nutritional intake correlates with {metrics[selectedMetric].label.toLowerCase()}. 
              Look for patterns between high protein/calorie days and your progress metrics.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}