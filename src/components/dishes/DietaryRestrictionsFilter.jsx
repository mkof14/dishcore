import React from 'react';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const DIETARY_RESTRICTIONS = [
  { id: 'gluten_free', label: 'Gluten-Free', color: 'bg-amber-500' },
  { id: 'dairy_free', label: 'Dairy-Free', color: 'bg-blue-500' },
  { id: 'nut_free', label: 'Nut-Free', color: 'bg-red-500' },
  { id: 'soy_free', label: 'Soy-Free', color: 'bg-green-500' },
  { id: 'egg_free', label: 'Egg-Free', color: 'bg-yellow-500' },
  { id: 'vegan', label: 'Vegan', color: 'bg-emerald-500' },
  { id: 'vegetarian', label: 'Vegetarian', color: 'bg-lime-500' },
  { id: 'pescatarian', label: 'Pescatarian', color: 'bg-cyan-500' },
  { id: 'low_fodmap', label: 'Low-FODMAP', color: 'bg-purple-500' },
  { id: 'halal', label: 'Halal', color: 'bg-indigo-500' },
  { id: 'kosher', label: 'Kosher', color: 'bg-violet-500' }
];

export default function DietaryRestrictionsFilter({ selectedRestrictions, onRestrictionsChange }) {
  const toggleRestriction = (restrictionId) => {
    const newRestrictions = selectedRestrictions.includes(restrictionId)
      ? selectedRestrictions.filter(r => r !== restrictionId)
      : [...selectedRestrictions, restrictionId];
    onRestrictionsChange(newRestrictions);
  };

  return (
    <div className="space-y-3">
      <Label style={{ color: 'var(--text-secondary)' }}>Dietary Restrictions</Label>
      <div className="flex flex-wrap gap-2">
        {DIETARY_RESTRICTIONS.map(restriction => {
          const isSelected = selectedRestrictions.includes(restriction.id);
          return (
            <Badge
              key={restriction.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? `${restriction.color} text-white` 
                  : 'bg-transparent border'
              }`}
              style={!isSelected ? { borderColor: 'var(--border)', color: 'var(--text-secondary)' } : {}}
              onClick={() => toggleRestriction(restriction.id)}
            >
              {restriction.label}
              {isSelected && <X className="w-3 h-3 ml-1" />}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}