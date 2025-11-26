import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { toast } from "sonner";

export const POINT_VALUES = {
  meal_logged: 10,
  breakfast_logged: 15,
  healthy_meal: 20,
  recipe_created: 50,
  plan_completed: 100,
  challenge_completed: 200,
  goal_achieved: 150,
  content_shared: 25,
  week_streak: 50,
  month_streak: 200,
  profile_completed: 30,
  wearable_connected: 40,
  water_goal_met: 15,
  workout_logged: 25,
  friend_invited: 100,
  recipe_reviewed: 15,
  community_post: 20,
  forum_reply: 5,
  daily_login: 5,
};

export const BADGES = {
  first_meal: { name: 'First Meal', description: 'Logged your first meal', icon: '🍽️' },
  meals_50: { name: 'Meal Master', description: 'Logged 50 meals', icon: '🎯' },
  meals_100: { name: 'Century Club', description: 'Logged 100 meals', icon: '💯' },
  meals_500: { name: 'Legendary Logger', description: 'Logged 500 meals', icon: '👑' },
  streak_7: { name: 'Week Warrior', description: '7-day logging streak', icon: '🔥' },
  streak_30: { name: 'Month Master', description: '30-day logging streak', icon: '⚡' },
  streak_100: { name: 'Unstoppable', description: '100-day logging streak', icon: '💪' },
  recipes_10: { name: 'Recipe Creator', description: 'Created 10 recipes', icon: '👨‍🍳' },
  recipes_50: { name: 'Chef Excellence', description: 'Created 50 recipes', icon: '⭐' },
  challenge_master: { name: 'Challenge Master', description: 'Completed 10 challenges', icon: '🏆' },
  challenge_novice: { name: 'Challenge Novice', description: 'Completed first challenge', icon: '🎖️' },
  goal_crusher: { name: 'Goal Crusher', description: 'Achieved 5 goals', icon: '🎯' },
  healthy_eater: { name: 'Healthy Eater', description: 'Ate 50 healthy meals', icon: '🥗' },
  water_warrior: { name: 'Water Warrior', description: 'Met water goals 30 days', icon: '💧' },
  early_bird: { name: 'Early Bird', description: 'Logged breakfast 30 times', icon: '🌅' },
  social_butterfly: { name: 'Social Butterfly', description: 'Shared 20 items', icon: '🦋' },
  fitness_fan: { name: 'Fitness Fan', description: 'Logged 50 workouts', icon: '💪' },
  tech_savvy: { name: 'Tech Savvy', description: 'Connected wearable device', icon: '⌚' },
  community_champion: { name: 'Community Champion', description: 'Made 50 community posts', icon: '🌟' },
  reviewer: { name: 'Food Critic', description: 'Left 25 recipe reviews', icon: '📝' },
  level_10: { name: 'Rising Star', description: 'Reached Level 10', icon: '⭐' },
  level_25: { name: 'Elite Member', description: 'Reached Level 25', icon: '💎' },
  level_50: { name: 'Legend', description: 'Reached Level 50', icon: '👑' },
};

