import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Send, Mic, Sparkles, Zap, Activity, TrendingUp, Droplet, Brain, Heart, Moon } from "lucide-react";
import { createPageUrl } from "@/utils";
import { format, subDays } from "date-fns";

const QUICK_PROMPTS = [
  'Analyze my meal logs from this week',
  'How am I doing on my macro targets?',
  'What should I improve in my diet?',
  'Compare my progress to last week',
  'Am I following my adaptive menu?',
  'Review my sleep and recovery data'
];

export default function StudioCoach() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [proactiveInsights, setProactiveInsights] = useState(null);

  // Fetch all user data
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
    queryKey: ['recentMealLogs'],
    queryFn: () => base44.entities.MealLog.list('-date', 30),
  });

  const { data: adaptiveMenus = [] } = useQuery({
    queryKey: ['adaptiveMenus'],
    queryFn: () => base44.entities.AdaptiveMenu.list('-date', 7),
  });

  const { data: measurements = [] } = useQuery({
    queryKey: ['bodyMeasurements'],
    queryFn: () => base44.entities.BodyMeasurement.list('-date', 30),
  });

  const { data: wearableData = [] } = useQuery({
    queryKey: ['wearableData'],
    queryFn: () => base44.entities.WearableData.list('-date', 30),
  });

  // Calculate key metrics
  const todayLogs = mealLogs.filter(log => log.date === format(new Date(), 'yyyy-MM-dd'));
  const weekLogs = mealLogs.filter(log => {
    const logDate = new Date(log.date);
    const weekAgo = subDays(new Date(), 7);
    return logDate >= weekAgo;
  });

  const todayStats = {
    calories: todayLogs.reduce((sum, log) => sum + (log.calories || 0), 0),
    protein: todayLogs.reduce((sum, log) => sum + (log.protein || 0), 0),
    carbs: todayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0),
    fat: todayLogs.reduce((sum, log) => sum + (log.fat || 0), 0),
  };

  const weekStats = {
    avgCalories: weekLogs.reduce((sum, log) => sum + (log.calories || 0), 0) / 7,
    avgProtein: weekLogs.reduce((sum, log) => sum + (log.protein || 0), 0) / 7,
  };

  const todayMenu = adaptiveMenus.find(m => m.date === format(new Date(), 'yyyy-MM-dd'));
  const acceptedMenus = adaptiveMenus.filter(m => m.is_accepted).length;

  const latestMeasurement = measurements[0];
  const previousMeasurement = measurements[1];

  const todayWearable = wearableData.find(w => w.date === format(new Date(), 'yyyy-MM-dd'));
  const weekWearable = wearableData.filter(w => {
    const wDate = new Date(w.date);
    const weekAgo = subDays(new Date(), 7);
    return wDate >= weekAgo;
  });

  const avgSteps = weekWearable.reduce((sum, w) => sum + (w.steps || 0), 0) / weekWearable.length;
  const avgSleep = weekWearable.reduce((sum, w) => sum + (w.sleep_hours || 0), 0) / weekWearable.length;
  const avgHeartRate = weekWearable.reduce((sum, w) => sum + (w.heart_rate_avg || 0), 0) / weekWearable.length;

  // Generate proactive insights on mount
  useEffect(() => {
    if (profile && mealLogs.length > 0 && !proactiveInsights) {
      generateProactiveInsights();
    }
  }, [profile, mealLogs, wearableData]);

  const generateProactiveInsights = async () => {
    if (!profile) return;

    const contextData = buildContextData();
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert nutrition AI coach. Analyze this user's comprehensive data and provide 3-5 PROACTIVE insights, suggestions, or alerts.

${contextData}

Focus on:
1. Micro-nutrient gaps (fiber, vitamins, minerals)
2. Hydration status and recommendations
3. Meal timing patterns
4. Macro balance vs targets
5. Body metric trends and nutrition correlation
6. Activity-nutrition balance (steps, sleep, recovery)
7. Heart rate and recovery insights

Return JSON array of insights with: type (warning/info/success), title, message, action (optional suggestion).`,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  message: { type: "string" },
                  action: { type: "string" }
                }
              }
            }
          }
        }
      });

      setProactiveInsights(result.insights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    }
  };

  const buildContextData = () => {
    return `USER PROFILE:
- Goal: ${profile?.goal || 'Not set'}
- Target Calories: ${profile?.target_calories || 'Not set'} kcal/day
- Target Protein: ${profile?.target_protein || 'Not set'}g/day
- Target Carbs: ${profile?.target_carbs || 'Not set'}g/day
- Target Fat: ${profile?.target_fat || 'Not set'}g/day
- Target Fiber: ${profile?.target_fiber || 'Not set'}g/day
- Target Water: ${profile?.target_water || 2000}ml/day
- Diet Type: ${profile?.diet_type || 'Not specified'}
- Activity Level: ${profile?.activity_level || 'Not specified'}

DISHCORE STUDIO:
- Current Score: ${studioProfile?.dishcore_score || 'Not calculated'}
- Score History: ${JSON.stringify(studioProfile?.score_history?.slice(-7) || [])}

TODAY'S INTAKE:
- Calories: ${todayStats.calories} kcal (${Math.round((todayStats.calories / (profile?.target_calories || 2000)) * 100)}% of target)
- Protein: ${todayStats.protein}g (${Math.round((todayStats.protein / (profile?.target_protein || 150)) * 100)}% of target)
- Carbs: ${todayStats.carbs}g
- Fat: ${todayStats.fat}g
- Meals Logged: ${todayLogs.length}

WEEKLY AVERAGES:
- Avg Calories: ${Math.round(weekStats.avgCalories)} kcal/day
- Avg Protein: ${Math.round(weekStats.avgProtein)}g/day
- Days with Logs: ${[...new Set(weekLogs.map(l => l.date))].length} of 7

RECENT MEALS (Last 5):
${mealLogs.slice(0, 5).map(log => `- ${log.dish_name} (${log.meal_type}): ${log.calories} kcal, ${log.protein}g protein`).join('\n')}

ADAPTIVE MENU:
- Today's Menu: ${todayMenu ? 'Generated' : 'Not generated'}
- Accepted: ${todayMenu?.is_accepted ? 'Yes' : 'No'}
- Menu Adherence: ${acceptedMenus} of ${adaptiveMenus.length} menus accepted

BODY METRICS:
- Latest Weight: ${latestMeasurement?.weight || 'Not recorded'} kg
- Weight Change: ${previousMeasurement ? `${(latestMeasurement?.weight - previousMeasurement?.weight).toFixed(1)} kg` : 'N/A'}
- Latest Waist: ${latestMeasurement?.waist || 'Not recorded'} cm
- BMI: ${latestMeasurement?.bmi || 'Not calculated'}

WEARABLE DATA (7-day averages):
- Avg Steps: ${Math.round(avgSteps || 0)} steps/day
- Avg Sleep: ${avgSleep?.toFixed(1) || 0} hours/night
- Avg Heart Rate: ${Math.round(avgHeartRate || 0)} bpm
- Today's Steps: ${todayWearable?.steps || 0}
- Today's Sleep: ${todayWearable?.sleep_hours?.toFixed(1) || 0}h
- Today's Calories Burned: ${todayWearable?.calories_burned || 0} kcal
- Sleep Quality: ${todayWearable?.sleep_quality || 0}/100`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const contextData = buildContextData();
      
      const prompt = `You are an expert AI nutrition coach with deep access to the user's complete nutritional data, wearable activity data, and health metrics. Answer their question with personalized, actionable insights.

${contextData}

USER QUESTION: ${input}

Provide a detailed, personalized response that:
1. References specific data from their logs, wearables, and metrics
2. Compares their current status to their goals
3. Identifies trends and patterns from activity and recovery data
4. Considers the interplay between nutrition, sleep, activity, and recovery
5. Gives specific, actionable recommendations
6. Explains the "why" behind your advice

Be conversational, supportive, and data-driven.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      const aiMessage = { role: 'assistant', content: result };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error processing your request. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsLoading(false);
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt);
  };

  const insightColors = {
    warning: { bg: 'from-orange-900/20 to-red-900/20', border: 'border-orange-500/30', icon: 'text-orange-400' },
    info: { bg: 'from-blue-900/20 to-cyan-900/20', border: 'border-blue-500/30', icon: 'text-blue-400' },
    success: { bg: 'from-green-900/20 to-emerald-900/20', border: 'border-green-500/30', icon: 'text-green-400' }
  };

  return (
    <div className="min-h-screen bg-[#0B0F18] text-white">
      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => window.location.href = createPageUrl('StudioHub')}
            className="w-12 h-12 rounded-2xl bg-[#141A27] border border-white/10 flex items-center justify-center hover:bg-[#1B2231] hover:border-purple-500/50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              AI Coach Pro
            </h1>
            <p className="text-lg text-gray-400">
              Deep reasoning with your complete nutritional and wearable data
            </p>
          </div>
        </div>

        {/* Data Overview Cards */}
        <div className="grid md:grid-cols-5 gap-4">
          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-2xl p-5 border border-white/5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <Activity className="w-6 h-6 text-teal-400 mb-2" />
              <p className="text-sm text-gray-400 mb-1">Today's Calories</p>
              <p className="text-2xl font-bold">{Math.round(todayStats.calories)}</p>
              <p className="text-xs text-gray-500">of {profile?.target_calories || 2000} target</p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-2xl p-5 border border-white/5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <Zap className="w-6 h-6 text-blue-400 mb-2" />
              <p className="text-sm text-gray-400 mb-1">Steps</p>
              <p className="text-2xl font-bold text-blue-400">{todayWearable?.steps?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500">today</p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-2xl p-5 border border-white/5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <Moon className="w-6 h-6 text-purple-400 mb-2" />
              <p className="text-sm text-gray-400 mb-1">Sleep</p>
              <p className="text-2xl font-bold text-purple-400">{todayWearable?.sleep_hours?.toFixed(1) || 0}h</p>
              <p className="text-xs text-gray-500">last night</p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-2xl p-5 border border-white/5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <Heart className="w-6 h-6 text-red-400 mb-2" />
              <p className="text-sm text-gray-400 mb-1">Heart Rate</p>
              <p className="text-2xl font-bold text-red-400">{todayWearable?.heart_rate_avg || '--'}</p>
              <p className="text-xs text-gray-500">avg bpm</p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-2xl p-5 border border-white/5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <TrendingUp className="w-6 h-6 text-orange-400 mb-2" />
              <p className="text-sm text-gray-400 mb-1">DishCore Score</p>
              <p className="text-2xl font-bold text-orange-400">{studioProfile?.dishcore_score || '--'}</p>
              <p className="text-xs text-gray-500">current</p>
            </div>
          </div>
        </div>

        {/* Proactive Insights */}
        {proactiveInsights && proactiveInsights.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">Proactive Insights</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {proactiveInsights.map((insight, idx) => {
                const colors = insightColors[insight.type] || insightColors.info;
                return (
                  <div key={idx} className={`relative bg-gradient-to-br ${colors.bg} rounded-2xl p-6 border ${colors.border} overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                    <div className="relative">
                      <h4 className={`font-bold mb-2 ${colors.icon}`}>{insight.title}</h4>
                      <p className="text-sm text-gray-300 leading-relaxed mb-3">{insight.message}</p>
                      {insight.action && (
                        <p className="text-xs text-gray-400 italic">💡 {insight.action}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          
          <div className="relative">
            {/* Messages Container */}
            <div className="h-[500px] overflow-y-auto p-8 space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-20">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
                  <p className="text-gray-400">Ask me anything about your nutrition, activity, recovery, or health goals</p>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-3xl rounded-br-lg' 
                      : 'bg-[#0B0F18] border border-white/10 rounded-3xl rounded-bl-lg'
                  } p-5 shadow-lg`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs text-purple-400 font-semibold tracking-wider">AI COACH PRO</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#0B0F18] border border-white/10 p-5 rounded-3xl rounded-bl-lg shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50" />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="px-8 py-6 border-t border-white/5 bg-[#0B0F18]/50 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400 font-medium">Quick questions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt)}
                    className="px-4 py-2 bg-[#141A27] hover:bg-[#1B2231] border border-white/10 hover:border-purple-500/50 rounded-full text-sm transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/5 bg-[#0B0F18]/50 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about your meals, progress, activity, or nutrition goals..."
                  className="flex-1 bg-[#141A27] border border-white/10 focus:border-purple-500/50 rounded-full px-6 py-4 focus:outline-none transition-all text-white placeholder-gray-500"
                  disabled={isLoading}
                />
                <button className="w-14 h-14 rounded-full bg-[#141A27] border border-white/10 hover:border-purple-500/50 flex items-center justify-center transition-all">
                  <Mic className="w-5 h-5 text-gray-400" />
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:opacity-90 flex items-center justify-center transition-opacity disabled:opacity-50 shadow-lg shadow-purple-500/30"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}