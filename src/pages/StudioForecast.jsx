import React from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Target, Activity, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { createPageUrl } from "@/utils";

const FORECAST_DATA = [
  { week: 'Now', weight: 75, waist: 82, energy: 70, score: 75 },
  { week: 'Week 1', weight: 74.5, waist: 81, energy: 72, score: 77 },
  { week: 'Week 2', weight: 74, waist: 80, energy: 75, score: 80 },
  { week: 'Week 3', weight: 73.5, waist: 79, energy: 77, score: 82 },
  { week: 'Week 4', weight: 73, waist: 78, energy: 80, score: 85 }
];

export default function StudioForecast() {
  return (
    <div className="min-h-screen bg-[#0B0F18] text-white">
      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => window.location.href = createPageUrl('StudioHub')}
            className="w-12 h-12 rounded-2xl bg-[#141A27] border border-white/10 flex items-center justify-center hover:bg-[#1B2231] hover:border-cyan-500/50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Health Trajectory Forecast
            </h1>
            <p className="text-lg text-gray-400">
              AI-powered 30-day predictions based on current patterns
            </p>
          </div>
        </div>

        {/* Key Predictions */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <TrendingDown className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="text-5xl font-bold mb-2">
                73<span className="text-2xl text-gray-400 ml-2">kg</span>
              </div>
              <p className="text-blue-400 font-medium mb-2">-2kg in 4 weeks</p>
              <p className="text-sm text-gray-400">Weight trajectory</p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-green-500/20">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="text-5xl font-bold mb-2">85</div>
              <p className="text-green-400 font-medium mb-2">+10 points</p>
              <p className="text-sm text-gray-400">DishCore Score</p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Target className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="text-5xl font-bold mb-2">
                78<span className="text-2xl text-gray-400 ml-2">cm</span>
              </div>
              <p className="text-purple-400 font-medium mb-2">-4cm reduction</p>
              <p className="text-sm text-gray-400">Waist circumference</p>
            </div>
          </div>
        </div>

        {/* Weight Forecast Chart */}
        <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Weight Trajectory</h3>
                <p className="text-sm text-gray-400">Predicted changes over next 4 weeks</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={FORECAST_DATA}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.3} />
                <XAxis dataKey="week" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" domain={[72, 76]} style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0B0F18', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '16px',
                    color: '#fff',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                  }} 
                />
                <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#weightGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Forecast */}
        <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-green-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">DishCore Score Projection</h3>
                <p className="text-sm text-gray-400">Expected improvement curve</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={FORECAST_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.3} />
                <XAxis dataKey="week" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" domain={[70, 90]} style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0B0F18', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '16px',
                    color: '#fff',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#00E38C" 
                  strokeWidth={3} 
                  dot={{ fill: '#00E38C', r: 6, strokeWidth: 2, stroke: '#0B0F18' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Confidence Analysis */}
        <div className="relative bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-3xl p-8 border border-cyan-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
          
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-3 text-cyan-300">87% Confidence in Forecast</h4>
              <p className="text-gray-300 leading-relaxed mb-4">
                Based on your current patterns, we project high confidence in achieving these outcomes 
                if you maintain consistency with:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#0B0F18]/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                    <p className="text-sm font-semibold text-cyan-300">Calorie Control</p>
                  </div>
                  <p className="text-xs text-gray-400">Daily targets within ±10%</p>
                </div>
                <div className="p-4 bg-[#0B0F18]/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                    <p className="text-sm font-semibold text-cyan-300">Protein Intake</p>
                  </div>
                  <p className="text-xs text-gray-400">Above 140g/day average</p>
                </div>
                <div className="p-4 bg-[#0B0F18]/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                    <p className="text-sm font-semibold text-cyan-300">Activity Level</p>
                  </div>
                  <p className="text-xs text-gray-400">3+ active days per week</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}