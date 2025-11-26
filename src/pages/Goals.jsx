import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Target, Trash2, Play, Pause, CheckCircle2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";
import GoalCard from "../components/progress/GoalCard";

export default function Goals() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_type: 'nutrition',
    metric: 'protein',
    target_value: 0,
    start_value: 0,
    current_value: 0,
    unit: 'g',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    target_date: '',
    status: 'active'
  });

  const queryClient = useQueryClient();

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['mealLogs'],
    queryFn: () => base44.entities.MealLog.list('-date', 100),
  });

  const createGoalMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      toast.success('Goal created!');
      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        goal_type: 'nutrition',
        metric: 'protein',
        target_value: 0,
        start_value: 0,
        current_value: 0,
        unit: 'g',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        target_date: '',
        status: 'active'
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      toast.success('Goal updated!');
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id) => base44.entities.Goal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      toast.success('Goal deleted');
    },
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.target_date) {
      toast.error('Please fill in all required fields');
      return;
    }
    createGoalMutation.mutate(formData);
  };

  const toggleGoalStatus = (goal) => {
    const newStatus = goal.status === 'active' ? 'paused' : 'active';
    updateGoalMutation.mutate({ id: goal.id, data: { status: newStatus } });
  };

  const completeGoal = (goal) => {
    updateGoalMutation.mutate({ id: goal.id, data: { status: 'completed' } });
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const pausedGoals = goals.filter(g => g.status === 'paused');

  // Calculate period data for GoalCard
  const periodData = [];

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = createPageUrl('Progress')}
              className="w-12 h-12 rounded-2xl btn-secondary flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Goals Management
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                Set and track custom health goals
              </p>
            </div>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="gradient-accent text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </motion.div>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Target className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
              Active Goals ({activeGoals.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGoals.map(goal => (
                <div key={goal.id} className="relative">
                  <GoalCard goal={goal} periodData={periodData} />
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleGoalStatus(goal)}
                      className="flex-1"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeGoal(goal)}
                      className="flex-1"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteGoalMutation.mutate(goal.id)}
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paused Goals */}
        {pausedGoals.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Paused Goals
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pausedGoals.map(goal => (
                <div key={goal.id} className="relative opacity-60">
                  <GoalCard goal={goal} periodData={periodData} />
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleGoalStatus(goal)}
                      className="flex-1"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Resume
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteGoalMutation.mutate(goal.id)}
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Completed Goals
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedGoals.map(goal => (
                <GoalCard key={goal.id} goal={goal} periodData={periodData} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
            <Target className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              No goals yet
            </h3>
            <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
              Create your first goal to start tracking progress
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="gradient-accent text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </Card>
        )}
      </div>

      {/* Create Goal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text-primary)' }}>Create New Goal</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                Goal Title *
              </label>
              <Input
                placeholder="e.g., Increase daily protein"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                Description
              </label>
              <Textarea
                placeholder="Add details about your goal..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2}
                style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Metric
                </label>
                <Select value={formData.metric} onValueChange={(value) => {
                  const units = { protein: 'g', weight: 'kg', steps: 'steps', sleep: 'hours', calories: 'kcal' };
                  setFormData({...formData, metric: value, unit: units[value] || 'units'});
                }}>
                  <SelectTrigger style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="protein">Protein</SelectItem>
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="steps">Steps</SelectItem>
                    <SelectItem value="sleep">Sleep</SelectItem>
                    <SelectItem value="calories">Calories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Unit
                </label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Start Value
                </label>
                <Input
                  type="number"
                  value={formData.start_value}
                  onChange={(e) => setFormData({...formData, start_value: parseFloat(e.target.value)})}
                  style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Target Value *
                </label>
                <Input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => setFormData({...formData, target_value: parseFloat(e.target.value)})}
                  style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                Target Date *
              </label>
              <Input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setDialogOpen(false)}
                variant="outline"
                className="flex-1"
                style={{ borderColor: 'var(--border)' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createGoalMutation.isPending}
                className="flex-1 gradient-accent text-white border-0"
              >
                {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}