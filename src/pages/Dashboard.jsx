import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, startOfDay } from "date-fns";
import {
  Calendar,
  Camera,
  Plus,
  Utensils,
  Zap,
  ArrowRight,
  Droplet,
  Apple,
  Beef,
  Cookie,
  Target,
  TrendingUp,
  BookOpen,
  ShoppingCart,
  Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import SEOHead from "@/components/SEOHead";

export default function Dashboard() {
  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const { data: todayLogs = [] } = useQuery({
    queryKey: ['mealLogs', today],
    queryFn: () => base44.entities.MealLog.filter({ date: today }),
  });

  const { data: activePlan } = useQuery({
    queryKey: ['activeMealPlan'],
    queryFn: async () => {
      const plans = await base44.entities.MealPlan.filter({ is_active: true });
      return plans[0] || null;
    },
  });

  const { data: waterLogs = [] } = useQuery({
    queryKey: ['waterLogs', today],
    queryFn: () => base44.entities.WaterLog.filter({ date: today }),
  });

  // Calculate today's nutrition
  const todayCalories = todayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const todayProtein = todayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const todayCarbs = todayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
  const todayFat = todayLogs.reduce((sum, log) => sum + (log.fat || 0), 0);

  const targetCalories = profile?.target_calories || 2000;
  const targetProtein = profile?.target_protein || 150;
  const targetCarbs = profile?.target_carbs || 200;
  const targetFat = profile?.target_fat || 65;
  const targetWater = profile?.target_water || 2000;

  const caloriesPercent = Math.min((todayCalories / targetCalories) * 100, 100);
  const proteinPercent = Math.min((todayProtein / targetProtein) * 100, 100);
  const carbsPercent = Math.min((todayCarbs / targetCarbs) * 100, 100);
  const fatPercent = Math.min((todayFat / targetFat) * 100, 100);

  const totalWater = waterLogs.reduce((sum, log) => sum + (log.ml || 0), 0);
  const waterPercent = Math.min((totalWater / targetWater) * 100, 100);

  const todayPlan = activePlan?.days?.find(d => d.date === today);
  const userName = currentUser?.full_name?.split(' ')[0] || 'there';

  // Calculate remaining calories
  const remainingCalories = Math.max(0, targetCalories - todayCalories);

  const quickActions = [
    { icon: Utensils, label: 'Dishes', path: 'DishLibrary', color: '#10B981' },
    { icon: Calendar, label: 'Menu', path: 'MenuPlanner', color: '#8B5CF6' },
    { icon: TrendingUp, label: 'Analytics', path: 'Analytics', color: '#F59E0B' },
    { icon: BookOpen, label: 'Recipes', path: 'RecipeDiscovery', color: '#EC4899' },
    { icon: Target, label: 'Goals', path: 'BodyGoals', color: '#3B82F6' },
    { icon: ShoppingCart, label: 'Grocery', path: 'GroceryList', color: '#14B8A6' },
  ];

  return (
    <>
      <SEOHead 
        title="Dashboard - DishCore"
        description="Your personalized nutrition dashboard"
      />
      
      <div className="min-h-screen p-4 md:p-6" style={{ background: 'var(--background)' }}>
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {getGreeting()}, {userName}! 👋
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {format(new Date(), 'EEEE, MMMM d')}
              </p>
            </div>
            <div className="flex gap-2">
              <Link to={createPageUrl("FoodScanner")}>
                <Button size="sm" className="gradient-accent text-white border-0">
                  <Camera className="w-4 h-4 mr-1" />
                  Scan
                </Button>
              </Link>
              <Link to={createPageUrl("Tracking")}>
                <Button size="sm" variant="outline" style={{ borderColor: 'var(--border)' }}>
                  <Plus className="w-4 h-4 mr-1" />
                  Log Meal
                </Button>
              </Link>
            </div>
          </div>

          {/* Main Calories Card */}
          <Card className="p-6 rounded-3xl relative overflow-hidden" 
            style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0F2744 100%)', border: 'none' }}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Circular Progress */}
              <div className="relative w-40 h-40 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8"/>
                  <circle 
                    cx="50" cy="50" r="45" fill="none" 
                    stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${caloriesPercent * 2.83} 283`}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00A3E3"/>
                      <stop offset="100%" stopColor="#4ADE80"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <Zap className="w-5 h-5 mb-1 text-cyan-400" />
                  <span className="text-3xl font-bold">{Math.round(todayCalories)}</span>
                  <span className="text-xs opacity-70">of {targetCalories}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 w-full">
                <div className="text-center md:text-left mb-4">
                  <p className="text-white/70 text-sm">Remaining today</p>
                  <p className="text-3xl font-bold text-white">{remainingCalories} kcal</p>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <Beef className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <p className="text-lg font-bold text-white">{Math.round(todayProtein)}g</p>
                    <p className="text-xs text-white/60">Protein</p>
                    <Progress value={proteinPercent} className="h-1 mt-2" />
                  </div>
                  <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <Apple className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                    <p className="text-lg font-bold text-white">{Math.round(todayCarbs)}g</p>
                    <p className="text-xs text-white/60">Carbs</p>
                    <Progress value={carbsPercent} className="h-1 mt-2" />
                  </div>
                  <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <Cookie className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                    <p className="text-lg font-bold text-white">{Math.round(todayFat)}g</p>
                    <p className="text-xs text-white/60">Fat</p>
                    <Progress value={fatPercent} className="h-1 mt-2" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Water */}
            <Card className="p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" 
                  style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                  <Droplet className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Water</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {(totalWater / 1000).toFixed(1)}L
                  </p>
                  <Progress value={waterPercent} className="h-1.5 mt-1" />
                </div>
              </div>
            </Card>

            {/* Meals Logged */}
            <Card className="p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" 
                  style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                  <Utensils className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Meals Today</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {todayLogs.length}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {todayLogs.length === 0 ? 'Start logging!' : 'Keep going!'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {quickActions.map((action) => (
                <Link key={action.path} to={createPageUrl(action.path)}>
                  <Card className="p-4 rounded-xl text-center hover:scale-105 transition-transform cursor-pointer"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                      style={{ background: `${action.color}20` }}>
                      <action.icon className="w-5 h-5" style={{ color: action.color }} />
                    </div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{action.label}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Today's Plan */}
          <Card className="p-5 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Today's Plan
              </h2>
              <Link to={createPageUrl("MenuPlanner")}>
                <Button variant="ghost" size="sm" style={{ color: 'var(--accent-from)' }}>
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {todayPlan?.meals && todayPlan.meals.length > 0 ? (
              <div className="space-y-3">
                {todayPlan.meals.slice(0, 4).map((meal, index) => {
                  const logged = todayLogs.some(log => 
                    log.dish_name === meal.dish_name && log.meal_type === meal.meal_type
                  );
                  
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: logged ? 'rgba(16, 185, 129, 0.1)' : 'var(--background)' }}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        logged ? 'bg-emerald-500' : ''
                      }`} style={!logged ? { background: 'var(--surface)', border: '1px solid var(--border)' } : {}}>
                        <Utensils className={`w-4 h-4 ${logged ? 'text-white' : ''}`}
                          style={!logged ? { color: 'var(--text-muted)' } : {}} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {meal.dish_name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {meal.meal_type} • {meal.calories} kcal
                        </p>
                      </div>
                      {logged && (
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500 text-white font-medium">
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  No meal plan yet
                </p>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  Create a personalized plan with AI
                </p>
                <Link to={createPageUrl("MenuPlanner")}>
                  <Button className="gradient-accent text-white border-0">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Plan
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* DishCore Studio CTA */}
          <Card className="p-5 rounded-2xl relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  ✨ DishCore Studio
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  AI-powered adaptive menus & health insights
                </p>
              </div>
              <Link to={createPageUrl("Studio")}>
                <Button className="gradient-accent text-white border-0">
                  Explore
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>

        </div>
      </div>
    </>
  );
}