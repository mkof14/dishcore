import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2, Database, FileJson, FileText } from "lucide-react";
import { toast } from "sonner";

export default function DataExport() {
  const [exporting, setExporting] = useState(false);

  const exportAllData = async () => {
    setExporting(true);
    toast.info('Preparing your data...');

    try {
      // Fetch all user data
      const [
        profile,
        mealLogs,
        dishes,
        measurements,
        goals,
        userProgress,
        wearableData
      ] = await Promise.all([
        base44.entities.UserProfile.list(),
        base44.entities.MealLog.list('-created_date', 1000),
        base44.entities.Dish.filter({ is_custom: true }),
        base44.entities.BodyMeasurement.list('-date'),
        base44.entities.BodyGoal.list(),
        base44.entities.UserProgress.list(),
        base44.entities.WearableData.list('-date', 100)
      ]);

      const exportData = {
        export_date: new Date().toISOString(),
        export_version: '1.0',
        user_profile: profile[0] || null,
        meal_logs: mealLogs,
        custom_dishes: dishes,
        body_measurements: measurements,
        goals: goals,
        progress: userProgress[0] || null,
        wearable_data: wearableData,
        statistics: {
          total_meals_logged: mealLogs.length,
          total_custom_dishes: dishes.length,
          total_measurements: measurements.length,
          date_range: {
            first_log: mealLogs[mealLogs.length - 1]?.date,
            last_log: mealLogs[0]?.date
          }
        }
      };

      // Create downloadable file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dishcore-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const exportCSV = async () => {
    setExporting(true);
    toast.info('Generating CSV...');

    try {
      const mealLogs = await base44.entities.MealLog.list('-created_date', 1000);

      // Convert to CSV
      const headers = ['Date', 'Meal Type', 'Dish Name', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)'];
      const rows = mealLogs.map(log => [
        log.date,
        log.meal_type,
        log.dish_name,
        log.calories || 0,
        log.protein || 0,
        log.carbs || 0,
        log.fat || 0
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dishcore-meals-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('CSV exported!');
    } catch (error) {
      console.error('CSV export failed:', error);
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6" style={{ color: 'var(--accent-from)' }} />
        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Export Your Data
        </h3>
      </div>
      
      <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Download all your DishCore data for backup or migration. GDPR compliant.
      </p>

      <div className="space-y-3">
        <Button
          onClick={exportAllData}
          disabled={exporting}
          className="w-full gradient-accent text-white border-0"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileJson className="w-4 h-4 mr-2" />
          )}
          Export Complete Data (JSON)
        </Button>

        <Button
          onClick={exportCSV}
          disabled={exporting}
          variant="outline"
          className="w-full"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          Export Meals Only (CSV)
        </Button>
      </div>

      <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        Your data includes: profile, meal logs, custom recipes, measurements, goals, and progress tracking.
      </p>
    </Card>
  );
}