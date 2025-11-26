
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download, 
  Share2, 
  Copy,
  Printer,
  FileSpreadsheet,
  AlertCircle,
  ArrowLeft,
  TrendingUp,
  Activity,
  Apple,
  Brain
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays } from "date-fns";
import { createPageUrl } from "@/utils";
import GenerateReportDialog from "../components/reports/GenerateReportDialog";
import ReportPreview from "../components/reports/ReportPreview";
import ShareDialog from "../components/reports/ShareDialog";
import FoodImpactAnalysis from "../components/reports/FoodImpactAnalysis";
import AdvancedCorrelations from "../components/reports/AdvancedCorrelations";
import DetailedBreakdown from "../components/reports/DetailedBreakdown";

export default function Reports() {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState(null);

  const { data: measurements = [] } = useQuery({
    queryKey: ['bodyMeasurements'],
    queryFn: () => base44.entities.BodyMeasurement.list('-date', 100),
  });

  const { data: bodyGoals = [] } = useQuery({
    queryKey: ['bodyGoals'],
    queryFn: () => base44.entities.BodyGoal.list('-created_date'),
  });

  const { data: customGoals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
  });

  const { data: mealLogs = [] } = useQuery({
    queryKey: ['mealLogs'],
    queryFn: () => base44.entities.MealLog.list('-date', 200),
  });

  const { data: wearableData = [] } = useQuery({
    queryKey: ['wearableData'],
    queryFn: () => base44.entities.WearableData.list('-date', 100),
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return { email: 'user@example.com', full_name: 'User' };
      }
    },
  });

  const generateReport = async (config) => {
    setIsGenerating(true);
    setProgress(0);
    setShowGenerateDialog(false);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      const daysCount = config.range === '7d' ? 7 : config.range === '30d' ? 30 : 90;
      const periodLogs = mealLogs.filter(log => {
        const logDate = new Date(log.date);
        const cutoffDate = subDays(new Date(), daysCount);
        return logDate >= cutoffDate;
      });

      const periodWearable = wearableData.filter(w => {
        const wDate = new Date(w.date);
        const cutoffDate = subDays(new Date(), daysCount);
        return wDate >= cutoffDate;
      });

      const reportData = {
        user: {
          id: user?.id || Math.random().toString(36).substr(2, 9),
          email: user?.email || 'user@example.com',
          full_name: user?.full_name || 'User'
        },
        profile,
        measurements: measurements.slice(0, daysCount),
        bodyGoals: bodyGoals.filter(g => g.is_active),
        customGoals: customGoals.filter(g => g.status === 'active'),
        mealLogs: periodLogs,
        wearableData: periodWearable,
        generatedAt: new Date().toISOString(),
        config,
        period: daysCount
      };

      setProgress(100);
      clearInterval(progressInterval);

      setTimeout(() => {
        setGeneratedReport(reportData);
        setIsGenerating(false);
        setProgress(0);
        toast.success('Report generated successfully!');
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setProgress(0);
      toast.error('Failed to generate report');
    }
  };

  const downloadCSV = () => {
    if (!generatedReport) return;

    const csvSections = [];

    // Measurements
    if (generatedReport.config.sections.includes('body')) {
      csvSections.push('BODY MEASUREMENTS');
      csvSections.push(['Date', 'Weight (kg)', 'Waist (cm)', 'Hips (cm)', 'Body Fat %', 'BMI'].join(','));
      generatedReport.measurements.forEach(m => {
        csvSections.push([m.date, m.weight || '', m.waist || '', m.hips || '', m.body_fat_percentage || '', m.bmi || ''].join(','));
      });
      csvSections.push('');
    }

    // Nutrition
    if (generatedReport.config.sections.includes('nutrition')) {
      csvSections.push('NUTRITION DATA');
      csvSections.push(['Date', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)'].join(','));
      const dailyNutrition = {};
      generatedReport.mealLogs.forEach(log => {
        if (!dailyNutrition[log.date]) {
          dailyNutrition[log.date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        dailyNutrition[log.date].calories += log.calories || 0;
        dailyNutrition[log.date].protein += log.protein || 0;
        dailyNutrition[log.date].carbs += log.carbs || 0;
        dailyNutrition[log.date].fat += log.fat || 0;
      });
      Object.entries(dailyNutrition).forEach(([date, data]) => {
        csvSections.push([date, data.calories, data.protein, data.carbs, data.fat].join(','));
      });
      csvSections.push('');
    }

    // Wearable Data
    if (generatedReport.config.sections.includes('activity') && generatedReport.wearableData.length > 0) {
      csvSections.push('ACTIVITY & SLEEP DATA');
      csvSections.push(['Date', 'Steps', 'Active Min', 'Sleep (h)', 'Heart Rate', 'HRV', 'Recovery Score'].join(','));
      generatedReport.wearableData.forEach(w => {
        csvSections.push([
          w.date, 
          w.steps || '', 
          w.active_minutes || '', 
          w.sleep_hours || '', 
          w.heart_rate_avg || '', 
          w.heart_rate_variability || '',
          w.recovery_score || ''
        ].join(','));
      });
      csvSections.push('');
    }

    // Goals
    if (generatedReport.config.sections.includes('goals')) {
      csvSections.push('GOALS PROGRESS');
      csvSections.push(['Goal', 'Type', 'Current', 'Target', 'Status'].join(','));
      generatedReport.customGoals.forEach(g => {
        csvSections.push([g.title, g.metric, g.current_value, g.target_value, g.status].join(','));
      });
    }

    const csv = csvSections.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dishcore-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('CSV downloaded successfully!');
  };

  const downloadPDF = async () => {
    toast.info('PDF generation feature - share this report with your healthcare provider');
  };

  const copyData = () => {
    if (!generatedReport || !generatedReport.measurements[0]) return;

    const current = generatedReport.measurements[0];
    const baseline = generatedReport.measurements[generatedReport.measurements.length - 1];

    const text = `📊 DishCore Health Report

User: ${generatedReport.user.full_name}
Generated: ${format(new Date(generatedReport.generatedAt), 'PPP')}
Period: ${generatedReport.period} days

Current Metrics:
Weight: ${current.weight?.toFixed(1)} kg
Waist: ${current.waist?.toFixed(0)} cm
BMI: ${current.bmi?.toFixed(1)}

Progress:
Weight Change: ${((current.weight || 0) - (baseline.weight || 0)).toFixed(1)} kg
Waist Change: ${((current.waist || 0) - (baseline.waist || 0)).toFixed(0)} cm

---
Generated by DishCore
biomathcore.com

⚕️ Disclaimer: This report is for wellness purposes only. Not medical advice.`;

    navigator.clipboard.writeText(text);
    toast.success('Report summary copied!');
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Medical Disclaimer */}
        <Card className="border-orange-500/20 bg-orange-500/5 p-4 rounded-2xl">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <strong>Wellness & Informational Purpose:</strong> Reports are for wellness tracking only. 
              Not intended as medical advice, diagnosis, or treatment. Consult healthcare professionals for medical decisions.
            </div>
          </div>
        </Card>

        {/* Header */}
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
                Advanced Reports
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                Comprehensive health analytics with export & sharing
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowGenerateDialog(true)}
            className="gradient-accent text-white border-0 shadow-lg"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="gradient-card border-0 p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Data Points</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {mealLogs.length + measurements.length + wearableData.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="gradient-card border-0 p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Active Goals</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {customGoals.filter(g => g.status === 'active').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="gradient-card border-0 p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Apple className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Meals Logged</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {mealLogs.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Generating comprehensive report...
                    </span>
                    <span className="text-sm font-bold text-teal-500">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--background)' }}>
                    <motion.div
                      className="h-full gradient-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Analytics Tabs */}
        {!generatedReport && !isGenerating && (
          <Tabs defaultValue="correlations">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="correlations">Correlations</TabsTrigger>
              <TabsTrigger value="breakdown">Detailed Data</TabsTrigger>
              <TabsTrigger value="impact">Food Impact</TabsTrigger>
            </TabsList>

            <TabsContent value="correlations">
              <AdvancedCorrelations 
                mealLogs={mealLogs} 
                wearableData={wearableData}
                measurements={measurements}
              />
            </TabsContent>

            <TabsContent value="breakdown">
              <DetailedBreakdown 
                mealLogs={mealLogs}
                wearableData={wearableData}
                profile={profile}
              />
            </TabsContent>

            <TabsContent value="impact">
              <FoodImpactAnalysis 
                mealLogs={mealLogs} 
                wearableData={wearableData}
                profile={profile}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Report Preview & Actions */}
        {generatedReport && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Action Buttons */}
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <div className="flex flex-wrap gap-3">
                <Button onClick={downloadPDF} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={downloadCSV} variant="outline">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={copyData} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Summary
                </Button>
                <Button onClick={printReport} variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button onClick={() => setShowShareDialog(true)} className="gradient-accent text-white border-0">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Report
                </Button>
              </div>
            </Card>

            {/* Report Preview */}
            <ReportPreview report={generatedReport} />

            {/* Footer */}
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span>Powered by</span>
                  <a 
                    href="https://biomathcore.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-bold gradient-text hover:opacity-80 transition-opacity"
                  >
                    biomathcore.com
                  </a>
                </div>
                <p className="text-xs max-w-3xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                  © {new Date().getFullYear()} BioMath Core. This report is for wellness purposes only. 
                  Not medical advice. Consult healthcare professionals for medical guidance.
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {!generatedReport && !isGenerating && (
          <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Generate Comprehensive Report
              </h3>
              <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Create detailed reports consolidating nutrition, activity, sleep, and goal progress. 
                Perfect for tracking or sharing with health professionals.
              </p>
              <Button
                onClick={() => setShowGenerateDialog(true)}
                className="gradient-accent text-white border-0 shadow-lg"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Report
              </Button>
            </div>
          </Card>
        )}
      </motion.div>

      <GenerateReportDialog
        open={showGenerateDialog}
        onClose={() => setShowGenerateDialog(false)}
        onGenerate={generateReport}
      />

      <ShareDialog
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        report={generatedReport}
      />
    </div>
  );
}
