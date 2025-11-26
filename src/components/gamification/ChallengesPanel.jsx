import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Clock, Trophy, Users, TrendingUp, Flame, CheckCircle2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { updateUserProgress } from "./progressUtils";

const CHALLENGE_TEMPLATES = [
  {
    id: 'weekly_logger',
    name: '7-Day Logging Streak',
    description: 'Log your meals for 7 consecutive days',
    type: 'streak',
    target: 7,
    points: 150,
    icon: Flame,
    color: 'orange',
    difficulty: 'easy'
  },
  {
    id: 'protein_week',
    name: 'Protein Power Week',
    description: 'Hit your protein target for 5 days this week',
    type: 'nutrition',
    target: 5,
    points: 200,
    icon: TrendingUp,
    color: 'blue',
    difficulty: 'medium'
  },
  {
    id: 'healthy_habits',
    name: 'Healthy Habits',
    description: 'Log 10 meals with health score above 70',
    type: 'quality',
    target: 10,
    points: 250,
    icon: Target,
    color: 'green',
    difficulty: 'medium'
  },
  {
    id: 'social_sharer',
    name: 'Social Butterfly',
    description: 'Share 5 recipes or meal plans with the community',
    type: 'social',
    target: 5,
    points: 100,
    icon: Users,
    color: 'purple',
    difficulty: 'easy'
  },
  {
    id: 'early_bird',
    name: 'Early Bird Special',
    description: 'Log breakfast before 9 AM for 5 days',
    type: 'timing',
    target: 5,
    points: 180,
    icon: Clock,
    color: 'yellow',
    difficulty: 'medium'
  },
  {
    id: 'challenge_champion',
    name: 'Challenge Champion',
    description: 'Complete 3 challenges this month',
    type: 'meta',
    target: 3,
    points: 500,
    icon: Trophy,
    color: 'gold',
    difficulty: 'hard'
  }
];

export default function ChallengesPanel() {
  const [selectedTab, setSelectedTab] = useState('active');
  const queryClient = useQueryClient();

  const { data: activeChallenges = [] } = useQuery({
    queryKey: ['activeChallenges'],
    queryFn: () => base44.entities.Challenge.filter({ status: 'active' }),
  });

  const { data: completedChallenges = [] } = useQuery({
    queryKey: ['completedChallenges'],
    queryFn: () => base44.entities.Challenge.filter({ status: 'completed' }),
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['challengeProgress'],
    queryFn: () => base44.entities.ChallengeProgress.list(),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUserProgress'],
    queryFn: () => base44.entities.UserProgress.list(),
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (template) => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // 1 week challenges

      const challenge = await base44.entities.Challenge.create({
        name: template.name,
        description: template.description,
        type: template.type,
        target: template.target,
        points: template.points,
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        difficulty: template.difficulty
      });

      await base44.entities.ChallengeProgress.create({
        challenge_id: challenge.id,
        progress: 0,
        started_at: new Date().toISOString()
      });

      return challenge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activeChallenges']);
      queryClient.invalidateQueries(['challengeProgress']);
      toast.success('Challenge joined! 🎯');
    }
  });

  const completeChallengeMutation = useMutation({
    mutationFn: async (challenge) => {
      await base44.entities.Challenge.update(challenge.id, { status: 'completed' });
      await updateUserProgress(null, {
        type: 'challenge_completed',
        points: challenge.points
      });
    },
    onSuccess: (_, challenge) => {
      queryClient.invalidateQueries(['activeChallenges']);
      queryClient.invalidateQueries(['completedChallenges']);
      queryClient.invalidateQueries(['userProgress']);
      toast.success(`Challenge completed! +${challenge.points} points 🏆`);
    }
  });

  const getChallengeProgress = (challengeId) => {
    return userProgress.find(p => p.challenge_id === challengeId);
  };

  const getParticipantCount = (challengeType) => {
    return activeChallenges.filter(c => c.type === challengeType).length;
  };

  const availableChallenges = CHALLENGE_TEMPLATES.filter(
    template => !activeChallenges.some(active => active.type === template.type)
  );

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Available Challenges */}
      {availableChallenges.length > 0 && (
        <div>
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Plus className="w-4 h-4" />
            Available Challenges
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {availableChallenges.map((template, idx) => {
              const Icon = template.icon;
              const participants = getParticipantCount(template.type);

              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="gradient-card border-0 p-4 rounded-2xl hover:scale-105 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-${template.color}-500/20 flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 text-${template.color}-400`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {template.name}
                          </h4>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {template.points} points
                          </p>
                        </div>
                      </div>
                      <Badge className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                      </Badge>
                    </div>
                    
                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                      {template.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Users className="w-3 h-3" />
                        {participants} participating
                      </div>
                      <Button
                        size="sm"
                        onClick={() => joinChallengeMutation.mutate(template)}
                        disabled={joinChallengeMutation.isPending}
                        className="gradient-accent text-white border-0"
                      >
                        Join Challenge
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div>
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Target className="w-4 h-4" />
            Your Active Challenges ({activeChallenges.length})
          </h4>
          <div className="space-y-3">
            {activeChallenges.map((challenge) => {
              const progress = getChallengeProgress(challenge.id);
              const progressPercent = progress ? (progress.progress / challenge.target) * 100 : 0;
              const isComplete = progressPercent >= 100;

              return (
                <Card key={challenge.id} className="gradient-card border-0 p-4 rounded-2xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {challenge.name}
                        </h4>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                        {challenge.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          {challenge.points} points
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Ends {new Date(challenge.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {isComplete && (
                      <Button
                        size="sm"
                        onClick={() => completeChallengeMutation.mutate(challenge)}
                        disabled={completeChallengeMutation.isPending}
                        className="gradient-accent text-white border-0"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Claim
                      </Button>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Progress: {progress?.progress || 0} / {challenge.target}
                      </span>
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                        {Math.round(progressPercent)}%
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div>
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Completed Challenges ({completedChallenges.length})
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            {completedChallenges.slice(0, 6).map((challenge) => (
              <Card key={challenge.id} className="gradient-card border-0 p-3 rounded-xl opacity-75">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {challenge.name}
                    </h5>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      +{challenge.points} points earned
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeChallenges.length === 0 && availableChallenges.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            No challenges available
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Check back soon for new challenges!
          </p>
        </div>
      )}
    </div>
  );
}