
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Plus, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SleepWidget() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

  const { data: wearableData = [] } = useQuery({
    queryKey: ['wearableData'],
    queryFn: () => base44.entities.WearableData.list('-date', 7),
  });

  const lastNightData = wearableData.find(w => w.date === yesterday);
  const lastNight = lastNightData?.sleep_hours || 0;
  const sleepQuality = lastNightData?.sleep_quality || 0;
  
  // Calculate weekly average
  const weekData = wearableData.slice(0, 7);
  const avgSleep = weekData.length > 0
    ? weekData.reduce((sum, d) => sum + (d.sleep_hours || 0), 0) / weekData.length
    : 0;

  const getQualityLabel = (quality) => {
    if (quality >= 80) return { label: 'Excellent', color: 'text-emerald-400' };
    if (quality >= 60) return { label: 'Good', color: 'text-green-400' };
    if (quality >= 40) return { label: 'Fair', color: 'text-yellow-400' };
    return { label: 'Poor', color: 'text-red-400' };
  };

  const qualityInfo = getQualityLabel(sleepQuality);
  const sleepGoal = 8;
  const sleepPercentage = Math.min(100, (lastNight / sleepGoal) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="gradient-card border-0 rounded-3xl overflow-hidden relative group hover:shadow-2xl transition-all duration-300">
        {/* Animated Background Stars */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
          <motion.div
            className="absolute top-4 right-8"
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1, 0.8]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          </motion.div>
          <motion.div
            className="absolute top-8 right-16"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [0.6, 1, 0.6]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          >
            <Star className="w-2 h-2 text-yellow-300 fill-yellow-300" />
          </motion.div>
        </div>

        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 via-indigo-400 to-purple-600 flex items-center justify-center shadow-xl"
                animate={{ 
                  rotate: [0, -5, 5, 0],
                  y: [0, -2, 0]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Moon className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                  Sleep
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Last night: {lastNight.toFixed(1)}h
                </p>
              </div>
            </div>

            <Link to={createPageUrl("WearablesSettings")}>
              <Button
                className="gradient-accent text-white border-0 px-3 py-2 h-auto rounded-xl hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span className="text-xs font-semibold">Log</span>
              </Button>
            </Link>
          </div>

          {/* Sleep Visualization */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              {/* Moon Phase Indicator */}
              <motion.div
                className="w-28 h-28 rounded-full relative overflow-hidden flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #818CF8 0%, #C084FC 100%)',
                  boxShadow: '0 8px 24px rgba(129, 140, 248, 0.3)'
                }}
                animate={{
                  boxShadow: [
                    '0 8px 24px rgba(129, 140, 248, 0.3)',
                    '0 8px 32px rgba(129, 140, 248, 0.5)',
                    '0 8px 24px rgba(129, 140, 248, 0.3)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Moon className="w-16 h-16 text-white/95 fill-white/20" strokeWidth={1.5} />
              </motion.div>
              
              {/* Sleep Hours Display */}
              <motion.div
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-4 py-1.5 rounded-full gradient-accent shadow-lg"
                initial={{ scale: 0, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
              >
                <p className="text-sm font-bold text-white whitespace-nowrap">
                  {lastNight.toFixed(1)} hours
                </p>
              </motion.div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div 
              className="p-3 rounded-2xl relative overflow-hidden group/stat"
              style={{ background: 'var(--bg-surface-alt)' }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
              <div className="relative">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Weekly Avg
                </p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {avgSleep.toFixed(1)}h
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="p-3 rounded-2xl relative overflow-hidden group/stat"
              style={{ background: 'var(--bg-surface-alt)' }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
              <div className="relative">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Quality
                </p>
                <p className={`text-base font-bold ${qualityInfo.color}`}>
                  {qualityInfo.label}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Sleep Progress Bar */}
          <div className="mt-3">
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-alt)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #818CF8, #C084FC)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${sleepPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs mt-1.5 text-center" style={{ color: 'var(--text-muted)' }}>
              {((lastNight / sleepGoal) * 100).toFixed(0)}% of recommended 8h
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
