import { base44 } from "@/api/base44Client";

export class PersonalizedAIEngine {
  static async gatherUserContext() {
    const [
      profile,
      recentLogs,
      measurements,
      goals,
      wearableData,
      userProgress
    ] = await Promise.all([
      base44.entities.UserProfile.list().then(p => p[0]),
      base44.entities.MealLog.list('-date', 50),
      base44.entities.BodyMeasurement.list('-date', 30),
      base44.entities.BodyGoal.filter({ is_active: true }),
      base44.entities.WearableData.list('-date', 14),
      base44.entities.UserProgress.list().then(p => p[0])
    ]);

    const recentDays = [...new Set(recentLogs.map(l => l.date))].slice(0, 7);
    const dailyStats = recentDays.map(date => {
      const dayLogs = recentLogs.filter(l => l.date === date);
      return {
        date,
        calories: dayLogs.reduce((sum, l) => sum + (l.calories || 0), 0),
        protein: dayLogs.reduce((sum, l) => sum + (l.protein || 0), 0),
        carbs: dayLogs.reduce((sum, l) => sum + (l.carbs || 0), 0),
        fat: dayLogs.reduce((sum, l) => sum + (l.fat || 0), 0),
        mealCount: dayLogs.filter(l => ['breakfast', 'lunch', 'dinner'].includes(l.meal_type)).length
      };
    });

    const avgCalories = dailyStats.reduce((sum, d) => sum + d.calories, 0) / (dailyStats.length || 1);
    const avgProtein = dailyStats.reduce((sum, d) => sum + d.protein, 0) / (dailyStats.length || 1);
    const avgSteps = wearableData.reduce((sum, w) => sum + (w.steps || 0), 0) / (wearableData.length || 1);
    const avgSleep = wearableData.reduce((sum, w) => sum + (w.sleep_hours || 0), 0) / (wearableData.length || 1);

    const latestWeight = measurements.length > 0 ? measurements[0].weight : profile?.weight;
    const weightTrend = measurements.length >= 2 
      ? measurements[0].weight - measurements[measurements.length - 1].weight 
      : 0;

    return {
      profile,
      recentLogs,
      measurements,
      goals: goals[0],
      wearableData,
      userProgress,
      analytics: {
        dailyStats,
        avgCalories: Math.round(avgCalories),
        avgProtein: Math.round(avgProtein),
        avgSteps: Math.round(avgSteps),
        avgSleep: avgSleep.toFixed(1),
        latestWeight,
        weightTrend: weightTrend.toFixed(1),
        adherenceScore: this.calculateAdherence(dailyStats, profile),
        consistency: this.calculateConsistency(dailyStats)
      }
    };
  }

  static calculateAdherence(dailyStats, profile) {
    if (!profile || dailyStats.length === 0) return 50;

    const targetCals = profile.target_calories || 2000;
    const targetProtein = profile.target_protein || 150;

    const adherenceScores = dailyStats.map(day => {
      const calDeviation = Math.abs(day.calories - targetCals) / targetCals;
      const proteinDeviation = Math.abs(day.protein - targetProtein) / targetProtein;
      const calScore = Math.max(0, 100 * (1 - calDeviation));
      const proteinScore = Math.max(0, 100 * (1 - proteinDeviation));
      return (calScore + proteinScore) / 2;
    });

    return Math.round(adherenceScores.reduce((a, b) => a + b, 0) / adherenceScores.length);
  }

  static calculateConsistency(dailyStats) {
    if (dailyStats.length < 2) return 50;

    const mealCounts = dailyStats.map(d => d.mealCount);
    const avg = mealCounts.reduce((a, b) => a + b, 0) / mealCounts.length;
    const variance = mealCounts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / mealCounts.length;
    const consistency = Math.max(0, 100 - (variance * 20));

    return Math.round(consistency);
  }

