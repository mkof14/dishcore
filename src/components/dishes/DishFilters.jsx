import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const COMMON_TAGS = ['high_protein', 'low_carb', 'vegan', 'vegetarian', 'quick', 'healthy', 'comfort_food', 'fiber_rich'];

export default function DishFilters({ filters, onFiltersChange, dishes }) {
  const cuisines = [...new Set(dishes.map(d => d.cuisine_type).filter(Boolean))];
  
  // Initialize filter defaults if not set
  const defaultFilters = {
    mealType: 'all',
    cuisine_type: 'all',
    difficulty: 'all',
    minProtein: 0,
    maxCalories: 1500,
    min_calories: 0,
    max_calories: 1500,
    min_protein: 0,
    max_protein: 100,
    min_carbs: 0,
    max_carbs: 150,
    min_fat: 0,
    max_fat: 80,
    min_fiber: 0,
    max_sugar: 50,
    min_prep_time: 0,
    max_prep_time: 120,
    min_cook_time: 0,
    max_cook_time: 180,
    min_rating: 0,
    min_reviews: 0,
    tags: [],
    ...filters
  };

  const toggleTag = (tag) => {
    const newTags = defaultFilters.tags.includes(tag)
      ? defaultFilters.tags.filter(t => t !== tag)
      : [...defaultFilters.tags, tag];
    onFiltersChange({ ...defaultFilters, tags: newTags });
  };

  return (
    <div className="space-y-6">
      {/* Basic Filters */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <Label style={{ color: 'var(--text-secondary)' }}>Meal Type</Label>
          <Select 
            value={defaultFilters.mealType} 
            onValueChange={(val) => onFiltersChange({ ...defaultFilters, mealType: val })}
          >
            <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label style={{ color: 'var(--text-secondary)' }}>Cuisine</Label>
          <Select 
            value={defaultFilters.cuisine_type} 
            onValueChange={(val) => onFiltersChange({ ...defaultFilters, cuisine_type: val })}
          >
            <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cuisines</SelectItem>
              {cuisines.map(cuisine => (
                <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label style={{ color: 'var(--text-secondary)' }}>Difficulty</Label>
          <Select value={defaultFilters.difficulty} onValueChange={(val) => onFiltersChange({...defaultFilters, difficulty: val})}>
            <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Nutrition Filters */}
      <div>
        <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Nutritional Content</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label style={{ color: 'var(--text-secondary)' }}>Calories</Label>
              <span className="text-sm font-semibold px-2 py-1 rounded-full" 
                style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-primary)' }}>
                {defaultFilters.min_calories}-{defaultFilters.max_calories} kcal
              </span>
            </div>
            <div className="space-y-2">
              <Slider
                value={[defaultFilters.min_calories, defaultFilters.max_calories]}
                onValueChange={(val) => onFiltersChange({ ...defaultFilters, min_calories: val[0], max_calories: val[1] })}
                min={0}
                max={1500}
                step={50}
                minStepsBetweenThumbs={1}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label style={{ color: 'var(--text-secondary)' }}>Protein (g)</Label>
              <span className="text-sm font-semibold px-2 py-1 rounded-full" 
                style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-primary)' }}>
                {defaultFilters.min_protein}-{defaultFilters.max_protein}g
              </span>
            </div>
            <Slider
              value={[defaultFilters.min_protein, defaultFilters.max_protein]}
              onValueChange={(val) => onFiltersChange({ ...defaultFilters, min_protein: val[0], max_protein: val[1] })}
              min={0}
              max={100}
              step={5}
              minStepsBetweenThumbs={1}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label style={{ color: 'var(--text-secondary)' }}>Carbs (g)</Label>
              <span className="text-sm font-semibold px-2 py-1 rounded-full" 
                style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-primary)' }}>
                {defaultFilters.min_carbs}-{defaultFilters.max_carbs}g
              </span>
            </div>
            <Slider
              value={[defaultFilters.min_carbs, defaultFilters.max_carbs]}
              onValueChange={(val) => onFiltersChange({ ...defaultFilters, min_carbs: val[0], max_carbs: val[1] })}
              min={0}
              max={150}
              step={5}
              minStepsBetweenThumbs={1}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label style={{ color: 'var(--text-secondary)' }}>Fat (g)</Label>
              <span className="text-sm font-semibold px-2 py-1 rounded-full" 
                style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-primary)' }}>
                {defaultFilters.min_fat}-{defaultFilters.max_fat}g
              </span>
            </div>
            <Slider
              value={[defaultFilters.min_fat, defaultFilters.max_fat]}
              onValueChange={(val) => onFiltersChange({ ...defaultFilters, min_fat: val[0], max_fat: val[1] })}
              min={0}
              max={80}
              step={5}
              minStepsBetweenThumbs={1}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label style={{ color: 'var(--text-secondary)' }}>Fiber (g)</Label>
              <span className="text-sm font-semibold px-2 py-1 rounded-full" 
                style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-primary)' }}>
                {defaultFilters.min_fiber}+ g
              </span>
            </div>
            <Slider
              value={[defaultFilters.min_fiber]}
              onValueChange={(val) => onFiltersChange({ ...defaultFilters, min_fiber: val[0] })}
              min={0}
              max={30}
              step={2}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label style={{ color: 'var(--text-secondary)' }}>Sugar (g)</Label>
              <span className="text-sm font-semibold px-2 py-1 rounded-full" 
                style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-primary)' }}>
                Max {defaultFilters.max_sugar}g
              </span>
            </div>
            <Slider
              value={[defaultFilters.max_sugar]}
              onValueChange={(val) => onFiltersChange({ ...defaultFilters, max_sugar: val[0] })}
              min={0}
              max={50}
              step={5}
            />
          </div>
        </div>
      </div>

      {/* Time & Rating Filters */}
      <div>
        <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Time & Ratings</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label style={{ color: 'var(--text-secondary)' }}>Prep Time</Label>
              <span className="text-sm font-semibold px-2 py-1 rounded-full" 
                style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-primary)' }}>
                {defaultFilters.min_prep_time}-{defaultFilters.max_prep_time} min
              </span>
            </div>
            <Slider
              value={[defaultFilters.min_prep_time, defaultFilters.max_prep_time]}
              onValueChange={(val) => onFiltersChange({ ...defaultFilters, min_prep_time: val[0], max_prep_time: val[1] })}
              min={0}
              max={120}
              step={5}
              minStepsBetweenThumbs={1}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label style={{ color: 'var(--text-secondary)' }}>Cook Time</Label>
              <span className="text-sm font-semibold px-2 py-1 rounded-full" 
                style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-primary)' }}>
                {defaultFilters.min_cook_time}-{defaultFilters.max_cook_time} min
              </span>
            </div>
            <Slider
              value={[defaultFilters.min_cook_time, defaultFilters.max_cook_time]}
              onValueChange={(val) => onFiltersChange({ ...defaultFilters, min_cook_time: val[0], max_cook_time: val[1] })}
              min={0}
              max={180}
              step={10}
              minStepsBetweenThumbs={1}
            />
          </div>

          <div>
            <Label style={{ color: 'var(--text-secondary)' }}>Minimum Rating</Label>
            <Select 
              value={defaultFilters.min_rating?.toString() || '0'} 
              onValueChange={(val) => onFiltersChange({...defaultFilters, min_rating: parseFloat(val)})}
            >
              <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Ratings</SelectItem>
                <SelectItem value="1">⭐ 1+ Stars</SelectItem>
                <SelectItem value="2">⭐⭐ 2+ Stars</SelectItem>
                <SelectItem value="3">⭐⭐⭐ 3+ Stars</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ 4+ Stars</SelectItem>
                <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label style={{ color: 'var(--text-secondary)' }}>Min Reviews</Label>
              <span className="text-sm font-semibold px-2 py-1 rounded-full" 
                style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-primary)' }}>
                {defaultFilters.min_reviews}+ reviews
              </span>
            </div>
            <Slider
              value={[defaultFilters.min_reviews]}
              onValueChange={(val) => onFiltersChange({ ...defaultFilters, min_reviews: val[0] })}
              min={0}
              max={50}
              step={5}
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label className="mb-3 block" style={{ color: 'var(--text-secondary)' }}>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {COMMON_TAGS.map(tag => (
            <Badge
              key={tag}
              variant={defaultFilters.tags.includes(tag) ? 'default' : 'outline'}
              className={`cursor-pointer ${defaultFilters.tags.includes(tag) ? 'gradient-accent text-white border-0' : ''}`}
              style={!defaultFilters.tags.includes(tag) ? { borderColor: 'var(--border)', color: 'var(--text-secondary)' } : {}}
              onClick={() => toggleTag(tag)}
            >
              {tag.replace(/_/g, ' ')}
              {defaultFilters.tags.includes(tag) && <X className="w-3 h-3 ml-1" />}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}