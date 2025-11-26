import React from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Star, Award } from "lucide-react";

export default function ProgressWidget({ progress }) {
  if (!progress) return null;

  const pointsForNextLevel = progress.level * 1000;
  const levelProgress = (progress.total_points % 1000) / 1000 * 100;

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Level {progress.level}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {progress.total_points} points
          </p>
        </div>
        <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center">
          <Trophy className="w-8 h-8 text-white" />
        </div>
      </div>

      <Progress value={levelProgress} className="h-3 mb-4" />
      <p className="text-xs text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
        {Math.round((1000 - (progress.total_points % 1000)))} points to Level {progress.level + 1}
      </p>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-2xl" style={{ background: 'var(--background)' }}>
          <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {progress.current_streak}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Day Streak</p>
        </div>
        
        <div className="text-center p-3 rounded-2xl" style={{ background: 'var(--background)' }}>
          <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {progress.meals_logged}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Meals</p>
        </div>

        <div className="text-center p-3 rounded-2xl" style={{ background: 'var(--background)' }}>
          <Award className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {progress.badges?.length || 0}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Badges</p>
        </div>
      </div>
    </Card>
  );
}