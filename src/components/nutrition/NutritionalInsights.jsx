import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, TrendingUp, Sparkles, Award } from "lucide-react";
import { motion } from "framer-motion";

// Recommended Daily Intakes (RDI) - based on general adult guidelines
const RDI = {
  vitamin_a: 900, // IU
  vitamin_c: 90, // mg
  vitamin_d: 600, // IU
  vitamin_e: 15, // mg
  vitamin_k: 120, // mcg
  vitamin_b6: 1.7, // mg
  vitamin_b12: 2.4, // mcg
  folate: 400, // mcg
  calcium: 1000, // mg
  iron: 18, // mg (higher for women)
  magnesium: 400, // mg
  potassium: 3500, // mg
  zinc: 11, // mg
  omega3: 1000, // mg
  fiber: 30, // g
  sugar: 50, // g (max)
  sodium: 2300 // mg (max)
};

// Calculate food quality scores
const calculateFoodScores = (dish, profile) => {
  const scores = {
    nutrient_density: 0,
    protein_quality: 0,
    fiber_content: 0,
    micronutrient_richness: 0,
    processed_score: 0,
    overall: 0
  };

  // Nutrient Density Score (calories vs nutrients)
  const calories = dish.calories || 1;
  const proteinDensity = ((dish.protein || 0) * 4 / calories) * 100;
  const fiberDensity = ((dish.fiber || 0) * 4 / calories) * 100;
  scores.nutrient_density = Math.min(100, (proteinDensity + fiberDensity) * 2);

  // Protein Quality Score
  const proteinPerCal = ((dish.protein || 0) * 4 / calories) * 100;
  scores.protein_quality = Math.min(100, proteinPerCal * 3);

  // Fiber Content Score
  scores.fiber_content = Math.min(100, ((dish.fiber || 0) / 10) * 100);

  // Micronutrient Richness Score
  if (dish.micronutrients) {
    const microCount = Object.values(dish.micronutrients).filter(v => v > 0).length;
    scores.micronutrient_richness = (microCount / 14) * 100;
  }

  // Processed Score (inverse of sugar/sodium)
  const sugarScore = Math.max(0, 100 - ((dish.sugar || 0) / 50) * 100);
  const sodiumScore = Math.max(0, 100 - ((dish.sodium || 0) / 2300) * 100);
  scores.processed_score = (sugarScore + sodiumScore) / 2;

  // Overall Score
  scores.overall = (
    scores.nutrient_density * 0.25 +
    scores.protein_quality * 0.25 +
    scores.fiber_content * 0.15 +
    scores.micronutrient_richness * 0.2 +
    scores.processed_score * 0.15
  );

  return scores;
};

// Identify potential deficiencies
const identifyDeficiencies = (dish, profile) => {
  const deficiencies = [];
  
  if (!dish.micronutrients) return deficiencies;

  const microGoals = profile?.micronutrient_goals || {};
  
  Object.entries(RDI).forEach(([nutrient, rdi]) => {
    if (nutrient === 'fiber' || nutrient === 'sugar' || nutrient === 'sodium') return;
    
    const dishValue = dish.micronutrients[nutrient] || 0;
    const userGoal = microGoals[nutrient] || rdi;
    const percentOfRDI = (dishValue / userGoal) * 100;
    
    if (percentOfRDI < 10) {
      deficiencies.push({
        nutrient: nutrient.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: dishValue,
        rdi: userGoal,
        percentOfRDI,
        severity: 'high'
      });
    } else if (percentOfRDI < 25) {
      deficiencies.push({
        nutrient: nutrient.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: dishValue,
        rdi: userGoal,
        percentOfRDI,
        severity: 'medium'
      });
    }
  });

  return deficiencies;
};

