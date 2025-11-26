import React, { useEffect, useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, X } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function StreakNotification() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { data: progress } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const progressList = await base44.entities.UserProgress.list();
      return progressList[0] || null;
    },
  });

  useEffect(() => {
    if (progress && progress.current_streak > 0 && !dismissed) {
      const lastShown = localStorage.getItem('last-streak-notification');
      const today = new Date().toDateString();
      
      if (lastShown !== today) {
        setShow(true);
        localStorage.setItem('last-streak-notification', today);
      }
    }
  }, [progress, dismissed]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
  };

  if (!progress || progress.current_streak === 0) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <Card className="gradient-card border-0 p-6 rounded-3xl shadow-2xl">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 flex-shrink-0">
                <Flame className="w-8 h-8 text-white animate-pulse" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {progress.current_streak} Day Streak! 🔥
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  You're on fire! Keep logging to maintain your streak.
                </p>
                {progress.current_streak === progress.longest_streak && progress.current_streak > 1 && (
                  <p className="text-xs mt-2 font-semibold" style={{ color: 'var(--accent-from)' }}>
                    🎉 New personal record!
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}