import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Sparkles,
  Utensils,
  X,
  Flame,
  Clock,
  Star,
  Pencil,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import DishDetailDialog from "@/components/dishes/DishDetailDialog";
import DishFormDialog from "@/components/dishes/DishFormDialog";
import AIRecipeGenerator from "@/components/dishes/AIRecipeGenerator";
import SpoonacularImport from "@/components/dishes/SpoonacularImport";

const MEAL_TYPES = ['all', 'breakfast', 'lunch', 'dinner', 'snack'];

function SimpleDishCard({ dish, onView, onEdit, onDelete }) {
  return (
    <Card 
      onClick={() => onView && onView(dish)}
      className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      style={{ 
        background: 'var(--surface)', 
        border: '1px solid var(--border)',
        borderRadius: '16px'
      }}
    >
      <div className="relative h-40 overflow-hidden">
        {dish.image_url ? (
          <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))' }}>
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        
        {dish.avgRating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}>
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            {dish.avgRating.toFixed(1)}
          </div>
        )}

        {dish.meal_type && (
          <div className="absolute top-2 left-2">
            <Badge className="text-xs text-white border-0" style={{ background: 'rgba(0,0,0,0.7)' }}>
              {dish.meal_type}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-base mb-2 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
          {dish.name}
        </h3>

        <div className="flex items-center gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span style={{ color: 'var(--text-secondary)' }}>{dish.calories || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span style={{ color: 'var(--text-secondary)' }}>{(dish.prep_time || 0) + (dish.cook_time || 0)}m</span>
          </div>
        </div>

        <div className="flex gap-2 text-xs mb-3">
          <span className="px-2 py-1 rounded-full" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA' }}>
            P: {dish.protein || 0}g
          </span>
          <span className="px-2 py-1 rounded-full" style={{ background: 'rgba(251, 146, 60, 0.15)', color: '#FB923C' }}>
            C: {dish.carbs || 0}g
          </span>
          <span className="px-2 py-1 rounded-full" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#A78BFA' }}>
            F: {dish.fat || 0}g
          </span>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            {onEdit && (
              <span onClick={(e) => { e.stopPropagation(); onEdit(dish); }}
                className="p-2 rounded-lg cursor-pointer hover:opacity-70">
                <Pencil className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </span>
            )}
            {onDelete && (
              <span onClick={(e) => { e.stopPropagation(); onDelete(dish); }}
                className="p-2 rounded-lg cursor-pointer hover:opacity-70">
                <Trash2 className="w-4 h-4 text-red-500" />
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default function DishLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("all");
  const [selectedDish, setSelectedDish] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingDish, setEditingDish] = useState(null);

  const queryClient = useQueryClient();

  const { data: dishes = [], isLoading } = useQuery({
    queryKey: ['dishes'],
    queryFn: () => base44.entities.Dish.list('-created_date'),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => base44.entities.DishReview.list(),
  });

  const deleteDishMutation = useMutation({
    mutationFn: (dishId) => base44.entities.Dish.delete(dishId),
    onSuccess: () => {
      queryClient.invalidateQueries(['dishes']);
      toast.success('Recipe deleted successfully');
    },
  });

  const dishesWithRatings = dishes.map(dish => {
    const dishReviews = reviews.filter(r => r.dish_id === dish.id);
    const avgRating = dishReviews.length > 0
      ? dishReviews.reduce((sum, r) => sum + r.rating, 0) / dishReviews.length
      : 0;
    return { ...dish, avgRating };
  });

  const filteredDishes = dishesWithRatings
    .filter(dish => {
      const matchesSearch = !searchTerm || 
        dish.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMealType = selectedMealType === 'all' || dish.meal_type === selectedMealType;
      return matchesSearch && matchesMealType;
    })
    .sort((a, b) => {
      // Dishes with images first
      const aHasImage = a.image_url ? 1 : 0;
      const bHasImage = b.image_url ? 1 : 0;
      return bHasImage - aHasImage;
    });

  const handleDeleteDish = (dish) => {
    if (confirm(`Are you sure you want to delete "${dish.name}"?`)) {
      deleteDishMutation.mutate(dish.id);
    }
  };

  const handleEditDish = (dish) => {
    setEditingDish(dish);
    setShowAddDialog(true);
  };

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              🍽️ Dish Library
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {dishes.length} {dishes.length === 1 ? 'recipe' : 'recipes'} in your collection
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setShowAIGenerator(true)}
              className="text-white border-0"
              style={{ background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))' }}>
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generator
            </Button>
            <Button onClick={() => setShowImportDialog(true)}
              variant="outline" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              <Search className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => { setEditingDish(null); setShowAddDialog(true); }}
              variant="outline" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Search & Filter */}
        <Card className="p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <Input
                placeholder="Search by recipe name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {MEAL_TYPES.map(type => (
                <button key={type} onClick={() => setSelectedMealType(type)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: selectedMealType === type 
                      ? 'linear-gradient(135deg, var(--accent-from), var(--accent-to))' 
                      : 'var(--background)',
                    color: selectedMealType === type ? '#fff' : 'var(--text-secondary)',
                    border: selectedMealType === type ? 'none' : '1px solid var(--border)'
                  }}>
                  {type === 'all' ? 'All' : 
                   type === 'breakfast' ? '🌅 Breakfast' :
                   type === 'lunch' ? '☀️ Lunch' :
                   type === 'dinner' ? '🌙 Dinner' : '🍎 Snack'}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Dishes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="h-64 animate-pulse" style={{ background: 'var(--surface)', borderRadius: '16px' }} />
            ))}
          </div>
        ) : filteredDishes.length === 0 ? (
          <Card className="p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
            <Utensils className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No Recipes Found</h3>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Start building your recipe collection by adding your first dish</p>
            <Button onClick={() => setShowAIGenerator(true)}
              className="text-white border-0"
              style={{ background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))' }}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Recipe with AI
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDishes.map((dish) => (
              <SimpleDishCard
                key={dish.id}
                dish={dish}
                onView={setSelectedDish}
                onEdit={handleEditDish}
                onDelete={handleDeleteDish}
              />
            ))}
          </div>
        )}
      </div>

      {selectedDish && (
        <DishDetailDialog
          dish={selectedDish}
          open={!!selectedDish}
          onClose={() => setSelectedDish(null)}
          onEdit={handleEditDish}
          onDelete={handleDeleteDish}
        />
      )}

      {showAddDialog && (
        <DishFormDialog
          open={showAddDialog}
          onClose={() => { setShowAddDialog(false); setEditingDish(null); }}
          dish={editingDish}
        />
      )}

      {showAIGenerator && (
        <AIRecipeGenerator
          open={showAIGenerator}
          onClose={() => setShowAIGenerator(false)}
        />
      )}

      {showImportDialog && (
        <SpoonacularImport
          open={showImportDialog}
          onClose={() => setShowImportDialog(false)}
        />
      )}
    </div>
  );
}