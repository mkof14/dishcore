import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Heart, Share2, MessageCircle, TrendingUp, ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { hasPermission, PERMISSIONS } from '../components/admin/permissions';
import { AccessDenied } from '../components/admin/PermissionGate';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export default function ContentAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: sharedContent = [] } = useQuery({
    queryKey: ['shared-content-analytics'],
    queryFn: () => base44.entities.SharedContent.list('-created_date', 500),
  });

  const { data: forumTopics = [] } = useQuery({
    queryKey: ['forum-topics-analytics'],
    queryFn: () => base44.entities.ForumTopic.list('-created_date', 500),
  });

  const { data: dishes = [] } = useQuery({
    queryKey: ['dishes-analytics'],
    queryFn: () => base44.entities.Dish.filter({ is_custom: true }, '-created_date', 500),
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['content-submissions-analytics'],
    queryFn: () => base44.entities.ContentSubmission.list('-created_date', 200),
  });

  if (!currentUser || !hasPermission(currentUser, PERMISSIONS.VIEW_CONTENT_ANALYTICS)) {
    return <AccessDenied />;
  }

  // Calculate engagement metrics
  const totalViews = sharedContent.reduce((sum, c) => sum + (c.views || 0), 0) + 
                     forumTopics.reduce((sum, t) => sum + (t.views || 0), 0);
  const totalLikes = sharedContent.reduce((sum, c) => sum + (c.likes || 0), 0);
  const totalComments = forumTopics.reduce((sum, t) => sum + (t.replies_count || 0), 0);
  const totalShares = sharedContent.length;

  // Top performing content
  const topContent = [...sharedContent]
    .sort((a, b) => (b.views + b.likes * 2) - (a.views + a.likes * 2))
    .slice(0, 10);

  // Content by type
  const contentByType = [
    { name: 'Recipes', value: dishes.length, color: '#3B82F6' },
    { name: 'Meal Plans', value: sharedContent.filter(c => c.content_type === 'meal_plan').length, color: '#10B981' },
    { name: 'Forum Posts', value: forumTopics.length, color: '#F59E0B' },
    { name: 'Success Stories', value: sharedContent.filter(c => c.content_type === 'success_story').length, color: '#8B5CF6' }
  ];

  // Engagement over time
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(new Date(), 29 - i), 'MMM dd');
    const dayContent = sharedContent.filter(c => 
      format(new Date(c.created_date), 'MMM dd') === date
    );
    return {
      date,
      views: dayContent.reduce((sum, c) => sum + (c.views || 0), 0),
      likes: dayContent.reduce((sum, c) => sum + (c.likes || 0), 0),
      content: dayContent.length
    };
  });

  // Moderation stats
  const moderationStats = {
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    flagged: submissions.filter(s => s.flags && s.flags.length > 0).length
  };

  const exportReport = () => {
    const csv = [
      ['Metric', 'Value'],
      ['Total Views', totalViews],
      ['Total Likes', totalLikes],
      ['Total Comments', totalComments],
      ['Total Content', sharedContent.length],
      ['Custom Recipes', dishes.length],
      ['Forum Topics', forumTopics.length],
      ['Pending Moderation', moderationStats.pending],
      ['Approved', moderationStats.approved],
      ['Rejected', moderationStats.rejected]
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Content Analytics
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Engagement metrics and content performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportReport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Link to={createPageUrl('Admin')}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-blue-500" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Total Views</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {totalViews.toLocaleString()}
            </p>
          </Card>
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <Heart className="w-8 h-8 text-red-500 mb-2" />
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Total Likes</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {totalLikes.toLocaleString()}
            </p>
          </Card>
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <MessageCircle className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Comments</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {totalComments.toLocaleString()}
            </p>
          </Card>
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <Share2 className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Shared Content</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {totalShares}
            </p>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="top">Top Content</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Engagement Trends (30 Days)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={last30Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} name="Views" />
                    <Line type="monotone" dataKey="likes" stroke="#EF4444" strokeWidth={2} name="Likes" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Content Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={contentByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {contentByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Content Created (30 Days)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={last30Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Bar dataKey="content" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="top">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Top Performing Content
              </h3>
              <div className="space-y-2">
                {topContent.map((content, index) => (
                  <div
                    key={content.id}
                    className="p-4 rounded-2xl"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl font-bold text-blue-500">#{index + 1}</span>
                          <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {content.title}
                          </h4>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          By: {content.created_by}
                        </p>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span>{content.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span>{content.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="moderation">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Moderation Queue
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>Pending Review</span>
                    <span className="text-xl font-bold text-yellow-500">{moderationStats.pending}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>Approved</span>
                    <span className="text-xl font-bold text-green-500">{moderationStats.approved}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>Rejected</span>
                    <span className="text-xl font-bold text-red-500">{moderationStats.rejected}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>Flagged</span>
                    <span className="text-xl font-bold text-orange-500">{moderationStats.flagged}</span>
                  </div>
                </div>
              </Card>

              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Approval Rate
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Approved', value: moderationStats.approved, color: '#10B981' },
                        { name: 'Rejected', value: moderationStats.rejected, color: '#EF4444' },
                        { name: 'Pending', value: moderationStats.pending, color: '#F59E0B' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {[
                        { color: '#10B981' },
                        { color: '#EF4444' },
                        { color: '#F59E0B' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}