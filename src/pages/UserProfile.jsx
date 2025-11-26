import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Award, TrendingUp, Heart, MessageSquare, Share2, Trophy, Calendar, Target } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("shared");
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(window.location.search);
  const profileEmail = urlParams.get('email');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userProgress } = useQuery({
    queryKey: ['userProgress', profileEmail],
    queryFn: async () => {
      const progress = await base44.entities.UserProgress.filter({ created_by: profileEmail });
      return progress[0] || null;
    },
    enabled: !!profileEmail,
  });

  const { data: sharedContent = [] } = useQuery({
    queryKey: ['userSharedContent', profileEmail],
    queryFn: () => base44.entities.SharedContent.filter({ created_by: profileEmail }, '-created_date'),
    enabled: !!profileEmail,
  });

  const { data: activityFeed = [] } = useQuery({
    queryKey: ['userActivityFeed', profileEmail],
    queryFn: () => base44.entities.ActivityFeed.filter({ user_email: profileEmail }, '-created_date', 20),
    enabled: !!profileEmail,
  });

  const { data: followData = [] } = useQuery({
    queryKey: ['following', currentUser?.email],
    queryFn: () => base44.entities.UserFollowing.filter({ follower_email: currentUser?.email }),
    enabled: !!currentUser,
  });

  const { data: followerCount = [] } = useQuery({
    queryKey: ['followers', profileEmail],
    queryFn: () => base44.entities.UserFollowing.filter({ following_email: profileEmail }),
    enabled: !!profileEmail,
  });

  const isFollowing = followData.some(f => f.following_email === profileEmail);
  const isOwnProfile = currentUser?.email === profileEmail;

  const followMutation = useMutation({
    mutationFn: () => base44.entities.UserFollowing.create({
      follower_email: currentUser.email,
      following_email: profileEmail
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['following']);
      queryClient.invalidateQueries(['followers']);
      toast.success('Following user!');
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      const follow = followData.find(f => f.following_email === profileEmail);
      if (follow) {
        await base44.entities.UserFollowing.delete(follow.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['following']);
      queryClient.invalidateQueries(['followers']);
      toast.success('Unfollowed user');
    },
  });

  const likeContentMutation = useMutation({
    mutationFn: (contentId) => {
      const content = sharedContent.find(c => c.id === contentId);
      return base44.entities.SharedContent.update(contentId, {
        likes: (content?.likes || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userSharedContent']);
      toast.success('Liked!');
    },
  });

  if (!profileEmail) {
    return <div className="p-8 text-center">No user specified</div>;
  }

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button 
            onClick={() => window.location.href = createPageUrl('Community')}
            className="w-12 h-12 rounded-2xl btn-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            User Profile
          </h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="gradient-card border-0 p-8 rounded-3xl">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 rounded-full gradient-accent flex items-center justify-center text-4xl font-bold text-white">
                {profileEmail?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {profileEmail?.split('@')[0]}
                </h2>
                <div className="flex items-center gap-4 justify-center md:justify-start mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {followerCount.length}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {followData.length}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Following</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {sharedContent.length}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Posts</p>
                  </div>
                </div>
                {!isOwnProfile && currentUser && (
                  <Button
                    onClick={() => isFollowing ? unfollowMutation.mutate() : followMutation.mutate()}
                    className={isFollowing ? 'btn-secondary' : 'gradient-accent text-white border-0'}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
              <div className="flex flex-col gap-4">
                {userProgress && (
                  <>
                    <div className="p-4 rounded-2xl text-center" style={{ background: 'var(--background)' }}>
                      <Trophy className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--accent-from)' }} />
                      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {userProgress.total_points}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Points</p>
                    </div>
                    <div className="p-4 rounded-2xl text-center" style={{ background: 'var(--background)' }}>
                      <Target className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--accent-from)' }} />
                      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {userProgress.current_streak}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Day Streak</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Badges */}
        {userProgress?.badges && userProgress.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Award className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
                Achievements
              </h3>
              <div className="flex flex-wrap gap-3">
                {userProgress.badges.map((badge, idx) => (
                  <Badge key={idx} className="px-4 py-2 text-sm">
                    {badge}
                  </Badge>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="shared">Shared Content</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="shared">
            <div className="space-y-4">
              {sharedContent.map(content => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="gradient-card border-0 p-6 rounded-3xl hover:shadow-lg transition-shadow">
                    {content.image_url && (
                      <img src={content.image_url} alt={content.title} 
                        className="w-full h-64 object-cover rounded-2xl mb-4" />
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Badge className="mb-2 text-xs">{content.content_type}</Badge>
                        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                          {content.title}
                        </h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                          {content.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => likeContentMutation.mutate(content.id)}
                        className="flex items-center gap-2"
                      >
                        <Heart className="w-4 h-4" style={{ color: content.likes > 0 ? '#ef4444' : 'var(--text-muted)' }} />
                        <span className="text-sm">{content.likes || 0}</span>
                      </Button>
                      <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        <MessageSquare className="w-4 h-4" />
                        {content.comments_count || 0}
                      </span>
                      <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        <Share2 className="w-4 h-4" />
                        Share
                      </span>
                      <span className="text-sm ml-auto" style={{ color: 'var(--text-muted)' }}>
                        {format(new Date(content.created_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {sharedContent.length === 0 && (
                <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
                  <Share2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    No shared content yet
                  </h3>
                  <p style={{ color: 'var(--text-muted)' }}>
                    {isOwnProfile ? 'Start sharing your journey!' : 'This user hasn\'t shared anything yet.'}
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="space-y-3">
              {activityFeed.map(activity => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="gradient-card border-0 p-5 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-white font-bold">
                        {activity.activity_type === 'badge_earned' && <Award className="w-5 h-5" />}
                        {activity.activity_type === 'goal_achieved' && <Target className="w-5 h-5" />}
                        {activity.activity_type === 'meal_logged' && <Calendar className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                          {activity.content}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {format(new Date(activity.created_date), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {activityFeed.length === 0 && (
                <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    No activity yet
                  </h3>
                  <p style={{ color: 'var(--text-muted)' }}>
                    Activity will appear here as the user makes progress
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}