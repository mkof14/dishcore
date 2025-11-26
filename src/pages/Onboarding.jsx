import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const STEPS = [
  { id: 1, title: 'Welcome', subtitle: 'Let\'s get to know you' },
  { id: 2, title: 'Your Goals', subtitle: 'What brings you here?' },
  { id: 3, title: 'Body Stats', subtitle: 'Help us personalize' },
  { id: 4, title: 'Preferences', subtitle: 'Your dietary needs' },
  { id: 5, title: 'All Set!', subtitle: 'Your journey begins' }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: '',
    sex: '',
    height: '',
    weight: '',
    activity_level: 'moderately_active',
    goal: 'lose_weight',
    diet_type: 'balanced',
    dietary_restrictions: [],
    allergies: [],
    disliked_ingredients: [],
    favorite_cuisines: [],
    meal_frequency: 3,
    target_calories: 2000,
    cooking_skill: 'intermediate'
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, data);
      } else {
        await base44.entities.UserProfile.create(data);
      }
      
      return data;
    },
    onSuccess: () => {
      localStorage.setItem('onboarding_completed', 'true');
      toast.success('Profile created successfully!');
      setTimeout(() => navigate(createPageUrl('Dashboard')), 1500);
    },
  });

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      saveProfileMutation.mutate(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" 
      style={{ background: 'linear-gradient(135deg, #07182F 0%, #0D1F36 100%)' }}>
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`w-8 md:w-16 h-1 mx-2 transition-all ${
                    currentStep > step.id ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-1">{STEPS[currentStep - 1].title}</h2>
            <p className="text-blue-300">{STEPS[currentStep - 1].subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8" style={{ 
              background: '#0D1F36', 
              border: '1px solid rgba(45, 163, 255, 0.2)',
              borderRadius: '24px'
            }}>
              {currentStep === 1 && <WelcomeStep />}
              {currentStep === 2 && <GoalsStep formData={formData} updateFormData={updateFormData} />}
              {currentStep === 3 && <BodyStatsStep formData={formData} updateFormData={updateFormData} />}
              {currentStep === 4 && <PreferencesStep formData={formData} updateFormData={updateFormData} />}
              {currentStep === 5 && <FinalStep formData={formData} />}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            onClick={handleBack}
            variant="outline"
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="gradient-accent text-white border-0 gap-2"
            disabled={saveProfileMutation.isPending}
          >
            {currentStep === STEPS.length ? 'Complete' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
      >
        <Sparkles className="w-20 h-20 mx-auto mb-6 text-blue-400" />
      </motion.div>
      <h1 className="text-4xl font-bold text-white mb-4">Welcome to DishCore!</h1>
      <p className="text-xl text-blue-200 mb-8">
        Your AI-powered nutrition companion
      </p>
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(0, 163, 227, 0.1)' }}>
          <div className="text-4xl mb-3">🍽️</div>
          <h3 className="font-bold text-white mb-2">Smart Tracking</h3>
          <p className="text-sm text-blue-300">AI-powered meal analysis</p>
        </div>
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(0, 163, 227, 0.1)' }}>
          <div className="text-4xl mb-3">📊</div>
          <h3 className="font-bold text-white mb-2">Real-Time Insights</h3>
          <p className="text-sm text-blue-300">Track your progress</p>
        </div>
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(0, 163, 227, 0.1)' }}>
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="font-bold text-white mb-2">Personalized Plans</h3>
          <p className="text-sm text-blue-300">Custom meal recommendations</p>
        </div>
      </div>
    </div>
  );
}

function GoalsStep({ formData, updateFormData }) {
  const goals = [
    { value: 'lose_weight', label: 'Lose Weight', icon: '🎯', desc: 'Healthy weight loss' },
    { value: 'gain_weight', label: 'Gain Weight', icon: '💪', desc: 'Build muscle mass' },
    { value: 'maintain', label: 'Maintain', icon: '⚖️', desc: 'Stay at current weight' },
    { value: 'muscle_building', label: 'Build Muscle', icon: '🏋️', desc: 'Gain lean muscle' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">What's your primary goal?</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {goals.map(goal => (
          <button
            key={goal.value}
            onClick={() => updateFormData('goal', goal.value)}
            className={`p-6 rounded-2xl text-left transition-all ${
              formData.goal === goal.value
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-blue-400'
                : 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="text-4xl mb-3">{goal.icon}</div>
            <h4 className="font-bold text-white mb-1">{goal.label}</h4>
            <p className="text-sm text-gray-400">{goal.desc}</p>
          </button>
        ))}
      </div>

      <div>
        <label className="text-sm font-medium text-blue-200 mb-2 block">Activity Level</label>
        <Select value={formData.activity_level} onValueChange={(v) => updateFormData('activity_level', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
            <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
            <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
            <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function BodyStatsStep({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Tell us about yourself</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-blue-200 mb-2 block">Age</label>
          <Input
            type="number"
            value={formData.age}
            onChange={(e) => updateFormData('age', e.target.value)}
            placeholder="25"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-blue-200 mb-2 block">Sex</label>
          <Select value={formData.sex} onValueChange={(v) => updateFormData('sex', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-blue-200 mb-2 block">Height (cm)</label>
          <Input
            type="number"
            value={formData.height}
            onChange={(e) => updateFormData('height', e.target.value)}
            placeholder="170"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-blue-200 mb-2 block">Weight (kg)</label>
          <Input
            type="number"
            value={formData.weight}
            onChange={(e) => updateFormData('weight', e.target.value)}
            placeholder="70"
          />
        </div>
      </div>
    </div>
  );
}

function PreferencesStep({ formData, updateFormData }) {
  const dietTypes = [
    { value: 'balanced', label: 'Balanced' },
    { value: 'low_carb', label: 'Low Carb' },
    { value: 'keto', label: 'Keto' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'vegetarian', label: 'Vegetarian' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Your dietary preferences</h3>
      
      <div>
        <label className="text-sm font-medium text-blue-200 mb-2 block">Diet Type</label>
        <Select value={formData.diet_type} onValueChange={(v) => updateFormData('diet_type', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dietTypes.map(diet => (
              <SelectItem key={diet.value} value={diet.value}>{diet.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-blue-200 mb-2 block">Allergies (optional)</label>
        <Textarea
          value={formData.allergies.join(', ')}
          onChange={(e) => updateFormData('allergies', e.target.value.split(',').map(s => s.trim()))}
          placeholder="Peanuts, shellfish..."
          rows={2}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-blue-200 mb-2 block">Foods to avoid (optional)</label>
        <Textarea
          value={formData.disliked_ingredients.join(', ')}
          onChange={(e) => updateFormData('disliked_ingredients', e.target.value.split(',').map(s => s.trim()))}
          placeholder="Mushrooms, olives..."
          rows={2}
        />
      </div>
    </div>
  );
}

function FinalStep({ formData }) {
  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
      >
        <Check className="w-20 h-20 mx-auto mb-6 text-green-400" />
      </motion.div>
      <h1 className="text-4xl font-bold text-white mb-4">You're All Set!</h1>
      <p className="text-xl text-blue-200 mb-8">
        Your personalized nutrition journey starts now
      </p>
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-2xl border border-blue-500/20">
        <p className="text-blue-200 mb-2">Based on your profile:</p>
        <div className="flex flex-wrap justify-center gap-3">
          <span className="px-4 py-2 bg-blue-500/20 rounded-full text-white text-sm">
            Goal: {formData.goal.replace('_', ' ')}
          </span>
          <span className="px-4 py-2 bg-purple-500/20 rounded-full text-white text-sm">
            Diet: {formData.diet_type}
          </span>
          <span className="px-4 py-2 bg-green-500/20 rounded-full text-white text-sm">
            Activity: {formData.activity_level.replace('_', ' ')}
          </span>
        </div>
      </div>
    </div>
  );
}