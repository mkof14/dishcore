import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Watch, Heart, Activity, Moon, RefreshCw, CheckCircle2, ArrowLeft, Dumbbell, Zap } from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import DetailedMetricsChart from "../components/wearables/DetailedMetricsChart";
import WorkoutAnalysis from "../components/wearables/WorkoutAnalysis";
import AdvancedCorrelation from "../components/wearables/AdvancedCorrelation";
import MultiDeviceConsolidator from "../components/wearables/MultiDeviceConsolidator";
import AIWearableInsights from "../components/wearables/AIWearableInsights";

const DEVICES = [
  { id: 'fitbit', name: 'Fitbit', icon: Activity, gradient: 'from-teal-400 to-cyan-500' },
  { id: 'apple_health', name: 'Apple Health', icon: Heart, gradient: 'from-red-400 to-pink-500' },
  { id: 'garmin', name: 'Garmin', icon: Watch, gradient: 'from-blue-400 to-indigo-500' },
];

export default function WearablesSettings() {
  const [connectedDevices, setConnectedDevices] = useState(() => {
    return JSON.parse(localStorage.getItem('connected-wearables') || '[]');
  });
  const queryClient = useQueryClient();

  const { data: wearableData = [] } = useQuery({
    queryKey: ['wearableData'],
    queryFn: () => base44.entities.WearableData.list('-date', 30),
  });

  // Get today's data from all connected devices
  const today = new Date().toISOString().split('T')[0];
  const todayDeviceData = wearableData.filter(d => d.date === today);

  const { data: logs = [] } = useQuery({
    queryKey: ['mealLogs'],
    queryFn: () => base44.entities.MealLog.list('-date', 30),
  });

  const syncMutation = useMutation({
    mutationFn: async (deviceId) => {
      // Simulate API call for syncing data
      await new Promise(resolve => setTimeout(resolve, 2000));
      // In a real application, you would call an actual API endpoint here
      // For mock purposes, we return success
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wearableData']);
      toast.success('Data synced successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to sync data: ${error.message}`);
    }
  });

  const handleConnect = (deviceId) => {
    const updated = [...connectedDevices, deviceId];
    setConnectedDevices(updated);
    localStorage.setItem('connected-wearables', JSON.stringify(updated));
    toast.success(`${DEVICES.find(d => d.id === deviceId)?.name} connected!`);
    // Optionally trigger an initial sync upon connection
    // syncMutation.mutate(deviceId);
  };

  const handleDisconnect = (deviceId) => {
    const updated = connectedDevices.filter(id => id !== deviceId);
    setConnectedDevices(updated);
    localStorage.setItem('connected-wearables', JSON.stringify(updated));
    toast.success('Device disconnected');
  };

  const scoreData = logs.map(log => ({
    date: log.date,
    // This is a placeholder; in a real app, DishCoreScore would be calculated
    dishCoreScore: 75 
  }));

  const latestData = wearableData[0];

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = createPageUrl('Dashboard')}
              className="w-12 h-12 rounded-2xl btn-secondary flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Advanced Wearables
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                Comprehensive health tracking & AI correlations
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Device Consolidated Data */}
        {todayDeviceData.length > 0 && (
          <MultiDeviceConsolidator 
            deviceDataArray={todayDeviceData}
            showDetails={connectedDevices.length > 1}
          />
        )}

        {/* AI Insights */}
        {wearableData.length >= 3 && (
          <AIWearableInsights 
            wearableData={latestData}
            recentDays={7}
          />
        )}

        <Tabs defaultValue="metrics">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-6">
            <DetailedMetricsChart data={wearableData} metric="heart_rate_variability" title="Heart Rate Variability (HRV)" unit="ms" />
            <DetailedMetricsChart data={wearableData} metric="sleep_stages.deep_sleep" title="Deep Sleep" unit="hours" />
            <DetailedMetricsChart data={wearableData} metric="stress_level" title="Stress Level" unit="" />
          </TabsContent>

          <TabsContent value="workouts">
            <WorkoutAnalysis data={wearableData} />
          </TabsContent>

          <TabsContent value="correlations">
            <AdvancedCorrelation wearableData={wearableData} scoreData={scoreData} />
          </TabsContent>

          <TabsContent value="insights">
            <AIWearableInsights 
              wearableData={latestData}
              recentDays={14}
            />
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            {DEVICES.map(device => {
              const Icon = device.icon;
              const isConnected = connectedDevices.includes(device.id);
              
              return (
                <Card key={device.id} className="gradient-card border-0 p-6 rounded-3xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${device.gradient} flex items-center justify-center shadow-xl`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                          {device.name}
                          {isConnected && (
                            <Badge className="bg-green-500/20 text-green-400">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {isConnected ? 'Syncing health data automatically' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isConnected ? (
                        <>
                          <Button
                            onClick={() => syncMutation.mutate(device.id)}
                            disabled={syncMutation.isPending}
                            variant="outline"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                            Sync
                          </Button>
                          <Button
                            onClick={() => handleDisconnect(device.id)}
                            variant="outline"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleConnect(device.id)}
                          className="gradient-accent text-white border-0"
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}

            <Card className="gradient-card border-0 p-6 rounded-3xl bg-blue-500/10 border-blue-500/30">
              <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                📊 Enhanced Data Tracking
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Connected wearables provide advanced metrics like Heart Rate Variability (HRV), 
                sleep stages, workout analysis, stress levels, and recovery scores. 
                This data correlates with your DishCore Score to provide deeper health insights.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}