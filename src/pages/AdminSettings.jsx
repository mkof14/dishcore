import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, Globe, Mail, Database, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'DishCore',
    maintenanceMode: false,
    registrationEnabled: true,
    maxUsersPerPlan: 10000,
    apiRateLimit: 100,
    dataRetentionDays: 90,
    autoBackup: true,
    emailNotifications: true
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              System Settings
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Configure application settings
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gradient-accent text-white border-0 gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
            <Link to={createPageUrl('Admin')}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                General Settings
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                    Site Name
                  </label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    placeholder="Site Name"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Maintenance Mode</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Put site in maintenance mode</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>User Registration</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Allow new user registrations</p>
                  </div>
                  <Switch
                    checked={settings.registrationEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, registrationEnabled: checked})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                    Max Users Per Plan
                  </label>
                  <Input
                    type="number"
                    value={settings.maxUsersPerPlan}
                    onChange={(e) => setSettings({...settings, maxUsersPerPlan: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Security Settings
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                    API Rate Limit (requests/min)
                  </label>
                  <Input
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={(e) => setSettings({...settings, apiRateLimit: parseInt(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                    Data Retention Period (days)
                  </label>
                  <Input
                    type="number"
                    value={settings.dataRetentionDays}
                    onChange={(e) => setSettings({...settings, dataRetentionDays: parseInt(e.target.value)})}
                  />
                </div>

                <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>SSL Certificate</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">Active & Valid</Badge>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    Expires: Dec 18, 2026
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Email Configuration
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Email Notifications</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Send system email notifications</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                    SMTP Server
                  </label>
                  <Input placeholder="smtp.example.com" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                    From Email
                  </label>
                  <Input placeholder="noreply@dishcore.life" />
                </div>

                <Button variant="outline">Test Email Configuration</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Database Settings
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Automatic Backups</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Daily automatic database backups</p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                    <Database className="w-8 h-8 mb-3 text-blue-500" />
                    <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Database Size</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>2.4 GB</p>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                    <Database className="w-8 h-8 mb-3 text-green-500" />
                    <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Last Backup</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>2h ago</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline">Create Backup Now</Button>
                  <Button variant="outline">Restore from Backup</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}