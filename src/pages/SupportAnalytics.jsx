import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, AlertCircle, Users, ArrowLeft, Download, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { hasPermission, PERMISSIONS } from '../components/admin/permissions';
import { AccessDenied } from '../components/admin/PermissionGate';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, differenceInHours } from 'date-fns';

export default function SupportAnalytics() {
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['all-tickets-analytics'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date', 500),
  });

  const { data: userReports = [] } = useQuery({
    queryKey: ['user-reports-analytics'],
    queryFn: () => base44.entities.UserReport.list('-created_date', 500),
  });

  const { data: supportTeam = [] } = useQuery({
    queryKey: ['support-team-analytics'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list();
      return allUsers.filter(u => ['support', 'support_lead', 'admin'].includes(u.role));
    },
  });

  if (!currentUser || !hasPermission(currentUser, PERMISSIONS.VIEW_ALL_TICKETS)) {
    return <AccessDenied />;
  }

  // Calculate resolution times
  const resolvedTickets = tickets.filter(t => t.resolved_at);
  const avgResolutionTime = resolvedTickets.length > 0
    ? resolvedTickets.reduce((sum, t) => {
        const hours = differenceInHours(new Date(t.resolved_at), new Date(t.created_date));
        return sum + hours;
      }, 0) / resolvedTickets.length
    : 0;

  // Tickets by status
  const statusCounts = {
    open: tickets.filter(t => t.status === 'open').length,
    assigned: tickets.filter(t => t.status === 'assigned').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length
  };

  // Common issues (by category)
  const categoryData = [
    { name: 'Technical', value: tickets.filter(t => t.category === 'technical').length, color: '#3B82F6' },
    { name: 'Billing', value: tickets.filter(t => t.category === 'billing').length, color: '#10B981' },
    { name: 'Account', value: tickets.filter(t => t.category === 'account').length, color: '#F59E0B' },
    { name: 'Bug Report', value: tickets.filter(t => t.category === 'bug_report').length, color: '#EF4444' },
    { name: 'Feature Request', value: tickets.filter(t => t.category === 'feature_request').length, color: '#8B5CF6' }
  ].filter(c => c.value > 0);

  // Agent performance
  const agentPerformance = supportTeam.map(agent => {
    const agentTickets = tickets.filter(t => t.assigned_to === agent.email);
    const resolved = agentTickets.filter(t => t.status === 'resolved' || t.status === 'closed');
    const avgTime = resolved.length > 0
      ? resolved.reduce((sum, t) => {
          if (!t.resolved_at) return sum;
          return sum + differenceInHours(new Date(t.resolved_at), new Date(t.created_date));
        }, 0) / resolved.length
      : 0;

    return {
      name: agent.email.split('@')[0],
      assigned: agentTickets.length,
      resolved: resolved.length,
      avgTime: avgTime.toFixed(1)
    };
  }).sort((a, b) => b.resolved - a.resolved);

  // Tickets over time
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(new Date(), 29 - i), 'MMM dd');
    const dayTickets = tickets.filter(t => 
      format(new Date(t.created_date), 'MMM dd') === date
    );
    const dayResolved = dayTickets.filter(t => t.resolved_at);
    
    return {
      date,
      created: dayTickets.length,
      resolved: dayResolved.length,
      open: dayTickets.filter(t => t.status === 'open').length
    };
  });

  const exportReport = () => {
    const csv = [
      ['Metric', 'Value'],
      ['Total Tickets', tickets.length],
      ['Open', statusCounts.open],
      ['Resolved', statusCounts.resolved],
      ['Avg Resolution Time (hours)', avgResolutionTime.toFixed(1)],
      ['', ''],
      ['Agent', 'Assigned', 'Resolved', 'Avg Time (hours)'],
      ...agentPerformance.map(a => [a.name, a.assigned, a.resolved, a.avgTime])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `support-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Support Analytics
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Ticket resolution insights and team performance
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
            <AlertCircle className="w-8 h-8 text-yellow-500 mb-2" />
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Open Tickets</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {statusCounts.open}
            </p>
          </Card>
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Resolved</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {statusCounts.resolved}
            </p>
          </Card>
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <Clock className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Avg Resolution Time</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {avgResolutionTime.toFixed(1)}h
            </p>
          </Card>
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <Users className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Support Team</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {supportTeam.length}
            </p>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Team Performance</TabsTrigger>
            <TabsTrigger value="issues">Common Issues</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Ticket Trends (30 Days)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={last30Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="created" stroke="#3B82F6" strokeWidth={2} name="Created" />
                    <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} name="Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Ticket Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Open', value: statusCounts.open, color: '#F59E0B' },
                        { name: 'Assigned', value: statusCounts.assigned, color: '#3B82F6' },
                        { name: 'In Progress', value: statusCounts.inProgress, color: '#8B5CF6' },
                        { name: 'Resolved', value: statusCounts.resolved, color: '#10B981' },
                        { name: 'Closed', value: statusCounts.closed, color: '#6B7280' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {[
                        '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#6B7280'
                      ].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Agent Performance
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={agentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="assigned" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Assigned" />
                  <Bar dataKey="resolved" fill="#10B981" radius={[8, 8, 0, 0]} name="Resolved" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-2">
                {agentPerformance.map((agent, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {agent.name}
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {agent.resolved} resolved / {agent.assigned} assigned
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Avg Resolution</p>
                        <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                          {agent.avgTime}h
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="issues">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Issues by Category
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Top Issues
                </h3>
                <div className="space-y-3">
                  {categoryData.sort((a, b) => b.value - a.value).map((cat, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 rounded-xl"
                      style={{ background: 'var(--background)' }}
                    >
                      <span style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                      <span className="text-xl font-bold" style={{ color: cat.color }}>
                        {cat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}