import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Leaf, Zap, Heart, Sun, Flame, Moon } from "lucide-react";

const CATEGORIES = [
  {
    id: 'quick',
    name: 'Quick Meals',
    icon: Zap,
    color: '#60A5FA',
    filter: (dish) => ((dish.prep_time || 0) + (dish.cook_time || 0)) <= 30
  },
  {
    id: 'budget',
    name: 'Budget-Friendly',
    icon: DollarSign,
    color: '#34D399',
    filter: (dish) => dish.tags?.includes('budget-friendly') || dish.tags?.includes('affordable')
  },
  {
    id: 'high_protein',
    name: 'High Protein',
    icon: Flame,
    color: '#F87171',
    filter: (dish) => (dish.protein || 0) >= 30
  },
  {
    id: 'low_calorie',
    name: 'Light & Lean',
    icon: Leaf,
    color: '#A78BFA',
    filter: (dish) => (dish.calories || 0) <= 400
  },
  {
    id: 'seasonal',
    name: 'Seasonal Picks',
    icon: Sun,
    color: '#FBBF24',
    filter: (dish) => {
      const month = new Date().getMonth();
      if (month >= 2 && month <= 4) return dish.tags?.includes('spring');
      if (month >= 5 && month <= 7) return dish.tags?.includes('summer');
      if (month >= 8 && month <= 10) return dish.tags?.includes('fall');
      return dish.tags?.includes('winter');
    }
  },
  {
    id: 'comfort',
    name: 'Comfort Food',
    icon: Heart,
    color: '#FB923C',
    filter: (dish) => dish.tags?.includes('comfort') || dish.tags?.includes('cozy')
  }
];

export default function RecipeCategories({ dishes, onCategorySelect }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        const count = dishes.filter(category.filter).length;
        
        return (
          <Card
            key={category.id}
            className="gradient-card border-0 p-4 rounded-2xl cursor-pointer hover:scale-105 transition-all group"
            onClick={() => onCategorySelect(category)}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ background: `${category.color}20` }}
              >
                <Icon className="w-6 h-6" style={{ color: category.color }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {category.name}
                </h3>
                <Badge className="mt-1 text-xs" style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-muted)' }}>
                  {count} recipes
                </Badge>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export { CATEGORIES };