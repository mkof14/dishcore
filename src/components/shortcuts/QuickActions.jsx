import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Coffee, Utensils, Moon, Droplet, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function QuickActions() {
  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['quickTemplates'],
    queryFn: async () => {
      // Get user's most logged meals
      const logs = await base44.entities.MealLog.list('-date', 100);
      
      // Find most common meals
      const counts = {};
      logs.forEach(log => {
        const key = `${log.meal_type}-${log.dish_name}`;
        if (!counts[key]) {
          counts[key] = { ...log, count: 0 };
        }
        counts[key].count++;
      });

      return Object.values(counts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
    }
  });

  const quickLogMutation = useMutation({
    mutationFn: async (template) => {
      return await base44.entities.MealLog.create({
        date: format(new Date(), 'yyyy-MM-dd'),
        meal_type: template.meal_type,
        dish_name: template.dish_name,
        calories: template.calories,
        protein: template.protein,
        carbs: template.carbs,
        fat: template.fat,
        is_quick_log: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mealLogs']);
      toast.success('Meal logged! ⚡');
    }
  });

  const quickActions = [
    {
      icon: Coffee,
      label: "Morning Coffee",
      calories: 50,
      color: "from-amber-400 to-orange-500",
      data: { meal_type: 'breakfast', dish_name: 'Coffee with milk', calories: 50, protein: 2, carbs: 6, fat: 2 }
    },
    {
      icon: Droplet,
      label: "Log Water",
      color: "from-blue-400 to-cyan-500",
      action: async () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const waterLogs = await base44.entities.WaterLog?.filter({ date: today }) || [];
        const current = waterLogs[0]?.cups || 0;
        
        if (base44.entities.WaterLog) {
          if (waterLogs[0]) {
            await base44.entities.WaterLog.update(waterLogs[0].id, { cups: current + 1 });
          } else {
            await base44.entities.WaterLog.create({ date: today, cups: 1 });
          }
        }
        toast.success('Water logged! 💧');
      }
    }
  ];

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-6 h-6" style={{ color: 'var(--accent-from)' }} />
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          Quick Actions
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={() => action.data 
                ? quickLogMutation.mutate(action.data) 
                : action.action?.()
              }
              className="p-4 rounded-2xl hover:scale-105 transition-transform text-left"
              style={{ 
                background: `linear-gradient(135deg, var(--bg-surface-alt), var(--bg-surface))`,
                border: '1px solid var(--border-soft)'
              }}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-2`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {action.label}
              </p>
              {action.calories && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {action.calories} kcal
                </p>
              )}
            </button>
          );
        })}
      </div>

      {templates.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4" style={{ color: 'var(--accent-from)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Your Favorites
            </p>
          </div>

          <div className="space-y-2">
            {templates.slice(0, 3).map((template, idx) => (
              <button
                key={idx}
                onClick={() => quickLogMutation.mutate(template)}
                className="w-full p-3 rounded-xl hover:scale-[1.02] transition-transform text-left flex items-center justify-between"
                style={{ 
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-soft)'
                }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {template.dish_name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {template.meal_type} • {template.calories} kcal
                  </p>
                </div>
                <Zap className="w-4 h-4" style={{ color: 'var(--accent-from)' }} />
              </button>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}