export async function updateUserProgress(userId, action) {
  try {
    const progressList = await base44.entities.UserProgress.list();
    let progress = progressList[0];

    if (!progress) {
      progress = await base44.entities.UserProgress.create({
        total_points: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0,
        meals_logged: 0,
        recipes_created: 0,
        plans_completed: 0,
        challenges_completed: 0,
        badges: []
      });
    }

    const updates = { ...progress };
    let pointsEarned = 0;
    let earnedBadges = [];

    switch (action.type) {
      case 'meal_logged':
        updates.meals_logged = (progress.meals_logged || 0) + 1;
        pointsEarned = POINT_VALUES.meal_logged;
        
        // Bonus for healthy meals
        if (action.isHealthy) {
          pointsEarned += POINT_VALUES.healthy_meal - POINT_VALUES.meal_logged;
        }
        
        // Bonus for breakfast
        if (action.mealType === 'breakfast') {
          pointsEarned += POINT_VALUES.breakfast_logged - POINT_VALUES.meal_logged;
        }
        
        // Update streak
        const today = format(new Date(), 'yyyy-MM-dd');
        if (progress.last_log_date !== today) {
          const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
          if (progress.last_log_date === yesterday) {
            updates.current_streak = (progress.current_streak || 0) + 1;
          } else {
            updates.current_streak = 1;
          }
          updates.longest_streak = Math.max(updates.longest_streak || 0, updates.current_streak);
          updates.last_log_date = today;
          
          // Streak bonuses
          if (updates.current_streak === 7) pointsEarned += POINT_VALUES.week_streak;
          if (updates.current_streak === 30) pointsEarned += POINT_VALUES.month_streak;
        }
        break;

      case 'recipe_created':
        updates.recipes_created = (progress.recipes_created || 0) + 1;
        pointsEarned = POINT_VALUES.recipe_created;
        break;

      case 'plan_completed':
        updates.plans_completed = (progress.plans_completed || 0) + 1;
        pointsEarned = POINT_VALUES.plan_completed;
        break;

      case 'challenge_completed':
        updates.challenges_completed = (progress.challenges_completed || 0) + 1;
        pointsEarned = action.points || POINT_VALUES.challenge_completed;
        break;

      case 'goal_achieved':
        pointsEarned = POINT_VALUES.goal_achieved;
        break;

      case 'content_shared':
        pointsEarned = POINT_VALUES.content_shared;
        break;

      case 'water_goal_met':
        pointsEarned = POINT_VALUES.water_goal_met;
        break;

      case 'workout_logged':
        pointsEarned = POINT_VALUES.workout_logged;
        break;

      case 'wearable_connected':
        pointsEarned = POINT_VALUES.wearable_connected;
        break;

      case 'profile_completed':
        pointsEarned = POINT_VALUES.profile_completed;
        break;
    }

    updates.total_points = (progress.total_points || 0) + pointsEarned;
    updates.level = Math.floor(updates.total_points / 1000) + 1;

    // Check for new badges
    const newBadges = [...(progress.badges || [])];
    
    // Meal badges
    if (updates.meals_logged === 1 && !newBadges.includes('first_meal')) {
      newBadges.push('first_meal');
      earnedBadges.push('first_meal');
    }
    if (updates.meals_logged === 50 && !newBadges.includes('meals_50')) {
      newBadges.push('meals_50');
      earnedBadges.push('meals_50');
    }
    if (updates.meals_logged === 100 && !newBadges.includes('meals_100')) {
      newBadges.push('meals_100');
      earnedBadges.push('meals_100');
    }
    if (updates.meals_logged === 500 && !newBadges.includes('meals_500')) {
      newBadges.push('meals_500');
      earnedBadges.push('meals_500');
    }

    // Streak badges
    if (updates.current_streak === 7 && !newBadges.includes('streak_7')) {
      newBadges.push('streak_7');
      earnedBadges.push('streak_7');
    }
    if (updates.current_streak === 30 && !newBadges.includes('streak_30')) {
      newBadges.push('streak_30');
      earnedBadges.push('streak_30');
    }
    if (updates.current_streak === 100 && !newBadges.includes('streak_100')) {
      newBadges.push('streak_100');
      earnedBadges.push('streak_100');
    }

    // Recipe badges
    if (updates.recipes_created === 10 && !newBadges.includes('recipes_10')) {
      newBadges.push('recipes_10');
      earnedBadges.push('recipes_10');
    }
    if (updates.recipes_created === 50 && !newBadges.includes('recipes_50')) {
      newBadges.push('recipes_50');
      earnedBadges.push('recipes_50');
    }

    // Challenge badges
    if (updates.challenges_completed === 1 && !newBadges.includes('challenge_novice')) {
      newBadges.push('challenge_novice');
      earnedBadges.push('challenge_novice');
    }
    if (updates.challenges_completed === 10 && !newBadges.includes('challenge_master')) {
      newBadges.push('challenge_master');
      earnedBadges.push('challenge_master');
    }

    // Wearable badge
    if (action.type === 'wearable_connected' && !newBadges.includes('tech_savvy')) {
      newBadges.push('tech_savvy');
      earnedBadges.push('tech_savvy');
    }

    // Level badges
    if (updates.level === 10 && !newBadges.includes('level_10')) {
      newBadges.push('level_10');
      earnedBadges.push('level_10');
    }
    if (updates.level === 25 && !newBadges.includes('level_25')) {
      newBadges.push('level_25');
      earnedBadges.push('level_25');
    }
    if (updates.level === 50 && !newBadges.includes('level_50')) {
      newBadges.push('level_50');
      earnedBadges.push('level_50');
    }

    updates.badges = newBadges;

    await base44.entities.UserProgress.update(progress.id, updates);

    // Show notifications
    if (pointsEarned > 0) {
      toast.success(`+${pointsEarned} points earned! 🎉`);
    }
    
    if (earnedBadges.length > 0) {
      earnedBadges.forEach(badgeKey => {
        const badge = BADGES[badgeKey];
        toast.success(`${badge.icon} New Badge: ${badge.name}!`, {
          description: badge.description
        });
      });
    }

    return { success: true, pointsEarned, newBadges: earnedBadges };
  } catch (error) {
    console.error('Failed to update progress:', error);
    return { success: false };
  }
}

export function calculateLevel(points) {
  return Math.floor(points / 1000) + 1;
}

export function getPointsForNextLevel(currentPoints) {
  const currentLevel = calculateLevel(currentPoints);
  return currentLevel * 1000;
}

export function getLevelProgress(currentPoints) {
  return (currentPoints % 1000) / 1000 * 100;
}