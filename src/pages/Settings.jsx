import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Globe, Ruler, Zap, Bell, Eye } from "lucide-react";
import { toast } from "sonner";
import DataExport from "../components/export/DataExport";
import ImportData from "../components/import/ImportData";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Shield } from 'lucide-react'; // New import
import { requestNotificationPermission } from "../components/notifications/PushNotifications";

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'uk', name: 'Українська' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'zh', name: '简体中文' },
  { code: 'pt', name: 'Português' },
  { code: 'tr', name: 'Türkçe' }
];

export default function Settings() {
  const [settings, setSettings] = useState({
    language: localStorage.getItem('dishcore-language') || 'en',
    weightUnit: localStorage.getItem('dishcore-weight-unit') || 'kg',
    heightUnit: localStorage.getItem('dishcore-height-unit') || 'cm',
    volumeUnit: localStorage.getItem('dishcore-volume-unit') || 'ml',
    temperatureUnit: localStorage.getItem('dishcore-temperature-unit') || 'celsius',
    energyUnit: localStorage.getItem('dishcore-energy-unit') || 'kcal',
    aiStrictness: parseInt(localStorage.getItem('dishcore-ai-strictness') || '50'),
    notifications: localStorage.getItem('dishcore-notifications') === 'true',
    mealReminders: localStorage.getItem('dishcore-meal-reminders') === 'true',
    waterReminders: localStorage.getItem('dishcore-water-reminders') === 'true',
    fontSize: parseInt(localStorage.getItem('dishcore-font-size') || '100')
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${settings.fontSize}%`;
  }, [settings.fontSize]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(`dishcore-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value.toString());
    
    if (key === 'fontSize') {
      document.documentElement.style.fontSize = `${value}%`;
    }
    
    toast.success('Setting updated');
    window.dispatchEvent(new Event('dishcore-settings-changed'));
  };

  const handleEnableNotifications = async (val) => {
    if (val) {
      const granted = await requestNotificationPermission();
      if (granted) {
        updateSetting('notifications', true);
      } else {
        toast.error('Notification permission denied');
      }
    } else {
      updateSetting('notifications', false);
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
            Customize your DishCore experience
          </p>
        </div>

        {/* Language Settings */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Language & Region
            </h2>
          </div>

          <div>
            <Label style={{ color: 'var(--text-secondary)' }}>Language</Label>
            <Select 
              value={settings.language} 
              onValueChange={(val) => updateSetting('language', val)}
            >
              <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Unit System Settings */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
              <Ruler className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Unit System
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Weight</Label>
              <Select 
                value={settings.weightUnit} 
                onValueChange={(val) => updateSetting('weightUnit', val)}
              >
                <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="lb">Pounds (lb)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Height</Label>
              <Select 
                value={settings.heightUnit} 
                onValueChange={(val) => updateSetting('heightUnit', val)}
              >
                <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">Centimeters (cm)</SelectItem>
                  <SelectItem value="in">Inches (in)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Volume</Label>
              <Select 
                value={settings.volumeUnit} 
                onValueChange={(val) => updateSetting('volumeUnit', val)}
              >
                <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ml">Milliliters (ml)</SelectItem>
                  <SelectItem value="oz">Ounces (oz)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Temperature</Label>
              <Select 
                value={settings.temperatureUnit} 
                onValueChange={(val) => updateSetting('temperatureUnit', val)}
              >
                <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celsius">Celsius (°C)</SelectItem>
                  <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Energy</Label>
              <Select 
                value={settings.energyUnit} 
                onValueChange={(val) => updateSetting('energyUnit', val)}
              >
                <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kcal">Kilocalories (kcal)</SelectItem>
                  <SelectItem value="kj">Kilojoules (kJ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* AI Preferences */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              AI Advisor Preferences
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label style={{ color: 'var(--text-secondary)' }}>
                  AI Strictness Level
                </Label>
                <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white">
                  {settings.aiStrictness}%
                </span>
              </div>
              <Slider
                value={[settings.aiStrictness]}
                onValueChange={(val) => updateSetting('aiStrictness', val[0])}
                min={0}
                max={100}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>Flexible Lifestyle</span>
                <span>Strict Health Rules</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Notifications & Reminders
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl" 
              style={{ background: 'var(--background)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Enable Notifications
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Receive updates and alerts
                </p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={handleEnableNotifications}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl" 
              style={{ background: 'var(--background)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Meal Reminders
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Get reminded to log meals
                </p>
              </div>
              <Switch
                checked={settings.mealReminders}
                onCheckedChange={(val) => updateSetting('mealReminders', val)}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl" 
              style={{ background: 'var(--background)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Water Reminders
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Stay hydrated throughout the day
                </p>
              </div>
              <Switch
                checked={settings.waterReminders}
                onCheckedChange={(val) => updateSetting('waterReminders', val)}
              />
            </div>
          </div>
        </Card>

        {/* Display Settings */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Display Settings
            </h2>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label style={{ color: 'var(--text-secondary)' }}>
                Font Size
              </Label>
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 text-white">
                {settings.fontSize}%
              </span>
            </div>
            <Slider
              value={[settings.fontSize]}
              onValueChange={(val) => updateSetting('fontSize', val[0])}
              min={80}
              max={140}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Small</span>
              <span>Normal</span>
              <span>Large</span>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <div className="grid md:grid-cols-2 gap-6">
          <DataExport />
          <ImportData />

          {/* Security Settings */}
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Shield className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
              Security & Privacy
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Manage your account security, two-factor authentication, and active sessions.
            </p>
            <Link to={createPageUrl('Security')}>
              <Button className="gradient-accent text-white border-0">
                Manage Security Settings
              </Button>
            </Link>
          </Card> {/* New component */}
        </div>

        {/* Privacy & Legal */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Privacy & Legal
          </h2>
          <div className="space-y-3">
            <a 
              href="/privacy-policy" 
              className="block p-4 rounded-2xl hover:scale-105 transition-transform"
              style={{ background: 'var(--background)', border: '1px solid var(--border-soft)' }}
            >
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Privacy Policy
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                How we handle your data
              </p>
            </a>
            <a 
              href="/terms" 
              className="block p-4 rounded-2xl hover:scale-105 transition-transform"
              style={{ background: 'var(--background)', border: '1px solid var(--border-soft)' }}
            >
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Terms of Service
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Terms and conditions
              </p>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}