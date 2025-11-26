import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Trash2, Archive, Filter } from 'lucide-react';
import { format } from 'date-fns';
import Pagination from '../components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function NotificationHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const pageSize = 20;
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications-history', currentPage, filter],
    queryFn: async () => {
      const query = filter === 'all' ? {} : { type: filter };
      return base44.entities.Notification.filter(query, '-created_date', pageSize * currentPage);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications-history']);
    },
  });

  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(notifications.length / pageSize);

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-500/20 text-gray-400',
      medium: 'bg-blue-500/20 text-blue-400',
      high: 'bg-orange-500/20 text-orange-400',
      critical: 'bg-red-500/20 text-red-400'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Notification History
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              View all your past notifications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="meal_reminder">Meal Reminders</SelectItem>
                <SelectItem value="water_reminder">Water</SelectItem>
                <SelectItem value="progress_update">Progress</SelectItem>
                <SelectItem value="goal_achieved">Goals</SelectItem>
                <SelectItem value="system_alert">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-24 animate-pulse gradient-card border-0" />
            ))}
          </div>
        ) : paginatedNotifications.length > 0 ? (
          <>
            <div className="space-y-3">
              {paginatedNotifications.map(notification => (
                <Card key={notification.id} className="gradient-card border-0 p-4 rounded-2xl"
                  role="article"
                  aria-label={`Notification: ${notification.title}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {notification.title}
                          </h3>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                          {notification.message}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {format(new Date(notification.created_date), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteNotificationMutation.mutate(notification.id)}
                      aria-label="Delete notification"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
            <Archive className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--accent-from)' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No notifications
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {filter === 'all' ? 'You have no notifications yet' : 'No notifications of this type'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}