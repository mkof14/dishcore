import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Check, Trash2, ChevronDown, ChevronUp, Flame, Repeat, Share2, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import MealSwapDialog from "./MealSwapDialog";
import ShareMealPlanDialog from "../sharing/ShareMealPlanDialog";
import WeeklyNutritionTracker from "./WeeklyNutritionTracker";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function MealPlanCard({ plan, onActivate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const handleSwapClick = (meal, date) => {
    setSelectedMeal(meal);
    setSelectedDate(date);
    setSwapDialogOpen(true);
  };

  return (
    <>
      <Card className="gradient-card border-0 rounded-3xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {plan.name}
                </h3>
                {plan.is_active && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium gradient-accent text-white">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                {format(new Date(plan.start_date), 'MMM d')} - {format(new Date(plan.end_date), 'MMM d, yyyy')}
              </p>
              {plan.rationale && (
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  {plan.rationale}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Link to={`${createPageUrl('GroceryList')}?plan=${plan.id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Generate List
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShareDialogOpen(true)}
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              {!plan.is_active && (
                <Button
                  size="sm"
                  onClick={onActivate}
                  className="gradient-accent text-white border-0"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Activate
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={onDelete}
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              style={{ color: 'var(--text-secondary)' }}
            >
              {expanded ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
              {expanded ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>

          {expanded && plan.days && (
            <>
              <WeeklyNutritionTracker plan={plan} profile={profile} />
              
              <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              {plan.days.map((day, index) => (
                <div key={index} className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {format(new Date(day.date), 'EEEE, MMM d')}
                    </h4>
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <Flame className="w-4 h-4" />
                      {day.total_calories || 0} kcal
                    </div>
                  </div>

                  <div className="space-y-2">
                    {day.meals?.map((meal, mealIndex) => (
                      <div key={mealIndex} className="flex items-center justify-between p-3 rounded-xl group"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {meal.dish_name}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {meal.meal_type}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {meal.calories} kcal • P: {meal.protein}g
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleSwapClick(meal, day.date)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--accent-from)' }}
                          >
                            <Repeat className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              </div>
            </>
          )}
        </div>
      </Card>

      {selectedMeal && (
        <MealSwapDialog
          open={swapDialogOpen}
          onClose={() => {
            setSwapDialogOpen(false);
            setSelectedMeal(null);
            setSelectedDate(null);
          }}
          meal={selectedMeal}
          date={selectedDate}
          planId={plan.id}
        />
      )}

      <ShareMealPlanDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        plan={plan}
      />
    </>
  );
}