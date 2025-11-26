import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Activity,
  TrendingUp,
  DollarSign,
  Server,
  AlertCircle,
  CheckCircle2,
  CheckCircle,
  Clock,
  Search,
  RefreshCw,
  BarChart3,
  Shield,
  Settings,
  Utensils,
  FileText,
  Bell,
  Ticket,
  Zap,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { hasPermission, PERMISSIONS } from '../components/admin/permissions';
import { AccessDenied } from '../components/admin/PermissionGate';

export default function Admin() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        
        // Check if user is admin
        if (user.role !== 'admin') {
          window.location.href = '/dashboard';
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        window.location.href = '/dashboard';
      }
    };
    fetchUser();
  }, []);

  // Fetch admin data
  const { data: healthData, refetch: refetchHealth } = useQuery({
    queryKey: ['admin-health'],
    queryFn: async () => {
      const res = await base44.functions.invoke('monitoringHealth');
      return res.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await base44.functions.invoke('monitoringStats');
      return res.data;
    },
    refetchInterval: 60000,
  });

  const { data: userMetrics } = useQuery({
    queryKey: ['admin-user-metrics'],
    queryFn: async () => {
      const res = await base44.functions.invoke('metricsUsers');
      return res.data;
    },
  });

  const { data: engagementMetrics } = useQuery({
    queryKey: ['admin-engagement'],
    queryFn: async () => {
      const res = await base44.functions.invoke('metricsEngagement');
      return res.data;
    },
  });

  const { data: productMetrics } = useQuery({
    queryKey: ['admin-product-usage'],
    queryFn: async () => {
      const res = await base44.functions.invoke('metricsProduct');
      return res.data;
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-users', searchQuery],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminUsers', { 
        query: searchQuery 
      });
      return res.data;
    },
  });

  // Check if user has any admin permissions
  if (!currentUser || !hasPermission(currentUser, PERMISSIONS.VIEW_METRICS)) {
    return <AccessDenied />;
  }

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Admin Panel
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              System monitoring and management
            </p>
          </div>
          <Button
            onClick={() => {
              refetchHealth();
              refetchStats();
            }}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </motion.div>

        {/* System Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>System Status</p>
                <h3 className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  {healthData?.status === 'healthy' ? 'Healthy' : 'Issues'}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                healthData?.status === 'healthy' ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {healthData?.status === 'healthy' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-500" />
                )}
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              DB Latency: {healthData?.services?.db?.latency_ms}ms
            </p>
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Users</p>
                <h3 className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  {statsData?.users?.total?.toLocaleString() || 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              +{userMetrics?.new?.today || 0} today
            </p>
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>DAU</p>
                <h3 className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  {engagementMetrics?.dau || 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              MAU: {engagementMetrics?.mau || 0}
            </p>
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Meal Logs</p>
                <h3 className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  {productMetrics?.meal_logs?.total?.toLocaleString() || 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {productMetrics?.meal_logs?.today || 0} today
            </p>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Link to={createPageUrl('AdminUsers')}>
              <Button variant="outline" className="gap-2">
                <Users className="w-4 h-4" />
                Users
              </Button>
            </Link>
            <Link to={createPageUrl('AdminFinance')}>
              <Button variant="outline" className="gap-2">
                <DollarSign className="w-4 h-4" />
                Finance
              </Button>
            </Link>
            <Link to={createPageUrl('AdminProductUsage')}>
              <Button variant="outline" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Product
              </Button>
            </Link>
            <Link to={createPageUrl('AdminMonitoring')}>
              <Button variant="outline" className="gap-2">
                <Server className="w-4 h-4" />
                Monitoring
              </Button>
            </Link>
            <Link to={createPageUrl('AdminSettings')}>
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </Link>
            <Link to={createPageUrl('AdminContent')}>
              <Button variant="outline" className="gap-2">
                <Utensils className="w-4 h-4" />
                Content
              </Button>
            </Link>
            <Link to={createPageUrl('AdminAudit')}>
              <Button variant="outline" className="gap-2">
                <FileText className="w-4 h-4" />
                Audit Logs
              </Button>
            </Link>
            {hasPermission(currentUser, PERMISSIONS.EDIT_USERS) && (
              <Link to={createPageUrl('AdminRoles')}>
                <Button variant="outline" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Roles
                </Button>
              </Link>
            )}
            {hasPermission(currentUser, PERMISSIONS.VIEW_SUPPORT_TICKETS) && (
              <Link to={createPageUrl('AdminNotifications')}>
                <Button variant="outline" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </Button>
              </Link>
            )}
            {hasPermission(currentUser, PERMISSIONS.MODERATE_CONTENT) && (
              <Link to={createPageUrl('ContentModeration')}>
                <Button variant="outline" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Content Moderation
                </Button>
              </Link>
            )}
            {hasPermission(currentUser, PERMISSIONS.VIEW_SUPPORT_TICKETS) && (
              <Link to={createPageUrl('SupportTickets')}>
                <Button variant="outline" className="gap-2">
                  <Ticket className="w-4 h-4" />
                  Support Tickets
                </Button>
              </Link>
            )}
            {hasPermission(currentUser, PERMISSIONS.VIEW_CONTENT_ANALYTICS) && (
              <Link to={createPageUrl('ContentAnalytics')}>
                <Button variant="outline" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Content Analytics
                </Button>
              </Link>
            )}
            {hasPermission(currentUser, PERMISSIONS.VIEW_ALL_TICKETS) && (
              <Link to={createPageUrl('SupportAnalytics')}>
                <Button variant="outline" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Support Analytics
                </Button>
              </Link>
            )}
            {hasPermission(currentUser, PERMISSIONS.MANAGE_SETTINGS) && (
              <Link to={createPageUrl('TicketAutomation')}>
                <Button variant="outline" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Automation
                </Button>
              </Link>
            )}
            {hasPermission(currentUser, PERMISSIONS.MANAGE_SETTINGS) && (
              <Link to={createPageUrl('AdminEmailTemplates')}>
                <Button variant="outline" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Email Templates
                </Button>
              </Link>
            )}
          </div>

          <TabsContent value="users" className="space-y-4">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  User Management
                </h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" 
                      style={{ color: 'var(--text-muted)' }} />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {usersData?.users?.slice(0, 20).map((user) => (
                  <div
                    key={user.id}
                    className="p-4 rounded-2xl flex items-center justify-between"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {user.email}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Plan: {user.plan} • {user.stats?.mealsLogged || 0} meals logged
                        </p>
                      </div>
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  User Growth
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-muted)' }}>Total Users</span>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {userMetrics?.total || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-muted)' }}>New Today</span>
                    <span className="font-bold text-green-500">
                      +{userMetrics?.new?.today || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-muted)' }}>New This Week</span>
                    <span className="font-bold text-blue-500">
                      +{userMetrics?.new?.last_7d || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-muted)' }}>New This Month</span>
                    <span className="font-bold text-purple-500">
                      +{userMetrics?.new?.last_30d || 0}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Product Usage
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-muted)' }}>Total Meal Logs</span>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {productMetrics?.meal_logs?.total?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-muted)' }}>Active Meal Plans</span>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {productMetrics?.meal_plans?.active || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-muted)' }}>Total Dishes</span>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {productMetrics?.dishes?.total || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-muted)' }}>Custom Recipes</span>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {productMetrics?.dishes?.custom || 0}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                User Engagement
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                    Daily Active Users
                  </p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {engagementMetrics?.dau || 0}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {engagementMetrics?.engagement_rate?.daily || 0}% of MAU
                  </p>
                </div>
                <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                    Weekly Active Users
                  </p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {engagementMetrics?.wau || 0}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {engagementMetrics?.engagement_rate?.weekly || 0}% of MAU
                  </p>
                </div>
                <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                    Monthly Active Users
                  </p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {engagementMetrics?.mau || 0}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Total active this month
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                System Health
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: 'var(--background)' }}>
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Database
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Connection status
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {healthData?.services?.db?.latency_ms}ms
                    </span>
                    {healthData?.services?.db?.status === 'ok' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: 'var(--background)' }}>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        API Response Time
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Average latency
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {healthData?.services?.api?.latency_ms}ms
                    </span>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}