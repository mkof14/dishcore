import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  UtensilsCrossed, 
  Search, 
  AlertCircle, 
  CheckCircle2,
  MapPin,
  Sparkles
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CUISINES = [
  'Italian', 'Asian', 'American', 'Mediterranean', 'Mexican', 
  'Indian', 'Japanese', 'Thai', 'French', 'Middle Eastern'
];

const MOCK_DISHES = [
  {
    id: 1,
    name: 'Grilled Salmon Salad',
    cuisine: 'Mediterranean',
    category: 'Salads',
    calories: 420,
    protein: 35,
    carbs: 15,
    fat: 25,
    safe: true,
    tags: ['high-protein', 'omega-3', 'low-carb'],
    warnings: []
  },
  {
    id: 2,
    name: 'Margherita Pizza',
    cuisine: 'Italian',
    category: 'Mains',
    calories: 850,
    protein: 28,
    carbs: 110,
    fat: 32,
    safe: false,
    tags: ['vegetarian'],
    warnings: ['high-sodium', 'high-carb']
  },
  {
    id: 3,
    name: 'Caesar Salad',
    cuisine: 'American',
    category: 'Salads',
    calories: 320,
    protein: 22,
    carbs: 12,
    fat: 18,
    safe: true,
    tags: ['high-protein'],
    warnings: ['hidden-calories-in-dressing']
  },
  {
    id: 4,
    name: 'Pad Thai',
    cuisine: 'Thai',
    category: 'Mains',
    calories: 680,
    protein: 18,
    carbs: 85,
    fat: 28,
    safe: false,
    tags: ['spicy'],
    warnings: ['high-sodium', 'high-sugar']
  }
];

export default function RestaurantMode() {
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [travelMode, setTravelMode] = useState(false);
  const [alternativesDialog, setAlternativesDialog] = useState(null);
  const queryClient = useQueryClient();

  const addMealMutation = useMutation({
    mutationFn: async (dish) => {
      const today = format(new Date(), 'yyyy-MM-dd');
      return await base44.entities.MealLog.create({
        date: today,
        meal_type: 'lunch',
        dish_name: dish.name,
        calories: dish.calories,
        protein: dish.protein,
        carbs: dish.carbs,
        fat: dish.fat,
        notes: `From restaurant: ${dish.cuisine}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mealLogs']);
      toast.success('Meal added to today!');
    },
    onError: () => {
      toast.error('Failed to add meal');
    }
  });

  const filteredDishes = MOCK_DISHES.filter(dish => {
    const matchesCuisine = selectedCuisine === 'all' || dish.cuisine === selectedCuisine;
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCuisine && matchesSearch;
  });

  const getAlternatives = (dish) => {
    return MOCK_DISHES.filter(d => 
      d.id !== dish.id && 
      d.category === dish.category && 
      d.safe === true
    );
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <UtensilsCrossed className="w-8 h-8" />
              Restaurant Mode
            </h1>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
              Smart dining choices when eating out
            </p>
          </div>
          <Button
            variant={travelMode ? 'default' : 'outline'}
            onClick={() => setTravelMode(!travelMode)}
            className={travelMode ? 'gradient-accent text-white border-0' : ''}
          >
            <MapPin className="w-4 h-4 mr-2" />
            {travelMode ? 'Travel Mode ON' : 'Enable Travel Mode'}
          </Button>
        </div>

        {travelMode && (
          <Card className="border-blue-500/20 bg-blue-500/5 p-4 rounded-2xl">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Travel Mode Active
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Adjusted hydration goal (+500ml), flexible calorie target (±200 kcal), 
                  airport-friendly suggestions enabled. Focus on protein and hydration during travel.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Search & Filters */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: 'var(--text-muted)' }} />
              <Input
                placeholder="Search dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{
                  background: 'var(--background)',
                  borderColor: 'var(--border)'
                }}
              />
            </div>
            <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cuisines</SelectItem>
                {CUISINES.map(cuisine => (
                  <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Dishes Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredDishes.map(dish => (
            <Card key={dish.id} className="gradient-card border-0 p-6 rounded-3xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {dish.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span>{dish.cuisine}</span>
                    <span>•</span>
                    <span>{dish.category}</span>
                  </div>
                </div>
                {dish.safe ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-2xl" style={{ background: 'var(--background)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Calories</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {dish.calories}
                  </p>
                </div>
                <div className="p-3 rounded-2xl" style={{ background: 'var(--background)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Protein</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {dish.protein}g
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {dish.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {dish.warnings.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-semibold text-orange-500">Caution</span>
                  </div>
                  <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    {dish.warnings.map(warning => (
                      <li key={warning}>• {warning.replace(/-/g, ' ')}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 gradient-accent text-white border-0"
                  onClick={() => addMealMutation.mutate(dish)}
                  disabled={addMealMutation.isPending}
                >
                  Add to Today
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setAlternativesDialog(dish)}
                >
                  Alternatives
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredDishes.length === 0 && (
          <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
            <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
            <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No dishes found
            </p>
            <p style={{ color: 'var(--text-muted)' }}>
              Try adjusting your filters or search term
            </p>
          </Card>
        )}
      </div>

      {/* Alternatives Dialog */}
      <Dialog open={!!alternativesDialog} onOpenChange={() => setAlternativesDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Healthier Alternatives to {alternativesDialog?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {alternativesDialog && getAlternatives(alternativesDialog).map(alt => (
              <Card key={alt.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {alt.name}
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {alt.cuisine} • {alt.category}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Calories</p>
                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{alt.calories}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Protein</p>
                    <p className="font-bold text-blue-500">{alt.protein}g</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Savings</p>
                    <p className="font-bold text-green-500">
                      {alternativesDialog.calories - alt.calories} kcal
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full gradient-accent text-white border-0"
                  onClick={() => {
                    addMealMutation.mutate(alt);
                    setAlternativesDialog(null);
                  }}
                >
                  Add This Instead
                </Button>
              </Card>
            ))}
            {alternativesDialog && getAlternatives(alternativesDialog).length === 0 && (
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                No healthier alternatives found for this category.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}