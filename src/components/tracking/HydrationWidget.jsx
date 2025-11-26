import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function HydrationWidget() {
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const dailyGoal = 2500;

  const { data: todayLogs = [] } = useQuery({
    queryKey: ['hydration', today],
    queryFn: async () => {
      const logs = await base44.entities.MealLog.list('-created_date', 50);
      return logs.filter(log => 
        log.meal_type === 'water' && 
        log.date === today
      );
    },
  });

  const addWaterMutation = useMutation({
    mutationFn: async (amount) => {
      return await base44.entities.MealLog.create({
        date: today,
        meal_type: 'water',
        dish_name: `Water ${amount}ml`,
        calories: 0,
        notes: `Hydration log: ${amount}ml`,
        portion_size: amount
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['hydration']);
      toast.success('💧 Water logged!');
      setIsAdding(false);
    }
  });

  const totalWater = todayLogs.reduce((sum, log) => sum + (log.portion_size || 250), 0);
  const percentage = Math.min(100, (totalWater / dailyGoal) * 100);

  const quickAddButtons = [
    { label: 'Glass (250ml)', amount: 250, emoji: '🥛' },
    { label: 'Bottle (500ml)', amount: 500, emoji: '🍼' },
    { label: 'Large (750ml)', amount: 750, emoji: '🚰' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="gradient-card border-0 rounded-3xl overflow-hidden relative group hover:shadow-2xl transition-all duration-300">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-600 flex items-center justify-center shadow-xl flex-shrink-0"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Droplets className="w-6 h-6 text-white" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base truncate" style={{ color: 'var(--text-primary)' }}>
                  Hydration
                </h3>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                  {totalWater} / {dailyGoal} ml
                </p>
              </div>
            </div>
            
            <motion.div 
              className="flex-shrink-0"
              key={percentage}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <p className="text-3xl font-bold gradient-text whitespace-nowrap">
                {percentage.toFixed(0)}%
              </p>
            </motion.div>
          </div>

          {/* Animated Progress Bar */}
          <div className="mb-4 relative">
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-alt)' }}>
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  background: 'linear-gradient(90deg, #3B82F6, #06B6D4, #3B82F6)',
                  backgroundSize: '200% 100%',
                }}
                initial={{ width: 0 }}
                animate={{ 
                  width: `${percentage}%`,
                  backgroundPosition: ['0% 0%', '100% 0%']
                }}
                transition={{ 
                  width: { duration: 1, ease: "easeOut" },
                  backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </motion.div>
            </div>
          </div>

          {/* Quick Add Buttons - Vertical Layout */}
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {quickAddButtons.map((btn, idx) => (
                <motion.div
                  key={btn.amount}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Button
                    onClick={() => addWaterMutation.mutate(btn.amount)}
                    disabled={addWaterMutation.isPending}
                    className="w-full h-11 rounded-2xl font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    style={{ 
                      background: 'var(--bg-surface-alt)', 
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-soft)'
                    }}
                  >
                    <span className="text-lg mr-2">{btn.emoji}</span>
                    <span className="truncate">{btn.label}</span>
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Achievement Badge */}
          <AnimatePresence>
            {percentage >= 100 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="mt-3 p-2 rounded-xl text-center bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
              >
                <p className="text-xs font-semibold text-green-400 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Daily goal achieved!
                  <Sparkles className="w-3 h-3" />
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}