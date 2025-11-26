import React, { useState } from "react";
import { Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DIETARY_RESTRICTIONS = [
  'vegan',
  'vegetarian',
  'gluten_free',
  'dairy_free',
  'nut_free',
  'low_carb',
  'keto',
  'paleo'
];

export default function MenuPreferences({ preferences, onSave }) {
  const [open, setOpen] = useState(false);
  const [localPrefs, setLocalPrefs] = useState(preferences || {
    macroTargets: { protein: 30, carbs: 40, fat: 30 },
    restrictions: [],
    avoidIngredients: []
  });

  const [newIngredient, setNewIngredient] = useState('');

  const handleMacroChange = (macro, value) => {
    setLocalPrefs(prev => ({
      ...prev,
      macroTargets: {
        ...prev.macroTargets,
        [macro]: Math.max(0, Math.min(100, parseInt(value) || 0))
      }
    }));
  };

  const toggleRestriction = (restriction) => {
    setLocalPrefs(prev => ({
      ...prev,
      restrictions: prev.restrictions.includes(restriction)
        ? prev.restrictions.filter(r => r !== restriction)
        : [...prev.restrictions, restriction]
    }));
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setLocalPrefs(prev => ({
        ...prev,
        avoidIngredients: [...prev.avoidIngredients, newIngredient.trim()]
      }));
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredient) => {
    setLocalPrefs(prev => ({
      ...prev,
      avoidIngredients: prev.avoidIngredients.filter(i => i !== ingredient)
    }));
  };

  const handleSave = () => {
    onSave(localPrefs);
    setOpen(false);
  };

  const totalMacros = Object.values(localPrefs.macroTargets).reduce((a, b) => a + b, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#141A27] border-white/10 hover:border-teal-500/50 text-white"
        >
          <Settings className="w-4 h-4 mr-2" />
          Menu Preferences
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#141A27] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Menu Preferences</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          
          {/* Macro Targets */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Macro Targets (% of calories)</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Protein</Label>
                  <span className="text-sm text-gray-400">{localPrefs.macroTargets.protein}%</span>
                </div>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={localPrefs.macroTargets.protein}
                  onChange={(e) => handleMacroChange('protein', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label>Carbohydrates</Label>
                  <span className="text-sm text-gray-400">{localPrefs.macroTargets.carbs}%</span>
                </div>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={localPrefs.macroTargets.carbs}
                  onChange={(e) => handleMacroChange('carbs', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label>Fats</Label>
                  <span className="text-sm text-gray-400">{localPrefs.macroTargets.fat}%</span>
                </div>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={localPrefs.macroTargets.fat}
                  onChange={(e) => handleMacroChange('fat', e.target.value)}
                  className="w-full"
                />
              </div>

              {totalMacros !== 100 && (
                <p className="text-sm text-orange-400">
                  ⚠️ Total: {totalMacros}% (should equal 100%)
                </p>
              )}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Dietary Restrictions</h3>
            <div className="flex flex-wrap gap-2">
              {DIETARY_RESTRICTIONS.map((restriction) => (
                <button
                  key={restriction}
                  onClick={() => toggleRestriction(restriction)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    localPrefs.restrictions.includes(restriction)
                      ? 'bg-teal-500 text-white'
                      : 'bg-[#0B0F18] border border-white/10 hover:border-white/20'
                  }`}
                >
                  {restriction.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Avoid Ingredients */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Ingredients to Avoid</h3>
            <div className="flex gap-2 mb-3">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                placeholder="e.g., mushrooms, cilantro"
                className="flex-1 bg-[#0B0F18] border-white/10"
              />
              <Button
                onClick={addIngredient}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {localPrefs.avoidIngredients.map((ingredient, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full flex items-center gap-2 text-sm"
                >
                  <span>{ingredient}</span>
                  <button
                    onClick={() => removeIngredient(ingredient)}
                    className="hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="bg-[#0B0F18] border-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={totalMacros !== 100}
            className="bg-gradient-to-br from-teal-400 to-green-400 text-white"
          >
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}