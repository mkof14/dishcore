
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw, Check, Sparkles, Heart, Download, Copy } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import MenuPreferences from "../components/menu/MenuPreferences";
import { motion } from "framer-motion";

export default function StudioMenuEngine() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEvolution, setShowEvolution] = useState(false);
  const [menuPreferences, setMenuPreferences] = useState(() => {
    const saved = localStorage.getItem('menu-preferences');
    return saved ? JSON.parse(saved) : {
      macroTargets: { protein: 30, carbs: 40, fat: 30 },
      restrictions: [],
      avoidIngredients: []
    };
  });

  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const { data: adaptiveMenus = [] } = useQuery({
    queryKey: ['adaptiveMenus'],
    queryFn: () => base44.entities.AdaptiveMenu.list('-date', 7),
  });

  const todayMenu = adaptiveMenus.find(m => m.date === format(new Date(), 'yyyy-MM-dd'));
  // const yesterdayMenu = adaptiveMenus.find(m => m.date === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')); // Removed as per instructions

  const handlePreferencesSave = (prefs) => {
    setMenuPreferences(prefs);
    localStorage.setItem('menu-preferences', JSON.stringify(prefs));
    toast.success('Preferences saved!');
  };

  const generateMenu = useMutation({
    mutationFn: async () => {
      const dishes = await base44.entities.Dish.list('-created_date', 100);
      const logs = await base44.entities.MealLog.list('-date', 7);
      
      const macroTargetsText = `Protein: ${menuPreferences.macroTargets.protein}%, Carbs: ${menuPreferences.macroTargets.carbs}%, Fat: ${menuPreferences.macroTargets.fat}%`;
      const restrictionsText = menuPreferences.restrictions.length > 0 
        ? `Dietary restrictions: ${menuPreferences.restrictions.join(', ')}` 
        : '';
      const avoidText = menuPreferences.avoidIngredients.length > 0 
        ? `Ingredients to avoid: ${menuPreferences.avoidIngredients.join(', ')}` 
        : '';

      const prompt = `Generate today's adaptive menu for user with the following parameters:

USER PROFILE:
- Primary goal: ${profile?.goal || 'balanced nutrition'}
- Target calories: ${profile?.target_calories || 2000} kcal/day
- Target protein: ${profile?.target_protein || 150}g/day

MACRO TARGETS (% of daily calories):
${macroTargetsText}

DIETARY RESTRICTIONS:
${restrictionsText || 'None'}

INGREDIENTS TO AVOID:
${avoidText || 'None'}

RECENT INTAKE ANALYSIS:
User recently consumed: ${logs.slice(0, 5).map(l => l.dish_name).join(', ')}

AVAILABLE DISHES:
${JSON.stringify(dishes.slice(0, 30).map(d => ({ 
  id: d.id, 
  name: d.name, 
  calories: d.calories, 
  protein: d.protein, 
  carbs: d.carbs, 
  fat: d.fat,
  ingredients: d.ingredients?.map(i => typeof i === 'string' ? i : i.name).join(', ')
})))}

TASK:
Create a personalized 3-meal plan (breakfast, lunch, dinner) that:
1. Respects all dietary restrictions
2. Avoids specified ingredients
3. Meets macro targets as closely as possible
4. Provides variety from recent meals
5. Aligns with the user's health goals

For each meal, provide:
- Why this specific dish was chosen
- How it contributes to macro targets
- How it addresses the user's goals
- Any adaptations made for restrictions

Return a detailed JSON response explaining your reasoning.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            adaptation_reason: { 
              type: "string",
              description: "Overall explanation of menu choices considering all parameters"
            },
            macro_analysis: {
              type: "string",
              description: "How the menu meets the macro targets"
            },
            restriction_compliance: {
              type: "string", 
              description: "Confirmation of dietary restriction adherence"
            },
            meals: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  meal_type: { type: "string" },
                  dish_id: { type: "string" },
                  dish_name: { type: "string" },
                  calories: { type: "number" },
                  protein: { type: "number" },
                  carbs: { type: "number" },
                  fat: { type: "number" },
                  reason: { 
                    type: "string",
                    description: "Detailed explanation of why this dish was selected"
                  },
                  macro_contribution: {
                    type: "string",
                    description: "How this meal contributes to daily macro targets"
                  }
                }
              }
            }
          }
        }
      });

      setShowEvolution(true);
      setTimeout(() => setShowEvolution(3000)); // Changed to 3000 instead of false for consistency

      return await base44.entities.AdaptiveMenu.create({
        date: format(new Date(), 'yyyy-MM-dd'),
        adaptation_reason: result.adaptation_reason,
        meals: result.meals.map(m => ({
          ...m // No need to explicitly re-add reason and macro_contribution as they are part of result.meals
        })),
        is_accepted: false,
        total_score: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adaptiveMenus']);
      toast.success('Menu generated!'); // Changed toast message
    },
  });

  const acceptMenu = useMutation({
    mutationFn: async () => {
      return await base44.entities.AdaptiveMenu.update(todayMenu.id, { is_accepted: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adaptiveMenus']);
      toast.success('Menu accepted!');
    },
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateMenu.mutateAsync();
    } catch (error) {
      toast.error('Failed to generate menu');
    }
    setIsGenerating(false);
  };

  const handleCopy = () => {
    const text = todayMenu?.meals?.map(m => `${m.meal_type}: ${m.dish_name} (${m.calories} kcal)`).join('\n');
    navigator.clipboard.writeText(text || '');
    toast.success('Copied!'); // Changed toast message
  };

  const totalMealMacros = todayMenu?.meals?.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.protein || 0),
    carbs: acc.carbs + (meal.carbs || 0),
    fat: acc.fat + (meal.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-6">
            <button 
              onClick={() => window.location.href = createPageUrl('StudioHub')}
              className="w-12 h-12 rounded-2xl btn-secondary flex items-center justify-center hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl font-bold">
                <span style={{ 
                  background: 'linear-gradient(135deg, #4CAF50, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Menu Engine
                </span>
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
                AI-powered adaptive meal planning
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <MenuPreferences 
              preferences={menuPreferences}
              onSave={handlePreferencesSave}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-3 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-xl hover:scale-105"
            >
              {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {isGenerating ? 'Generating...' : 'Generate Menu'}
            </button>
          </div>
        </motion.div>

        {/* Evolution Animation */}
        {showEvolution && (
          <motion.div 
            className="gradient-card border-0 rounded-3xl p-6 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="relative flex items-center justify-center gap-6">
              <div className="text-center opacity-50">
                <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Previous Menu</p>
                <p className="text-2xl">→</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Optimized for You</p>
                <p className="font-semibold text-purple-300">Menu evolved</p>
              </div>
            </div>
          </motion.div>
        )}

        {todayMenu ? (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Active Preferences Display - Re-arranged order */}
            {(menuPreferences.restrictions.length > 0 || menuPreferences.avoidIngredients.length > 0) && (
              <div className="studio-card">
                <h3 className="font-semibold mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>Active Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {menuPreferences.restrictions.map(r => (
                    <span key={r} className="px-3 py-1 bg-teal-500/20 border border-teal-500/30 rounded-full text-xs">
                      {r.replace('_', ' ')}
                    </span>
                  ))}
                  {menuPreferences.avoidIngredients.map(i => (
                    <span key={i} className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-xs">
                      Avoiding {i}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rationale */}
            <div className="gradient-card border-0 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">AI Decision Rationale</h3>
                </div>
                <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{todayMenu.adaptation_reason}</p>
                
                {totalMealMacros && (
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total Protein</p>
                      <p className="text-2xl font-bold text-blue-400">{Math.round(totalMealMacros.protein)}g</p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total Carbs</p>
                      <p className="text-2xl font-bold text-orange-400">{Math.round(totalMealMacros.carbs)}g</p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total Fat</p>
                      <p className="text-2xl font-bold text-purple-400">{Math.round(totalMealMacros.fat)}g</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Meal Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {todayMenu.meals?.map((meal, idx) => (
                <motion.div 
                  key={idx} 
                  className="gradient-card border-0 rounded-3xl p-6 group relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center rounded-xl mb-4">
                      <span className="text-6xl">
                        {meal.meal_type === 'breakfast' ? '🌅' : meal.meal_type === 'lunch' ? '☀️' : '🌙'}
                      </span>
                    </div>
                    
                    <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{meal.meal_type}</div>
                    <h4 className="text-xl font-bold mb-4">{meal.dish_name}</h4>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="p-2 rounded-lg" style={{ background: 'var(--bg-surface-alt)' }}>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Calories</span>
                        <p className="font-semibold">{meal.calories} kcal</p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: 'var(--bg-surface-alt)' }}>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Protein</span>
                        <p className="font-semibold text-blue-400">{meal.protein}g</p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: 'var(--bg-surface-alt)' }}>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Carbs</span>
                        <p className="font-semibold text-orange-400">{meal.carbs}g</p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: 'var(--bg-surface-alt)' }}>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Fat</span>
                        <p className="font-semibold text-purple-400">{meal.fat}g</p>
                      </div>
                    </div>
                    
                    {meal.reason && (
                      <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl mb-3">
                        <p className="text-xs font-semibold text-orange-300 mb-1">Why This Dish?</p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{meal.reason}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 justify-center">
              {!todayMenu.is_accepted && (
                <button
                  onClick={() => acceptMenu.mutate()}
                  className="px-8 py-4 bg-gradient-to-br from-teal-400 to-green-400 text-white rounded-2xl font-semibold hover:scale-105 transition-transform flex items-center gap-2 shadow-xl"
                >
                  <Check className="w-5 h-5" />
                  Accept Menu
                </button>
              )}
              <button onClick={handleCopy} className="btn-secondary px-8 py-4 flex items-center gap-2">
                <Copy className="w-5 h-5" />
                Copy
              </button>
              {/* Removed Save and Export buttons as per instructions */}
            </div>

          </motion.div>
        ) : (
          <motion.div 
            className="gradient-card border-0 rounded-3xl p-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Sparkles className="w-20 h-20 mx-auto mb-6" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-3xl font-bold mb-3">No Menu Generated Yet</h3>
            <p className="mb-8" style={{ color: 'var(--text-muted)' }}>Create today's personalized adaptive meal plan</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
