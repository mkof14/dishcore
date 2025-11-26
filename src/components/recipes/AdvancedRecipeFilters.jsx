import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Filter, X, TrendingUp, Heart, Sparkles } from "lucide-react";

const MICRONUTRIENTS = [
  { id: 'vitamin_d', name: 'Vitamin D', unit: 'IU' },
  { id: 'vitamin_c', name: 'Vitamin C', unit: 'mg' },
  { id: 'vitamin_b12', name: 'Vitamin B12', unit: 'mcg' },
  { id: 'iron', name: 'Iron', unit: 'mg' },
  { id: 'calcium', name: 'Calcium', unit: 'mg' },
  { id: 'magnesium', name: 'Magnesium', unit: 'mg' },
  { id: 'potassium', name: 'Potassium', unit: 'mg' },
  { id: 'omega3', name: 'Omega-3', unit: 'mg' },
  { id: 'zinc', name: 'Zinc', unit: 'mg' }
];

const SORT_OPTIONS = [
  { value: 'health_score', label: 'Health Score' },
  { value: 'nutrient_density', label: 'Nutrient Density' },
  { value: 'rating', label: 'User Rating' },
  { value: 'anti_inflammatory', label: 'Anti-Inflammatory' },
  { value: 'protein', label: 'Highest Protein' },
  { value: 'fiber', label: 'Highest Fiber' },
  { value: 'calories', label: 'Lowest Calories' }
];

export default function AdvancedRecipeFilters({ 
  filters, 
  onFilterChange, 
  userDeficiencies = [],
  onClose 
}) {
  const [localFilters, setLocalFilters] = React.useState(filters);

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose?.();
  };

  const handleReset = () => {
    const resetFilters = {
      sortBy: 'health_score',
      minHealthScore: 0,
      minRating: 0,
      targetMicronutrients: [],
      maxCalories: 1000,
      minProtein: 0,
      minFiber: 0,
      antiInflammatory: false
    };
    setLocalFilters(resetFilters);
  };

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Advanced Filters
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <X className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Sort By */}
      <div>
        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
          Sort By
        </label>
        <Select 
          value={localFilters.sortBy} 
          onValueChange={(value) => setLocalFilters({ ...localFilters, sortBy: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Health Score Filter */}
      <div>
        <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent-from)' }} />
          Minimum Health Score: {localFilters.minHealthScore}
        </label>
        <Slider
          value={[localFilters.minHealthScore]}
          onValueChange={([value]) => setLocalFilters({ ...localFilters, minHealthScore: value })}
          max={100}
          step={5}
          className="mt-2"
        />
      </div>

      {/* Rating Filter */}
      <div>
        <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-from)' }} />
          Minimum Rating: {localFilters.minRating} ⭐
        </label>
        <Slider
          value={[localFilters.minRating]}
          onValueChange={([value]) => setLocalFilters({ ...localFilters, minRating: value })}
          max={5}
          step={0.5}
          className="mt-2"
        />
      </div>

      {/* Calorie Filter */}
      <div>
        <label className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Max Calories: {localFilters.maxCalories}
        </label>
        <Slider
          value={[localFilters.maxCalories]}
          onValueChange={([value]) => setLocalFilters({ ...localFilters, maxCalories: value })}
          min={100}
          max={1000}
          step={50}
          className="mt-2"
        />
      </div>

      {/* Protein Filter */}
      <div>
        <label className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Min Protein: {localFilters.minProtein}g
        </label>
        <Slider
          value={[localFilters.minProtein]}
          onValueChange={([value]) => setLocalFilters({ ...localFilters, minProtein: value })}
          max={100}
          step={5}
          className="mt-2"
        />
      </div>

      {/* Fiber Filter */}
      <div>
        <label className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Min Fiber: {localFilters.minFiber}g
        </label>
        <Slider
          value={[localFilters.minFiber]}
          onValueChange={([value]) => setLocalFilters({ ...localFilters, minFiber: value })}
          max={30}
          step={1}
          className="mt-2"
        />
      </div>

      {/* Anti-Inflammatory */}
      <div className="flex items-center gap-3">
        <Checkbox
          checked={localFilters.antiInflammatory}
          onCheckedChange={(checked) => setLocalFilters({ ...localFilters, antiInflammatory: checked })}
        />
        <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Heart className="w-4 h-4 text-red-400" />
          Anti-Inflammatory Foods Only
        </label>
      </div>

      {/* Target Micronutrients */}
      {userDeficiencies.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-primary)' }}>
            Address Your Deficiencies
          </label>
          <div className="space-y-2">
            {userDeficiencies.map(def => (
              <div key={def} className="flex items-center gap-2">
                <Checkbox
                  checked={localFilters.targetMicronutrients?.includes(def)}
                  onCheckedChange={(checked) => {
                    const updated = checked
                      ? [...(localFilters.targetMicronutrients || []), def]
                      : (localFilters.targetMicronutrients || []).filter(m => m !== def);
                    setLocalFilters({ ...localFilters, targetMicronutrients: updated });
                  }}
                />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  High in {MICRONUTRIENTS.find(m => m.id === def)?.name || def}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Micronutrients */}
      <div>
        <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-primary)' }}>
          Rich in Specific Nutrients
        </label>
        <div className="grid grid-cols-2 gap-2">
          {MICRONUTRIENTS.map(micro => (
            <div key={micro.id} className="flex items-center gap-2">
              <Checkbox
                checked={localFilters.targetMicronutrients?.includes(micro.id)}
                onCheckedChange={(checked) => {
                  const updated = checked
                    ? [...(localFilters.targetMicronutrients || []), micro.id]
                    : (localFilters.targetMicronutrients || []).filter(m => m !== micro.id);
                  setLocalFilters({ ...localFilters, targetMicronutrients: updated });
                }}
              />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {micro.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleApply} className="w-full gradient-accent text-white border-0">
        Apply Filters
      </Button>
    </Card>
  );
}