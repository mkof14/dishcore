import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function BodyComparison({ current, target }) {
  const [showTarget, setShowTarget] = useState(false);

  const renderSilhouette = (measurements, isTarget = false) => {
    const waistWidth = measurements.waist ? Math.max(40, Math.min(70, measurements.waist * 0.6)) : 50;
    const hipsWidth = measurements.hips ? Math.max(50, Math.min(80, measurements.hips * 0.7)) : 60;
    const chestWidth = measurements.chest ? Math.max(45, Math.min(75, measurements.chest * 0.65)) : 55;

    return (
      <svg width="120" height="280" viewBox="0 0 120 280" className="mx-auto">
        <defs>
          <linearGradient id={`silhouetteGradient${isTarget ? 'Target' : 'Current'}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isTarget ? "#10B981" : "#3B82F6"} stopOpacity="0.6" />
            <stop offset="100%" stopColor={isTarget ? "#059669" : "#2563EB"} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Head */}
        <ellipse 
          cx="60" 
          cy="30" 
          rx="18" 
          ry="22" 
          fill={`url(#silhouetteGradient${isTarget ? 'Target' : 'Current'})`}
          stroke={isTarget ? "#10B981" : "#3B82F6"}
          strokeWidth="2"
        />

        {/* Neck */}
        <rect 
          x="52" 
          y="48" 
          width="16" 
          height="12" 
          fill={`url(#silhouetteGradient${isTarget ? 'Target' : 'Current'})`}
          stroke={isTarget ? "#10B981" : "#3B82F6"}
          strokeWidth="2"
        />

        {/* Chest/Torso */}
        <motion.rect
          x={60 - chestWidth/2}
          y="60"
          width={chestWidth}
          height="60"
          rx="12"
          fill={`url(#silhouetteGradient${isTarget ? 'Target' : 'Current'})`}
          stroke={isTarget ? "#10B981" : "#3B82F6"}
          strokeWidth="2"
          animate={{ width: chestWidth }}
          transition={{ duration: 0.8 }}
        />

        {/* Waist */}
        <motion.rect
          x={60 - waistWidth/2}
          y="120"
          width={waistWidth}
          height="40"
          rx="10"
          fill={`url(#silhouetteGradient${isTarget ? 'Target' : 'Current'})`}
          stroke={isTarget ? "#10B981" : "#3B82F6"}
          strokeWidth="2"
          animate={{ width: waistWidth }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        {/* Hips */}
        <motion.ellipse
          cx="60"
          cy="180"
          rx={hipsWidth/2}
          ry="25"
          fill={`url(#silhouetteGradient${isTarget ? 'Target' : 'Current'})`}
          stroke={isTarget ? "#10B981" : "#3B82F6"}
          strokeWidth="2"
          animate={{ rx: hipsWidth/2 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />

        {/* Legs */}
        <rect 
          x="45" 
          y="200" 
          width="14" 
          height="70" 
          rx="8" 
          fill={`url(#silhouetteGradient${isTarget ? 'Target' : 'Current'})`}
          stroke={isTarget ? "#10B981" : "#3B82F6"}
          strokeWidth="2"
        />
        <rect 
          x="61" 
          y="200" 
          width="14" 
          height="70" 
          rx="8" 
          fill={`url(#silhouetteGradient${isTarget ? 'Target' : 'Current'})`}
          stroke={isTarget ? "#10B981" : "#3B82F6"}
          strokeWidth="2"
        />
      </svg>
    );
  };

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Body Shape: Now vs Goal
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTarget(!showTarget)}
        >
          {showTarget ? 'Show Current' : 'Show Goal'}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Current */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: showTarget ? 0.4 : 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4">
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              Current
            </p>
            <div className="inline-block px-4 py-2 rounded-full bg-blue-500/20">
              <p className="text-lg font-bold text-blue-500">
                {current.weight?.toFixed(1)} kg
              </p>
            </div>
          </div>
          
          {renderSilhouette(current, false)}

          <div className="mt-4 space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Waist: {current.waist?.toFixed(0) || '--'} cm</p>
            <p>Hips: {current.hips?.toFixed(0) || '--'} cm</p>
            {current.chest && <p>Chest: {current.chest.toFixed(0)} cm</p>}
          </div>
        </motion.div>

        {/* Arrow/Morph indicator */}
        <div className="hidden md:flex items-center justify-center">
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight className="w-8 h-8 text-green-500" />
          </motion.div>
        </div>

        {/* Target */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: showTarget ? 1 : 0.4, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4">
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              Goal
            </p>
            <div className="inline-block px-4 py-2 rounded-full bg-green-500/20">
              <p className="text-lg font-bold text-green-500">
                {target.weight?.toFixed(1)} kg
              </p>
            </div>
          </div>
          
          {renderSilhouette(target, true)}

          <div className="mt-4 space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Waist: {target.waist?.toFixed(0) || '--'} cm</p>
            <p>Hips: {target.hips?.toFixed(0) || '--'} cm</p>
            {target.chest && <p>Chest: {target.chest.toFixed(0)} cm</p>}
          </div>
        </motion.div>
      </div>

      {/* Difference Summary */}
      <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Weight Diff</p>
            <p className="text-lg font-bold text-green-500">
              {Math.abs((target.weight || 0) - (current.weight || 0)).toFixed(1)} kg
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Waist Diff</p>
            <p className="text-lg font-bold text-orange-500">
              {Math.abs((target.waist || 0) - (current.waist || 0)).toFixed(0)} cm
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Hips Diff</p>
            <p className="text-lg font-bold text-purple-500">
              {Math.abs((target.hips || 0) - (current.hips || 0)).toFixed(0)} cm
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}