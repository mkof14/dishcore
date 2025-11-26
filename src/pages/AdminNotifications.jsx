import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, MessageSquare, Send, ArrowLeft, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { hasPermission, PERMISSIONS } from '../components/admin/permissions';
import { AccessDenied } from '../components/admin/PermissionGate';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminNotifications() {
  const queryClient = useQueryClient();
  const [filterPriority, setFilterPriority] = useState('all');
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    priority: 'medium',
    type: 'system_alert'
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: systemNotifications = [] } = useQuery({
    queryKey: ['admin-notifications', filterPriority],
    queryFn: async () => {
      const all = await base44.entities.Notification.filter({ is_admin: true }, '-created_date', 100);
      return filterPriority === 'all' 
        ? all 
        : all.filter(n => n.priority === filterPriority);
    },
  });

  const { data: userReports = [] } = useQuery({
    queryKey: ['user-reports'],
    queryFn: () => base44.entities.UserReport.filter({}, '-created_date', 50),
  });

  const createNotificationMutation = useMutation({
    mutationFn: (data) => base44.entities.Notification.create({
      ...data,
      is_admin: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-notifications']);
      toast.success('Notification created');
      setNewNotification({ title: '', message: '', priority: 'medium', type: 'system_alert' });
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserReport.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-reports']);
      toast.success('Report updated');
    },
  });

  if (currentUser && !hasPermission(currentUser, PERMISSIONS.VIEW_SUPPORT_TICKETS)) {
    return <AccessDenied />;
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'medium': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-500/20 text-red-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'resolved': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Admin Notifications
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              System alerts and user reports
            </p>
          </div>
          <Link to={createPageUrl('Admin')}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="system" className="space-y-6">
          <TabsList>
            <TabsTrigger value="system">System Alerts ({systemNotifications.length})</TabsTrigger>
            <TabsTrigger value="reports">User Reports ({userReports.filter(r => r.status === 'open').length})</TabsTrigger>
            <TabsTrigger value="create">Create Alert</TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <div className="space-y-2">
                {systemNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 rounded-2xl"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <AlertTriangle className="w-5 h-5 mt-1" style={{ color: 'var(--accent-from)' }} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {notification.title}
                            </p>
                            <Badge className={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                            {notification.message}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {new Date(notification.created_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <div className="space-y-2">
                {userReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-2xl"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <MessageSquare className="w-5 h-5 mt-1 text-blue-500" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {report.title}
                            </p>
                            <Badge className={getPriorityColor(report.priority)}>
                              {report.priority}
                            </Badge>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                            {report.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span>Type: {report.type}</span>
                            <span>By: {report.created_by}</span>
                            <span>{new Date(report.created_date).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <Select
                        value={report.status}
                        onValueChange={(status) => 
                          updateReportMutation.mutate({ id: report.id, data: { status } })
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Create System Alert
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                    Title
                  </label>
                  <Input
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    placeholder="Alert title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                    Message
                  </label>
                  <Textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    placeholder="Alert message"
                    rows={4}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                      Priority
                    </label>
                    <Select
                      value={newNotification.priority}
                      onValueChange={(priority) => setNewNotification({ ...newNotification, priority })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                      Type
                    </label>
                    <Select
                      value={newNotification.type}
                      onValueChange={(type) => setNewNotification({ ...newNotification, type })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system_alert">System Alert</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="critical_error">Critical Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={() => createNotificationMutation.mutate(newNotification)}
                  className="w-full gradient-accent text-white border-0 gap-2"
                  disabled={!newNotification.title || !newNotification.message}
                >
                  <Send className="w-4 h-4" />
                  Send Alert
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}