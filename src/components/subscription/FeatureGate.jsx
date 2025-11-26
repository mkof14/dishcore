import React from 'react';
import { useSubscription } from './SubscriptionContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function FeatureGate({ feature, children, fallback }) {
  const { hasFeature, isLite, isCore } = useSubscription();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const getUpgradeInfo = () => {
    const studioFeatures = ['studio_score', 'metabolism_map', 'adaptive_menu_engine', 'advanced_reports', 'pdf_export', 'voice_ai'];
    
    if (studioFeatures.includes(feature)) {
      return {
        tier: 'Studio',
        price: '$29.99/mo',
        description: 'Unlock advanced AI analytics and metabolic intelligence'
      };
    }
    
    return {
      tier: 'Core',
      price: '$14.99/mo',
      description: 'Unlock unlimited menus and AI recommendations'
    };
  };

  const upgradeInfo = getUpgradeInfo();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="gradient-card border-0 p-8 rounded-3xl text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Crown className="w-10 h-10 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {upgradeInfo.tier} Feature
          </h3>
          
          <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
            {upgradeInfo.description}
          </p>
          
          <div className="inline-block px-6 py-3 rounded-2xl mb-6" style={{ background: 'var(--bg-surface-alt)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Starting at</p>
            <p className="text-3xl font-bold gradient-text">{upgradeInfo.price}</p>
          </div>
          
          <Button
            size="lg"
            className="gradient-accent text-white border-0 shadow-xl"
            onClick={() => window.location.href = '/pricing'}
          >
            Upgrade to {upgradeInfo.tier}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export function FeatureBadge({ feature, children }) {
  const { hasFeature } = useSubscription();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  return (
    <div className="relative inline-block">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="px-3 py-1 rounded-full bg-purple-500/90 text-white text-xs font-bold flex items-center gap-1 shadow-xl">
          <Lock className="w-3 h-3" />
          Pro
        </div>
      </div>
    </div>
  );
}