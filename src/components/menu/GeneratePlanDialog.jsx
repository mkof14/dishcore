import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X } from "lucide-react";

const MEAL_TIMING_PREFERENCES = [
  { value: 'regular', label: 'Regular (3 meals)', meals: 3 },
  { value: 'frequent', label: 'Frequent (5-6 meals)', meals: 5 },
  { value: 'intermittent', label: 'Intermittent Fasting (2 meals)', meals: 2 }
];

const FOCUS_AREAS = [
  'Muscle Building', 'Fat Loss', 'Energy', 'Recovery', 
  'Anti-Inflammatory', 'Gut Health', 'Heart Health', 'Longevity'
];

export default function GeneratePlanDialog({ open, onClose, onGenerate, profile }) {
  const [preferences, setPreferences] = useState({
    duration: 7,
    budget: profile?.budget || 'medium',
    variety: 'balanced',
    cooking_complexity: 'medium',
    meal_timing: 'regular',
    focus_areas: [],
    custom_notes: '',
    macro_balance: 'balanced'
  });

  const toggleFocusArea = (area) => {
    setPreferences(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(area)
        ? prev.focus_areas.filter(a => a !== area)
        : [...prev.focus_areas, area]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" 
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-soft)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            Generate AI Meal Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p style={{ color: 'var(--text-secondary)' }}>
            Create a fully personalized meal plan optimized for your goals, preferences, and lifestyle.
          </p>

          {/* Profile Summary */}
          {profile && (
            <div className="p-4 rounded-2xl space-y-3" style={{ background: 'var(--bg-page)' }}>
              <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Your Profile Summary
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Goal:</span>
                  <span className="ml-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                    {profile.goal?.replace(/_/g, ' ') || 'Not set'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Diet:</span>
                  <span className="ml-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                    {profile.diet_type?.replace(/_/g, ' ') || 'Not set'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Calories:</span>
                  <span className="ml-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                    {profile.target_calories || 2000} kcal/day
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Activity:</span>
                  <span className="ml-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                    {profile.activity_level?.replace(/_/g, ' ') || 'Not set'}
                  </span>
                </div>
              </div>
              {profile.allergies && profile.allergies.length > 0 && (
                <div className="pt-2 border-t" style={{ borderColor: 'var(--border-soft)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Allergies:</span>
                  <span className="ml-2 text-sm font-medium text-red-400">
                    {profile.allergies.join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Plan Duration */}
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Plan Duration</Label>
              <Select 
                value={preferences.duration.toString()} 
                onValueChange={(val) => setPreferences({...preferences, duration: parseInt(val)})}
              >
                <SelectTrigger className="mt-2" style={{ background: 'var(--bg-surface-alt)', borderColor: 'var(--border-soft)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">7 Days (Week)</SelectItem>
                  <SelectItem value="14">14 Days (2 Weeks)</SelectItem>
                  <SelectItem value="21">21 Days (3 Weeks)</SelectItem>
                  <SelectItem value="30">30 Days (Month)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Meal Timing */}
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Meal Timing</Label>
              <Select 
                value={preferences.meal_timing} 
                onValueChange={(val) => setPreferences({...preferences, meal_timing: val})}
              >
                <SelectTrigger className="mt-2" style={{ background: 'var(--bg-surface-alt)', borderColor: 'var(--border-soft)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_TIMING_PREFERENCES.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Budget Preference</Label>
              <Select 
                value={preferences.budget} 
                onValueChange={(val) => setPreferences({...preferences, budget: val})}
              >
                <SelectTrigger className="mt-2" style={{ background: 'var(--bg-surface-alt)', borderColor: 'var(--border-soft)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">💰 Budget-Friendly</SelectItem>
                  <SelectItem value="medium">💵 Moderate</SelectItem>
                  <SelectItem value="high">💎 Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Variety */}
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Meal Variety</Label>
              <Select 
                value={preferences.variety} 
                onValueChange={(val) => setPreferences({...preferences, variety: val})}
              >
                <SelectTrigger className="mt-2" style={{ background: 'var(--bg-surface-alt)', borderColor: 'var(--border-soft)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal (Repeat favorites)</SelectItem>
                  <SelectItem value="balanced">Balanced Mix</SelectItem>
                  <SelectItem value="maximum">Maximum Variety</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cooking Complexity */}
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Cooking Complexity</Label>
              <Select 
                value={preferences.cooking_complexity} 
                onValueChange={(val) => setPreferences({...preferences, cooking_complexity: val})}
              >
                <SelectTrigger className="mt-2" style={{ background: 'var(--bg-surface-alt)', borderColor: 'var(--border-soft)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (Beginner-friendly)</SelectItem>
                  <SelectItem value="medium">Medium (Some skills needed)</SelectItem>
                  <SelectItem value="hard">Advanced (Complex recipes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Macro Balance */}
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Macro Balance</Label>
              <Select 
                value={preferences.macro_balance} 
                onValueChange={(val) => setPreferences({...preferences, macro_balance: val})}
              >
                <SelectTrigger className="mt-2" style={{ background: 'var(--bg-surface-alt)', borderColor: 'var(--border-soft)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced (40/30/30)</SelectItem>
                  <SelectItem value="high_protein">High Protein (40/35/25)</SelectItem>
                  <SelectItem value="low_carb">Low Carb (20/40/40)</SelectItem>
                  <SelectItem value="keto">Keto (5/25/70)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Focus Areas */}
          <div>
            <Label className="mb-3 block" style={{ color: 'var(--text-secondary)' }}>
              Health Focus Areas (Optional)
            </Label>
            <div className="flex flex-wrap gap-2">
              {FOCUS_AREAS.map(area => (
                <Badge
                  key={area}
                  className="cursor-pointer px-3 py-1"
                  style={preferences.focus_areas.includes(area)
                    ? { background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))', color: 'white' }
                    : { background: 'var(--bg-surface-alt)', color: 'var(--text-primary)', border: '1px solid var(--border-soft)' }
                  }
                  onClick={() => toggleFocusArea(area)}
                >
                  {area}
                  {preferences.focus_areas.includes(area) && <X className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom Notes */}
          <div>
            <Label style={{ color: 'var(--text-secondary)' }}>
              Additional Instructions (Optional)
            </Label>
            <Textarea
              placeholder="e.g., I prefer quick breakfasts, avoid spicy food for dinner, prefer fish over meat..."
              value={preferences.custom_notes}
              onChange={(e) => setPreferences({...preferences, custom_notes: e.target.value})}
              className="mt-2"
              style={{
                background: 'var(--bg-surface-alt)',
                borderColor: 'var(--border-soft)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* What's Included */}
          <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-page)' }}>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              ✨ Your AI-Generated Plan Includes:
            </h4>
            <div className="grid md:grid-cols-2 gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <div>✓ Personalized meal selection</div>
              <div>✓ Macro-optimized nutrition</div>
              <div>✓ Allergy & restriction safety</div>
              <div>✓ Budget-aligned choices</div>
              <div>✓ Activity level consideration</div>
              <div>✓ Daily nutritional summaries</div>
              <div>✓ Cooking time optimization</div>
              <div>✓ Ingredient variety balance</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onGenerate(preferences)}
              className="flex-1 gradient-accent text-white border-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}