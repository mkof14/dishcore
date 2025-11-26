import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingDown, CheckCircle2 } from "lucide-react";
import { format, startOfDay } from "date-fns";

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

export default function DailyDeficiencyTracker() {
  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const { data: todayLogs = [] } = useQuery({
    queryKey: ['mealLogs', today],
    queryFn: () => base44.entities.MealLog.filter({ date: today }),
  });

  const { data: dishes = [] } = useQuery({
    queryKey: ['dishes'],
    queryFn: () => base44.entities.Dish.list(),
  });

  // Calculate today's micronutrient intake
  const todayMicronutrients = {};
  
  todayLogs.forEach(log => {
    const dish = dishes.find(d => d.name === log.dish_name);
    if (dish?.micronutrients) {
      Object.entries(dish.micronutrients).forEach(([nutrient, value]) => {
        todayMicronutrients[nutrient] = (todayMicronutrients[nutrient] || 0) + (value || 0);
      });
    }
  });

  // Identify deficiencies
  const deficiencies = [];
  const adequate = [];
  
  Object.entries(RDI).forEach(([nutrient, rdi]) => {
    const userGoal = profile?.micronutrient_goals?.[nutrient] || rdi;
    const intake = todayMicronutrients[nutrient] || 0;
    const percentage = (intake / userGoal) * 100;
    
    const item = {
      nutrient: nutrient.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      intake: Math.round(intake),
      goal: Math.round(userGoal),
      percentage: Math.round(percentage)
    };
    
    if (percentage < 50) {
      deficiencies.push({ ...item, severity: percentage < 25 ? 'high' : 'medium' });
    } else if (percentage >= 75) {
      adequate.push(item);
    }
  });

  if (todayLogs.length === 0) {
    return (
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <p className="text-center" style={{ color: 'var(--text-muted)' }}>
          Log meals to see your daily micronutrient status
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="gradient-card border-0 p-4 rounded-2xl text-center">
          <TrendingDown className="w-6 h-6 mx-auto mb-2 text-red-500" />
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {deficiencies.filter(d => d.severity === 'high').length}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Critical Low</p>
        </Card>
        <Card className="gradient-card border-0 p-4 rounded-2xl text-center">
          <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {deficiencies.filter(d => d.severity === 'medium').length}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Below Target</p>
        </Card>
        <Card className="gradient-card border-0 p-4 rounded-2xl text-center">
          <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {adequate.length}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>On Track</p>
        </Card>
      </div>

      {/* Deficiencies */}
      {deficiencies.length > 0 && (
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Nutrients Needing Attention
          </h3>
          <div className="space-y-3">
            {deficiencies.map((def, idx) => (
              <div key={idx} className="p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {def.nutrient}
                  </span>
                  <Badge className={def.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}>
                    {def.percentage}%
                  </Badge>
                </div>
                <Progress value={def.percentage} className="h-2 mb-1" />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {def.intake} / {def.goal} consumed today
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Adequate Nutrients */}
      {adequate.length > 0 && (
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Meeting Daily Needs
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {adequate.slice(0, 6).map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl flex items-center gap-2" 
                style={{ background: 'var(--background)' }}>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {item.nutrient}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {item.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}