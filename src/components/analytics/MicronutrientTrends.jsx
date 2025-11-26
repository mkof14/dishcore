import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const RDI = {
  vitamin_a: 900,
  vitamin_c: 90,
  vitamin_d: 600,
  vitamin_e: 15,
  vitamin_k: 120,
  vitamin_b6: 1.7,
  vitamin_b12: 2.4,
  folate: 400,
  calcium: 1000,
  iron: 18,
  magnesium: 400,
  potassium: 3500,
  zinc: 11,
  omega3: 1000
};

const MICRONUTRIENTS = [
  { id: 'vitamin_c', label: 'Vitamin C', color: '#F59E0B' },
  { id: 'vitamin_d', label: 'Vitamin D', color: '#EF4444' },
  { id: 'vitamin_b12', label: 'Vitamin B12', color: '#3B82F6' },
  { id: 'iron', label: 'Iron', color: '#DC2626' },
  { id: 'calcium', label: 'Calcium', color: '#06B6D4' },
  { id: 'magnesium', label: 'Magnesium', color: '#10B981' },
  { id: 'potassium', label: 'Potassium', color: '#8B5CF6' },
  { id: 'omega3', label: 'Omega-3', color: '#14B8A6' },
  { id: 'zinc', label: 'Zinc', color: '#F97316' }
];

export default function MicronutrientTrends({ periodData, logs }) {
  const [selectedNutrient, setSelectedNutrient] = useState('vitamin_c');

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const { data: dishes = [] } = useQuery({
    queryKey: ['dishes'],
    queryFn: () => base44.entities.Dish.list(),
  });

  // Calculate micronutrient data per day
  const micronutrientData = periodData.map(day => {
    const dayLogs = logs.filter(log => log.date === day.fullDate);
    const micronutrients = {};
    
    dayLogs.forEach(log => {
      const dish = dishes.find(d => d.name === log.dish_name);
      if (dish?.micronutrients) {
        Object.entries(dish.micronutrients).forEach(([nutrient, value]) => {
          micronutrients[nutrient] = (micronutrients[nutrient] || 0) + (value || 0) * (log.portion_size || 1);
        });
      }
    });
    
    return {
      date: day.date,
      fullDate: day.fullDate,
      ...micronutrients
    };
  });

  const selectedConfig = MICRONUTRIENTS.find(n => n.id === selectedNutrient);
  const rdi = profile?.micronutrient_goals?.[selectedNutrient] || RDI[selectedNutrient];
  
  // Calculate average intake
  const avgIntake = micronutrientData.reduce((sum, day) => sum + (day[selectedNutrient] || 0), 0) / periodData.length;
  const percentOfRDI = (avgIntake / rdi) * 100;

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Micronutrient Trends
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Track essential vitamins and minerals
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {percentOfRDI < 70 && (
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              <AlertCircle className="w-3 h-3 mr-1" />
              Below target
            </Badge>
          )}
          <Select value={selectedNutrient} onValueChange={setSelectedNutrient}>
            <SelectTrigger className="w-48" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MICRONUTRIENTS.map(nutrient => (
                <SelectItem key={nutrient.id} value={nutrient.id}>
                  {nutrient.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--background)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Average Daily</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {Math.round(avgIntake)}
          </p>
        </div>
        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--background)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>RDI Target</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {Math.round(rdi)}
          </p>
        </div>
        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--background)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>% of RDI</p>
          <p className={`text-2xl font-bold ${
            percentOfRDI >= 100 ? 'text-green-500' :
            percentOfRDI >= 70 ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {Math.round(percentOfRDI)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={micronutrientData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" stroke="var(--text-muted)" />
          <YAxis stroke="var(--text-muted)" />
          <Tooltip 
            contentStyle={{ 
              background: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: '12px', 
              color: 'var(--text-primary)' 
            }} 
          />
          <Legend />
          <ReferenceLine 
            y={rdi} 
            stroke="#10B981" 
            strokeDasharray="5 5" 
            label={{ value: 'RDI Target', fill: '#10B981', fontSize: 12 }}
          />
          <Line 
            type="monotone" 
            dataKey={selectedNutrient} 
            stroke={selectedConfig?.color || '#3B82F6'} 
            strokeWidth={3} 
            name={selectedConfig?.label}
            dot={{ fill: selectedConfig?.color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {percentOfRDI < 70 && (
        <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            💡 <strong>Recommendation:</strong> Your {selectedConfig?.label.toLowerCase()} intake is below optimal levels. 
            Consider adding supplements or foods rich in this nutrient.
          </p>
        </div>
      )}
    </Card>
  );
}