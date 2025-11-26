import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ArrowRight, CheckCircle, Target, Utensils, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { sendWelcomeEmail } from "../notifications/EmailService";
import { trackEvent } from "../Analytics";

export default function ForcedOnboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    age: '',
    sex: 'male',
    height: '',
    weight: '',
    goal: 'lose_weight',
    activity_level: 'moderately_active',
    diet_type: 'balanced'
  });
  const queryClient = useQueryClient();

  const { data: existingProfile } = useQuery({
    queryKey: ['checkProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0];
    }
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data) => {
      const bmr = calculateBMR(data);
      const tdee = bmr * getActivityMultiplier(data.activity_level);
      const { calories, protein, carbs, fat } = calculateMacros(tdee, data.goal);

      return await base44.entities.UserProfile.create({
        ...data,
        target_calories: calories,
        target_protein: protein,
        target_carbs: carbs,
        target_fat: fat
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries(['userProfile']);
      const user = await base44.auth.me();
      await sendWelcomeEmail(user);
      trackEvent('onboarding_completed', { goal: profileData.goal });
      toast.success('Welcome to DishCore! 🎉');
      if (onComplete) onComplete();
    }
  });

  useEffect(() => {
    if (existingProfile && onComplete) {
      onComplete();
    }
  }, [existingProfile, onComplete]);

  const calculateBMR = (data) => {
    const weight = parseFloat(data.weight);
    const height = parseFloat(data.height);
    const age = parseFloat(data.age);
    
    if (data.sex === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  const getActivityMultiplier = (level) => {
    const multipliers = {
      'sedentary': 1.2,
      'lightly_active': 1.375,
      'moderately_active': 1.55,
      'very_active': 1.725,
      'extremely_active': 1.9
    };
    return multipliers[level] || 1.55;
  };

  const calculateMacros = (tdee, goal) => {
    let calories = tdee;
    if (goal === 'lose_weight') calories = tdee - 500;
    if (goal === 'gain_weight') calories = tdee + 300;

    const protein = Math.round(2.2 * parseFloat(profileData.weight));
    const fat = Math.round(calories * 0.25 / 9);
    const carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4);

    return { calories: Math.round(calories), protein, carbs, fat };
  };

  const handleNext = () => {
    if (step === 1 && (!profileData.age || !profileData.height || !profileData.weight)) {
      toast.error('Please fill all fields');
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      createProfileMutation.mutate(profileData);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" 
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}>
      <Card className="gradient-card border-0 p-8 rounded-3xl max-w-2xl w-full">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Welcome to DishCore! ✨
            </h2>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Step {step} of 3
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8" style={{ color: 'var(--accent-from)' }} />
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Tell us about yourself
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Age</Label>
                <Input
                  type="number"
                  value={profileData.age}
                  onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                  placeholder="25"
                  className="mt-2"
                />
              </div>

              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Sex</Label>
                <Select value={profileData.sex} onValueChange={(val) => setProfileData({ ...profileData, sex: val })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Height (cm)</Label>
                <Input
                  type="number"
                  value={profileData.height}
                  onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
                  placeholder="175"
                  className="mt-2"
                />
              </div>

              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Weight (kg)</Label>
                <Input
                  type="number"
                  value={profileData.weight}
                  onChange={(e) => setProfileData({ ...profileData, weight: e.target.value })}
                  placeholder="70"
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8" style={{ color: 'var(--accent-from)' }} />
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                What's your goal?
              </h3>
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Primary Goal</Label>
              <Select value={profileData.goal} onValueChange={(val) => setProfileData({ ...profileData, goal: val })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">Lose Weight</SelectItem>
                  <SelectItem value="maintain">Maintain Weight</SelectItem>
                  <SelectItem value="gain_weight">Gain Weight</SelectItem>
                  <SelectItem value="muscle_building">Build Muscle</SelectItem>
                  <SelectItem value="longevity">Longevity & Health</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Activity Level</Label>
              <Select value={profileData.activity_level} onValueChange={(val) => setProfileData({ ...profileData, activity_level: val })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (desk job)</SelectItem>
                  <SelectItem value="lightly_active">Lightly Active (1-2 workouts/week)</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active (3-4 workouts/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (5-6 workouts/week)</SelectItem>
                  <SelectItem value="extremely_active">Extremely Active (athlete)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Utensils className="w-8 h-8" style={{ color: 'var(--accent-from)' }} />
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Eating preferences
              </h3>
            </div>

            <div>
              <Label style={{ color: 'var(--text-secondary)' }}>Diet Type</Label>
              <Select value={profileData.diet_type} onValueChange={(val) => setProfileData({ ...profileData, diet_type: val })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="low_carb">Low Carb</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="high_protein">High Protein</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="p-6 rounded-2xl" style={{ background: 'var(--bg-surface-alt)' }}>
              <h4 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
                Your Personalized Plan
              </h4>
              {profileData.weight && profileData.height && (
                <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <p>Daily Calories: <strong>{calculateMacros(calculateBMR(profileData) * getActivityMultiplier(profileData.activity_level), profileData.goal).calories}</strong></p>
                  <p>Protein: <strong>{calculateMacros(calculateBMR(profileData) * getActivityMultiplier(profileData.activity_level), profileData.goal).protein}g</strong></p>
                  <p>Carbs: <strong>{calculateMacros(calculateBMR(profileData) * getActivityMultiplier(profileData.activity_level), profileData.goal).carbs}g</strong></p>
                  <p>Fat: <strong>{calculateMacros(calculateBMR(profileData) * getActivityMultiplier(profileData.activity_level), profileData.goal).fat}g</strong></p>
                </div>
              )}
            </Card>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <Button onClick={() => setStep(step - 1)} variant="outline">
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={createProfileMutation.isPending}
            className="gradient-accent text-white border-0 ml-auto"
          >
            {step === 3 ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Setup
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}