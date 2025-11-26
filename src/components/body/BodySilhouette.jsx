import React from 'react';
import { motion } from 'framer-motion';

export default function BodySilhouette({ hoveredZone, measurements }) {
  const zones = {
    chest: { y: 120, label: 'Chest', value: measurements?.chest, color: '#3B82F6' },
    waist: { y: 180, label: 'Waist', value: measurements?.waist, color: '#F59E0B' },
    hips: { y: 240, label: 'Hips', value: measurements?.hips, color: '#A855F7' },
    weight: { y: 60, label: 'Weight', value: measurements?.weight, color: '#10B981' }
  };

  return (
    <div className="relative flex items-center justify-center py-8">
      <svg width="200" height="420" viewBox="0 0 200 420" className="mx-auto">
        <defs>
          <linearGradient id="bodyGradientMain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
            <stop offset="30%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.4" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <radialGradient id="chestGradient">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
          </radialGradient>

          <radialGradient id="waistGradient">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.2" />
          </radialGradient>

          <radialGradient id="hipsGradient">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Head with glow */}
          <motion.ellipse 
            cx="100" 
            cy="40" 
            rx="25" 
            ry="30" 
            fill="url(#bodyGradientMain)"
            stroke="#10B981"
            strokeWidth="2"
            animate={{
              filter: hoveredZone === 'weight' ? 'url(#strongGlow)' : 'url(#glow)',
              strokeWidth: hoveredZone === 'weight' ? 3 : 2
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Neck */}
          <rect 
            x="90" 
            y="65" 
            width="20" 
            height="15" 
            fill="url(#bodyGradientMain)"
            stroke="#00E38C"
            strokeWidth="2"
            filter="url(#glow)"
          />

          {/* Shoulders/Arms */}
          <motion.path
            d="M 70 80 L 45 120 L 45 180 L 60 165 L 70 140 Z"
            fill="url(#chestGradient)"
            stroke="#3B82F6"
            strokeWidth="2"
            animate={{
              filter: hoveredZone === 'chest' ? 'url(#strongGlow)' : 'url(#glow)',
              strokeWidth: hoveredZone === 'chest' ? 3 : 2,
              fillOpacity: hoveredZone === 'chest' ? 1 : 0.6
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.path
            d="M 130 80 L 155 120 L 155 180 L 140 165 L 130 140 Z"
            fill="url(#chestGradient)"
            stroke="#3B82F6"
            strokeWidth="2"
            animate={{
              filter: hoveredZone === 'chest' ? 'url(#strongGlow)' : 'url(#glow)',
              strokeWidth: hoveredZone === 'chest' ? 3 : 2,
              fillOpacity: hoveredZone === 'chest' ? 1 : 0.6
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Chest/Torso */}
          <motion.rect
            x="70"
            y="80"
            width="60"
            height="80"
            rx="15"
            fill="url(#chestGradient)"
            stroke="#3B82F6"
            strokeWidth="2"
            animate={{
              filter: hoveredZone === 'chest' ? 'url(#strongGlow)' : 'url(#glow)',
              strokeWidth: hoveredZone === 'chest' ? 3 : 2,
              fillOpacity: hoveredZone === 'chest' ? 1 : 0.6
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Waist */}
          <motion.rect
            x="75"
            y="160"
            width="50"
            height="50"
            rx="12"
            fill="url(#waistGradient)"
            stroke="#F59E0B"
            strokeWidth="2"
            animate={{
              filter: hoveredZone === 'waist' ? 'url(#strongGlow)' : 'url(#glow)',
              strokeWidth: hoveredZone === 'waist' ? 3 : 2,
              fillOpacity: hoveredZone === 'waist' ? 1 : 0.6
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Hips */}
          <motion.ellipse
            cx="100"
            cy="230"
            rx="38"
            ry="32"
            fill="url(#hipsGradient)"
            stroke="#A855F7"
            strokeWidth="2"
            animate={{
              filter: hoveredZone === 'hips' ? 'url(#strongGlow)' : 'url(#glow)',
              strokeWidth: hoveredZone === 'hips' ? 3 : 2,
              fillOpacity: hoveredZone === 'hips' ? 1 : 0.6
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Legs */}
          <motion.rect 
            x="75" 
            y="250" 
            width="20" 
            height="140" 
            rx="12" 
            fill="url(#bodyGradientMain)"
            stroke="#A855F7"
            strokeWidth="2"
            filter="url(#glow)"
            animate={{ opacity: [0.7, 0.9, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.rect 
            x="105" 
            y="250" 
            width="20" 
            height="140" 
            rx="12" 
            fill="url(#bodyGradientMain)"
            stroke="#A855F7"
            strokeWidth="2"
            filter="url(#glow)"
            animate={{ opacity: [0.7, 0.9, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
          />

          {/* Measurement Lines */}
          {Object.entries(zones).map(([zone, data]) => (
            hoveredZone === zone && data.value && (
              <motion.g
                key={zone}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <motion.line
                  x1="20"
                  y1={data.y}
                  x2="180"
                  y2={data.y}
                  stroke={data.color}
                  strokeWidth="3"
                  strokeDasharray="6 3"
                  animate={{ strokeDashoffset: [0, -20] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <circle cx="20" cy={data.y} r="5" fill={data.color}>
                  <animate attributeName="r" values="5;7;5" dur="1s" repeatCount="indefinite" />
                </circle>
                <circle cx="180" cy={data.y} r="5" fill={data.color}>
                  <animate attributeName="r" values="5;7;5" dur="1s" repeatCount="indefinite" />
                </circle>
                
                <motion.text
                  x="100"
                  y={data.y - 15}
                  textAnchor="middle"
                  fill={data.color}
                  fontSize="16"
                  fontWeight="bold"
                  initial={{ scale: 0, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  filter="url(#glow)"
                >
                  {data.value} {zone === 'weight' ? 'kg' : 'cm'}
                </motion.text>
              </motion.g>
            )
          ))}
        </motion.g>

        {/* Animated pulse rings */}
        {hoveredZone && (
          <>
            <motion.circle
              cx="100"
              cy={zones[hoveredZone]?.y || 100}
              r="50"
              fill="none"
              stroke={zones[hoveredZone]?.color}
              strokeWidth="2"
              initial={{ opacity: 0.6, scale: 0.9 }}
              animate={{ opacity: 0, scale: 1.6 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.circle
              cx="100"
              cy={zones[hoveredZone]?.y || 100}
              r="50"
              fill="none"
              stroke={zones[hoveredZone]?.color}
              strokeWidth="2"
              initial={{ opacity: 0.6, scale: 0.9 }}
              animate={{ opacity: 0, scale: 1.6 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
          </>
        )}

        {/* Particle effects */}
        {measurements?.weight && !hoveredZone && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.circle
                key={i}
                cx={60 + Math.random() * 80}
                cy={100 + Math.random() * 200}
                r="2"
                fill={['#10B981', '#3B82F6', '#F59E0B', '#A855F7'][Math.floor(Math.random() * 4)]}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  y: [0, -20, -40]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
              />
            ))}
          </>
        )}
      </svg>

      {/* Legend */}
      {measurements?.weight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-0 left-0 right-0 text-center p-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-lg"
            style={{ background: 'rgba(0, 227, 140, 0.15)', border: '1px solid var(--border)' }}>
            <motion.div 
              className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Hover zones to see measurements
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}