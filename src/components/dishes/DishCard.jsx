import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Clock, Star, Pencil, Trash2 } from "lucide-react";

export default function DishCard({ dish, onView, onEdit, onDelete, compact }) {
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
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        {dish.image_url ? (
          <img
            src={dish.image_url}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))' }}
          >
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        
        {/* Rating badge */}
        {dish.avgRating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}>
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            {dish.avgRating.toFixed(1)}
          </div>
        )}

        {/* Meal type badge */}
        {dish.meal_type && (
          <div className="absolute top-2 left-2">
            <Badge className="text-xs text-white border-0" 
              style={{ background: 'rgba(0,0,0,0.7)' }}>
              {dish.meal_type}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Title */}
        <h3 className="font-bold text-base mb-2 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
          {dish.name}
        </h3>

        {/* Quick stats row */}
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

        {/* Macros */}
        {!compact && (
          <div className="flex gap-3 text-xs mb-3">
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
        )}

        {/* Action icons */}
        {(onEdit || onDelete) && (
          <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            {onEdit && (
              <span
                onClick={(e) => { e.stopPropagation(); onEdit(dish); }}
                className="p-2 rounded-lg cursor-pointer hover:opacity-70 transition-opacity"
              >
                <Pencil className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </span>
            )}
            {onDelete && (
              <span
                onClick={(e) => { e.stopPropagation(); onDelete(dish); }}
                className="p-2 rounded-lg cursor-pointer hover:opacity-70 transition-opacity"
              >
                <Trash2 className="w-4 h-4" style={{ color: '#EF4444' }} />
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}