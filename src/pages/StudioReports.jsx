import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, FileText, TrendingUp, Calendar, Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { toast } from "sonner";

export default function StudioReports() {
  const [reportType, setReportType] = useState('weekly'); // weekly, monthly
  const [sections, setSections] = useState({
    nutrition: true,
    bodyMetrics: true,
    dishcoreScore: true,
    menuAdherence: true,
    wearableData: true
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const { data: studioProfile } = useQuery({
    queryKey: ['studioProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.StudioProfile.list();
      return profiles[0] || null;
    },
  });

  const { data: mealLogs = [] } = useQuery({
    queryKey: ['mealLogs'],
    queryFn: () => base44.entities.MealLog.list('-date', 100),
  });

  const { data: measurements = [] } = useQuery({
    queryKey: ['bodyMeasurements'],
    queryFn: () => base44.entities.BodyMeasurement.list('-date', 60),
  });

  const { data: adaptiveMenus = [] } = useQuery({
    queryKey: ['adaptiveMenus'],
    queryFn: () => base44.entities.AdaptiveMenu.list('-date', 30),
  });

  const { data: wearableData = [] } = useQuery({
    queryKey: ['wearableData'],
    queryFn: () => base44.entities.WearableData.list('-date', 60),
  });

  // Calculate date range
  const days = reportType === 'weekly' ? 7 : 30;
  const dateRange = [...Array(days)].map((_, i) => 
    format(subDays(new Date(), days - 1 - i), 'yyyy-MM-dd')
  );

  // Nutrition data
  const nutritionData = dateRange.map(date => {
    const dayLogs = mealLogs.filter(log => log.date === date);
    return {
      date: format(new Date(date), reportType === 'weekly' ? 'EEE' : 'MMM d'),
      calories: dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0),
      protein: dayLogs.reduce((sum, log) => sum + (log.protein || 0), 0),
      carbs: dayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0),
      fat: dayLogs.reduce((sum, log) => sum + (log.fat || 0), 0),
    };
  });

  // DishCore Score data
  const scoreData = dateRange.map(date => {
    const dayLogs = mealLogs.filter(log => log.date === date);
    const calories = dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const protein = dayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
    const targetCalories = profile?.target_calories || 2000;
    const targetProtein = profile?.target_protein || 150;
    const proteinScore = Math.min(30, (protein / targetProtein) * 30);
    const calorieDeviation = Math.abs(calories - targetCalories) / targetCalories;
    const calorieScore = Math.max(0, 25 * (1 - calorieDeviation));
    const score = Math.round(proteinScore + calorieScore + 30);
    return {
      date: format(new Date(date), reportType === 'weekly' ? 'EEE' : 'MMM d'),
      score
    };
  });

  // Body metrics data
  const bodyData = dateRange.map(date => {
    const measurement = measurements.find(m => m.date === date);
    return {
      date: format(new Date(date), reportType === 'weekly' ? 'EEE' : 'MMM d'),
      weight: measurement?.weight || null,
      waist: measurement?.waist || null
    };
  }).filter(d => d.weight || d.waist);

  // Menu adherence
  const menuAdherence = dateRange.map(date => {
    const menu = adaptiveMenus.find(m => m.date === date);
    const dayLogs = mealLogs.filter(log => log.date === date);
    let adherence = 0;
    if (menu && menu.meals) {
      const matchedMeals = menu.meals.filter(plannedMeal => 
        dayLogs.some(log => log.dish_name === plannedMeal.dish_name)
      );
      adherence = (matchedMeals.length / menu.meals.length) * 100;
    }
    return {
      date: format(new Date(date), reportType === 'weekly' ? 'EEE' : 'MMM d'),
      adherence: Math.round(adherence)
    };
  });

  // Wearable data
  const wearableChartData = dateRange.map(date => {
    const dayData = wearableData.find(w => w.date === date);
    return {
      date: format(new Date(date), reportType === 'weekly' ? 'EEE' : 'MMM d'),
      steps: dayData?.steps || 0,
      sleep: dayData?.sleep_hours || 0,
      heartRate: dayData?.heart_rate_avg || 0,
      caloriesBurned: dayData?.calories_burned || 0
    };
  });

  // Summary stats
  const avgCalories = nutritionData.reduce((sum, d) => sum + d.calories, 0) / days;
  const avgProtein = nutritionData.reduce((sum, d) => sum + d.protein, 0) / days;
  const avgScore = scoreData.reduce((sum, d) => sum + d.score, 0) / days;
  const avgAdherence = menuAdherence.reduce((sum, d) => sum + d.adherence, 0) / days;
  const avgSteps = wearableChartData.reduce((sum, d) => sum + d.steps, 0) / days;
  const avgSleep = wearableChartData.reduce((sum, d) => sum + d.sleep, 0) / days;

  const latestWeight = bodyData[bodyData.length - 1]?.weight;
  const firstWeight = bodyData[0]?.weight;
  const weightChange = latestWeight && firstWeight ? latestWeight - firstWeight : 0;

  const handleExportPDF = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('PDF report downloaded (demo)');
    setIsGenerating(false);
  };

  const handleExportCSV = () => {
    const csvData = [
      ['Date', 'Calories', 'Protein', 'Carbs', 'Fat', 'DishCore Score', 'Weight', 'Waist', 'Menu Adherence', 'Steps', 'Sleep (h)', 'Heart Rate'].join(','),
      ...dateRange.map((date, idx) => [
        date,
        nutritionData[idx].calories,
        nutritionData[idx].protein,
        nutritionData[idx].carbs,
        nutritionData[idx].fat,
        scoreData[idx].score,
        bodyData.find(d => d.date === nutritionData[idx].date)?.weight || '',
        bodyData.find(d => d.date === nutritionData[idx].date)?.waist || '',
        menuAdherence[idx].adherence,
        wearableChartData[idx].steps,
        wearableChartData[idx].sleep,
        wearableChartData[idx].heartRate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dishcore-studio-report-${reportType}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('CSV exported successfully!');
  };

  return (
    <div className="min-h-screen bg-[#0B0F18] text-white">
      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => window.location.href = createPageUrl('StudioHub')}
              className="w-12 h-12 rounded-2xl bg-[#141A27] border border-white/10 flex items-center justify-center hover:bg-[#1B2231] hover:border-teal-500/50 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Studio Reports
              </h1>
              <p className="text-lg text-gray-400">
                Comprehensive analytics with wearable insights
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="px-5 py-3 bg-[#141A27] border border-white/10 rounded-2xl hover:bg-[#1B2231] hover:border-teal-500/50 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isGenerating}
              className="px-5 py-3 bg-gradient-to-br from-teal-400 to-green-400 text-white rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-teal-500/30"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {isGenerating ? 'Generating...' : 'Export PDF'}
            </button>
          </div>
        </div>

        {/* Report Controls */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Period Selection */}
          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-6 border border-white/5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-400" />
              Report Period
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setReportType('weekly')}
                className={`flex-1 px-4 py-3 rounded-xl transition-all ${
                  reportType === 'weekly'
                    ? 'bg-gradient-to-br from-teal-400 to-green-400 text-white'
                    : 'bg-[#0B0F18] border border-white/10 hover:border-white/20'
                }`}
              >
                Weekly (7 days)
              </button>
              <button
                onClick={() => setReportType('monthly')}
                className={`flex-1 px-4 py-3 rounded-xl transition-all ${
                  reportType === 'monthly'
                    ? 'bg-gradient-to-br from-teal-400 to-green-400 text-white'
                    : 'bg-[#0B0F18] border border-white/10 hover:border-white/20'
                }`}
              >
                Monthly (30 days)
              </button>
            </div>
          </div>

          {/* Section Selection */}
          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-6 border border-white/5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Report Sections
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(sections).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setSections(prev => ({ ...prev, [key]: !value }))}
                  className={`px-3 py-2 rounded-lg text-xs transition-all ${
                    value
                      ? 'bg-teal-500/20 border border-teal-500/30 text-teal-300'
                      : 'bg-[#0B0F18] border border-white/10 text-gray-400'
                  }`}
                >
                  {key === 'nutrition' ? 'Nutrition' :
                   key === 'bodyMetrics' ? 'Body' :
                   key === 'dishcoreScore' ? 'Score' :
                   key === 'wearableData' ? 'Wearables' :
                   'Adherence'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-5 gap-4">
          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-2xl p-5 border border-white/5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <p className="text-sm text-gray-400 mb-1">Avg Calories</p>
              <p className="text-2xl font-bold">{Math.round(avgCalories)}</p>
              <p className="text-xs text-gray-500 mt-1">per day</p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-2xl p-5 border border-white/5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <p className="text-sm text-gray-400 mb-1">Avg Steps</p>
              <p className="text-2xl font-bold text-blue-400">{Math.round(avgSteps).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">per day</p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-2xl p-5 border border-white/5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <p className="text-sm text-gray-400 mb-1">Avg Sleep</p>
              <p className="text-2xl font-bold text-purple-400">{avgSleep.toFixed(1)}h</p>
              <p className="text-xs text-gray-500 mt-1">per night</p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-2xl p-5 border border-white/5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <p className="text-sm text-gray-400 mb-1">Weight Change</p>
              <p className={`text-2xl font-bold ${weightChange < 0 ? 'text-green-400' : weightChange > 0 ? 'text-orange-400' : 'text-gray-400'}`}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
              </p>
              <p className="text-xs text-gray-500 mt-1">{reportType === 'weekly' ? '7 days' : '30 days'}</p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-2xl p-5 border border-white/5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <p className="text-sm text-gray-400 mb-1">DishCore Score</p>
              <p className="text-2xl font-bold text-teal-400">{Math.round(avgScore)}</p>
              <p className="text-xs text-gray-500 mt-1">average</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        {sections.nutrition && (
          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5">
            <h3 className="text-xl font-bold mb-6">Nutrition Tracking</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={nutritionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    background: '#141A27', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="calories" stroke="#00E38C" strokeWidth={2} name="Calories" />
                <Line type="monotone" dataKey="protein" stroke="#3B82F6" strokeWidth={2} name="Protein (g)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {sections.wearableData && (
          <>
            <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5">
              <h3 className="text-xl font-bold mb-6">Activity & Sleep</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={wearableChartData}>
                  <defs>
                    <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#141A27', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '12px',
                      color: '#fff'
                    }} 
                  />
                  <Legend />
                  <Area type="monotone" dataKey="steps" stroke="#3B82F6" fillOpacity={1} fill="url(#stepsGradient)" name="Steps" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5">
              <h3 className="text-xl font-bold mb-6">Sleep & Recovery</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={wearableChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#141A27', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '12px',
                      color: '#fff'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="sleep" fill="#A855F7" radius={[8, 8, 0, 0]} name="Sleep (hours)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {sections.dishcoreScore && (
          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5">
            <h3 className="text-xl font-bold mb-6">DishCore Score Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    background: '#141A27', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="score" fill="url(#scoreGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A78BFA" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {sections.bodyMetrics && bodyData.length > 0 && (
          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5">
            <h3 className="text-xl font-bold mb-6">Body Metrics Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bodyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    background: '#141A27', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#FB923C" strokeWidth={2} name="Weight (kg)" />
                <Line type="monotone" dataKey="waist" stroke="#F472B6" strokeWidth={2} name="Waist (cm)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {sections.menuAdherence && (
          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5">
            <h3 className="text-xl font-bold mb-6">Adaptive Menu Adherence</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={menuAdherence}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    background: '#141A27', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="adherence" fill="#14B8A6" radius={[8, 8, 0, 0]} name="Adherence %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </div>
  );
}