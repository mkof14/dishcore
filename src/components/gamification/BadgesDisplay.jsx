import React from 'react';
import { Card } from "@/components/ui/card";
import { BADGES } from './progressUtils';
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function BadgesDisplay({ badges = [], compact = false }) {
  const allBadgeKeys = Object.keys(BADGES);
  
  if (compact) {
    // Show only earned badges in compact mode
    return (
      <div className="flex flex-wrap gap-2">
        {badges.slice(0, 5).map((badgeKey, idx) => {
          const badge = BADGES[badgeKey];
          if (!badge) return null;
          
          return (
            <motion.div
              key={badgeKey}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="text-3xl"
              title={`${badge.name} - ${badge.description}`}
            >
              {badge.icon}
            </motion.div>
          );
        })}
        {badges.length > 5 && (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
            +{badges.length - 5}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {allBadgeKeys.map((badgeKey, idx) => {
        const badge = BADGES[badgeKey];
        const earned = badges.includes(badgeKey);
        
        return (
          <motion.div
            key={badgeKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card 
              className={`p-6 rounded-2xl text-center transition-all ${
                earned ? 'gradient-card border-0 hover:scale-105' : 'opacity-50'
              }`}
              style={!earned ? { 
                background: 'var(--surface)', 
                border: '1px solid var(--border)' 
              } : {}}
            >
              <div className="relative mb-4">
                <div className="text-5xl mb-2">
                  {earned ? badge.icon : <Lock className="w-12 h-12 mx-auto" style={{ color: 'var(--text-muted)' }} />}
                </div>
                {earned && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <h4 className="font-bold text-sm mb-1" style={{ color: earned ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {badge.name}
              </h4>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {badge.description}
              </p>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}