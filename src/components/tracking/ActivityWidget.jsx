import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Plus, Footprints, Flame, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ActivityWidget() {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: wearableData = [] } = useQuery({
    queryKey: ['wearableData'],
    queryFn: () => base44.entities.WearableData.list('-date', 7),
  });

  const todayData = wearableData.find(w => w.date === today);
  const stepsGoal = 10000;
  const currentSteps = todayData?.steps || 0;
  const activeMinutes = todayData?.active_minutes || 0;
  const caloriesBurned = todayData?.calories_burned || Math.round(currentSteps * 0.04);
  const stepsPercentage = Math.min(100, (currentSteps / stepsGoal) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="gradient-card border-0 rounded-3xl overflow-hidden relative group hover:shadow-2xl transition-all duration-300">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 via-amber-400 to-orange-600 flex items-center justify-center shadow-xl"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Activity className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                  Activity
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {currentSteps.toLocaleString()} / {stepsGoal.toLocaleString()}
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

          {/* Circular Progress */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="var(--bg-surface-alt)"
                  strokeWidth="8"
                  fill="none"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#gradient-orange)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 56 * (1 - stepsPercentage / 100)
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient-orange" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#FB923C" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.p 
                  className="text-2xl font-bold gradient-text"
                  key={stepsPercentage}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {stepsPercentage.toFixed(0)}%
                </motion.p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>of goal</p>
              </div>
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
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <Footprints className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Steps</span>
                </div>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {currentSteps.toLocaleString()}
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="p-3 rounded-2xl relative overflow-hidden group/stat"
              style={{ background: 'var(--bg-surface-alt)' }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Burned</span>
                </div>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {caloriesBurned}
                  <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-muted)' }}>kcal</span>
                </p>
              </div>
            </motion.div>
          </div>

          {/* Active Minutes Badge */}
          {activeMinutes > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
            >
              <p className="text-xs font-medium flex items-center justify-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <TrendingUp className="w-3 h-3 text-purple-400" />
                {activeMinutes} active minutes today
              </p>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}