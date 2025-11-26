
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageSquare, 
  Users, 
  Trophy,
  TrendingUp,
  Eye,
  Share2,
  BookOpen,
  Calendar,
  Sparkles,
  Target,
  ArrowLeft,
  UserPlus
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import ActivityFeedWidget from "../components/community/ActivityFeedWidget";
import LeaderboardPanel from "../components/gamification/LeaderboardPanel";

export default function Community() {
  const [selectedTab, setSelectedTab] = useState("feed");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: sharedContent = [] } = useQuery({
    queryKey: ['sharedContent'],
    queryFn: () => base44.entities.SharedContent.list('-created_date', 50),
  });

  const { data: following = [] } = useQuery({
    queryKey: ['following', user?.email],
    queryFn: () => base44.entities.UserFollowing.filter({ follower_email: user?.email }),
    enabled: !!user,
  });

  const { data: friendsActivity = [] } = useQuery({
    queryKey: ['friendsActivity'],
    queryFn: async () => {
      const friendEmails = following.map(f => f.following_email);
      if (friendEmails.length === 0) return [];
      
      const allActivity = await base44.entities.ActivityFeed.list('-created_date', 100);
      return allActivity.filter(a => friendEmails.includes(a.user_email));
    },
    enabled: following.length > 0,
  });

  const { data: friendsSharedContent = [] } = useQuery({
    queryKey: ['friendsSharedContent'],
    queryFn: async () => {
      const friendEmails = following.map(f => f.following_email);
      if (friendEmails.length === 0) return [];
      
      const allContent = await base44.entities.SharedContent.list('-created_date', 100);
      return allContent.filter(c => friendEmails.includes(c.created_by));
    },
    enabled: following.length > 0,
  });

  const likeContentMutation = useMutation({
    mutationFn: (contentId) => {
      const content = sharedContent.find(c => c.id === contentId);
      return base44.entities.SharedContent.update(contentId, {
        likes: (content?.likes || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sharedContent']);
      queryClient.invalidateQueries(['friendsSharedContent']);
      toast.success('Liked!');
    },
  });

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = createPageUrl('Dashboard')}
              className="w-12 h-12 rounded-2xl btn-secondary flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Community Hub
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                Connect, share, and get inspired
              </p>
            </div>
          </div>
          <Link to={createPageUrl('Friends')}>
            <Button className="gradient-accent text-white border-0">
              <UserPlus className="w-4 h-4 mr-2" />
              Manage Friends
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to={createPageUrl('CommunityForums')}>
            <Card className="gradient-card border-0 p-5 rounded-2xl hover:scale-105 transition-transform cursor-pointer">
              <MessageSquare className="w-8 h-8 mb-3" style={{ color: 'var(--accent-from)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Forums</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Discuss & ask questions</p>
            </Card>
          </Link>

          <Link to={createPageUrl('CommunityGroups')}>
            <Card className="gradient-card border-0 p-5 rounded-2xl hover:scale-105 transition-transform cursor-pointer">
              <Users className="w-8 h-8 mb-3" style={{ color: 'var(--accent-from)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Groups</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Join communities</p>
            </Card>
          </Link>

          <Link to={createPageUrl('Achievements')}>
            <Card className="gradient-card border-0 p-5 rounded-2xl hover:scale-105 transition-transform cursor-pointer">
              <Trophy className="w-8 h-8 mb-3" style={{ color: 'var(--accent-from)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Challenges</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Compete & earn rewards</p>
            </Card>
          </Link>

          <Link to={createPageUrl('DishLibrary')}>
            <Card className="gradient-card border-0 p-5 rounded-2xl hover:scale-105 transition-transform cursor-pointer">
              <Sparkles className="w-8 h-8 mb-3" style={{ color: 'var(--accent-from)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Share Recipe</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Inspire others</p>
            </Card>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="feed">All Activity</TabsTrigger>
                <TabsTrigger value="friends">Friends ({following.length})</TabsTrigger>
                <TabsTrigger value="shared">Shared Content</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              </TabsList>

              <TabsContent value="feed">
                <ActivityFeedWidget limit={20} />
              </TabsContent>

              <TabsContent value="friends">
                {following.length === 0 ? (
                  <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
                    <Users className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                      No friends yet
                    </h3>
                    <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
                      Start following users to see their activities here
                    </p>
                    <Link to={createPageUrl('Friends')}>
                      <Button className="gradient-accent text-white border-0">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Find Friends
                      </Button>
                    </Link>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {friendsSharedContent.map(content => (
                      <Card key={content.id} className="gradient-card border-0 p-6 rounded-3xl hover:shadow-lg transition-shadow">
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
                            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                              {content.description}
                            </p>
                            <p 
                              className="text-xs cursor-pointer hover:underline" 
                              style={{ color: 'var(--text-muted)' }}
                              onClick={() => window.location.href = createPageUrl('UserProfile') + '?email=' + content.created_by}
                            >
                              by {content.created_by?.split('@')[0]}
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
                          <span className="text-sm ml-auto" style={{ color: 'var(--text-muted)' }}>
                            {format(new Date(content.created_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </Card>
                    ))}

                    {friendsSharedContent.length === 0 && (
                      <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
                        <Share2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                          No shared content yet
                        </h3>
                        <p style={{ color: 'var(--text-muted)' }}>
                          Your friends haven't shared anything yet
                        </p>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="shared">
                <div className="space-y-4">
                  {sharedContent.map(content => (
                    <Card key={content.id} className="gradient-card border-0 p-6 rounded-3xl hover:shadow-lg transition-shadow">
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
                          <Eye className="w-4 h-4" />
                          {content.views || 0}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          by {content.created_by} • {format(new Date(content.created_date), 'MMM d')}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="leaderboard">
                <LeaderboardPanel />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Target className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
                Active Challenges
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    7-Day Streak
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Log meals for 7 consecutive days
                  </p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    Protein Master
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Hit protein goal 5 days this week
                  </p>
                </div>
              </div>
              <Link to={createPageUrl('Achievements')}>
                <Button size="sm" variant="outline" className="w-full mt-4" style={{ borderColor: 'var(--border)' }}>
                  View All Challenges
                </Button>
              </Link>
            </Card>

            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
                Trending Topics
              </h3>
              <div className="space-y-2">
                <div className="text-sm p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors" 
                  style={{ color: 'var(--text-secondary)' }}>
                  #HighProteinBreakfast
                </div>
                <div className="text-sm p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                  style={{ color: 'var(--text-secondary)' }}>
                  #MealPrepSunday
                </div>
                <div className="text-sm p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                  style={{ color: 'var(--text-secondary)' }}>
                  #WeightLossJourney
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
