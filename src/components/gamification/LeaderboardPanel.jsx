import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Flame, Users, Crown, Medal, Award } from "lucide-react";
import { motion } from "framer-motion";

const LEADERBOARD_TYPES = {
  points: { label: 'Total Points', icon: Trophy, key: 'total_points' },
  level: { label: 'Highest Level', icon: Award, key: 'level' },
  streak: { label: 'Current Streak', icon: Flame, key: 'current_streak' },
  meals: { label: 'Meals Logged', icon: TrendingUp, key: 'meals_logged' }
};

export default function LeaderboardPanel() {
  const [selectedType, setSelectedType] = useState('points');
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  const { data: allProgress = [] } = useQuery({
    queryKey: ['allUserProgress'],
    queryFn: () => base44.entities.UserProgress.list(),
  });

  const { data: following = [] } = useQuery({
    queryKey: ['following'],
    queryFn: () => base44.entities.UserFollowing.filter({ follower_email: currentUser?.email }),
    enabled: !!currentUser
  });

  const leaderboardType = LEADERBOARD_TYPES[selectedType];
  const sortedProgress = [...allProgress].sort((a, b) => 
    (b[leaderboardType.key] || 0) - (a[leaderboardType.key] || 0)
  );

  const currentUserProgress = allProgress.find(p => p.created_by === currentUser?.email);
  const currentUserRank = sortedProgress.findIndex(p => p.created_by === currentUser?.email) + 1;

  const friendsProgress = sortedProgress.filter(p => 
    following.some(f => f.following_email === p.created_by)
  );

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-orange-400" />;
      default: return <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>#{rank}</span>;
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    return 'bg-gray-500/20 text-gray-400';
  };

  const renderLeaderboardItem = (progress, rank) => {
    const isCurrentUser = progress.created_by === currentUser?.email;
    const value = progress[leaderboardType.key] || 0;

    return (
      <motion.div
        key={progress.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: rank * 0.05 }}
      >
        <div 
          className={`p-4 rounded-xl flex items-center justify-between ${
            isCurrentUser ? 'ring-2 ring-offset-2' : ''
          }`}
          style={{ 
            background: rank <= 3 ? 'var(--bg-surface-alt)' : 'var(--background)',
            ringColor: isCurrentUser ? 'var(--accent-from)' : undefined,
            ringOffsetColor: 'var(--background)'
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 flex items-center justify-center">
              {getRankIcon(rank)}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
                <span className="text-white font-bold">
                  {(progress.created_by || 'User').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {isCurrentUser ? 'You' : (progress.created_by?.split('@')[0] || 'User')}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Level {progress.level || 1}
                </p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {value.toLocaleString()}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {leaderboardType.label}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(LEADERBOARD_TYPES).map(([key, type]) => {
          const Icon = type.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`p-3 rounded-xl transition-all ${
                selectedType === key ? 'gradient-accent text-white' : 'bg-gray-500/10'
              }`}
            >
              <Icon className={`w-5 h-5 mx-auto mb-1 ${selectedType === key ? 'text-white' : ''}`} 
                style={selectedType !== key ? { color: 'var(--text-muted)' } : {}} />
              <p className="text-xs font-medium">
                {type.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Current User Rank */}
      {currentUserProgress && (
        <Card className="gradient-card border-0 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Your Rank</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                #{currentUserRank}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Your Score</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {(currentUserProgress[leaderboardType.key] || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="global">
        <TabsList>
          <TabsTrigger value="global">
            <Users className="w-4 h-4 mr-2" />
            Global
          </TabsTrigger>
          <TabsTrigger value="friends">
            <Users className="w-4 h-4 mr-2" />
            Friends ({friendsProgress.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-4 space-y-2">
          {sortedProgress.slice(0, 50).map((progress, idx) => 
            renderLeaderboardItem(progress, idx + 1)
          )}
        </TabsContent>

        <TabsContent value="friends" className="mt-4 space-y-2">
          {friendsProgress.length > 0 ? (
            friendsProgress.map((progress, idx) => {
              const globalRank = sortedProgress.findIndex(p => p.id === progress.id) + 1;
              return renderLeaderboardItem(progress, globalRank);
            })
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                No friends yet
              </h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Follow other users to see their rankings here!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}