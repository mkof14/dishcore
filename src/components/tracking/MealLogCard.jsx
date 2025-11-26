import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Flame } from "lucide-react";

export default function MealLogCard({ log, onEdit, onDelete }) {
  return (
    <div className="p-4 rounded-2xl flex items-center justify-between"
      style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 flex-1">
        {log.image_url && (
          <img
            src={log.image_url}
            alt={log.dish_name}
            className="w-12 h-12 rounded-xl object-cover"
          />
        )}
        <div className="flex-1">
          <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {log.dish_name}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Flame className="w-3 h-3" />
            <span>{Math.round(log.calories)} kcal</span>
            {log.portion_size && log.portion_size !== 1 && (
              <span>• {log.portion_size}x portion</span>
            )}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            P: {Math.round(log.protein)}g • C: {Math.round(log.carbs)}g • F: {Math.round(log.fat)}g
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onEdit(log)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}