  static async generatePersonalizedMealPlan(preferences, userContext) {
    const context = userContext || await this.gatherUserContext();
    const { profile, analytics, goals, recentLogs } = context;

    const recentDishes = [...new Set(recentLogs.slice(0, 20).map(l => l.dish_name))];

    const prompt = `Generate a highly personalized meal plan based on comprehensive user data.

USER PROFILE & GOALS:
- Primary Goal: ${goals?.main_goal || profile?.goal || 'balanced nutrition'}
- Target Weight: ${goals?.target_weight || profile?.weight} kg
- Current Weight: ${analytics.latestWeight} kg (trend: ${analytics.weightTrend > 0 ? '+' : ''}${analytics.weightTrend} kg)
- Diet Type: ${profile?.diet_type || 'balanced'}
- Activity Level: ${profile?.activity_level || 'moderate'}
- Medical Conditions: ${profile?.medical_conditions?.join(', ') || 'none'}
- Allergies: ${profile?.allergies?.join(', ') || 'none'}
- Foods to Avoid: ${profile?.foods_to_avoid?.join(', ') || 'none'}
- Favorite Foods: ${profile?.favorite_foods?.join(', ') || 'not specified'}
- Dietary Restrictions: ${profile?.dietary_restrictions?.join(', ') || 'none'}

BEHAVIORAL PATTERNS (Last 7 days):
- Avg Daily Calories: ${analytics.avgCalories} kcal (target: ${profile?.target_calories || 2000})
- Avg Daily Protein: ${analytics.avgProtein}g (target: ${profile?.target_protein || 150})
- Adherence Score: ${analytics.adherenceScore}%
- Meal Consistency: ${analytics.consistency}%
- Avg Sleep: ${analytics.avgSleep}h
- Avg Steps: ${analytics.avgSteps}

LIFESTYLE FACTORS:
- Available Cooking Time: ${profile?.daily_cooking_time_available || 30} min/day
- Meal Prep Style: ${profile?.meal_prep_preference || 'daily_fresh'}
- Cooking Skill: ${profile?.cooking_skill || 'intermediate'}
- Budget: ${profile?.weekly_grocery_budget ? `$${profile.weekly_grocery_budget}/week` : 'moderate'}
- Kitchen Equipment: ${profile?.kitchen_equipment?.join(', ') || 'basic'}
- Household Size: ${profile?.household_size || 1}

PREFERENCES:
- Duration: ${preferences.duration} days
- Variety: ${preferences.variety}
- Budget Level: ${preferences.budget}
- Cooking Complexity: ${preferences.cooking_complexity}
- Meal Timing: ${preferences.meal_timing}
- Macro Balance: ${preferences.macro_balance}
- Focus Areas: ${preferences.focus_areas?.join(', ') || 'general health'}

RECENT EATING PATTERNS:
Recently consumed: ${recentDishes.slice(0, 10).join(', ')}

CRITICAL AI ANALYSIS REQUIRED:
1. GOAL OPTIMIZATION: Adjust calories/macros specifically for their ${goals?.main_goal || 'goal'}
2. BEHAVIORAL ADAPTATION: Account for their ${analytics.adherenceScore}% adherence - make it realistic
3. METABOLIC CONSIDERATION: Factor in ${analytics.avgSleep}h sleep and ${analytics.avgSteps} daily steps
4. VARIETY BALANCE: Mix familiar foods with new options based on variety preference
5. LIFESTYLE FIT: Respect ${profile?.daily_cooking_time_available || 30} min cooking time constraint
6. MICRONUTRIENT OPTIMIZATION: Address any deficiencies based on medical conditions
7. PROGRESSIVE DIFFICULTY: Match complexity to ${profile?.cooking_skill || 'intermediate'} skill
8. BUDGET AWARENESS: Stay within ${profile?.weekly_grocery_budget || 'moderate'} budget

Generate a meal plan that feels personalized, achievable, and scientifically sound. Include rationale explaining WHY each meal was chosen for THIS specific user.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          rationale: { type: "string" },
          personalization_notes: { type: "string" },
          days: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string" },
                meals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      meal_type: { type: "string" },
                      dish_name: { type: "string" },
                      calories: { type: "number" },
                      protein: { type: "number" },
                      carbs: { type: "number" },
                      fat: { type: "number" },
                      why_chosen: { type: "string" }
                    }
                  }
                },
                total_calories: { type: "number" },
                total_protein: { type: "number" },
                total_carbs: { type: "number" },
                total_fat: { type: "number" }
              }
            }
          }
        }
      }
    });

    return result;
  }

  static async generateMetabolismInsights(userContext) {
    const context = userContext || await this.gatherUserContext();
    const { profile, analytics, measurements, wearableData } = context;

    const prompt = `As an expert metabolic health analyst, provide detailed insights on the user's metabolism based on comprehensive tracking data.

USER DATA:
- Age: ${profile?.age}, Sex: ${profile?.sex}
- Weight: ${analytics.latestWeight} kg (7-day trend: ${analytics.weightTrend} kg)
- Height: ${profile?.height} cm
- Body Type: ${profile?.body_type}
- Activity Level: ${profile?.activity_level}

NUTRITION PATTERNS:
- Avg Calories: ${analytics.avgCalories}/day (target: ${profile?.target_calories || 2000})
- Avg Protein: ${analytics.avgProtein}g/day (target: ${profile?.target_protein})
- Adherence: ${analytics.adherenceScore}%
- Meal Consistency: ${analytics.consistency}%

LIFESTYLE DATA:
- Avg Sleep: ${analytics.avgSleep} hours
- Avg Steps: ${analytics.avgSteps}
- Recent Activity: ${wearableData.slice(0, 3).map(w => `${w.active_minutes || 0} min`).join(', ')}

BODY MEASUREMENTS:
${measurements.slice(0, 3).map(m => `- ${m.date}: Weight ${m.weight}kg, Waist ${m.waist || 'N/A'}cm`).join('\n')}

Analyze and provide insights for these metabolism zones:`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          overall_metabolic_health: { type: "string" },
          zones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                zone: { type: "string" },
                score: { type: "number" },
                status: { type: "string" },
                insight: { type: "string" },
                recommendation: { type: "string" }
              }
            }
          },
          key_improvements: { type: "array", items: { type: "string" } }
        }
      }
    });

    return result;
  }

  static async generateSmartRecommendations(userContext) {
    const context = userContext || await this.gatherUserContext();
    const { profile, analytics, recentLogs, goals, userProgress } = context;

    const today = new Date().toISOString().split('T')[0];
    const todayLogs = recentLogs.filter(l => l.date === today);
    
    const todayCalories = todayLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
    const todayProtein = todayLogs.reduce((sum, l) => sum + (l.protein || 0), 0);
    const remainingCalories = (profile?.target_calories || 2000) - todayCalories;
    const remainingProtein = (profile?.target_protein || 150) - todayProtein;

    const prompt = `Generate highly personalized, actionable recommendations for this user RIGHT NOW.

CURRENT SITUATION (Today):
- Consumed: ${todayCalories} kcal, ${todayProtein}g protein
- Remaining: ${remainingCalories} kcal, ${remainingProtein}g protein
- Meals logged: ${todayLogs.length}
- Current time context: Consider time of day for recommendations

USER PROFILE:
- Goal: ${goals?.main_goal || profile?.goal}
- Diet: ${profile?.diet_type}
- Activity: ${profile?.activity_level}
- Allergies: ${profile?.allergies?.join(', ') || 'none'}
- Preferences: ${profile?.favorite_foods?.join(', ') || 'not specified'}

7-DAY PERFORMANCE:
- Avg Adherence: ${analytics.adherenceScore}%
- Consistency: ${analytics.consistency}%
- Avg Sleep: ${analytics.avgSleep}h
- Avg Activity: ${analytics.avgSteps} steps
- Weight Trend: ${analytics.weightTrend} kg

GAMIFICATION:
- Current Level: ${userProgress?.level || 1}
- Streak: ${userProgress?.current_streak || 0} days
- Total Points: ${userProgress?.total_points || 0}

Generate specific, time-relevant, actionable recommendations:`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          priority_action: { type: "string" },
          next_meal_suggestion: {
            type: "object",
            properties: {
              meal_name: { type: "string" },
              calories: { type: "number" },
              protein: { type: "number" },
              why: { type: "string" }
            }
          },
          immediate_tips: { type: "array", items: { type: "string" } },
          hydration_reminder: { type: "string" },
          movement_suggestion: { type: "string" },
          evening_prep: { type: "string" },
          motivational_insight: { type: "string" },
          progress_recognition: { type: "string" }
        }
      }
    });

    return result;
  }

  static async generateAdaptiveMenu(userContext) {
    const context = userContext || await this.gatherUserContext();
    const { profile, analytics, recentLogs, wearableData } = context;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const yesterdayLogs = recentLogs.filter(l => l.date === yesterday);
    const yesterdayCalories = yesterdayLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
    const yesterdayProtein = yesterdayLogs.reduce((sum, l) => sum + (l.protein || 0), 0);

    const yesterdayActivity = wearableData.find(w => w.date === yesterday);

    const prompt = `Generate TODAY's adaptive menu that intelligently responds to yesterday's intake and activity.

YESTERDAY'S DATA:
- Calories: ${yesterdayCalories} (target: ${profile?.target_calories || 2000})
- Protein: ${yesterdayProtein}g (target: ${profile?.target_protein})
- Steps: ${yesterdayActivity?.steps || 0}
- Sleep: ${yesterdayActivity?.sleep_hours || 0}h
- Active Minutes: ${yesterdayActivity?.active_minutes || 0}

USER GOALS & PROFILE:
- Goal: ${profile?.goal}
- Diet Type: ${profile?.diet_type}
- Allergies: ${profile?.allergies?.join(', ') || 'none'}

7-DAY PATTERNS:
- Adherence: ${analytics.adherenceScore}%
- Weight Trend: ${analytics.weightTrend} kg

Generate a smart, adaptive menu for TODAY that compensates for yesterday's intake and activity. If they overate yesterday, slightly reduce today. If they undershot protein, boost it today.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          adaptation_reason: { type: "string" },
          meals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                meal_type: { type: "string" },
                dish_name: { type: "string" },
                calories: { type: "number" },
                protein: { type: "number" },
                carbs: { type: "number" },
                fat: { type: "number" },
                adaptation_note: { type: "string" }
              }
            }
          }
        }
      }
    });

    return result;
  }
}