export default function NutritionalInsights({ dish, profile }) {
  const scores = calculateFoodScores(dish, profile);
  const deficiencies = identifyDeficiencies(dish, profile);

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    return 'Fair';
  };

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Award className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            Food Quality Scores
          </h3>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(scores.overall)}`}>
              {Math.round(scores.overall)}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {getScoreLabel(scores.overall)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--text-secondary)' }}>Nutrient Density</span>
              <span className={getScoreColor(scores.nutrient_density)}>
                {Math.round(scores.nutrient_density)}
              </span>
            </div>
            <Progress value={scores.nutrient_density} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--text-secondary)' }}>Protein Quality</span>
              <span className={getScoreColor(scores.protein_quality)}>
                {Math.round(scores.protein_quality)}
              </span>
            </div>
            <Progress value={scores.protein_quality} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--text-secondary)' }}>Fiber Content</span>
              <span className={getScoreColor(scores.fiber_content)}>
                {Math.round(scores.fiber_content)}
              </span>
            </div>
            <Progress value={scores.fiber_content} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--text-secondary)' }}>Micronutrient Richness</span>
              <span className={getScoreColor(scores.micronutrient_richness)}>
                {Math.round(scores.micronutrient_richness)}
              </span>
            </div>
            <Progress value={scores.micronutrient_richness} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--text-secondary)' }}>Minimally Processed</span>
              <span className={getScoreColor(scores.processed_score)}>
                {Math.round(scores.processed_score)}
              </span>
            </div>
            <Progress value={scores.processed_score} className="h-2" />
          </div>
        </div>
      </Card>

      {/* RDI Comparison */}
      {dish.micronutrients && Object.keys(dish.micronutrients).length > 0 && (
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            RDI Coverage
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(dish.micronutrients).map(([nutrient, value]) => {
              if (!value || !RDI[nutrient]) return null;
              
              const rdi = profile?.micronutrient_goals?.[nutrient] || RDI[nutrient];
              const percentage = Math.min(100, (value / rdi) * 100);
              
              return (
                <div key={nutrient} className="p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {nutrient.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className={`text-xs font-bold ${percentage >= 25 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {Math.round(percentage)}%
                    </p>
                  </div>
                  <Progress value={percentage} className="h-1.5" />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {Math.round(value)} / {Math.round(rdi)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Deficiency Warnings */}
      {deficiencies.length > 0 && (
        <Card className="gradient-card border-0 p-6 rounded-3xl border-2 border-orange-500/20">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Potential Deficiencies
          </h3>
          
          <div className="space-y-2">
            {deficiencies.slice(0, 5).map((def, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'var(--background)' }}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className={`w-4 h-4 ${def.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {def.nutrient}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Only {Math.round(def.percentOfRDI)}% of daily needs
                    </p>
                  </div>
                </div>
                <Badge 
                  className={def.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}
                >
                  {def.severity === 'high' ? 'Very Low' : 'Low'}
                </Badge>
              </motion.div>
            ))}
          </div>
          
          <p className="text-xs mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20" 
            style={{ color: 'var(--text-secondary)' }}>
            💡 Consider pairing with foods rich in these nutrients or take supplements
          </p>
        </Card>
      )}

      {/* Nutritional Highlights */}
      {dish.micronutrients && (
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
            <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            Nutritional Highlights
          </h3>
          
          <div className="space-y-2">
            {Object.entries(dish.micronutrients)
              .filter(([_, value]) => value > 0)
              .sort((a, b) => {
                const aPercent = (a[1] / (RDI[a[0]] || 1)) * 100;
                const bPercent = (b[1] / (RDI[b[0]] || 1)) * 100;
                return bPercent - aPercent;
              })
              .slice(0, 5)
              .map(([nutrient, value], idx) => {
                const rdi = profile?.micronutrient_goals?.[nutrient] || RDI[nutrient];
                const percentage = (value / rdi) * 100;
                
                if (percentage < 25) return null;
                
                return (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl" 
                    style={{ background: 'var(--background)' }}>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Excellent source of {nutrient.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Provides {Math.round(percentage)}% of daily needs
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}
    </div>
  );
}