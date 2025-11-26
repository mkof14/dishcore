import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, TrendingUp, Trophy, Search, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function FriendsCompetition() {
  const [searchEmail, setSearchEmail] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

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

  const { data: following = [] } = useQuery({
    queryKey: ['following'],
    queryFn: () => base44.entities.UserFollowing.filter({ follower_email: currentUser?.email }),
    enabled: !!currentUser
  });

  const { data: followers = [] } = useQuery({
    queryKey: ['followers'],
    queryFn: () => base44.entities.UserFollowing.filter({ following_email: currentUser?.email }),
    enabled: !!currentUser
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['allUserProgress'],
    queryFn: () => base44.entities.UserProgress.list(),
  });

  const followMutation = useMutation({
    mutationFn: (email) => base44.entities.UserFollowing.create({
      follower_email: currentUser.email,
      following_email: email
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['following']);
      toast.success('Friend added! 🤝');
      setSearchEmail('');
    },
    onError: () => {
      toast.error('Failed to add friend');
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: (id) => base44.entities.UserFollowing.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['following']);
      toast.success('Friend removed');
    }
  });

  const handleFollow = () => {
    if (!searchEmail || searchEmail === currentUser?.email) {
      toast.error('Please enter a valid email');
      return;
    }
    
    if (following.some(f => f.following_email === searchEmail)) {
      toast.error('Already following this user');
      return;
    }

    followMutation.mutate(searchEmail);
  };

  const friendsWithProgress = following.map(f => {
    const progress = allProgress.find(p => p.created_by === f.following_email);
    return {
      ...f,
      progress: progress || { total_points: 0, level: 1, current_streak: 0 }
    };
  }).sort((a, b) => b.progress.total_points - a.progress.total_points);

  const myProgress = allProgress.find(p => p.created_by === currentUser?.email) || { total_points: 0, level: 1 };

  return (
    <div className="space-y-6">
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Users className="w-5 h-5" />
          Friends Competition
        </h3>

        {/* Add Friend */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <Input
              placeholder="Enter friend's email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFollow()}
              className="pl-10"
            />
          </div>
          <Button
            onClick={handleFollow}
            disabled={followMutation.isPending || !searchEmail}
            className="gradient-accent text-white border-0"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl text-center" style={{ background: 'var(--background)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Following</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {following.length}
            </p>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ background: 'var(--background)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Followers</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {followers.length}
            </p>
          </div>
        </div>

        {/* Friends List */}
        {friendsWithProgress.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
              Your Friends ({friendsWithProgress.length})
            </h4>
            {friendsWithProgress.map((friend, idx) => {
              const isAhead = friend.progress.total_points > myProgress.total_points;
              const pointsDiff = Math.abs(friend.progress.total_points - myProgress.total_points);

              return (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="p-4 rounded-xl" style={{ background: 'var(--background)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
                          <span className="text-white font-bold">
                            {friend.following_email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {friend.following_email.split('@')[0]}
                          </p>
                          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span>Level {friend.progress.level}</span>
                            <span>•</span>
                            <span>{friend.progress.total_points.toLocaleString()} pts</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge className={isAhead ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {isAhead ? `-${pointsDiff}` : `+${pointsDiff}`}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => unfollowMutation.mutate(friend.id)}
                          className="mt-1"
                        >
                          Unfollow
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Add friends to compete and stay motivated together!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}