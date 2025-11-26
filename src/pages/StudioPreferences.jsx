import React, { useState, useEffect } from "react";
import { ArrowLeft, Globe, Ruler, Zap, Check, Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  { code: 'auto', name: 'Auto-detect', flag: '🌐' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' }
];

const UNIT_OPTIONS = {
  weight: [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'lbs', label: 'Pounds (lbs)' }
  ],
  height: [
    { value: 'cm', label: 'Centimeters (cm)' },
    { value: 'inches', label: 'Inches (in)' }
  ],
  waist: [
    { value: 'cm', label: 'Centimeters (cm)' },
    { value: 'inches', label: 'Inches (in)' }
  ],
  calories: [
    { value: 'kcal', label: 'Kilocalories (kcal)' },
    { value: 'kj', label: 'Kilojoules (kJ)' }
  ]
};

export default function StudioPreferences() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dishcore-language') || 'auto';
  });

  const [units, setUnits] = useState(() => {
    const saved = localStorage.getItem('dishcore-units');
    return saved ? JSON.parse(saved) : {
      weight: 'kg',
      height: 'cm',
      waist: 'cm',
      calories: 'kcal'
    };
  });

  const [saved, setSaved] = useState(false);

  const handleLanguageChange = (code) => {
    setLanguage(code);
  };

  const handleUnitChange = (category, value) => {
    setUnits(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSave = () => {
    localStorage.setItem('dishcore-language', language);
    localStorage.setItem('dishcore-units', JSON.stringify(units));
    
    // Trigger global settings change event
    window.dispatchEvent(new Event('dishcore-settings-changed'));
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const selectedLang = LANGUAGES.find(l => l.code === language);

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
              Studio Preferences
            </h1>
            <p className="text-lg text-gray-400">
              Customize language and measurement units
            </p>
          </div>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-br from-teal-400 to-green-400 text-white border-0 px-8 py-6 shadow-lg shadow-teal-500/30 hover:opacity-90 transition-opacity"
          >
            {saved ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>

        {/* Current Settings Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-green-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Active Language</h3>
                  <p className="text-sm text-gray-400">Current interface language</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-[#0B0F18]/50 rounded-2xl border border-white/5">
                <span className="text-3xl">{selectedLang.flag}</span>
                <span className="text-lg font-semibold">{selectedLang.name}</span>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Ruler className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Measurement System</h3>
                  <p className="text-sm text-gray-400">Active units</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-[#0B0F18]/50 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-400 mb-1">Weight</p>
                  <p className="font-semibold">{units.weight}</p>
                </div>
                <div className="p-3 bg-[#0B0F18]/50 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-400 mb-1">Height</p>
                  <p className="font-semibold">{units.height}</p>
                </div>
                <div className="p-3 bg-[#0B0F18]/50 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-400 mb-1">Waist</p>
                  <p className="font-semibold">{units.waist}</p>
                </div>
                <div className="p-3 bg-[#0B0F18]/50 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-400 mb-1">Energy</p>
                  <p className="font-semibold">{units.calories}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Language Selection */}
        <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-green-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Language Selection</h3>
                <p className="text-sm text-gray-400">Choose your preferred interface language</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              {LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`relative p-5 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/20'
                        : 'border-white/10 bg-[#0B0F18]/50 hover:border-white/20'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/50">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="text-4xl mb-3">{lang.flag}</div>
                    <h4 className="font-semibold text-sm">{lang.name}</h4>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Unit Settings */}
        <div className="relative bg-gradient-to-br from-[#141A27] to-[#1B2231] rounded-3xl p-8 border border-white/5 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Ruler className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Measurement Units</h3>
                <p className="text-sm text-gray-400">Select your preferred units for body metrics</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(UNIT_OPTIONS).map(([category, options]) => (
                <div key={category} className="space-y-3">
                  <h4 className="font-semibold text-lg capitalize">{category}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {options.map((option) => {
                      const isSelected = units[category] === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleUnitChange(category, option.value)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                              : 'border-white/10 bg-[#0B0F18]/50 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm">{option.value.toUpperCase()}</span>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/50">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{option.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sync Info */}
        <div className="relative bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-3xl p-8 border border-purple-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-3 text-purple-300">Automatic Sync</h4>
              <p className="text-gray-300 leading-relaxed mb-4">
                All settings will automatically sync across all Studio modules including:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#0B0F18]/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
                    <p className="text-sm font-semibold text-purple-300">Dashboard</p>
                  </div>
                  <p className="text-xs text-gray-400">Main interface</p>
                </div>
                <div className="p-4 bg-[#0B0F18]/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
                    <p className="text-sm font-semibold text-purple-300">Score & Map</p>
                  </div>
                  <p className="text-xs text-gray-400">Calculations</p>
                </div>
                <div className="p-4 bg-[#0B0F18]/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
                    <p className="text-sm font-semibold text-purple-300">AI Outputs</p>
                  </div>
                  <p className="text-xs text-gray-400">Coach & Menu</p>
                </div>
                <div className="p-4 bg-[#0B0F18]/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
                    <p className="text-sm font-semibold text-purple-300">Reports</p>
                  </div>
                  <p className="text-xs text-gray-400">Export formats</p>
                </div>
                <div className="p-4 bg-[#0B0F18]/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
                    <p className="text-sm font-semibold text-purple-300">Measurements</p>
                  </div>
                  <p className="text-xs text-gray-400">Body tracking</p>
                </div>
                <div className="p-4 bg-[#0B0F18]/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
                    <p className="text-sm font-semibold text-purple-300">Forecast</p>
                  </div>
                  <p className="text-xs text-gray-400">Predictions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}