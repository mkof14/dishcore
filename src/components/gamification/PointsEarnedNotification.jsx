import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';

export default function PointsEarnedNotification({ points, action, onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onComplete?.(), 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed top-20 right-4 md:right-8 z-50"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
            <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">+{points} Points!</p>
                <p className="text-sm opacity-90">{action}</p>
              </div>
              <Sparkles className="w-5 h-5 ml-2 animate-spin" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}