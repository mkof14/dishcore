import { base44 } from "@/api/base44Client";

export class MicronutrientAnalyzer {
  // RDA (Recommended Daily Allowance) by age and sex
  static getRDA(nutrient, age, sex) {
    const rdas = {
      vitamin_d: { male: 600, female: 600 },
      vitamin_c: { male: 90, female: 75 },
      vitamin_b12: { male: 2.4, female: 2.4 },
      iron: { male: 8, female: 18 },
      calcium: { male: 1000, female: 1000 },
      magnesium: { male: 420, female: 320 },
      potassium: { male: 3400, female: 2600 },
      omega3: { male: 1600, female: 1100 },
      zinc: { male: 11, female: 8 },
      folate: { male: 400, female: 400 },
      vitamin_a: { male: 900, female: 700 },
      vitamin_e: { male: 15, female: 15 }
    };

    return rdas[nutrient]?.[sex] || rdas[nutrient]?.male || 100;
  }

  static async analyzeMicronutrients(recentLogs, profile) {
    const dailyIntake = {};
    const logsByDate = {};

    recentLogs.forEach(log => {
      if (!logsByDate[log.date]) {
        logsByDate[log.date] = [];
      }
      logsByDate[log.date].push(log);
    });

    // Estimate micronutrients from meals using AI
    const estimates = await Promise.all(
      Object.entries(logsByDate).slice(0, 7).map(async ([date, logs]) => {
        const meals = logs.map(l => ({
          name: l.dish_name,
          calories: l.calories,
          protein: l.protein,
          carbs: l.carbs,
          fat: l.fat
        }));

        const prompt = `Estimate micronutrient content for these meals consumed on ${date}:
${JSON.stringify(meals, null, 2)}

Provide reasonable estimates based on typical food composition. Return values in standard units (mg, mcg, IU).`;

        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              vitamin_d: { type: "number" },
              vitamin_c: { type: "number" },
              vitamin_b12: { type: "number" },
              iron: { type: "number" },
              calcium: { type: "number" },
              magnesium: { type: "number" },
              potassium: { type: "number" },
              omega3: { type: "number" },
              zinc: { type: "number" },
              folate: { type: "number" },
              vitamin_a: { type: "number" },
              vitamin_e: { type: "number" }
            }
          }
        });

        return { date, ...result };
      })
    );

    // Calculate averages
    const nutrients = Object.keys(estimates[0] || {}).filter(k => k !== 'date');
    const averages = {};
    
    nutrients.forEach(nutrient => {
      const total = estimates.reduce((sum, day) => sum + (day[nutrient] || 0), 0);
      averages[nutrient] = total / estimates.length;
    });

    // Get RDAs
    const rdas = {};
    nutrients.forEach(nutrient => {
      rdas[nutrient] = this.getRDA(nutrient, profile?.age || 30, profile?.sex || 'male');
    });

    // Calculate deficiencies
    const deficiencies = [];
    const adequate = [];
    const excess = [];

    nutrients.forEach(nutrient => {
      const intake = averages[nutrient];
      const rda = rdas[nutrient];
      const percentage = (intake / rda) * 100;

      if (percentage < 70) {
        deficiencies.push({ nutrient, intake, rda, percentage });
      } else if (percentage >= 70 && percentage <= 150) {
        adequate.push({ nutrient, intake, rda, percentage });
      } else {
        excess.push({ nutrient, intake, rda, percentage });
      }
    });

    return {
      dailyEstimates: estimates,
      averages,
      rdas,
      deficiencies,
      adequate,
      excess,
      overallScore: Math.round((adequate.length / nutrients.length) * 100)
    };
  }

  static async generateMicronutrientRecommendations(analysis, profile) {
    const deficiencies = analysis.deficiencies.map(d => d.nutrient).join(', ');
    
    const prompt = `As a nutrition expert, provide specific recommendations to address these micronutrient deficiencies:

DEFICIENCIES: ${deficiencies || 'none'}

USER PROFILE:
- Age: ${profile?.age}, Sex: ${profile?.sex}
- Diet: ${profile?.diet_type}
- Allergies: ${profile?.allergies?.join(', ') || 'none'}
- Medical Conditions: ${profile?.medical_conditions?.join(', ') || 'none'}

CURRENT INTAKE (7-day average):
${JSON.stringify(analysis.averages, null, 2)}

Provide:
1. Specific foods rich in deficient nutrients
2. Meal ideas incorporating these foods
3. Supplement recommendations if needed
4. Dietary adjustments`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          priority_nutrients: { 
            type: "array",
            items: {
              type: "object",
              properties: {
                nutrient: { type: "string" },
                recommended_foods: { type: "array", items: { type: "string" } },
                meal_ideas: { type: "array", items: { type: "string" } },
                supplement_suggestion: { type: "string" }
              }
            }
          },
          dietary_adjustments: { type: "array", items: { type: "string" } },
          sample_day_menu: { type: "string" }
        }
      }
    });

    return result;
  }
}