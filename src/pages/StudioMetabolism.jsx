import React, { useState } from "react";
import { ArrowLeft, Info, Activity, Droplet, Zap, Leaf, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

const BODY_ZONES = [
  { 
    id: 'waist', 
    name: 'Waistline Zone', 
    y: 180, 
    status: 'good', 
    value: 75,
    icon: Droplet,
    info: 'Sodium levels optimal. Water retention normal.',
    factors: ['Hydration: Good', 'Sodium: Normal', 'Inflammation: Low']
  },
  { 
    id: 'abdomen', 
    name: 'Abdomen', 
    y: 150, 
    status: 'attention', 
    value: 60,
    icon: Zap,
    info: 'Sugar intake slightly elevated from yesterday.',
    factors: ['Blood Sugar: Elevated', 'Insulin: Moderate', 'Fat Storage: Active']
  },
  { 
    id: 'muscle', 
    name: 'Muscle Zones', 
    y: 100, 
    status: 'excellent', 
    value: 90,
    icon: Activity,
    info: 'Protein intake optimal for muscle maintenance.',
    factors: ['Protein Synthesis: High', 'Recovery: Good', 'Strength: Optimal']
  },
  { 
    id: 'energy', 
    name: 'Energy Center', 
    y: 130, 
    status: 'good', 
    value: 80,
    icon: Sparkles,
    info: 'Carb timing on track. Energy levels stable.',
    factors: ['Glycogen: Adequate', 'ATP Production: Good', 'Stamina: High']
  },
  { 
    id: 'skin', 
    name: 'Skin & Hair', 
    y: 60, 
    status: 'good', 
    value: 78,
    icon: Leaf,
    info: 'Micronutrients balanced. Antioxidant levels good.',
    factors: ['Vitamins: Balanced', 'Minerals: Good', 'Oxidative Stress: Low']
  }
];

export default function StudioMetabolism() {
  const [selectedZone, setSelectedZone] = useState(BODY_ZONES[0]);

  const getZoneColor = (status) => {
    if (status === 'excellent') return '#22c55e';
    if (status === 'good') return '#00E38C';
    if (status === 'attention') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button 
            onClick={() => window.location.href = createPageUrl('StudioHub')}
            className="w-12 h-12 rounded-2xl btn-secondary flex items-center justify-center hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-4xl font-bold">
              <span style={{ 
                background: 'linear-gradient(135deg, #4CAF50, #FFA500)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Metabolism Map
              </span>
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Interactive body zone analysis</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Body Map */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="gradient-card border-0 rounded-3xl p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500 rounded-full blur-3xl animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold mb-8 text-center relative z-10">Body Zones</h3>
            <div className="relative flex items-center justify-center z-10">
              <svg viewBox="0 0 200 300" className="w-full max-w-xs">
                <ellipse cx="100" cy="70" rx="35" ry="45" fill="none" stroke="#00E38C" strokeWidth="2" opacity="0.5" />
                <ellipse cx="100" cy="140" rx="45" ry="55" fill="none" stroke="#00E38C" strokeWidth="2" opacity="0.5" />
                <ellipse cx="100" cy="220" rx="38" ry="50" fill="none" stroke="#00E38C" strokeWidth="2" opacity="0.5" />
                
                {BODY_ZONES.map((zone) => (
                  <g key={zone.id}>
                    <ellipse 
                      cx="100" 
                      cy={zone.y} 
                      rx={zone.id === 'muscle' ? 35 : zone.id === 'abdomen' ? 45 : 38} 
                      ry={zone.id === 'muscle' ? 45 : zone.id === 'abdomen' ? 55 : 50}
                      fill={getZoneColor(zone.status)}
                      opacity={selectedZone?.id === zone.id ? "0.5" : "0.2"}
                      className="cursor-pointer hover:opacity-60 transition-opacity"
                      onClick={() => setSelectedZone(zone)}
                    />
                    <circle 
                      cx="100" 
                      cy={zone.y}
                      r="6"
                      fill={getZoneColor(zone.status)}
                      className={selectedZone?.id === zone.id ? "animate-pulse" : ""}
                    />
                  </g>
                ))}
              </svg>
            </div>
          </motion.div>

          {/* Zone Details */}
          {selectedZone && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="gradient-card border-0 rounded-3xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: `${getZoneColor(selectedZone.status)}20` }}
                  >
                    {React.createElement(selectedZone.icon, { 
                      className: "w-8 h-8",
                      style: { color: getZoneColor(selectedZone.status) }
                    })}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{selectedZone.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ background: getZoneColor(selectedZone.status) }}
                      />
                      <span className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>{selectedZone.status}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: getZoneColor(selectedZone.status) }}>
                      {selectedZone.value}%
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Health Score</div>
                  </div>
                </div>
                
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{selectedZone.info}</p>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Contributing Factors
                  </h4>
                  {selectedZone.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: getZoneColor(selectedZone.status) }} />
                      <span className="text-sm">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              <div className="gradient-card border-0 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-blue-300">AI Analysis</h4>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Based on your recent intake, this zone is performing well. Keep your current nutrition pattern to maintain these levels.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* All Zones */}
        <motion.div 
          className="mt-6 grid md:grid-cols-5 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {BODY_ZONES.map((zone, idx) => {
            const Icon = zone.icon;
            return (
              <motion.button
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`gradient-card border-0 rounded-2xl p-4 hover:scale-105 transition-all ${
                  selectedZone?.id === zone.id ? 'ring-2' : ''
                }`}
                style={selectedZone?.id === zone.id ? { ringColor: 'var(--accent-from)' } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `${getZoneColor(zone.status)}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: getZoneColor(zone.status) }} />
                  </div>
                </div>
                <p className="text-sm font-semibold text-left">{zone.name}</p>
                <p className="text-xs text-left mt-1" style={{ color: 'var(--text-muted)' }}>{zone.value}%</p>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}