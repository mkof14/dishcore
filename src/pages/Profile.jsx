
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { User, Target, Heart, AlertCircle, Save, Ruler, ChefHat, Clock, Utensils, Home, DollarSign, Sparkles, Zap, Apple, Flame } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const DIETARY_RESTRICTIONS = [
  { id: 'gluten_free', label: '🌾 Gluten-Free' },
  { id: 'dairy_free', label: '🥛 Dairy-Free' },
  { id: 'nut_free', label: '🥜 Nut-Free' },
  { id: 'soy_free', label: '🫘 Soy-Free' },
  { id: 'egg_free', label: '🥚 Egg-Free' },
  { id: 'shellfish_free', label: '🦐 Shellfish-Free' },
  { id: 'low_fodmap', label: '💚 Low-FODMAP' },
  { id: 'halal', label: '☪️ Halal' },
  { id: 'kosher', label: '✡️ Kosher' }
];

const COOKING_METHODS = [
  { id: 'grilling', label: '🔥 Grilling' },
  { id: 'baking', label: '🍞 Baking' },
  { id: 'steaming', label: '💨 Steaming' },
  { id: 'stir_frying', label: '🥘 Stir-Frying' },
  { id: 'slow_cooking', label: '⏰ Slow Cooking' },
  { id: 'pressure_cooking', label: '⚡ Pressure Cooking' },
  { id: 'air_frying', label: '🌪️ Air Frying' },
  { id: 'roasting', label: '🔥 Roasting' },
  { id: 'sauteing', label: '🍳 Sautéing' },
  { id: 'raw_preparation', label: '🥗 Raw' },
  { id: 'boiling', label: '💧 Boiling' },
  { id: 'smoking', label: '🚬 Smoking' }
];

const KITCHEN_EQUIPMENT = [
  { id: 'oven', label: '🔥 Oven' },
  { id: 'microwave', label: '📡 Microwave' },
  { id: 'air_fryer', label: '🌪️ Air Fryer' },
  { id: 'slow_cooker', label: '⏰ Slow Cooker' },
  { id: 'pressure_cooker', label: '⚡ Pressure Cooker' },
  { id: 'grill', label: '🔥 Grill' },
  { id: 'blender', label: '🔄 Blender' },
  { id: 'food_processor', label: '⚙️ Food Processor' },
  { id: 'rice_cooker', label: '🍚 Rice Cooker' },
  { id: 'stand_mixer', label: '🎂 Stand Mixer' }
];

