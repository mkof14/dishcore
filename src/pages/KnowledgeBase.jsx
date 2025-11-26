import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  User,
  Ruler,
  Target,
  Sparkles,
  Utensils,
  BarChart3,
  Share2,
  Activity,
  ChevronRight,
  BookOpen,
  Home,
  Wrench,
  Heart
} from "lucide-react";

const knowledgeBase = [
  {
    id: "understanding",
    title: "Understanding DishCore",
    icon: Heart,
    articles: [
      {
        title: "What Is DishCore?",
        summary: "Your personal food-health companion that learns from your body and adapts to your goals.",
        content: `DishCore is your personal food-health companion.

The system learns from your body, your preferences, and your daily patterns — and then adapts your meals, insights, and recommendations to fit your goals.

**DishCore includes:**
• Personalized meal plans
• Adaptive formulas based on your profile
• DishCore Studio™ advanced analytics
• Smart progress tracking
• Photo-based food recognition
• Reports, trends, and insights

**DishCore is not a diet.**
It is a long-term healthy eating system built around your data.

The platform continuously analyzes your progress and adjusts recommendations to keep you on track sustainably. Whether you're losing weight, building muscle, or improving health, DishCore provides the structure and flexibility you need.`,
        tags: ["basics", "overview", "introduction"]
      },
      {
        title: "How DishCore Learns From You",
        summary: "Understanding the data DishCore uses to personalize your experience.",
        content: `DishCore analyzes multiple data points to provide personalized recommendations:

**Data Sources:**
• Body measurements (weight, waist, hips, chest)
• Weight trends over time
• Dish choices and preferences
• Portion sizes
• Habits (sleep, water intake, steps)
• Lifestyle inputs
• Your goals and targets
• Your progress changes over time

**What DishCore Adjusts:**
• Daily calorie targets
• Macro distribution (protein, carbs, fat)
• Meal timing suggestions
• Meal composition
• Dish suggestions and recommendations
• Weekly insights
• DishCore Studio™ Score

**The Learning Process:**
The more data you provide, the smarter DishCore becomes. Initial recommendations are based on your profile. As you log meals, track progress, and interact with the platform, DishCore refines its understanding of what works best for your body and lifestyle.

This adaptive approach means your meal plans improve over time, becoming more aligned with your preferences while keeping you on track toward your goals.`,
        tags: ["learning", "personalization", "data"]
      },
      {
        title: "Supported Languages & Units",
        summary: "Available languages and measurement systems in DishCore.",
        content: `DishCore supports multiple languages and measurement systems for global accessibility.

**Supported Languages:**
• English
• Spanish
• German
• Ukrainian
• Russian
• French
• Italian
• Portuguese
• Chinese
• Japanese

**Measurement Units:**
• **Weight:** kg, lbs
• **Height:** cm, inches
• **Portions:** grams, oz
• **Volume:** ml, fl oz
• **Temperature:** °C, °F

**Changing Settings:**
You can change language and units anytime from Settings → Language & Units. All data converts automatically—your historical records adjust to match your new preferences.

**Regional Adaptations:**
DishCore adapts to regional food preferences and availability. The dish library includes cuisine types from around the world, and recipes are tagged with regional categories.

Your language and unit preferences are saved across devices and apply to all reports, exports, and shared content.`,
        tags: ["settings", "language", "units", "international"]
      }
    ]
  },
  {
    id: "profile",
    title: "Profile & Measurements",
    icon: User,
    articles: [
      {
        title: "Setting Up Your Profile",
        summary: "Complete guide to filling out your profile for accurate recommendations.",
        content: `Your profile forms the foundation of all DishCore calculations.

**Required Information:**
• Age
• Sex
• Height
• Current weight
• Preferred units (kg/lbs, cm/in)
• Language

**Optional Information:**
• Activity level (sedentary, lightly active, moderately active, very active)
• Dietary restrictions (gluten-free, dairy-free, vegan, etc.)
• Allergies
• Food preferences
• Medical conditions
• Favorite cuisines

**Why This Matters:**
DishCore uses your profile data to calculate:
• Basal metabolic rate (BMR)
• Total daily energy expenditure (TDEE)
• Macro targets
• Appropriate calorie ranges
• Meal portion sizes

**Updating Your Profile:**
You can edit your profile anytime from Settings → My Profile. Update your age annually and your weight regularly for the most accurate recommendations. Major changes (like activity level or dietary restrictions) should be updated immediately to adjust your meal plans accordingly.`,
        tags: ["profile", "setup", "basics", "getting started"]
      },
      {
        title: "Body Measurements Explained",
        summary: "Understanding which measurements matter and how DishCore uses them.",
        content: `DishCore tracks multiple body measurements for comprehensive health analysis.

**Key Measurements:**

**Weight:** Your total body mass. Tracked for overall progress trends.

**Waist:** Most important measurement. Measured at the narrowest point (usually just above belly button). Indicates abdominal fat and metabolic health risk.

**Hips:** Widest part of the hips/buttocks. Used for body shape analysis and fat distribution.

**Chest:** Measured at the fullest part. Useful for tracking upper body changes.

**Neck:** Optional. Helps estimate body fat percentage.

**Body Fat %:** Optional but valuable. Can be measured with calipers, smart scales, or professional assessments.

**Why Multiple Measurements?**
Weight alone doesn't tell the full story. You might lose fat while gaining muscle, keeping weight stable but improving body composition. Waist measurement is often more meaningful than weight for health outcomes.

**How DishCore Uses This Data:**
• Calculates BMI and waist-to-height ratio
• Estimates metabolic rate adjustments
• Tracks fat distribution changes
• Identifies progress patterns
• Adjusts calorie and macro targets
• Generates body composition insights in Studio™

Consistent measurement timing (same time of day, same conditions) improves trend accuracy.`,
        tags: ["measurements", "tracking", "body composition"]
      },
      {
        title: "How Often Should You Update Measurements?",
        summary: "Optimal frequency for logging body data to maintain accurate trends.",
        content: `Measurement frequency affects data quality and recommendation accuracy.

**Recommended Schedule:**

**Weight:** 2-3 times per week
• Best time: Morning, after bathroom, before eating
• Same day each week (e.g., Monday, Wednesday, Friday)
• Avoid daily weighing—natural fluctuations cause unnecessary stress

**Waist:** Weekly to bi-weekly
• Measure at the same time of day
• Use the same measuring tape
• Measure at the narrowest point, breathing normally
• Most reliable indicator of fat loss progress

**Hips & Chest:** Bi-weekly to monthly
• Useful for tracking body shape changes
• Less variable than weight or waist

**Body Fat %:** Monthly
• Requires consistent measurement method
• Shows composition changes independent of weight

**Why Not Daily?**
Daily measurements create data noise. Weight fluctuates 1-2 kg daily due to:
• Water retention
• Food in digestive system
• Sodium intake
• Hormonal changes
• Exercise timing

Weekly trends are more meaningful than daily numbers.

**Exception:** If you're using a smart scale that tracks trends automatically, daily measurements are fine—just focus on weekly averages, not individual readings.`,
        tags: ["measurements", "frequency", "best practices", "tracking"]
      }
    ]
  },
  {
    id: "goals",
    title: "Goals & Progress",
    icon: Target,
    articles: [
      {
        title: "Choosing Your Goal",
        summary: "How to select and adjust your health goals for optimal results.",
        content: `DishCore supports multiple goal types to match your needs.

**Available Goals:**

**Lose Weight**
• Safe pace: 0.5-1 kg (1-2 lbs) per week
• Creates moderate calorie deficit
• Emphasizes protein to preserve muscle
• Recommended for most people starting out

**Maintain**
• Eat at maintenance calories
• Focus on consistent nutrition quality
• Ideal after reaching target weight
• Supports habit formation

**Build Muscle**
• Slight calorie surplus
• High protein targets (1.8-2.2g per kg body weight)
• Supports strength training
• May include slight weight gain

**Improve Health**
• Balanced macros
• Focus on whole foods
• Emphasizes fiber, micronutrients
• Moderate calorie target

**Balanced Lifestyle**
• General wellness approach
• Flexible eating patterns
• Sustainable long-term
• No strict targets

**How DishCore Adapts:**
When you change goals, DishCore instantly recalculates:
• Daily calorie target
• Protein/carb/fat ratios
• Meal suggestions
• Portion sizes
• Studio™ Score criteria

**Changing Goals:**
You can switch goals anytime from Body Goals page. Your progress history is preserved, and the system adapts to your new target immediately.

**Realistic Expectations:**
• Week 1-2: Initial water weight changes (up or down)
• Week 3+: True fat/muscle changes become visible
• Month 2-3: Noticeable body composition changes
• Month 6+: Sustainable habit formation

Slow, steady progress beats aggressive short-term changes.`,
        tags: ["goals", "targets", "planning", "weight loss", "muscle gain"]
      },
      {
        title: "Understanding Progress Rings",
        summary: "How to read and interpret the progress indicators on your dashboard.",
        content: `Your Dashboard displays progress rings that visualize your daily performance.

**Main Progress Rings:**

**Daily Target Ring (Calories)**
• Shows calorie intake vs. target
• Green when within 100 kcal of target
• Yellow when slightly over/under
• Red when significantly off target
• Tracks toward 100% completion

**DishCore Score Ring**
• 0-100 scale measuring overall nutrition quality
• Considers: calories, protein, meal timing, hydration, consistency
• 70+ = Good
• 80+ = Excellent
• 90+ = Outstanding

**Meal Quality Ring**
• Evaluates food choices and variety
• Tracks whole foods vs. processed
• Measures nutrient density
• Fills as you log balanced meals

**Consistency Ring**
• Shows how many days you've logged this week
• Builds as you track regularly
• Resets weekly
• Motivates daily engagement

**Activity Ring (if wearable connected)**
• Displays steps, active minutes, or exercise
• Auto-fills from connected devices
• Can be manually adjusted

**How to Use Rings Effectively:**
Don't stress over completing every ring daily. Focus on patterns:
• Are most days hitting 70%+ on Score Ring?
• Is Consistency Ring showing 5-7 days weekly?
• Are you mostly in the green zone for calories?

Rings are guides, not absolute requirements. Perfect days are rare—good weeks are what matter.`,
        tags: ["progress", "dashboard", "rings", "tracking"]
      },
      {
        title: "Why Weight Isn't the Whole Story",
        summary: "Understanding multiple health metrics beyond the number on the scale.",
        content: `Weight is just one piece of your health picture. DishCore uses a multi-metric approach for complete progress tracking.

**Metrics That Matter:**

**Waist Measurement**
• More accurate indicator of health than weight
• Measures visceral fat (around organs)
• Predicts metabolic health better than BMI
• Can decrease while weight stays stable (muscle gain + fat loss)

**Body Composition**
• Muscle vs. fat ratio
• Can improve dramatically without weight change
• Building muscle increases metabolism
• Focus on how clothes fit, not just scale weight

**Behavior Patterns**
• Meal consistency
• Logging frequency
• Menu adherence
• Sleep quality
• Hydration levels

**Food Quality**
• Whole foods vs. processed
• Protein intake
• Fiber consumption
• Nutrient density
• Meal timing

**Daily Balance**
• Energy levels throughout the day
• Hunger patterns
• Mood stability
• Recovery from exercise
• Sleep quality

**Why Weight Fluctuates:**
• Water retention from sodium, exercise, hormones
• Digestive system contents (0.5-2 kg)
• Glycogen storage changes
• Time of day
• Menstrual cycle (for women)

**The DishCore Approach:**
Instead of fixating on weight, focus on:
• Shrinking waist measurement
• Improving DishCore Score
• Feeling more energized
• Better food relationships
• Sustainable habits

Weight will follow as a natural result of consistent healthy behaviors. The scale is a lagging indicator—your daily choices are the leading indicators.`,
        tags: ["progress", "weight", "body composition", "measurements", "health"]
      }
    ]
  },
  {
    id: "menu",
    title: "Meal Planning & Menu Engine",
    icon: Utensils,
    articles: [
      {
        title: "How the Adaptive Menu Works",
        summary: "Behind the scenes of DishCore's intelligent meal planning system.",
        content: `The Adaptive Menu Engine is DishCore's core technology for personalized nutrition.

**What It Considers:**

**Your Profile:**
• Current weight and measurements
• Calorie targets
• Macro ratios (protein/carbs/fat)
• Activity level
• Dietary restrictions

**Your Preferences:**
• Dishes you've rated highly
• Meals you've skipped or swapped
• Favorite cuisines
• Cooking time preferences
• Budget considerations

**Your Progress:**
• Weekly DishCore Score trends
• Weight changes
• Adherence patterns
• Meal timing habits

**Each Dish Has Internal Formulas:**

**Energy Density Score**
• Calories per gram
• Satiety prediction
• Meal timing appropriateness

**Protein/Fiber Score**
• Essential nutrient content
• Keeps you full longer
• Supports recovery and metabolism

**Meal Timing Logic**
• Breakfast: moderate carbs, good protein
• Lunch: balanced macros
• Dinner: lighter carbs, higher protein
• Snacks: fiber-rich, portion-controlled

**Ingredient Quality**
• Whole foods prioritized
• Processed foods minimized
• Nutrient density maximized

**Portion Size Stabilizer**
• Automatically adjusts portions to hit targets
• Accounts for your typical hunger patterns
• Prevents over/under eating

**Menu Generation:**
1. System analyzes your week ahead
2. Distributes calories across days
3. Balances variety with preferences
4. Ensures macro targets are met
5. Provides alternatives for flexibility

**You Can:**
• Regenerate menus anytime
• Swap any individual meal
• Save favorite weekly patterns
• Adjust portion sizes
• Mark dishes as "never suggest again"

The engine learns continuously—the more you use it, the better your suggestions become.`,
        tags: ["menu", "planning", "adaptive", "ai", "personalization"]
      },
      {
        title: "Switching Meals You Don't Like",
        summary: "How to customize your meal plan with alternative dishes.",
        content: `Every meal in your plan is flexible. DishCore makes swapping easy.

**How to Swap a Meal:**
1. Click on any dish in your meal plan
2. Select "Swap This Meal"
3. View alternative dishes with similar nutrition
4. Choose your replacement
5. Changes save automatically

**Swap Filters:**
When swapping, you can filter alternatives by:
• Similar calories (±50 kcal)
• Similar protein (±10g)
• Quick prep time (<20 min)
• Budget-friendly
• Specific cuisine
• Dietary restrictions
• Cooking method (oven, stovetop, no-cook)

**Smart Swapping:**
DishCore remembers your swaps and learns:
• If you always swap chicken for fish → more fish suggested
• If you skip high-prep meals → more quick recipes offered
• If you love specific cuisines → those featured more often

**Swap Limits:**
You can swap as many meals as you want. However, if you're swapping most meals repeatedly, consider:
• Regenerating the entire menu with updated preferences
• Updating your profile with dislikes
• Adjusting your dietary restrictions
• Changing your cuisine preferences

**Maintaining Nutrition Balance:**
All swap suggestions maintain your:
• Daily calorie target
• Protein minimum
• Macro ratios
• Meal timing appropriateness

You can't swap a breakfast for a dessert, for example. DishCore keeps meal types appropriate.

**Favorites System:**
When you find dishes you love:
• Star them as favorites
• They'll appear more frequently in future menus
• Access them quickly from "My Favorites" tab

**Editing Dishes:**
Beyond swapping, you can:
• Adjust portion sizes (0.5x, 1x, 1.5x, 2x)
• Remove ingredients you don't like
• Add side dishes
• Combine multiple small meals into one

Flexibility is key—DishCore adapts to your real life, not the other way around.`,
        tags: ["swap", "meals", "alternatives", "customization", "preferences"]
      },
      {
        title: "Meal Tags & Filters",
        summary: "Using DishCore's tagging system to find the perfect meals for any situation.",
        content: `DishCore uses an extensive tagging system to help you find exactly what you need.

**Nutrition Tags:**
• **High-Protein** (30g+ protein per serving)
• **Low-Carb** (<20g carbs per serving)
• **Low-Calorie** (<300 kcal per serving)
• **High-Fiber** (8g+ fiber per serving)
• **Low-Fat** (<10g fat per serving)

**Dietary Tags:**
• **Vegetarian** (no meat, fish, or poultry)
• **Vegan** (no animal products)
• **Pescatarian** (fish but no other meat)
• **Dairy-Free** (no milk, cheese, yogurt)
• **Gluten-Free** (no wheat, barley, rye)
• **Nut-Free** (safe for nut allergies)

**Lifestyle Tags:**
• **Budget** (inexpensive ingredients)
• **Quick Meals** (<20 min total time)
• **Meal Prep** (batch-friendly, stores well)
• **No-Cook** (zero cooking required)
• **One-Pot** (minimal cleanup)

**Purpose Tags:**
• **Muscle-Building** (optimized for strength training)
• **Energy Boost** (balanced quick-digesting carbs)
• **Comfort Food** (satisfying, cozy meals)
• **Light & Fresh** (salads, light proteins)
• **Post-Workout** (protein + carbs for recovery)

**Cuisine Tags:**
• Mediterranean
• Asian
• Mexican
• Italian
• American
• Middle Eastern
• Indian
• French

**Complexity Tags:**
• **Beginner** (easy techniques, common ingredients)
• **Intermediate** (some skills required)
• **Chef-Style** (advanced techniques, impressive results)

**How to Use Filters:**
1. Go to Dish Library or Menu Planner
2. Click "Filters"
3. Select multiple tags to narrow results
4. Tags combine (AND logic): "High-Protein + Quick" shows only quick high-protein meals

**Saving Filter Presets:**
Create custom filter combinations like:
• "Weeknight Easy" (Quick + Budget + Beginner)
• "Fitness Focus" (High-Protein + Low-Carb + Muscle-Building)
• "Weekend Chef" (Chef-Style + Comfort Food)

**Tag-Based Menu Generation:**
When generating menus, you can set:
• "Only show Budget meals this week"
• "No dishes over 30 min prep time"
• "Mediterranean cuisine focus"

This ensures your entire week aligns with your current needs and constraints.`,
        tags: ["filters", "tags", "search", "dishes", "customization"]
      }
    ]
  },
  {
    id: "studio",
    title: "DishCore Studio™",
    icon: Sparkles,
    articles: [
      {
        title: "What Is DishCore Studio™?",
        summary: "Introduction to the premium analytics and optimization layer of DishCore.",
        content: `DishCore Studio™ is your professional-grade health analytics dashboard.

**What Studio Includes:**

**DishCore Score Engine**
• 0-100 daily nutrition score
• Breakdown of score components
• Historical trends
• Score forecasting

**Metabolism Map**
• Visual representation of body zones
• Shows response to nutrition
• Identifies optimization opportunities
• Tracks metabolic direction

**Weekly Insights**
• AI-generated observations
• What worked well
• Areas for improvement
• Personalized recommendations
• Next week's focus

**Advanced Analytics:**
• Timing analysis (when you eat best)
• Dish quality distribution
• Variability detection (consistency metrics)
• Trend curves (multi-week patterns)
• Stability index (how steady your nutrition is)

**Why Studio Matters:**
Basic DishCore shows *what* you're eating. Studio shows *how well* your nutrition strategy is working and *why*.

**Who Studio Is For:**
• Users who want deep insights
• People working with coaches or nutritionists
• Those optimizing athletic performance
• Anyone interested in data-driven health
• Users who've plateaued and need optimization

**Studio vs. Basic:**
• **Basic:** Tracking, goals, meal plans, reports
• **Studio:** Everything in Basic PLUS advanced analytics, score engine, metabolism insights, AI-driven optimization

**Getting Started with Studio:**
1. Ensure you have 2+ weeks of consistent data
2. Navigate to DishCore Studio™ from the sidebar
3. Explore your Score breakdown
4. Review your Metabolism Map
5. Read Weekly Insights
6. Apply recommended optimizations

Studio becomes more valuable over time as it accumulates data and identifies long-term patterns.`,
        tags: ["studio", "premium", "analytics", "advanced"]
      },
      {
        title: "Understanding DishCore Score",
        summary: "How your daily nutrition score is calculated and what it means.",
        content: `The DishCore Score (0-100) is your daily nutrition quality rating.

**Score Components:**

**Calorie Balance (30 points)**
• On target = 30 points
• Within 10% = 25-29 points
• Within 20% = 20-24 points
• Outside 20% = 0-19 points

**Protein Intake (25 points)**
• Meeting target = 25 points
• Within 10g = 20-24 points
• Within 20g = 15-19 points
• Below 50% of target = 0-14 points

**Meal Timing (15 points)**
• 3-4 balanced meals = 15 points
• 2 large meals = 10 points
• 1 large meal = 5 points
• Irregular timing = 0-4 points

**Hydration (10 points)**
• 8+ cups water = 10 points
• 6-7 cups = 7-9 points
• 4-5 cups = 4-6 points
• <4 cups = 0-3 points

**Food Quality (10 points)**
• 80%+ whole foods = 10 points
• 60-79% whole foods = 7-9 points
• 40-59% whole foods = 4-6 points
• <40% whole foods = 0-3 points

**Consistency (10 points)**
• All meals logged = 10 points
• Most meals logged = 7-9 points
• Some meals logged = 4-6 points
• Minimal logging = 0-3 points

**Score Interpretation:**

**90-100: Excellent**
• Hitting all targets
• Great habits
• Sustainable practices
• Keep it up!

**80-89: Very Good**
• Mostly on track
• Minor optimization opportunities
• Solid progress expected

**70-79: Good**
• Generally healthy
• Some inconsistencies
• Review Weekly Insights for improvement ideas

**60-69: Fair**
• Missing key targets
• Need more consistency
• Check where score is lowest

**Below 60: Needs Attention**
• Significant gaps in nutrition
• Review meal plan
• Consider simplifying approach
• Focus on basics first

**Using Your Score:**
Don't obsess over daily scores. Track weekly averages:
• **Weekly average 80+:** Excellent progress likely
• **Weekly average 70-79:** Good progress expected
• **Weekly average <70:** Revisit strategy

**Score Trends:**
Studio shows how your score changes over time. Look for:
• Upward trends (improving habits)
• Weekend dips (common, plan ahead)
• Sudden drops (identify triggers)
• Plateaus (need strategy shift)

Your score guides decisions without being punitive. A few low-score days won't derail progress—focus on the trend.`,
        tags: ["score", "metrics", "nutrition", "quality", "tracking"]
      },
      {
        title: "Metabolism Map Explained",
        summary: "Understanding the visual representation of how your body responds to nutrition.",
        content: `The Metabolism Map visualizes your body's response to nutrition across different zones.

**The Five Zones:**

**1. Waist Zone (Abdominal Region)**
• Tracks waist circumference changes
• Indicates visceral fat levels
• Most responsive to diet changes
• **Green:** Shrinking consistently
• **Blue:** Stable and healthy
• **Yellow:** Minor fluctuations
• **Red:** Increasing, needs attention

**2. Abdomen Zone (Core Area)**
• Overall core stability
• Digestive efficiency
• Bloating patterns
• Fiber/water impact
• **Green:** Well-balanced nutrition
• **Blue:** Maintaining well
• **Yellow:** Occasional issues
• **Red:** Frequent bloating/discomfort

**3. Muscle Zone (Lean Mass)**
• Protein synthesis indicators
• Recovery patterns
• Strength maintenance
• Activity integration
• **Green:** Building/maintaining muscle
• **Blue:** Stable muscle mass
• **Yellow:** Minor losses
• **Red:** Significant muscle loss

**4. Energy Zone (Metabolic Activity)**
• Daily energy levels
• Carb utilization
• Sleep quality impact
• Workout performance
• **Green:** Consistently high energy
• **Blue:** Stable, adequate energy
• **Yellow:** Fluctuating energy
• **Red:** Persistent fatigue

**5. Skin Zone (External Indicators)**
• Hydration status
• Micronutrient adequacy
• Overall wellness
• Inflammation markers
• **Green:** Optimal hydration/nutrients
• **Blue:** Healthy status
• **Yellow:** Needs minor adjustments
• **Red:** Deficiencies possible

**How Zones Interact:**
All zones influence each other. For example:
• Poor sleep (Energy Zone) → increased hunger → harder to shrink waist (Waist Zone)
• Low protein (Muscle Zone) → slower metabolism → impacts all zones
• High sodium → water retention (Abdomen Zone) → temporary weight gain

**Using the Map:**
1. Identify which zones are green/blue (doing well)
2. Focus on yellow/red zones for improvement
3. Check Zone-specific recommendations in Studio
4. Track changes week-over-week

**Map Updates:**
The Metabolism Map updates weekly based on:
• Your measurements
• Meal logs
• DishCore Score trends
• Activity data
• Progress patterns

**Zone-Specific Actions:**

**If Waist Zone is Red:**
• Reduce refined carbs
• Increase fiber
• Check sodium intake
• Ensure adequate protein

**If Energy Zone is Red:**
• Review sleep quality
• Check carb timing
• Ensure sufficient calories
• Consider micronutrient intake

**If Muscle Zone is Yellow/Red:**
• Increase protein (aim for 1.8-2.2g/kg)
• Add resistance training
• Check overall calorie intake
• Ensure recovery days

The Metabolism Map turns complex data into actionable visual insights. Focus on making one zone better each week rather than fixing everything at once.`,
        tags: ["metabolism", "zones", "visualization", "analysis", "studio"]
      }
    ]
  },
  {
    id: "tracking",
    title: "Tracking & Analytics",
    icon: BarChart3,
    articles: [
      {
        title: "What Can You Track?",
        summary: "Complete guide to all trackable metrics in DishCore for comprehensive health monitoring.",
        content: `DishCore allows you to track multiple health and lifestyle metrics for holistic insights.

**Nutrition Tracking:**

**Meals & Food Intake**
• Breakfast, lunch, dinner, snacks
• Portion sizes
• Macros (protein, carbs, fat)
• Calories
• Micronutrients (when available)
• Meal timing
• Eating out vs. home-cooked

**Hydration**
• Water intake (cups/ml)
• Other beverages
• Hydration reminders
• Daily goals

**Physical Activity:**

**Steps**
• Daily step count
• Distance walked
• Active minutes
• Automatically syncs from wearables

**Exercise**
• Workout type (cardio, strength, yoga, etc.)
• Duration
• Intensity
• Calories burned estimate

**Sleep:**

**Sleep Quality**
• Total sleep hours
• Bedtime & wake time
• Sleep quality rating (1-5)
• Disruptions
• Auto-sync from wearables

**Sleep Stages (if wearable connected)**
• Deep sleep
• Light sleep
• REM sleep
• Awake time

**Wellness Tracking:**

**Mood**
• Daily mood rating
• Energy levels
• Stress levels
• Emotional eating triggers

**Symptoms**
• Headaches
• Digestive issues
• Cravings
• Hunger levels
• Bloating

**Energy Levels**
• Morning energy
• Afternoon slumps
• Evening energy
• Overall vitality

**Additional Metrics:**

**Cravings**
• Type of craving (sweet, salty, carbs)
• Intensity
• Triggers
• How you responded

**Body Feelings**
• How clothes fit
• Perceived body changes
• Physical sensations
• Confidence levels

**Why Track Multiple Metrics?**

Tracking reveals connections:
• Poor sleep → increased hunger → harder to hit calorie targets
• Low water → afternoon fatigue → evening cravings
• Skipped breakfast → large dinner → poor sleep → cycle continues

**What's Required vs. Optional:**

**Essential for DishCore to work:**
• Meal logging (at least most days)
• Weekly weight measurements

**Highly Recommended:**
• Waist measurements (weekly)
• Hydration tracking
• Sleep hours

**Optional but valuable:**
• Mood tracking
• Symptom logging
• Detailed activity tracking
• Cravings and hunger patterns

**Getting Started:**
Don't track everything at once. Start with:
1. Meals (core requirement)
2. Water (easy habit)
3. Sleep (major impact)
4. Add others gradually as habits form

**Using Tracked Data:**
DishCore analyzes your tracking data to:
• Identify patterns and correlations
• Suggest menu adjustments
• Predict challenging days
• Celebrate progress
• Generate Weekly Insights (Studio)

The more you track, the smarter DishCore becomes—but start simple and build consistency first.`,
        tags: ["tracking", "logging", "metrics", "data"]
      },
      {
        title: "Wearables Integration",
        summary: "How to connect fitness trackers and smartwatches for automatic data sync.",
        content: `DishCore integrates with popular wearables for seamless health tracking.

**Currently Supported Devices:**
• Apple Health (iPhone)
• Fitbit (all models)
• Garmin (watches & fitness trackers)
• Oura Ring (coming soon)
• Whoop (coming soon)

**What Data Syncs Automatically:**

**From All Devices:**
• Daily step count
• Active minutes
• Calories burned estimate
• Sleep duration
• Heart rate data

**From Advanced Devices:**
• Sleep stages (deep, light, REM)
• Heart rate variability (HRV)
• Resting heart rate
• Recovery scores
• Workout details (type, duration, intensity)
• VO2 max estimates

**How to Connect Your Wearable:**

**For Apple Health:**
1. Go to Settings → Wearables
2. Select "Apple Health"
3. Click "Connect"
4. Authorize DishCore to read Health data
5. Choose which metrics to sync
6. Data syncs automatically going forward

**For Fitbit:**
1. Go to Settings → Wearables
2. Select "Fitbit"
3. Log into your Fitbit account
4. Authorize DishCore
5. Select data permissions
6. Sync happens every few hours

**For Garmin:**
1. Go to Settings → Wearables
2. Select "Garmin"
3. Log into Garmin Connect
4. Grant permissions
5. Data syncs automatically

**Sync Frequency:**
• **Apple Health:** Real-time when app is open
• **Fitbit:** Every 2-4 hours
• **Garmin:** Every 1-2 hours

**Manual Sync:**
You can force a sync anytime by going to Wearables Settings and clicking "Sync Now."

**Benefits of Wearable Integration:**

**Automatic Tracking:**
No manual data entry for steps, sleep, or workouts—everything flows automatically.

**Better Calorie Adjustments:**
DishCore adjusts your calorie target on high-activity days based on actual energy expenditure.

**Sleep-Nutrition Insights:**
Studio analyzes how sleep quality affects your nutrition patterns and hunger levels.

**Recovery Awareness:**
On low-recovery days, DishCore suggests easier meal prep and lighter meals.

**Workout-Meal Timing:**
Post-workout meals can be suggested with optimal protein/carb ratios.

**Troubleshooting Connection Issues:**

**Device not showing up:**
• Ensure wearable app is installed and logged in
• Check that device has synced recently
• Try disconnecting and reconnecting

**Data not syncing:**
• Force a manual sync
• Check permission settings in wearable app
• Restart both apps
• Ensure wearable has battery

**Data seems incorrect:**
• Wearables provide estimates, not exact values
• Check device placement and fit
• Compare with other tracking methods
• Contact support if persistently wrong

**Privacy & Data:**
• DishCore only reads data you authorize
• Wearable data is not shared with third parties
• You can disconnect devices anytime
• Historical data remains after disconnecting

**Coming Soon:**
• More wearable brands
• GPS run tracking integration
• Workout intensity recommendations
• Advanced HRV analysis

Wearable integration makes DishCore significantly more powerful by reducing manual effort and providing richer data for analysis.`,
        tags: ["wearables", "sync", "devices", "automation", "integration"]
      }
    ]
  },
  {
    id: "tools",
    title: "Tools & Extra Features",
    icon: Activity,
    articles: [
      {
        title: "Dish Library",
        summary: "How to browse, search, and manage your personal recipe collection.",
        content: `The Dish Library is your comprehensive database of meals and recipes.

**What's in the Library:**
• 1000+ pre-loaded dishes
• Your custom recipes
• Recently logged meals
• Favorite dishes
• Dishes from your meal plans

**Browsing the Library:**
1. Navigate to Dish Library from the sidebar
2. Browse all dishes or filter by category
3. Click any dish for detailed view

**Search Features:**
• Search by dish name
• Search by ingredient
• Search by cuisine type
• Search by preparation method

**Filter Options:**
• Meal type (breakfast, lunch, dinner, snack)
• Calorie range
• Protein content
• Preparation time
• Difficulty level
• Dietary restrictions
• Cuisine
• Custom tags

**Detailed Dish View:**
Each dish shows:
• Hero image
• Full nutritional breakdown
• Ingredients list with quantities
• Step-by-step instructions
• Preparation time
• Cooking time
• Difficulty rating
• User ratings and reviews
• Allergen warnings
• Dietary tags

**Creating Custom Dishes:**
1. Click "Add Custom Dish"
2. Enter dish name
3. Add ingredients (DishCore calculates nutrition automatically)
4. Enter portion size and servings
5. Add preparation instructions (optional)
6. Add photos (optional)
7. Save

**Your Custom Dishes:**
• Appear in menu suggestions
• Can be edited anytime
• Private to your account
• Can be shared with community (optional)

**Favorites System:**
• Star any dish to save it as a favorite
• Quick access from "Favorites" tab
• Favorites appear more often in menu suggestions
• Create favorite collections (e.g., "Quick Breakfasts," "Meal Prep")

**Rating & Reviews:**
• Rate dishes 1-5 stars after trying them
• Leave written reviews
• See community ratings
• Help others discover great meals

**Dish Collections:**
Browse pre-made collections:
• High-Protein Favorites
• Quick & Easy
• Budget-Friendly
• Comfort Classics
• International Flavors
• Meal Prep Heroes

**Nutritional Database:**
DishCore uses:
• USDA FoodData Central
• International food databases
• Verified user submissions
• Restaurant chain data (where available)

**Importing Recipes:**
• Paste recipe URLs from popular sites
• DishCore extracts ingredients and nutrition
• Review and save to your library

The Dish Library grows with you—the more you use DishCore, the more personalized your library becomes.`,
        tags: ["dishes", "recipes", "library", "search", "favorites"]
      },
      {
        title: "Food Scanner",
        summary: "Using AI-powered photo analysis to log meals instantly.",
        content: `The Food Scanner uses AI to analyze food photos and estimate nutrition.

**How Food Scanner Works:**
1. Open Food Scanner from Dashboard or Tracking page
2. Take a photo of your meal or select from gallery
3. AI analyzes visible ingredients
4. Nutrition data appears within seconds
5. Review and adjust if needed
6. Log the meal

**What the AI Recognizes:**
• Common foods and ingredients
• Portion sizes (with reference objects)
• Cooking methods
• Multiple foods on one plate
• Packaged foods by appearance

**Best Practices for Photos:**
• Good lighting (natural light is best)
• Photo from above (bird's eye view)
• Include the entire meal in frame
• Place a reference object (fork, phone) for scale
• Avoid shadows and glare
• Take photo before eating (obviously!)

**Accuracy Tips:**
Food Scanner provides estimates. For best accuracy:
• Photograph simple, identifiable foods
• Use barcode scanner for packaged items
• Manually adjust unusual portion sizes
• Add missing ingredients
• Verify protein sources (scanner may underestimate)

**What Food Scanner Provides:**
• Total calories
• Protein, carbs, fat breakdown
• Estimated portion size
• Food category
• Suggested meal name

**When to Use Manual Entry Instead:**
• Complex mixed dishes (casseroles, stews)
• Very small portions
• Multiple similar foods
• Poor lighting conditions
• Highly processed foods

**Barcode Scanner:**
For packaged foods, use the barcode scanner:
1. Click barcode icon in Food Scanner
2. Point camera at product barcode
3. Instant nutrition data from product database
4. Adjust serving size
5. Log meal

**Barcode Database:**
• 500,000+ products
• Includes: serving sizes, full nutrition, allergens
• More accurate than photo scanning for packaged items

**AI Learning:**
Food Scanner improves over time:
• Your corrections train the AI
• Frequently logged foods become more accurate
• Regional food recognition improves with use

**Limitations:**
Food Scanner cannot:
• See hidden ingredients (sauces, oils inside food)
• Accurately estimate heavily processed foods
• Detect all seasonings and additives
• Determine exact preparation methods

**Pro Tips:**
• Use scanner for main components, manually add oils/sauces
• Scan foods separately if mixed plate
• Cross-reference with similar dishes in library
• Over time, save accurate scans as "Recent Meals" for one-tap logging

Food Scanner makes logging 5x faster while maintaining reasonable accuracy. Perfect for everyday tracking without obsessive measuring.`,
        tags: ["scanner", "ai", "photos", "logging", "quick"]
      },
      {
        title: "Restaurant Mode",
        summary: "Navigating dining out while staying aligned with your nutrition goals.",
        content: `Restaurant Mode helps you make informed choices when eating out.

**How to Use Restaurant Mode:**
1. Open Restaurant Mode from Tools menu
2. Search for restaurant by name
3. Browse menu items
4. View nutrition data per dish
5. See DishCore recommendations
6. Log selected meal

**Restaurant Database:**
• Chain restaurants (McDonald's, Chipotle, Panera, etc.)
• Fast food establishments
• Fast-casual dining
• Major sit-down chains
• Coffee shops

**What You'll See:**
• Full menu with photos
• Calorie counts
• Macro breakdown
• Portion sizes
• Allergen information
• DishCore Score estimate for each dish

**DishCore Recommendations:**
Restaurant Mode highlights:
• **Best Match:** Closest to your daily targets
• **High Protein:** Options with 30g+ protein
• **Lower Calorie:** Lighter choices under 500 kcal
• **Balanced:** Good macro distribution

**Customization Options:**
Many restaurants allow customizations:
• Substitute sides
• Request sauces on the side
• Add or remove ingredients
• Adjust portion sizes

DishCore shows how customizations affect nutrition.

**When Restaurant Isn't Listed:**
1. Browse by cuisine type
2. Search for similar dishes
3. Use closest approximation
4. Adjust portion size manually
5. Or use Food Scanner after meal arrives

**Dining Out Strategy:**

**Before You Go:**
• Review menu online
• Pre-select options
• Plan rest of day accordingly

**At the Restaurant:**
• Choose DishCore-recommended options
• Ask for modifications
• Request half portions or split meals
• Take leftovers home

**After Dining:**
• Log meal promptly
• Note how you felt (energy, fullness)
• DishCore learns your dining preferences

**Common Restaurant Pitfalls:**

**Hidden Calories:**
• Butter/oil in cooking
• Creamy sauces and dressings
• Fried preparation
• Large portion sizes

**How to Avoid:**
• Ask for grilled instead of fried
• Dressing on the side
• Share appetizers
• Start with salad or soup

**Fast Food Tips:**
• Skip the combo (a la carte)
• Choose grilled over breaded
• Opt for water instead of soda
• Skip extra cheese/bacon

**Sit-Down Restaurant Tips:**
• Share an entrée
• Order appetizer as main
• Ask for sauces on side
• Request steamed vegetables instead of fries

**Special Occasions:**
Restaurant Mode isn't about restriction—it's about informed choices. For celebrations:
• Enjoy your meal
• Log it honestly
• Return to routine next day
• One meal won't derail progress

**Coming Soon:**
• Independent restaurant integration
• User-submitted restaurant data
• GPS-based nearby restaurant suggestions
• Reservation integration

Restaurant Mode makes dining out compatible with your health goals without sacrificing social experiences.`,
        tags: ["restaurant", "dining", "eating out", "social"]
      },
      {
        title: "Grocery List Generator",
        summary: "Automatically create organized shopping lists from your meal plans.",
        content: `The Grocery List Generator turns your meal plans into organized shopping lists.

**How It Works:**
1. Generate or select your weekly meal plan
2. Click "Generate Grocery List"
3. DishCore compiles all ingredients
4. Ingredients are organized by category
5. Quantities are calculated automatically
6. Review and customize the list
7. Export or share

**List Organization:**
Ingredients are grouped by store section:
• Produce
• Meat & Seafood
• Dairy & Eggs
• Grains & Pasta
• Canned & Packaged
• Frozen Foods
• Spices & Condiments
• Bakery
• Beverages

**Smart Features:**

**Quantity Consolidation:**
If multiple recipes need the same ingredient, DishCore combines them:
• 2 cups onions (Recipe A) + 1 cup onions (Recipe B) = 3 cups onions total

**Pantry Staples:**
Mark items as "I have this" to remove from list:
• Olive oil
• Salt, pepper
• Common spices
• Long-lasting ingredients

**Serving Adjustments:**
If you're cooking for more/fewer people:
• Adjust multiplier
• All quantities scale automatically

**Unit Conversions:**
Choose display units:
• Metric (grams, liters)
• Imperial (cups, ounces)
• Mixed (whatever makes sense for each item)

**Customization Options:**

**Add Items Manually:**
• Non-recipe items (snacks, household goods)
• Preferred brands
• Quantities you know you need

**Remove Items:**
• Ingredients you'll skip
• Items already in pantry
• Substitutions you're making

**Rearrange Categories:**
• Match your preferred store layout
• Group items how you shop

**Notes & Preferences:**
• Add notes per item ("organic preferred")
• Specify brands
• Note sale items

**Sharing & Exporting:**

**Share with Others:**
• Text message
• Email
• Shared app (e.g., AnyList, Bring!)

**Export Formats:**
• PDF (printable)
• Plain text
• CSV

**Mobile-Friendly:**
• Access list on phone while shopping
• Check off items as you shop
• List syncs across devices

**Budget Tracking (Coming Soon):**
• Estimated cost per item
• Total budget estimate
• Track actual spending

**Substitution Suggestions:**
If an ingredient is expensive or unavailable:
• DishCore suggests alternatives
• Shows nutrition impact of substitution

**Batch Shopping:**
Generate lists for multiple weeks:
• Identify overlapping ingredients
• Buy in bulk where appropriate
• Reduce shopping trips

**Pro Tips:**
• Generate list Saturday for Sunday shopping
• Check pantry before generating
• Add buffer quantities for staples
• Use photo feature to capture list

**Integration (Future):**
• Grocery delivery service integration
• Online cart pre-fill
• Store loyalty programs
• Real-time inventory at local stores

The Grocery List Generator eliminates the hassle of meal planning logistics, making healthy eating more convenient and less time-consuming.`,
        tags: ["grocery", "shopping", "list", "meal prep", "planning"]
      }
    ]
  },
  {
    id: "reports",
    title: "Reports & Sharing",
    icon: Share2,
    articles: [
      {
        title: "Understanding Reports",
        summary: "Complete guide to daily, weekly, and monthly health reports.",
        content: `DishCore generates comprehensive reports to track progress and share with others.

**Report Types:**

**Daily Report:**
• Today's calorie intake vs. target
• Macro breakdown (protein, carbs, fat)
• Meal-by-meal summary
• DishCore Score for the day
• Hydration level
• Activity summary
• Quick insights

**Weekly Report:**
• 7-day overview
• Average daily calories
• Macro trends
• Weight change
• Waist measurement (if logged)
• DishCore Score average
• Consistency tracking
• Top dishes eaten
• AI-generated weekly insights

**Monthly Report:**
• 30-day comprehensive analysis
• Body measurement trends
• Goal progress
• Adherence statistics
• Habit formation indicators
• Menu effectiveness
• Correlations discovered
• Recommendations for next month

**What's Included in Reports:**

**Nutrition Summary:**
• Total calories consumed
• Protein, carbs, fat averages
• Fiber intake
• Key micronutrients (if tracked)
• Meal frequency and timing

**Body Metrics:**
• Weight trend with chart
• Waist measurement changes
• Other measurements (if logged)
• BMI and waist-to-height ratio

**Progress Indicators:**
• Distance to goal
• Rate of progress
• Projected timeline
• Milestones hit

**Behavioral Insights:**
• Logging consistency
• Meal prep frequency
• Dining out patterns
• Weekend vs. weekday differences

**DishCore Studio™ Data (if enabled):**
• DishCore Score trends
• Metabolism Map changes
• Zone-specific progress
• Detailed pattern analysis

**Visual Elements:**
• Line charts (weight, calories)
• Bar charts (macro distribution)
• Pie charts (food categories)
• Metabolism Map visualization
• Progress rings

**Generating a Report:**
1. Go to Reports & Share
2. Select time period (daily, weekly, monthly, custom)
3. Choose what to include
4. Click "Generate Report"
5. Report appears in seconds

**Customization:**
Control what appears in reports:
• Include/exclude specific metrics
• Show or hide certain days
• Add personal notes
• Highlight specific achievements

**Report Actions:**
• **View:** Browse report in-app
• **Download PDF:** Professional print-ready format
• **Copy Link:** Share via web link
• **Email:** Send directly to someone
• **Print:** Hard copy for records

**Professional Formatting:**
Reports are designed for:
• Healthcare providers
• Nutritionists and dietitians
• Personal trainers
• Coaches
• Insurance documentation
• Personal records

**Privacy Controls:**
• Set report expiration dates
• Password-protect sensitive reports
• Revoke access to shared links
• Control which metrics are visible

**Automated Reports (Premium):**
Schedule reports to generate automatically:
• Weekly every Monday
• Monthly on the 1st
• Custom schedules
• Email delivery

**Using Reports Effectively:**

**For Self-Review:**
• Weekly review of progress
• Identify patterns and trends
• Celebrate wins
• Adjust strategy as needed

**For Healthcare Providers:**
• Share before appointments
• Provide comprehensive data
• Enable informed discussions
• Track treatment effectiveness

**For Coaches:**
• Regular check-ins
• Progress accountability
• Strategy refinement
• Goal adjustments

**For Motivation:**
• Visual proof of progress
• Long-term trend visibility
• Milestone documentation
• Share with support network

Reports transform raw data into meaningful insights and make your progress tangible and shareable.`,
        tags: ["reports", "analytics", "progress", "tracking"]
      },
      {
        title: "Sharing Your Progress",
        summary: "How to safely share your health data with others.",
        content: `DishCore makes it easy to share your progress with healthcare providers, coaches, or support networks.

**What You Can Share:**
• Daily/weekly/monthly reports
• Specific measurements
• Meal plans
• DishCore Score trends
• Metabolism Map
• Progress photos (if uploaded)
• Goal timelines

**Sharing Methods:**

**1. Link Sharing:**
• Generate a private web link
• Set expiration (1 day, 1 week, 1 month, never)
• Anyone with link can view
• Revoke access anytime
• Track who viewed

**2. PDF Download:**
• Professional formatted document
• Includes charts and graphs
• Print-ready
• Email as attachment
• Store in records

**3. Direct Email:**
• Send report directly from DishCore
• Add personal message
• Include specific date ranges
• Schedule recurring sends

**4. Copy Data:**
• Copy summary text
• Paste into messages or documents
• Quick sharing for text-only contexts

**Privacy & Security:**

**What You Control:**
• Which metrics to share
• Date ranges
• Who has access
• How long they can access

**What's Never Shared (unless you choose):**
• Full name (shown as initials or "User")
• Email address
• Payment information
• Private notes

**Shared Link Features:**
• Password protection option
• View-only (no editing or downloading)
• Automatic expiration
• View count tracking

**Sharing with Healthcare Providers:**

**Why Share:**
• Comprehensive nutrition data
• Trend analysis
• Medication effects on appetite
• Treatment plan adjustments
• Insurance documentation

**What to Include:**
• 30-day report minimum
• Body measurements
• Current medications (add in notes)
• Symptoms tracking
• Goal information

**Before Appointment:**
• Generate report
• Email to provider
• Bring printed copy
• Highlight specific concerns

**Sharing with Nutritionists/Dietitians:**

**What They Want to See:**
• Daily food logs
• Macro trends
• Meal timing
• Portion sizes
• Food preferences
• Problem areas

**Collaboration:**
• Some professionals may request weekly reports
• You can schedule automated sends
• They can provide feedback
• Adjust meal plans collaboratively

**Sharing with Personal Trainers:**

**Relevant Data:**
• Protein intake
• Overall calories
• Meal timing around workouts
• Recovery indicators
• Body composition changes
• Energy levels

**Sharing with Support Networks:**

**Friends & Family:**
• Share wins and milestones
• Accountability partnerships
• Group challenges
• Motivation during tough weeks

**DishCore Community:**
• Optional profile sharing
• Progress photos
• Favorite meals
• Tips and insights
• Challenges and competitions

**What to Share Publicly:**
• Non-identifiable progress
• General tips and learnings
• Favorite recipes
• Motivational updates

**What to Keep Private:**
• Exact measurements (if you prefer)
• Medical conditions
• Specific struggles
• Personal notes

**Revoking Access:**
If you shared something and want to remove access:
1. Go to Settings → Privacy → Shared Items
2. Find the shared report or link
3. Click "Revoke Access"
4. Link becomes invalid immediately

**Shared Link Management:**
View all active shared links:
• Who you shared with
• When shared
• Expiration dates
• View counts
• Revoke any link

**Best Practices:**

**For Medical Sharing:**
• Use PDF format
• Include all relevant metrics
• Add context in notes
• Use longer expiration (1 month+)

**For Coaching:**
• Weekly link sharing
• Include behavioral notes
• Highlight specific questions
• Short expiration (1 week)

**For Social:**
• Share wins only (optional)
• Use screenshots instead of full links
• Respect your privacy
• Celebrate without over-sharing

**Coming Soon:**
• Shared family accounts (track multiple family members)
• Coach/client portal integration
• Insurance reporting automation
• Integration with health records systems

Sharing your progress can enhance accountability, enable better professional support, and celebrate achievements with those who matter to you.`,
        tags: ["sharing", "privacy", "reports", "collaboration"]
      }
    ]
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: Wrench,
    articles: [
      {
        title: "Common Issues & Solutions",
        summary: "Quick fixes for the most common DishCore problems.",
        content: `Here are solutions to common issues you might encounter.

**Score Not Updating:**

**Possible Causes:**
• No new measurements logged
• Missing meals for the day
• Insufficient data (need 2+ weeks for trends)
• Cache issue

**Solutions:**
• Log at least one meal
• Add today's weight (if weekly weigh-in day)
• Force refresh (pull down on mobile, F5 on desktop)
• Clear browser cache
• Log out and log back in

**Dishes Look Repetitive:**

**Why This Happens:**
• Limited data on preferences
• Narrow dietary restrictions
• Small favorite list
• Recent profile changes not yet reflected

**Solutions:**
• Update your profile with more preferences
• Rate more dishes (thumbs up/down)
• Expand dietary flexibility where possible
• Manually swap dishes you don't like
• Add more custom recipes
• Regenerate entire menu

**App Feels Slow:**

**Quick Fixes:**
• Close other browser tabs
• Clear browser cache
• Check internet connection
• Disable browser extensions
• Use DishCore in incognito mode (tests if extensions are the issue)
• Restart browser

**Persistent Slowness:**
• Try different browser
• Check device storage (low storage slows everything)
• Disable low-power mode (mobile)
• Update browser to latest version

**Data Not Syncing:**

**Check:**
• Internet connection is stable
• You're logged into the correct account
• Device has recent backup
• Wearable is connected (if using wearables)

**Force Sync:**
• Pull to refresh on mobile
• Click sync button in Settings
• Log out and back in

**Login Issues:**

**Can't Remember Password:**
• Click "Forgot Password"
• Check email for reset link
• Check spam folder
• Use the exact email you signed up with

**Email Not Recognized:**
• Try variations (with/without dots, etc.)
• Check if you used social login (Apple, Google)
• Contact support if still stuck

**Account Locked:**
• Too many failed login attempts
• Wait 15 minutes
• Or use password reset

**Wearable Not Connecting:**

**Steps:**
1. Ensure wearable app is installed and logged in
2. Check that device synced recently in its own app
3. In DishCore: Settings → Wearables → Disconnect → Reconnect
4. Grant all requested permissions
5. Force sync after connecting

**Still Not Working:**
• Restart both apps
• Restart device
• Check wearable manufacturer's app for sync issues
• Try connecting on different device to isolate problem

**Food Scanner Not Working:**

**Common Issues:**
• Poor lighting → use natural light or good indoor lighting
• Blurry photo → hold camera steady
• Multiple foods → scan one at a time
• Unusual foods → AI might not recognize

**Troubleshooting:**
• Retake photo with better conditions
• Use barcode scanner for packaged foods
• Fall back to manual entry
• Update app to latest version

**Reports Not Generating:**

**Check:**
• You have enough data (at least 3 days logged)
• Selected valid date range
• Internet connection
• Browser allows downloads (check settings)

**Try:**
• Shorter date range
• Different format (PDF vs. Link)
• Clear cache and retry
• Try different browser

**Metrics Seem Wrong:**

**Weight/Measurements:**
• Check you're using correct units (kg vs. lbs)
• Verify you entered correctly
• Edit if typo was made

**Calories:**
• Verify portion sizes
• Check if meal was duplicated
• Review logged items for accuracy
• Use barcode scanner for packaged foods

**DishCore Score:**
• Score reflects the full day, not just one meal
• Check all scoring components
• Ensure all meals are logged
• Review Score breakdown in Studio

**App Crashes or Freezes:**

**Immediate Actions:**
• Force quit app
• Restart device
• Clear app cache
• Update to latest version

**Prevent Future Crashes:**
• Keep device OS updated
• Free up device storage
• Close background apps
• Report bug to support with crash details

**Can't Find a Feature:**

**Search Tips:**
• Use sidebar navigation
• Check Tools menu
• Some features are in Settings
• Studio features require sufficient data

**Still Can't Find It:**
• Check FAQ or Knowledge Base
• Contact support
• Feature might be coming soon

**Getting Error Messages:**

**Note the Error:**
• Take screenshot
• Write down exact message
• Note what you were doing

**First Steps:**
• Try the action again
• Refresh the page
• Clear cache
• Try different browser

**Still Broken:**
• Contact support with:
  - Screenshot of error
  - Steps to reproduce
  - Browser and OS version
  - Your account email

**When to Contact Support:**
• Bug persists after troubleshooting
• Data loss or corruption
• Billing issues
• Feature not working as described
• Security concerns

**How to Contact Support:**
• In-app: Settings → Help & Support
• Email: support@dishcore.com
• Include account email and problem description

Most issues resolve quickly with these steps. If you're still stuck, support is here to help!`,
        tags: ["troubleshooting", "issues", "bugs", "help", "fixes"]
      }
    ]
  }
];

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filteredKB = searchQuery
    ? knowledgeBase.map(category => ({
        ...category,
        articles: category.articles.filter(
          article =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      })).filter(category => category.articles.length > 0)
    : knowledgeBase;

  if (selectedArticle) {
    return (
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSelectedArticle(null)}
              style={{ borderColor: 'var(--border)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Learning Center → Knowledge Base
              </p>
              <h1 className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {selectedArticle.title}
              </h1>
            </div>
          </div>

          <Card className="gradient-card border-0 p-8 rounded-3xl">
            <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
              {selectedArticle.summary}
            </p>
            <div className="prose prose-invert max-w-none">
              {selectedArticle.content.split('\n').map((paragraph, idx) => {
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return (
                    <h3 key={idx} className="text-xl font-bold mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
                      {paragraph.replace(/\*\*/g, '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('• ')) {
                  return (
                    <li key={idx} className="ml-4" style={{ color: 'var(--text-secondary)' }}>
                      {paragraph.substring(2)}
                    </li>
                  );
                }
                if (paragraph.trim() === '') {
                  return <br key={idx} />;
                }
                return (
                  <p key={idx} className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {paragraph}
                  </p>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t" style={{ borderColor: 'var(--border-soft)' }}>
              {selectedArticle.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-muted)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("LearningCenter")}>
            <Button variant="outline" size="icon" style={{ borderColor: 'var(--border)' }}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Knowledge Base
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Detailed guides and documentation for every DishCore feature
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
              style={{ color: 'var(--text-muted)' }} />
            <Input
              placeholder="Search articles, guides, and topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base rounded-2xl"
              style={{ 
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-soft)'
              }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          
          <div className="lg:col-span-1">
            <Card className="gradient-card border-0 p-4 rounded-3xl sticky top-6">
              <h3 className="font-bold mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>
                Categories
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                    selectedCategory === null ? 'gradient-accent text-white' : ''
                  }`}
                  style={
                    selectedCategory !== null
                      ? { background: 'var(--bg-surface-alt)', border: '1px solid var(--border-soft)' }
                      : {}
                  }
                >
                  <div className="flex items-center gap-3">
                    <Home className="w-4 h-4" />
                    <span className="text-sm font-medium">All Topics</span>
                  </div>
                </button>
                {knowledgeBase.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                        selectedCategory === category.id ? 'gradient-accent text-white' : ''
                      }`}
                      style={
                        selectedCategory !== category.id
                          ? { background: 'var(--bg-surface-alt)', border: '1px solid var(--border-soft)' }
                          : {}
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{category.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-8">
            {filteredKB
              .filter(cat => !selectedCategory || cat.id === selectedCategory)
              .map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.id}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {category.title}
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {category.articles.map((article, idx) => (
                        <Card
                          key={idx}
                          onClick={() => setSelectedArticle(article)}
                          className="gradient-card border-0 p-6 rounded-2xl hover:scale-105 transition-transform duration-200 cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <BookOpen className="w-5 h-5 mt-1" style={{ color: 'var(--accent-from)' }} />
                            <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                          </div>
                          <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                            {article.title}
                          </h3>
                          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                            {article.summary}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {article.tags.slice(0, 2).map((tag, tagIdx) => (
                              <span
                                key={tagIdx}
                                className="text-xs px-2 py-1 rounded-full"
                                style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-muted)' }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}

            {filteredKB.length === 0 && (
              <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
                <Search className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  No articles found
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Try adjusting your search or browse all categories
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}