import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Utensils, Calendar, Droplet, Camera, BarChart3, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { hasPermission, PERMISSIONS } from '../components/admin/permissions';
import { AccessDenied } from '../components/admin/PermissionGate';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminProductUsage() {
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  if (currentUser && !hasPermission(currentUser, PERMISSIONS.VIEW_METRICS)) {
    return <AccessDenied />;
  }

  const { data: productData } = useQuery({
    queryKey: ['admin-product-detailed'],
    queryFn: async () => {
      const res = await base44.functions.invoke('metricsProduct');
      return res.data;
    },
  });

  const { data: engagementData } = useQuery({
    queryKey: ['admin-engagement-detailed'],
    queryFn: async () => {
      const res = await base44.functions.invoke('metricsEngagement');
      return res.data;
    },
  });

  // Mock data for charts
  const featureUsageData = [
    { date: 'Nov 11', meals: 245, water: 189, menus: 45, scans: 67 },
    { date: 'Nov 12', meals: 267, water: 201, menus: 52, scans: 71 },
    { date: 'Nov 13', meals: 289, water: 215, menus: 48, scans: 78 },
    { date: 'Nov 14', meals: 312, water: 234, menus: 61, scans: 82 },
    { date: 'Nov 15', meals: 298, water: 221, menus: 55, scans: 75 },
    { date: 'Nov 16', meals: 334, water: 256, menus: 68, scans: 89 },
    { date: 'Nov 17', meals: 356, water: 278, menus: 72, scans: 94 }
  ];

  const topFeaturesData = [
    { feature: 'Meal Logging', usage: 2456, color: '#3B82F6' },
    { feature: 'Water Tracking', usage: 1834, color: '#8B5CF6' },
    { feature: 'Menu Planning', usage: 456, color: '#10B981' },
    { feature: 'Food Scanner', usage: 623, color: '#F59E0B' },
    { feature: 'Reports', usage: 289, color: '#EF4444' }
  ];

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Product Usage Analytics
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Feature adoption and engagement metrics
            </p>
          </div>
          <Link to={createPageUrl('Admin')}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* Feature Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Meal Logs</p>
                <h3 className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  {productData?.meal_logs?.total?.toLocaleString() || 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {productData?.meal_logs?.today || 0} today
            </p>
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Water Logs</p>
                <h3 className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  {productData?.water_logs?.total?.toLocaleString() || 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <Droplet className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Avg 3.2 per user/day
            </p>
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Meal Plans</p>
                <h3 className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  {productData?.meal_plans?.total || 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {productData?.meal_plans?.active || 0} active
            </p>
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Active Users</p>
                <h3 className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  {engagementData?.dau || 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              DAU today
            </p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Feature Usage Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={featureUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="meals" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="water" stroke="#8B5CF6" strokeWidth={2} />
                <Line type="monotone" dataKey="menus" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="scans" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Most Used Features
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topFeaturesData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="var(--text-muted)" />
                <YAxis dataKey="feature" type="category" stroke="var(--text-muted)" width={120} />
                <Tooltip 
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                />
                <Bar dataKey="usage" fill="#3B82F6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Engagement Funnel */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            User Engagement Funnel
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm" style={{ color: 'var(--text-muted)' }}>Registered</div>
              <div className="flex-1 h-12 rounded-lg relative overflow-hidden" style={{ background: 'var(--background)' }}>
                <div className="h-full gradient-accent" style={{ width: '100%' }} />
                <span className="absolute inset-0 flex items-center justify-center font-bold text-white">
                  1,245 (100%)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm" style={{ color: 'var(--text-muted)' }}>Onboarded</div>
              <div className="flex-1 h-12 rounded-lg relative overflow-hidden" style={{ background: 'var(--background)' }}>
                <div className="h-full bg-blue-500" style={{ width: '87%' }} />
                <span className="absolute inset-0 flex items-center justify-center font-bold text-white">
                  1,083 (87%)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm" style={{ color: 'var(--text-muted)' }}>First Meal Log</div>
              <div className="flex-1 h-12 rounded-lg relative overflow-hidden" style={{ background: 'var(--background)' }}>
                <div className="h-full bg-purple-500" style={{ width: '72%' }} />
                <span className="absolute inset-0 flex items-center justify-center font-bold text-white">
                  896 (72%)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm" style={{ color: 'var(--text-muted)' }}>First Menu Plan</div>
              <div className="flex-1 h-12 rounded-lg relative overflow-hidden" style={{ background: 'var(--background)' }}>
                <div className="h-full bg-green-500" style={{ width: '45%' }} />
                <span className="absolute inset-0 flex items-center justify-center font-bold text-white">
                  560 (45%)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm" style={{ color: 'var(--text-muted)' }}>Active (7d+)</div>
              <div className="flex-1 h-12 rounded-lg relative overflow-hidden" style={{ background: 'var(--background)' }}>
                <div className="h-full bg-orange-500" style={{ width: '34%' }} />
                <span className="absolute inset-0 flex items-center justify-center font-bold text-white">
                  423 (34%)
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}