
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Clock, Flame, Users, Award } from "lucide-react";
import MicronutrientDisplay from "./MicronutrientDisplay";
import NutritionalInsights from "../nutrition/NutritionalInsights";

export default function DishDetailDialog({ dish, open, onClose, onEdit, onDelete }) {
  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  if (!dish) return null;

  const totalTime = (dish.prep_time || 0) + (dish.cook_time || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" 
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-soft)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between" style={{ color: 'var(--text-primary)' }}>
            <span>{dish.name}</span>
            {dish.health_score && (
              <Badge className="gradient-accent text-white border-0">
                <Award className="w-3 h-3 mr-1" />
                Score: {dish.health_score}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {dish.image_url && (
            <img src={dish.image_url} alt={dish.name} className="w-full h-64 object-cover rounded-2xl" />
          )}

          {dish.description && (
            <p style={{ color: 'var(--text-secondary)' }}>{dish.description}</p>
          )}

          {/* Basic Info */}
          <div className="flex flex-wrap gap-3">
            {totalTime > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {totalTime} min
              </Badge>
            )}
            {dish.servings && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {dish.servings} servings
              </Badge>
            )}
            {dish.difficulty && (
              <Badge variant="outline">{dish.difficulty}</Badge>
            )}
          </div>

          {/* Macros */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-4 rounded-xl text-center" style={{ background: 'var(--background)' }}>
              <Flame className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Calories</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{dish.calories}</p>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ background: 'var(--background)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Protein</p>
              <p className="text-xl font-bold text-blue-500">{dish.protein}g</p>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ background: 'var(--background)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Carbs</p>
              <p className="text-xl font-bold text-orange-500">{dish.carbs}g</p>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ background: 'var(--background)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Fat</p>
              <p className="text-xl font-bold text-purple-500">{dish.fat}g</p>
            </div>
          </div>

          {/* Advanced Nutritional Insights */}
          <NutritionalInsights dish={dish} profile={profile} />

          {/* Micronutrients */}
          {dish.micronutrients && Object.keys(dish.micronutrients).length > 0 && (
            <MicronutrientDisplay micronutrients={dish.micronutrients} />
          )}

          {/* Ingredients */}
          {dish.ingredients && dish.ingredients.length > 0 && (
            <div>
              <h3 className="font-bold mb-3 text-lg" style={{ color: 'var(--text-primary)' }}>Ingredients</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {dish.ingredients.map((ing, idx) => (
                  <div key={idx} className="p-2 rounded-lg" style={{ background: 'var(--background)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      • {typeof ing === 'string' ? ing : `${ing.amount} ${ing.unit} ${ing.name}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {dish.cooking_instructions && dish.cooking_instructions.length > 0 && (
            <div>
              <h3 className="font-bold mb-3 text-lg" style={{ color: 'var(--text-primary)' }}>Instructions</h3>
              <ol className="space-y-3">
                {dish.cooking_instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <p className="text-sm pt-0.5" style={{ color: 'var(--text-secondary)' }}>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button onClick={() => onEdit(dish)} variant="outline" className="flex-1">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button onClick={() => onDelete(dish)} variant="outline" className="flex-1 text-red-500 border-red-500/30 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
