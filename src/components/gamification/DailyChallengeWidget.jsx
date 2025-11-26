import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Sparkles, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function DailyChallengeWidget() {
  const { data: todayChallenges = [] } = useQuery({
    queryKey: ['dailyChallenges'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const challenges = await base44.entities.Challenge.filter({ 
        status: 'active',
        start_date: { $lte: today },
        end_date: { $gte: today }
      });
      return challenges;
    },
  });

  const { data: progressData = [] } = useQuery({
    queryKey: ['challengeProgress'],
    queryFn: () => base44.entities.ChallengeProgress.list(),
  });

  if (todayChallenges.length === 0) return null;

  const topChallenge = todayChallenges[0];
  const progress = progressData.find(p => p.challenge_id === topChallenge.id);
  const progressPercent = progress ? (progress.progress / topChallenge.target) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="gradient-card border-0 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-purple-500 blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  Daily Challenge
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {topChallenge.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                +{topChallenge.points} pts
              </div>
            </div>
          </div>

          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            {topChallenge.description}
          </p>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {progress?.progress || 0} / {topChallenge.target}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <Button
            onClick={() => window.location.href = createPageUrl('Achievements')}
            variant="outline"
            size="sm"
            className="w-full"
            style={{ borderColor: 'var(--border)' }}
          >
            View All Challenges
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}