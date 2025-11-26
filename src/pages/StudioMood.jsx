import React, { useState } from "react";
import { ArrowLeft, Heart, Smile, Meh, Frown, TrendingUp, Zap } from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";

const MOODS = [
  { id: 'great', label: 'Excellent', icon: Smile, color: '#22c55e', gradient: 'from-green-500 to-emerald-400' },
  { id: 'good', label: 'Good', icon: Smile, color: '#3b82f6', gradient: 'from-blue-500 to-cyan-400' },
  { id: 'neutral', label: 'Neutral', icon: Meh, color: '#f59e0b', gradient: 'from-orange-500 to-yellow-400' },
  { id: 'low', label: 'Low Energy', icon: Frown, color: '#ef4444', gradient: 'from-red-500 to-pink-400' }
];

export default function StudioMood() {
  const [selectedMood, setSelectedMood] = useState('good');
  const selectedMoodData = MOODS.find(m => m.id === selectedMood);

  return (
    <div className="min-h-screen bg-[#0B0F18] text-white">
      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => window.location.href = createPageUrl('StudioHub')}
            className="w-12 h-12 rounded-2xl bg-[#141A27] border border-white/10 flex items-center justify-center hover:bg-[#1B2231] hover:border-pink-500/50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Mood & Food Sync
            </h1>
            <p className="text-lg text-gray-400">
              Track emotional eating patterns with AI insights
            </p>
          </div>
        </div>

        {/* Current Mood Display */}
        <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-12 border border-white/5 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: `radial-gradient(circle, ${selectedMoodData.color}, transparent)` }} />
          
          <div className="relative text-center">
            <div className={`w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${selectedMoodData.gradient} flex items-center justify-center shadow-2xl`}
              style={{ boxShadow: `0 20px 60px ${selectedMoodData.color}40` }}>
              <selectedMoodData.icon className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Feeling {selectedMoodData.label}</h2>
            <p className="text-gray-400">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
        </div>

        {/* Mood Logger */}
        <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-500/20">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">How are you feeling?</h3>
                <p className="text-sm text-gray-400">Select your current mood to log</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MOODS.map((mood) => {
                const Icon = mood.icon;
                const isActive = selectedMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`relative p-6 rounded-2xl border-2 transition-all ${
                      isActive
                        ? 'border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/20'
                        : 'border-white/10 bg-[#0B0F18]/50 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${mood.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-semibold text-center">{mood.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Patterns Insight */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative bg-gradient-to-br from-pink-900/20 to-rose-900/20 rounded-3xl p-8 border border-pink-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/20">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2 text-pink-300">Identified Trigger</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    You tend to consume more carbohydrates on days marked as 'low' mood. 
                    Consider protein-rich snacks like Greek yogurt or nuts to stabilize energy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-3xl p-8 border border-blue-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2 text-blue-300">Mood Stabilization</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Regular meal timing (within 2-hour windows) has been correlated with 
                    23% better mood scores in your logs over the past month.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Overview */}
        <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">7-Day Mood Pattern</h3>
                <p className="text-sm text-gray-400">Your emotional wellness tracking</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {[...Array(7)].map((_, i) => {
                const randomMood = MOODS[Math.floor(Math.random() * MOODS.length)];
                const Icon = randomMood.icon;
                return (
                  <div key={i} className="flex items-center gap-4 p-5 bg-[#0B0F18]/50 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                    <span className="text-sm text-gray-400 w-32 font-medium">
                      {format(new Date(Date.now() - i * 86400000), 'EEE, MMM d')}
                    </span>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${randomMood.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{randomMood.label}</p>
                      <p className="text-xs text-gray-400">3 meals logged • 2100 kcal</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}