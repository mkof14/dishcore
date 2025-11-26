import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Trophy, Target, Utensils, Users, Flame } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const ACTIVITY_ICONS = {
  meal_logged: Utensils,
  badge_earned: Trophy,
  goal_achieved: Target,
  recipe_shared: Utensils,
  challenge_completed: Flame,
  joined_group: Users,
  streak_milestone: Flame
};

export default function ActivityFeedWidget({ limit = 10 }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activityFeed'],
    queryFn: () => base44.entities.ActivityFeed.list('-created_date', limit),
  });

  const { data: following = [] } = useQuery({
    queryKey: ['following', user?.email],
    queryFn: () => base44.entities.UserFollowing.filter({ follower_email: user?.email }),
    enabled: !!user,
  });

  const likeActivityMutation = useMutation({
    mutationFn: (activityId) => {
      const activity = activities.find(a => a.id === activityId);
      return base44.entities.ActivityFeed.update(activityId, {
        likes: (activity?.likes || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activityFeed']);
    },
  });

  const followUserMutation = useMutation({
    mutationFn: (userEmail) => base44.entities.UserFollowing.create({
      follower_email: user.email,
      following_email: userEmail
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['following']);
      toast.success('Following user');
    },
  });

  const isFollowing = (userEmail) => following.some(f => f.following_email === userEmail);

  if (isLoading) {
    return (
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'var(--background)' }} />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map(activity => {
        const Icon = ACTIVITY_ICONS[activity.activity_type] || Utensils;
        return (
          <Card key={activity.id} className="gradient-card border-0 p-5 rounded-2xl">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {activity.user_email.split('@')[0]}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {activity.content}
                    </p>
                  </div>
                  {user && activity.user_email !== user.email && !isFollowing(activity.user_email) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => followUserMutation.mutate(activity.user_email)}
                      style={{ borderColor: 'var(--border)' }}
                    >
                      Follow
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => likeActivityMutation.mutate(activity.id)}
                    className="flex items-center gap-1"
                  >
                    <Heart className="w-4 h-4" style={{ color: activity.likes > 0 ? '#ef4444' : 'var(--text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {activity.likes || 0}
                    </span>
                  </Button>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {format(new Date(activity.created_date), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      {activities.length === 0 && (
        <Card className="gradient-card border-0 p-8 rounded-3xl text-center">
          <Users className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>
            No recent activity. Start logging meals and earning achievements!
          </p>
        </Card>
      )}
    </div>
  );
}