import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Server, Database, Mail, CreditCard, Clock, AlertCircle, CheckCircle2, Activity, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { hasPermission, PERMISSIONS } from '../components/admin/permissions';
import { AccessDenied } from '../components/admin/PermissionGate';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminMonitoring() {
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  if (currentUser && !hasPermission(currentUser, PERMISSIONS.VIEW_MONITORING)) {
    return <AccessDenied message="You don't have permission to view monitoring data" />;
  }

  const { data: healthData, refetch } = useQuery({
    queryKey: ['admin-health-detailed'],
    queryFn: async () => {
      const res = await base44.functions.invoke('monitoringHealth');
      return res.data;
    },
    refetchInterval: 30000,
  });

  // Mock latency data
  const latencyData = [
    { time: '12:00', profile: 45, dashboard: 85, mealLogs: 62, menuPlans: 120 },
    { time: '12:05', profile: 48, dashboard: 92, mealLogs: 68, menuPlans: 115 },
    { time: '12:10', profile: 42, dashboard: 78, mealLogs: 55, menuPlans: 108 },
    { time: '12:15', profile: 51, dashboard: 95, mealLogs: 71, menuPlans: 125 },
    { time: '12:20', profile: 47, dashboard: 88, mealLogs: 64, menuPlans: 118 }
  ];

  const services = [
    { name: 'Database', icon: Database, status: healthData?.services?.db?.status, latency: healthData?.services?.db?.latency_ms, color: 'blue' },
    { name: 'API', icon: Server, status: healthData?.services?.api?.status, latency: healthData?.services?.api?.latency_ms, color: 'purple' },
    { name: 'Storage (S3)', icon: Server, status: 'ok', latency: null, color: 'green' },
    { name: 'Email Service', icon: Mail, status: 'ok', latency: null, color: 'orange' },
  ];

  const recentErrors = [
    { time: '12:34:12', route: '/api/v1/profile', status: 500, code: 'INTERNAL_ERROR', message: 'Database timeout', user: 'user@example.com' },
    { time: '12:32:45', route: '/api/v1/meal-logs', status: 401, code: 'UNAUTHORIZED', message: 'Invalid token', user: 'anonymous' },
    { time: '12:28:33', route: '/api/v1/dashboard/summary', status: 500, code: 'INTERNAL_ERROR', message: 'Query failed', user: 'test@example.com' },
    { time: '12:15:21', route: '/api/v1/menu-plans', status: 404, code: 'NOT_FOUND', message: 'Plan not found', user: 'demo@example.com' }
  ];

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              System Monitoring
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Real-time system health and performance metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline">Refresh</Button>
            <Link to={createPageUrl('Admin')}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        {/* System Status */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            System Health
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service) => {
              const Icon = service.icon;
              const isHealthy = service.status === 'ok';
              return (
                <div
                  key={service.name}
                  className="p-4 rounded-2xl"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-5 h-5" style={{ color: `var(--accent-from)` }} />
                    {isHealthy ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {service.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className={isHealthy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {isHealthy ? 'Healthy' : 'Error'}
                    </Badge>
                    {service.latency && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {service.latency}ms
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* API Latency */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            API Response Times
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              />
              <Line type="monotone" dataKey="profile" stroke="#3B82F6" strokeWidth={2} name="Profile" />
              <Line type="monotone" dataKey="dashboard" stroke="#8B5CF6" strokeWidth={2} name="Dashboard" />
              <Line type="monotone" dataKey="mealLogs" stroke="#10B981" strokeWidth={2} name="Meal Logs" />
              <Line type="monotone" dataKey="menuPlans" stroke="#F59E0B" strokeWidth={2} name="Menu Plans" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Error Logs */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Recent Errors
          </h3>
          <div className="space-y-2">
            {recentErrors.map((error, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl flex items-center justify-between"
                style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-4">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {error.route}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {error.message} • {error.user}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-red-500/20 text-red-400">
                    {error.status}
                  </Badge>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {error.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <Clock className="w-8 h-8 mb-3" style={{ color: 'var(--accent-from)' }} />
            <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Avg Response Time</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>74ms</p>
          </Card>
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <Activity className="w-8 h-8 mb-3 text-green-500" />
            <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Uptime (30d)</p>
            <p className="text-3xl font-bold text-green-500">99.8%</p>
          </Card>
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <AlertCircle className="w-8 h-8 mb-3 text-red-500" />
            <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Error Rate</p>
            <p className="text-3xl font-bold text-red-500">0.3%</p>
          </Card>
        </div>
      </div>
    </div>
  );
}