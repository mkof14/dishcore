import React, { useState } from "react";
import { ArrowLeft, Globe, Check, Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils";

const CUISINES = [
  { id: 'mediterranean', name: 'Mediterranean', flag: '🇬🇷', color: 'from-blue-400 to-cyan-400', desc: 'Heart-healthy, omega-rich' },
  { id: 'asian', name: 'Asian Fusion', flag: '🇯🇵', color: 'from-red-400 to-orange-400', desc: 'Low-fat, balanced' },
  { id: 'mexican', name: 'Mexican', flag: '🇲🇽', color: 'from-green-400 to-lime-400', desc: 'Fiber-rich, vibrant' },
  { id: 'middle_eastern', name: 'Middle Eastern', flag: '🇱🇧', color: 'from-purple-400 to-pink-400', desc: 'Protein & legumes' },
  { id: 'italian', name: 'Italian', flag: '🇮🇹', color: 'from-green-500 to-red-500', desc: 'Mediterranean style' },
  { id: 'indian', name: 'Indian', flag: '🇮🇳', color: 'from-orange-400 to-yellow-400', desc: 'Spice & antioxidants' }
];

const HEALTHY_PICKS = {
  mediterranean: [
    { name: 'Grilled Salmon with Herbs', cals: 320, protein: 38 },
    { name: 'Greek Salad with Feta', cals: 180, protein: 12 },
    { name: 'Hummus & Fresh Vegetables', cals: 150, protein: 8 }
  ],
  asian: [
    { name: 'Miso Soup with Tofu', cals: 90, protein: 8 },
    { name: 'Sashimi Platter', cals: 200, protein: 42 },
    { name: 'Stir-fry Vegetables', cals: 120, protein: 6 }
  ],
  mexican: [
    { name: 'Fish Tacos (2pcs)', cals: 280, protein: 24 },
    { name: 'Chicken Fajitas', cals: 320, protein: 35 },
    { name: 'Black Bean Bowl', cals: 250, protein: 18 }
  ],
  middle_eastern: [
    { name: 'Grilled Chicken Kebab', cals: 300, protein: 40 },
    { name: 'Tabbouleh Salad', cals: 140, protein: 5 },
    { name: 'Red Lentil Soup', cals: 180, protein: 12 }
  ],
  italian: [
    { name: 'Caprese Salad', cals: 160, protein: 10 },
    { name: 'Grilled Chicken Breast', cals: 280, protein: 38 },
    { name: 'Minestrone Soup', cals: 130, protein: 7 }
  ],
  indian: [
    { name: 'Tandoori Chicken', cals: 260, protein: 36 },
    { name: 'Yellow Dal', cals: 150, protein: 12 },
    { name: 'Palak Paneer', cals: 220, protein: 14 }
  ]
};

export default function StudioCulture() {
  const [selectedCuisines, setSelectedCuisines] = useState(['mediterranean']);

  const toggleCuisine = (id) => {
    if (selectedCuisines.includes(id)) {
      setSelectedCuisines(selectedCuisines.filter(c => c !== id));
    } else {
      setSelectedCuisines([...selectedCuisines, id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F18] text-white">
      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => window.location.href = createPageUrl('StudioHub')}
            className="w-12 h-12 rounded-2xl bg-[#141A27] border border-white/10 flex items-center justify-center hover:bg-[#1B2231] hover:border-teal-500/50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Culture-Aware Nutrition
            </h1>
            <p className="text-lg text-gray-400">
              Healthy choices within your cultural preferences
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-6 border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <Globe className="w-8 h-8 text-teal-400 mb-3" />
              <p className="text-3xl font-bold mb-1">{selectedCuisines.length}</p>
              <p className="text-sm text-gray-400">Active Cuisines</p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-6 border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <Sparkles className="w-8 h-8 text-blue-400 mb-3" />
              <p className="text-3xl font-bold mb-1">{selectedCuisines.length * 3}</p>
              <p className="text-sm text-gray-400">Healthy Recipes</p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-6 border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <Check className="w-8 h-8 text-green-400 mb-3" />
              <p className="text-3xl font-bold mb-1">92%</p>
              <p className="text-sm text-gray-400">Cultural Match</p>
            </div>
          </div>
        </div>

        {/* Cuisine Selection */}
        <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-green-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Select Your Cuisines</h3>
                <p className="text-sm text-gray-400">Choose cultural preferences for personalized menus</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {CUISINES.map((cuisine) => {
                const isSelected = selectedCuisines.includes(cuisine.id);
                return (
                  <button
                    key={cuisine.id}
                    onClick={() => toggleCuisine(cuisine.id)}
                    className={`relative p-6 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/20'
                        : 'border-white/10 bg-[#0B0F18]/50 hover:border-white/20'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/50">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="text-5xl mb-4">{cuisine.flag}</div>
                    <h4 className="font-bold text-lg mb-1">{cuisine.name}</h4>
                    <p className="text-xs text-gray-400">{cuisine.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Healthy Picks */}
        {selectedCuisines.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {selectedCuisines.map((cuisineId) => {
              const cuisine = CUISINES.find(c => c.id === cuisineId);
              const picks = HEALTHY_PICKS[cuisineId];
              
              return (
                <div key={cuisineId} className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5 overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br opacity-10 rounded-full blur-3xl" 
                    style={{ backgroundImage: `linear-gradient(to bottom right, ${cuisine.color.split(' ')[1]}, ${cuisine.color.split(' ')[3]})` }} />
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cuisine.color} flex items-center justify-center text-2xl shadow-lg`}>
                        {cuisine.flag}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{cuisine.name}</h3>
                        <p className="text-sm text-gray-400">Healthy Picks</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {picks.map((dish, idx) => (
                        <div key={idx} className="p-4 bg-[#0B0F18]/50 rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-teal-400 shadow-lg shadow-teal-400/50" />
                            <div>
                              <p className="font-medium">{dish.name}</p>
                              <p className="text-xs text-gray-400">{dish.cals} kcal • {dish.protein}g protein</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* AI Insight */}
        <div className="relative bg-gradient-to-br from-teal-900/20 to-green-900/20 rounded-3xl p-8 border border-teal-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-green-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-teal-300">Cultural Nutrition Insight</h4>
              <p className="text-gray-300 leading-relaxed">
                Your selected cuisines align perfectly with heart-healthy, protein-rich eating patterns. 
                {selectedCuisines.includes('mediterranean') && ' Mediterranean diet is scientifically proven to support longevity and metabolic health.'}
                {selectedCuisines.includes('asian') && ' Asian cooking methods preserve nutrients and minimize added fats.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}