import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Heart, Moon, Zap, TrendingUp, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

/**
 * Consolidates data from multiple wearable devices
 * Uses priority and weighted averaging for conflicting metrics
 */
const consolidateDeviceData = (deviceDataArray) => {
  if (!deviceDataArray || deviceDataArray.length === 0) return null;
  
  // Priority order: Garmin > Apple Health > Fitbit (most accurate devices first)
  const priorityOrder = { garmin: 3, apple_health: 2, fitbit: 1 };
  
  const consolidated = {
    devices_used: [],
    data_quality: 'high'
  };
  
  // Sort by priority
  const sortedData = [...deviceDataArray].sort((a, b) => 
    (priorityOrder[b.device_type] || 0) - (priorityOrder[a.device_type] || 0)
  );
  
  // Track which metrics came from which device
  const metricSources = {};
  
  // Consolidate metrics
  const metrics = [
    'steps', 'calories_burned', 'active_minutes', 'heart_rate_avg', 
    'heart_rate_variability', 'sleep_hours', 'recovery_score', 'stress_level'
  ];
  
  metrics.forEach(metric => {
    const validValues = sortedData
      .filter(d => d[metric] != null && d[metric] > 0)
      .map(d => ({ value: d[metric], device: d.device_type, priority: priorityOrder[d.device_type] || 0 }));
    
    if (validValues.length === 0) return;
    
    if (validValues.length === 1) {
      // Single source - use it
      consolidated[metric] = validValues[0].value;
      metricSources[metric] = [validValues[0].device];
    } else {
      // Multiple sources - use weighted average based on priority
      const totalPriority = validValues.reduce((sum, v) => sum + v.priority, 0);
      const weightedSum = validValues.reduce((sum, v) => sum + (v.value * v.priority), 0);
      consolidated[metric] = Math.round(weightedSum / totalPriority);
      metricSources[metric] = validValues.map(v => v.device);
    }
    
    consolidated.devices_used.push(...validValues.map(v => v.device));
  });
  
  // Consolidate sleep stages (take most detailed data)
  const sleepStageData = sortedData.find(d => d.sleep_stages);
  if (sleepStageData) {
    consolidated.sleep_stages = sleepStageData.sleep_stages;
    metricSources.sleep_stages = [sleepStageData.device_type];
  }
  
  // Consolidate workout sessions (merge all)
  const allWorkouts = sortedData
    .filter(d => d.workout_sessions?.length > 0)
    .flatMap(d => d.workout_sessions.map(w => ({ ...w, source: d.device_type })));
  
  if (allWorkouts.length > 0) {
    // Remove duplicates based on time and type
    const uniqueWorkouts = allWorkouts.reduce((acc, workout) => {
      const key = `${workout.start_time}_${workout.type}`;
      if (!acc[key] || workout.source === 'garmin') {
        acc[key] = workout;
      }
      return acc;
    }, {});
    consolidated.workout_sessions = Object.values(uniqueWorkouts);
  }
  
  consolidated.devices_used = [...new Set(consolidated.devices_used)];
  consolidated.metric_sources = metricSources;
  
  return consolidated;
};

export default function MultiDeviceConsolidator({ deviceDataArray, showDetails = false }) {
  if (!deviceDataArray || deviceDataArray.length === 0) {
    return null;
  }
  
  const consolidated = consolidateDeviceData(deviceDataArray);
  
  if (!consolidated) return null;
  
  const metrics = [
    { key: 'steps', label: 'Steps', icon: Activity, color: 'blue', format: (v) => v?.toLocaleString() },
    { key: 'heart_rate_avg', label: 'Avg Heart Rate', icon: Heart, color: 'red', format: (v) => `${v} bpm`, suffix: 'bpm' },
    { key: 'sleep_hours', label: 'Sleep', icon: Moon, color: 'purple', format: (v) => `${v?.toFixed(1)}h`, suffix: 'h' },
    { key: 'active_minutes', label: 'Active Minutes', icon: Zap, color: 'orange', format: (v) => v },
  ];
  
  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            Consolidated Health Data
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Data from {consolidated.devices_used.length} connected device{consolidated.devices_used.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {consolidated.devices_used.map(device => (
            <Badge key={device} className="bg-green-500/20 text-green-400 text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {device.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(metric => {
          const Icon = metric.icon;
          const value = consolidated[metric.key];
          const sources = consolidated.metric_sources?.[metric.key] || [];
          
          if (!value) return null;
          
          return (
            <div key={metric.key} className="p-4 rounded-xl" style={{ background: 'var(--background)' }}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 text-${metric.color}-400`} />
                {showDetails && sources.length > 1 && (
                  <Badge variant="outline" className="text-xs">
                    {sources.length} sources
                  </Badge>
                )}
              </div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                {metric.label}
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {metric.format(value)}
              </p>
              {showDetails && sources.length > 0 && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {sources.length > 1 ? 'Averaged' : sources[0].replace('_', ' ')}
                </p>
              )}
            </div>
          );
        })}
      </div>
      
      {consolidated.recovery_score && (
        <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--background)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Recovery Score
            </span>
            <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {consolidated.recovery_score}/100
            </span>
          </div>
          <Progress value={consolidated.recovery_score} className="h-2" />
        </div>
      )}
      
      {showDetails && consolidated.workout_sessions?.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Today's Workouts ({consolidated.workout_sessions.length})
          </h4>
          <div className="space-y-2">
            {consolidated.workout_sessions.map((workout, idx) => (
              <div key={idx} className="p-3 rounded-xl flex items-center justify-between"
                style={{ background: 'var(--background)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {workout.type}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {workout.duration} min • {workout.calories} cal
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {workout.source?.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export { consolidateDeviceData };