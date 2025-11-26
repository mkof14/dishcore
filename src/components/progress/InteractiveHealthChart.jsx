import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export default function InteractiveHealthChart({ 
  data, 
  title, 
  dataKey, 
  dataKey2, 
  goal,
  unit = '',
  chartType = 'line',
  color = '#3B82F6',
  color2 = '#8B5CF6'
}) {
  const [timeRange, setTimeRange] = useState('7d');

  const filterData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return data?.slice(-days) || [];
  };

  const filteredData = filterData();
  const latestValue = filteredData[filteredData.length - 1]?.[dataKey] || 0;
  const previousValue = filteredData[filteredData.length - 2]?.[dataKey] || 0;
  const change = latestValue - previousValue;
  const changePercent = previousValue ? ((change / previousValue) * 100).toFixed(1) : 0;

  const ChartComponent = chartType === 'area' ? AreaChart : chartType === 'bar' ? BarChart : LineChart;
  const DataComponent = chartType === 'area' ? Area : chartType === 'bar' ? Bar : Line;

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {latestValue.toFixed(1)}{unit}
            </span>
            {change !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(changePercent)}%
              </div>
            )}
          </div>
          {goal && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Goal: {goal}{unit}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
            className={timeRange === '7d' ? 'gradient-accent text-white border-0' : ''}
          >
            7D
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
            className={timeRange === '30d' ? 'gradient-accent text-white border-0' : ''}
          >
            30D
          </Button>
          <Button
            variant={timeRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('90d')}
            className={timeRange === '90d' ? 'gradient-accent text-white border-0' : ''}
          >
            90D
          </Button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <ChartComponent data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="var(--text-muted)"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="var(--text-muted)"
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'var(--surface)', 
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}
          />
          {dataKey2 && <Legend />}
          {chartType === 'area' ? (
            <>
              <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.3} strokeWidth={2} />
              {dataKey2 && <Area type="monotone" dataKey={dataKey2} stroke={color2} fill={color2} fillOpacity={0.3} strokeWidth={2} />}
            </>
          ) : chartType === 'bar' ? (
            <>
              <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
              {dataKey2 && <Bar dataKey={dataKey2} fill={color2} radius={[8, 8, 0, 0]} />}
            </>
          ) : (
            <>
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 4 }} />
              {dataKey2 && <Line type="monotone" dataKey={dataKey2} stroke={color2} strokeWidth={3} dot={{ r: 4 }} />}
            </>
          )}
          {goal && <Line type="monotone" dataKey={() => goal} stroke="#10B981" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Goal" />}
        </ChartComponent>
      </ResponsiveContainer>
    </Card>
  );
}