import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, UserPlus, UserMinus, Search, TrendingUp } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Friends() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: following = [] } = useQuery({
    queryKey: ['following', user?.email],
    queryFn: () => base44.entities.UserFollowing.filter({ follower_email: user?.email }),
    enabled: !!user,
  });

  const { data: followers = [] } = useQuery({
    queryKey: ['followers', user?.email],
    queryFn: () => base44.entities.UserFollowing.filter({ following_email: user?.email }),
    enabled: !!user,
  });

  const { data: allFollows = [] } = useQuery({
    queryKey: ['allFollows'],
    queryFn: () => base44.entities.UserFollowing.list('-created_date', 200),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list('-created_date', 100),
  });

  const followMutation = useMutation({
    mutationFn: (email) => base44.entities.UserFollowing.create({
      follower_email: user.email,
      following_email: email
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['following']);
      queryClient.invalidateQueries(['followers']);
      toast.success('Now following!');
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (email) => {
      const follow = following.find(f => f.following_email === email);
      if (follow) {
        await base44.entities.UserFollowing.delete(follow.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['following']);
      queryClient.invalidateQueries(['followers']);
      toast.success('Unfollowed');
    },
  });

  // Suggested users - users not following yet but have common interests
  const suggestedUsers = allUsers.filter(u => 
    u.email !== user?.email && 
    !following.some(f => f.following_email === u.email)
  ).slice(0, 5);

  const followingEmails = following.map(f => f.following_email);
  const followerEmails = followers.map(f => f.follower_email);

  const filteredFollowing = following.filter(f => 
    f.following_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFollowers = followers.filter(f => 
    f.follower_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        
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
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Friends & Connections
            </h1>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
              {following.length} following • {followers.length} followers
            </p>
          </div>
        </motion.div>

        {/* Search */}
        <Card className="gradient-card border-0 p-4 rounded-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
              style={{ color: 'var(--text-muted)' }} />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        </Card>

        {/* Suggestions */}
        {suggestedUsers.length > 0 && !searchQuery && (
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp className="w-5 h-5" />
              Suggested Users
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {suggestedUsers.map((suggestedUser) => (
                <Card key={suggestedUser.email} className="gradient-card border-0 p-4 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-xl font-bold text-white">
                        {suggestedUser.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {suggestedUser.full_name || suggestedUser.email.split('@')[0]}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {suggestedUser.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => followMutation.mutate(suggestedUser.email)}
                      disabled={followMutation.isPending}
                      className="gradient-accent text-white border-0"
                      size="sm"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Follow
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="following">
          <TabsList>
            <TabsTrigger value="following">Following ({following.length})</TabsTrigger>
            <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="following" className="space-y-3 mt-4">
            {filteredFollowing.map((follow) => (
              <Card key={follow.id} className="gradient-card border-0 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => window.location.href = createPageUrl('UserProfile') + '?email=' + follow.following_email}
                  >
                    <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-xl font-bold text-white">
                      {follow.following_email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {follow.following_email.split('@')[0]}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {follow.following_email}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => unfollowMutation.mutate(follow.following_email)}
                    disabled={unfollowMutation.isPending}
                    variant="outline"
                    size="sm"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    <UserMinus className="w-4 h-4 mr-1" />
                    Unfollow
                  </Button>
                </div>
              </Card>
            ))}

            {filteredFollowing.length === 0 && (
              <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
                <Users className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {searchQuery ? 'No results found' : 'Not following anyone yet'}
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  {searchQuery ? 'Try a different search' : 'Start following users to see their updates'}
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="followers" className="space-y-3 mt-4">
            {filteredFollowers.map((follow) => {
              const isFollowingBack = followingEmails.includes(follow.follower_email);
              
              return (
                <Card key={follow.id} className="gradient-card border-0 p-4 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => window.location.href = createPageUrl('UserProfile') + '?email=' + follow.follower_email}
                    >
                      <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-xl font-bold text-white">
                        {follow.follower_email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {follow.follower_email.split('@')[0]}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {follow.follower_email}
                        </p>
                      </div>
                    </div>
                    {isFollowingBack ? (
                      <Button
                        onClick={() => unfollowMutation.mutate(follow.follower_email)}
                        variant="outline"
                        size="sm"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      >
                        <UserMinus className="w-4 h-4 mr-1" />
                        Unfollow
                      </Button>
                    ) : (
                      <Button
                        onClick={() => followMutation.mutate(follow.follower_email)}
                        className="gradient-accent text-white border-0"
                        size="sm"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Follow Back
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}

            {filteredFollowers.length === 0 && (
              <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
                <Users className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {searchQuery ? 'No results found' : 'No followers yet'}
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  {searchQuery ? 'Try a different search' : 'Share your progress to attract followers'}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}