import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Bell, Save, ArrowLeft, Clock, Droplet, Utensils, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function NotificationSettings() {
  const queryClient = useQueryClient();

  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreference.list();
      return prefs[0] || null;
    },
  });

  const [settings, setSettings] = useState(preferences || {
    meal_logging_enabled: true,
    meal_logging_times: ['08:00', '12:00', '18:00'],
    water_reminder_enabled: true,
    water_reminder_interval: 120,
    menu_planning_enabled: true,
    menu_planning_frequency: 'weekly',
    progress_updates_enabled: true,
    goal_reminders_enabled: true,
    push_notifications_enabled: false,
    email_notifications_enabled: true,
  });

  React.useEffect(() => {
    if (preferences) {
      setSettings(preferences);
    }
  }, [preferences]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences?.id) {
        return await base44.entities.NotificationPreference.update(preferences.id, data);
      } else {
        return await base44.entities.NotificationPreference.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notification-preferences']);
      toast.success('Notification preferences saved');
    },
    onError: () => {
      toast.error('Failed to save preferences');
    }
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const handleTimeChange = (index, value) => {
    const newTimes = [...settings.meal_logging_times];
    newTimes[index] = value;
    setSettings({ ...settings, meal_logging_times: newTimes });
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Notification Settings
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Manage your reminder preferences
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gradient-accent text-white border-0 gap-2">
              <Save className="w-4 h-4" />
              Save
            </Button>
            <Link to={createPageUrl('Settings')}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        {/* Meal Logging Reminders */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                Meal Logging Reminders
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Get reminded to log your meals
              </p>
            </div>
            <Switch
              checked={settings.meal_logging_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, meal_logging_enabled: checked })}
            />
          </div>

          {settings.meal_logging_enabled && (
            <div className="space-y-3">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Reminder Times
              </p>
              <div className="grid gap-3">
                {settings.meal_logging_times?.map((time, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Water Reminders */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                Water Reminders
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Stay hydrated throughout the day
              </p>
            </div>
            <Switch
              checked={settings.water_reminder_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, water_reminder_enabled: checked })}
            />
          </div>

          {settings.water_reminder_enabled && (
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Reminder Interval (minutes)
              </p>
              <Input
                type="number"
                value={settings.water_reminder_interval}
                onChange={(e) => setSettings({ ...settings, water_reminder_interval: parseInt(e.target.value) })}
                min="30"
                max="480"
              />
            </div>
          )}
        </Card>

        {/* Menu Planning */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                Menu Planning Reminders
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Plan your meals ahead of time
              </p>
            </div>
            <Switch
              checked={settings.menu_planning_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, menu_planning_enabled: checked })}
            />
          </div>

          {settings.menu_planning_enabled && (
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Reminder Frequency
              </p>
              <Select
                value={settings.menu_planning_frequency}
                onValueChange={(value) => setSettings({ ...settings, menu_planning_frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </Card>

        {/* Other Notifications */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
            Other Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--background)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Progress Updates</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Weekly progress summaries</p>
              </div>
              <Switch
                checked={settings.progress_updates_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, progress_updates_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--background)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Goal Reminders</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Reminders for your goals</p>
              </div>
              <Switch
                checked={settings.goal_reminders_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, goal_reminders_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--background)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Push Notifications</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Browser push notifications</p>
              </div>
              <Switch
                checked={settings.push_notifications_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, push_notifications_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--background)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Email Notifications</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Receive notifications via email</p>
              </div>
              <Switch
                checked={settings.email_notifications_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, email_notifications_enabled: checked })}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}