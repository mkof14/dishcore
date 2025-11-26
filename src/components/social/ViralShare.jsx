import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Share2, Trophy, TrendingUp, Award, Copy, Facebook, Twitter } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ViralShare({ achievement, onClose }) {
  const [open, setOpen] = useState(!!achievement);

  const { data: userProgress } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const progress = await base44.entities.UserProgress.list();
      return progress[0];
    }
  });

  const generateShareText = () => {
    if (achievement?.type === 'streak') {
      return `🔥 ${achievement.days} day streak on DishCore! Crushing my nutrition goals! #DishCore #HealthJourney`;
    }
    if (achievement?.type === 'badge') {
      return `🏆 Just earned the "${achievement.name}" badge on DishCore! #Achievement #DishCore`;
    }
    if (achievement?.type === 'goal') {
      return `🎯 Goal achieved on DishCore! ${achievement.name} ✅ #GoalCrusher #DishCore`;
    }
    return `💪 Making progress on my health journey with DishCore! Join me!`;
  };

  const generateShareImage = async () => {
    // Generate shareable image card
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#00A3E3');
    gradient.addColorStop(1, '#0080FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 60px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(achievement?.name || 'Achievement Unlocked!', canvas.width / 2, 250);

    ctx.font = '40px Inter, sans-serif';
    ctx.fillText('DishCore', canvas.width / 2, 400);

    return canvas.toDataURL('image/png');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(generateShareText())}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(generateShareText())}&url=${encodeURIComponent(window.location.origin)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My DishCore Achievement',
          text: generateShareText(),
          url: window.location.origin
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(`${generateShareText()} ${window.location.origin}`);
      toast.success('Copied to clipboard!');
    }
  };

  if (!achievement) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val && onClose) onClose();
    }}>
      <DialogContent className="gradient-card border-0 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            🎉 Achievement Unlocked!
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-8"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl">
            <Trophy className="w-12 h-12 text-white" />
          </div>

          <h3 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {achievement.name}
          </h3>

          <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
            {achievement.description}
          </p>

          <div className="flex gap-3 justify-center mb-6">
            <Button onClick={shareToFacebook} className="flex-1 max-w-xs" style={{ background: '#1877F2', color: 'white' }}>
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>
            <Button onClick={shareToTwitter} className="flex-1 max-w-xs" style={{ background: '#1DA1F2', color: 'white' }}>
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
          </div>

          <Button onClick={shareNative} variant="outline" className="w-full max-w-xs">
            <Share2 className="w-4 h-4 mr-2" />
            Share via...
          </Button>
        </motion.div>

        <div className="p-4 rounded-2xl text-center" style={{ background: 'rgba(0, 163, 227, 0.1)' }}>
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            💡 Share & Inspire
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Your success story can motivate others to start their journey!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to trigger viral share
export function useViralShare() {
  const [achievement, setAchievement] = useState(null);

  const trigger = (achievementData) => {
    setAchievement(achievementData);
  };

  return {
    ViralShareComponent: achievement ? <ViralShare achievement={achievement} onClose={() => setAchievement(null)} /> : null,
    trigger
  };
}