import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, CreditCard, Users, ArrowUpRight, ArrowDownRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { hasPermission, PERMISSIONS } from '../components/admin/permissions';
import { AccessDenied } from '../components/admin/PermissionGate';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

export default function AdminFinance() {
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Check permissions - finance managers and admins can access
  if (currentUser && !hasPermission(currentUser, PERMISSIONS.VIEW_FINANCE)) {
    return <AccessDenied message="You don't have permission to view finance data" />;
  }

  const { data: revenueData } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: async () => {
      // Mock data for now - replace with actual API call
      return {
        mrr: 12500,
        arr: 150000,
        arpu: 45,
        totalRevenue: 87340,
        growth: 23.5,
        activeSubs: 278,
        byPlan: [
          { name: 'Free', value: 120, revenue: 0 },
          { name: 'Lite', value: 89, revenue: 2670 },
          { name: 'Core', value: 54, revenue: 5940 },
          { name: 'Studio', value: 15, revenue: 3750 }
        ],
        monthlyRevenue: [
          { month: 'Jul', revenue: 8500, subs: 210 },
          { month: 'Aug', revenue: 9200, subs: 225 },
          { month: 'Sep', revenue: 10100, subs: 245 },
          { month: 'Oct', revenue: 11300, subs: 260 },
          { month: 'Nov', revenue: 12500, subs: 278 }
        ],
        churnRate: 3.2,
        upgrades: 12,
        downgrades: 5
      };
    },
  });

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Finance & Revenue
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Financial metrics and subscription analytics
            </p>
          </div>
          <Link to={createPageUrl('Admin')}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>MRR</p>
                <h3 className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  ${revenueData?.mrr?.toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">+{revenueData?.growth}%</span>
            </div>
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>ARR</p>
                <h3 className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  ${revenueData?.arr?.toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Annual recurring revenue
            </p>
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>ARPU</p>
                <h3 className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  ${revenueData?.arpu}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Average revenue per user
            </p>
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Active Subs</p>
                <h3 className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  {revenueData?.activeSubs}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Churn: {revenueData?.churnRate}%
            </p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Revenue Growth
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData?.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Revenue by Plan
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData?.byPlan?.filter(p => p.revenue > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, revenue }) => `${name}: $${revenue}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {revenueData?.byPlan?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Subscription Changes */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Subscription Activity
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Upgrades This Month</p>
              <p className="text-3xl font-bold text-green-500">{revenueData?.upgrades}</p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Downgrades This Month</p>
              <p className="text-3xl font-bold text-orange-500">{revenueData?.downgrades}</p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Net Growth</p>
              <p className="text-3xl font-bold text-blue-500">+{revenueData?.upgrades - revenueData?.downgrades}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}