export default function Profile() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    dietary_restrictions: [],
    allergies: [],
    disliked_ingredients: [],
    medical_conditions: [],
    favorite_cuisines: [],
    foods_to_avoid: [],
    favorite_foods: [],
    preferred_cooking_methods: [],
    kitchen_equipment: [],
    micronutrient_goals: {},
    eating_schedule: {}
  });
  const [units, setUnits] = useState({
    weight: localStorage.getItem('dishcore-weight-unit') || 'kg',
    height: localStorage.getItem('dishcore-height-unit') || 'cm',
    energy: localStorage.getItem('dishcore-energy-unit') || 'kcal'
  });

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

  useEffect(() => {
    const handleSettingsChange = () => {
      setUnits({
        weight: localStorage.getItem('dishcore-weight-unit') || 'kg',
        height: localStorage.getItem('dishcore-height-unit') || 'cm',
        energy: localStorage.getItem('dishcore-energy-unit') || 'kcal'
      });
    };

    window.addEventListener('dishcore-settings-changed', handleSettingsChange);
    return () => window.removeEventListener('dishcore-settings-changed', handleSettingsChange);
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        dietary_restrictions: profile.dietary_restrictions || [],
        allergies: profile.allergies || [],
        disliked_ingredients: profile.disliked_ingredients || [],
        medical_conditions: profile.medical_conditions || [],
        favorite_cuisines: profile.favorite_cuisines || [],
        foods_to_avoid: profile.foods_to_avoid || [],
        favorite_foods: profile.favorite_foods || [],
        preferred_cooking_methods: profile.preferred_cooking_methods || [],
        kitchen_equipment: profile.kitchen_equipment || [],
        micronutrient_goals: profile.micronutrient_goals || {},
        eating_schedule: profile.eating_schedule || {}
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (profile?.id) {
        return await base44.entities.UserProfile.update(profile.id, data);
      } else {
        return await base44.entities.UserProfile.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      toast.success('Profile saved successfully! Recommendations will be updated.');
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => {
      const current = prev[field] || [];
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...current, item] };
      }
    });
  };

  const updateArrayField = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    updateField(field, items);
  };

  // Calculate macro ratios
  const totalMacros = (formData.target_protein || 0) * 4 + (formData.target_carbs || 0) * 4 + (formData.target_fat || 0) * 9;
  const proteinRatio = totalMacros > 0 ? ((formData.target_protein || 0) * 4 / totalMacros * 100) : 0;
  const carbsRatio = totalMacros > 0 ? ((formData.target_carbs || 0) * 4 / totalMacros * 100) : 0;
  const fatRatio = totalMacros > 0 ? ((formData.target_fat || 0) * 9 / totalMacros * 100) : 0;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full"
          style={{ borderColor: 'var(--accent-from)' }}></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
              Complete profile for personalized AI recommendations
            </p>
          </div>
          <Button 
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="gradient-accent text-white border-0"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>

        {/* HIGHLIGHTED: Nutrition Goals Section */}
        <Card className="gradient-card border-0 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500 blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Nutrition Goals
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Set your daily targets to influence recipe recommendations
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                <Label className="text-xs mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  <Flame className="w-3 h-3 inline mr-1" />
                  Calories ({units.energy})
                </Label>
                <Input
                  type="number"
                  value={formData.target_calories || ''}
                  onChange={(e) => updateField('target_calories', parseInt(e.target.value))}
                  placeholder="2000"
                  className="text-xl font-bold"
                  style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                <Label className="text-xs mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  <Zap className="w-3 h-3 inline mr-1" />
                  Protein (g)
                </Label>
                <Input
                  type="number"
                  value={formData.target_protein || ''}
                  onChange={(e) => updateField('target_protein', parseInt(e.target.value))}
                  placeholder="150"
                  className="text-xl font-bold text-blue-500"
                  style={{ background: 'transparent', borderColor: 'var(--border)' }}
                />
              </div>

              <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                <Label className="text-xs mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  <Apple className="w-3 h-3 inline mr-1" />
                  Carbs (g)
                </Label>
                <Input
                  type="number"
                  value={formData.target_carbs || ''}
                  onChange={(e) => updateField('target_carbs', parseInt(e.target.value))}
                  placeholder="200"
                  className="text-xl font-bold text-orange-500"
                  style={{ background: 'transparent', borderColor: 'var(--border)' }}
                />
              </div>

              <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                <Label className="text-xs mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  <Heart className="w-3 h-3 inline mr-1" />
                  Fat (g)
                </Label>
                <Input
                  type="number"
                  value={formData.target_fat || ''}
                  onChange={(e) => updateField('target_fat', parseInt(e.target.value))}
                  placeholder="65"
                  className="text-xl font-bold text-purple-500"
                  style={{ background: 'transparent', borderColor: 'var(--border)' }}
                />
              </div>
            </div>

            {/* Macro Ratios Display */}
            {totalMacros > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Macronutrient Ratios
                </h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>Protein</span>
                      <span className="font-bold text-blue-500">{proteinRatio.toFixed(0)}%</span>
                    </div>
                    <Progress value={proteinRatio} className="h-2 bg-blue-500/20" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>Carbs</span>
                      <span className="font-bold text-orange-500">{carbsRatio.toFixed(0)}%</span>
                    </div>
                    <Progress value={carbsRatio} className="h-2 bg-orange-500/20" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>Fat</span>
                      <span className="font-bold text-purple-500">{fatRatio.toFixed(0)}%</span>
                    </div>
                    <Progress value={fatRatio} className="h-2 bg-purple-500/20" />
                  </div>
                </div>
                <p className="text-xs mt-3 p-3 rounded-xl" 
                  style={{ background: 'var(--background)', color: 'var(--text-muted)' }}>
                  💡 These goals will be used to personalize recipe recommendations and meal plans
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Dietary Restrictions - HIGHLIGHTED */}
        <Card className="gradient-card border-0 p-6 rounded-3xl border-2" 
          style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Dietary Restrictions & Allergies
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Critical for safe recipe filtering
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="mb-3 block font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Restrictions & Intolerances
              </Label>
              <div className="grid md:grid-cols-3 gap-3">
                {DIETARY_RESTRICTIONS.map(restriction => (
                  <div key={restriction.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-opacity-80 transition-all"
                    style={{ background: 'var(--background)' }}>
                    <Checkbox
                      checked={formData.dietary_restrictions?.includes(restriction.id)}
                      onCheckedChange={() => toggleArrayItem('dietary_restrictions', restriction.id)}
                    />
                    <label className="text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                      {restriction.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>
                Allergies (comma-separated)
              </Label>
              <Input
                value={formData.allergies?.join(', ') || ''}
                onChange={(e) => updateArrayField('allergies', e.target.value)}
                placeholder="e.g., peanuts, shellfish, tree nuts"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                ⚠️ Recipes containing these ingredients will be automatically filtered
              </p>
            </div>
          </div>
        </Card>

        {/* User Info Card */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>User Information</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Full Name</Label>
              <Input
                value={currentUser?.full_name || ''}
                disabled
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Email</Label>
              <Input
                value={currentUser?.email || ''}
                disabled
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </Card>

        {/* Unit System Display */}
        <Card className="gradient-card border-0 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <Ruler className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Current units: <span className="font-semibold">{units.weight}</span> • <span className="font-semibold">{units.height}</span> • <span className="font-semibold">{units.energy}</span>
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/Settings'}
              className="ml-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Change in Settings →
            </Button>
          </div>
        </Card>

        {/* Basic Info */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Basic Information</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Age</Label>
              <Input
                type="number"
                value={formData.age || ''}
                onChange={(e) => updateField('age', parseInt(e.target.value))}
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Sex</Label>
              <Select value={formData.sex || ''} onValueChange={(val) => updateField('sex', val)}>
                <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Height ({units.height})</Label>
              <Input
                type="number"
                value={formData.height || ''}
                onChange={(e) => updateField('height', parseFloat(e.target.value))}
                className="mt-2"
                placeholder={units.height === 'cm' ? '170' : '67'}
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Weight ({units.weight})</Label>
              <Input
                type="number"
                value={formData.weight || ''}
                onChange={(e) => updateField('weight', parseFloat(e.target.value))}
                className="mt-2"
                placeholder={units.weight === 'kg' ? '70' : '154'}
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Body Type</Label>
              <Select value={formData.body_type || ''} onValueChange={(val) => updateField('body_type', val)}>
                <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                  <SelectValue placeholder="Select body type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ectomorph">Ectomorph (Lean)</SelectItem>
                  <SelectItem value="mesomorph">Mesomorph (Muscular)</SelectItem>
                  <SelectItem value="endomorph">Endomorph (Stocky)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Activity Level</Label>
              <Select value={formData.activity_level || ''} onValueChange={(val) => updateField('activity_level', val)}>
                <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (Office job)</SelectItem>
                  <SelectItem value="lightly_active">Lightly Active (1-2 days/week)</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                  <SelectItem value="extremely_active">Extremely Active (Athlete)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Goals & Diet */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Health Goals & Diet</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Primary Health Goal</Label>
              <Select value={formData.goal || ''} onValueChange={(val) => updateField('goal', val)}>
                <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">🔥 Lose Weight</SelectItem>
                  <SelectItem value="maintain">⚖️ Maintain Weight</SelectItem>
                  <SelectItem value="gain_weight">📈 Gain Weight</SelectItem>
                  <SelectItem value="muscle_building">💪 Build Muscle</SelectItem>
                  <SelectItem value="longevity">🧬 Longevity & Healthspan</SelectItem>
                  <SelectItem value="metabolic_improvement">⚡ Improve Metabolism</SelectItem>
                  <SelectItem value="anti_inflammatory">🌿 Anti-Inflammatory</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Diet Type</Label>
              <Select value={formData.diet_type || ''} onValueChange={(val) => updateField('diet_type', val)}>
                <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                  <SelectValue placeholder="Select diet type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">🍽️ Balanced</SelectItem>
                  <SelectItem value="low_carb">🥗 Low-Carb</SelectItem>
                  <SelectItem value="keto">🥑 Keto</SelectItem>
                  <SelectItem value="mediterranean">🫒 Mediterranean</SelectItem>
                  <SelectItem value="vegan">🌱 Vegan</SelectItem>
                  <SelectItem value="vegetarian">🥕 Vegetarian</SelectItem>
                  <SelectItem value="pescatarian">🐟 Pescatarian</SelectItem>
                  <SelectItem value="paleo">🦴 Paleo</SelectItem>
                  <SelectItem value="whole30">Whole30</SelectItem>
                  <SelectItem value="carnivore">🥩 Carnivore</SelectItem>
                  <SelectItem value="diabetic_friendly">💉 Diabetic-Friendly</SelectItem>
                  <SelectItem value="high_protein">🍗 High-Protein</SelectItem>
                  <SelectItem value="intermittent_fasting">⏰ Intermittent Fasting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Meal Frequency (per day)</Label>
              <Input
                type="number"
                min="1"
                max="6"
                value={formData.meal_frequency || 3}
                onChange={(e) => updateField('meal_frequency', parseInt(e.target.value))}
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Budget</Label>
              <Select value={formData.budget || ''} onValueChange={(val) => updateField('budget', val)}>
                <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">💰 Low Budget</SelectItem>
                  <SelectItem value="medium">💵 Medium Budget</SelectItem>
                  <SelectItem value="high">💎 High Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Target Fiber (g)</Label>
              <Input
                type="number"
                value={formData.target_fiber || ''}
                onChange={(e) => updateField('target_fiber', parseInt(e.target.value))}
                className="mt-2"
                placeholder="30"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Target Water (ml)</Label>
              <Input
                type="number"
                value={formData.target_water || ''}
                onChange={(e) => updateField('target_water', parseInt(e.target.value))}
                className="mt-2"
                placeholder="2000"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </Card>

        {/* NEW: Lifestyle & Time Section */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Lifestyle & Time</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Daily Cooking Time (minutes)</Label>
              <Input
                type="number"
                value={formData.daily_cooking_time_available || ''}
                onChange={(e) => updateField('daily_cooking_time_available', parseInt(e.target.value))}
                placeholder="45"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Meal Prep Style</Label>
              <Select value={formData.meal_prep_preference || ''} onValueChange={(val) => updateField('meal_prep_preference', val)}>
                <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily_fresh">🍃 Daily Fresh Meals</SelectItem>
                  <SelectItem value="batch_cooking">📦 Batch Cooking</SelectItem>
                  <SelectItem value="mix_of_both">🔄 Mix of Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Household Size</Label>
              <Input
                type="number"
                min="1"
                value={formData.household_size || 1}
                onChange={(e) => updateField('household_size', parseInt(e.target.value))}
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </Card>

        {/* Cooking Preferences */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Cooking Preferences</h2>
          </div>

          <div className="space-y-6">
            {/* Cooking Methods */}
            <div>
              <Label className="mb-3 block" style={{ color: 'var(--text-secondary)' }}>Preferred Cooking Methods</Label>
              <div className="grid md:grid-cols-4 gap-3">
                {COOKING_METHODS.map(method => (
                  <div key={method.id} className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ background: 'var(--background)' }}>
                    <Checkbox
                      checked={formData.preferred_cooking_methods?.includes(method.id)}
                      onCheckedChange={() => toggleArrayItem('preferred_cooking_methods', method.id)}
                    />
                    <label className="text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                      {method.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Kitchen Equipment */}
            <div>
              <Label className="mb-3 block" style={{ color: 'var(--text-secondary)' }}>Available Kitchen Equipment</Label>
              <div className="grid md:grid-cols-5 gap-3">
                {KITCHEN_EQUIPMENT.map(equip => (
                  <div key={equip.id} className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ background: 'var(--background)' }}>
                    <Checkbox
                      checked={formData.kitchen_equipment?.includes(equip.id)}
                      onCheckedChange={() => toggleArrayItem('kitchen_equipment', equip.id)}
                    />
                    <label className="text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                      {equip.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Cooking Skill Level</Label>
                <Select value={formData.cooking_skill || ''} onValueChange={(val) => updateField('cooking_skill', val)}>
                  <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">👶 Beginner</SelectItem>
                    <SelectItem value="intermediate">👨‍🍳 Intermediate</SelectItem>
                    <SelectItem value="advanced">⭐ Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Available Meal Prep Time</Label>
                <Select value={formData.meal_prep_time || ''} onValueChange={(val) => updateField('meal_prep_time', val)}>
                  <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick_15">⚡ Quick (15 min)</SelectItem>
                    <SelectItem value="moderate_30">⏱️ Moderate (30 min)</SelectItem>
                    <SelectItem value="extended_60">🕐 Extended (60+ min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Food Preferences */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Food Preferences</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Disliked Ingredients (comma-separated)</Label>
              <Input
                value={formData.disliked_ingredients?.join(', ') || ''}
                onChange={(e) => updateArrayField('disliked_ingredients', e.target.value)}
                placeholder="e.g., cilantro, olives, anchovies"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Medical Conditions (comma-separated)</Label>
              <Input
                value={formData.medical_conditions?.join(', ') || ''}
                onChange={(e) => updateArrayField('medical_conditions', e.target.value)}
                placeholder="e.g., diabetes, hypertension"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Favorite Cuisines (comma-separated)</Label>
              <Input
                value={formData.favorite_cuisines?.join(', ') || ''}
                onChange={(e) => updateArrayField('favorite_cuisines', e.target.value)}
                placeholder="e.g., Italian, Japanese, Mexican"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Favorite Foods (comma-separated)</Label>
              <Input
                value={formData.favorite_foods?.join(', ') || ''}
                onChange={(e) => updateArrayField('favorite_foods', e.target.value)}
                placeholder="e.g., chicken, salmon, broccoli"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Foods to Avoid (comma-separated)</Label>
              <Input
                value={formData.foods_to_avoid?.join(', ') || ''}
                onChange={(e) => updateArrayField('foods_to_avoid', e.target.value)}
                placeholder="e.g., red meat, spicy food, mushrooms"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Weekly Grocery Budget</Label>
              <Input
                type="number"
                value={formData.weekly_grocery_budget || ''}
                onChange={(e) => updateField('weekly_grocery_budget', parseFloat(e.target.value))}
                placeholder="100"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </Card>

        {/* NEW: Micronutrient Goals */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Micronutrient Goals (Optional)</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Vitamin D (IU)</Label>
              <Input
                type="number"
                value={formData.micronutrient_goals?.vitamin_d || ''}
                onChange={(e) => updateNestedField('micronutrient_goals', 'vitamin_d', parseInt(e.target.value))}
                placeholder="600"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Vitamin C (mg)</Label>
              <Input
                type="number"
                value={formData.micronutrient_goals?.vitamin_c || ''}
                onChange={(e) => updateNestedField('micronutrient_goals', 'vitamin_c', parseInt(e.target.value))}
                placeholder="90"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Vitamin B12 (mcg)</Label>
              <Input
                type="number"
                value={formData.micronutrient_goals?.vitamin_b12 || ''}
                onChange={(e) => updateNestedField('micronutrient_goals', 'vitamin_b12', parseFloat(e.target.value))}
                placeholder="2.4"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Iron (mg)</Label>
              <Input
                type="number"
                value={formData.micronutrient_goals?.iron || ''}
                onChange={(e) => updateNestedField('micronutrient_goals', 'iron', parseInt(e.target.value))}
                placeholder="18"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Calcium (mg)</Label>
              <Input
                type="number"
                value={formData.micronutrient_goals?.calcium || ''}
                onChange={(e) => updateNestedField('micronutrient_goals', 'calcium', parseInt(e.target.value))}
                placeholder="1000"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Magnesium (mg)</Label>
              <Input
                type="number"
                value={formData.micronutrient_goals?.magnesium || ''}
                onChange={(e) => updateNestedField('micronutrient_goals', 'magnesium', parseInt(e.target.value))}
                placeholder="400"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Potassium (mg)</Label>
              <Input
                type="number"
                value={formData.micronutrient_goals?.potassium || ''}
                onChange={(e) => updateNestedField('micronutrient_goals', 'potassium', parseInt(e.target.value))}
                placeholder="3500"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Omega-3 (mg)</Label>
              <Input
                type="number"
                value={formData.micronutrient_goals?.omega3 || ''}
                onChange={(e) => updateNestedField('micronutrient_goals', 'omega3', parseInt(e.target.value))}
                placeholder="1000"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Zinc (mg)</Label>
              <Input
                type="number"
                value={formData.micronutrient_goals?.zinc || ''}
                onChange={(e) => updateNestedField('micronutrient_goals', 'zinc', parseInt(e.target.value))}
                placeholder="11"
                className="mt-2"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </Card>

        {/* Additional Notes */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <Label style={{ color: 'var(--text-secondary)' }}>Special Considerations or Notes</Label>
          <Textarea
            value={formData.special_considerations || ''}
            onChange={(e) => updateField('special_considerations', e.target.value)}
            placeholder="Any additional information for personalized recommendations..."
            className="mt-2 h-24"
            style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </Card>

        {/* Save Button at Bottom */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="gradient-accent text-white border-0 px-8"
            size="lg"
          >
            <Save className="w-5 h-5 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
