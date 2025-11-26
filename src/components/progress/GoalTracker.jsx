import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function GoalTracker({ goals = [], onAddGoal, onUpdateGoal, onDeleteGoal }) {
  const [newGoal, setNewGoal] = useState({
    title: '',
    type: 'weight',
    target: '',
    current: '',
    unit: 'kg',
    deadline: ''
  });

  const handleSubmit = () => {
    onAddGoal(newGoal);
    setNewGoal({ title: '', type: 'weight', target: '', current: '', unit: 'kg', deadline: '' });
  };

  const getProgress = (goal) => {
    const current = parseFloat(goal.current) || 0;
    const target = parseFloat(goal.target) || 1;
    const start = parseFloat(goal.start_value) || current;
    
    if (goal.type === 'weight' && target < start) {
      return Math.min(((start - current) / (start - target)) * 100, 100);
    }
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (progress) => {
    if (progress >= 100) return 'text-green-500';
    if (progress >= 75) return 'text-blue-500';
    if (progress >= 50) return 'text-yellow-500';
    return 'text-orange-500';
  };

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Active Goals
        </h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-accent text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Goal title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
              <Select value={newGoal.type} onValueChange={(type) => setNewGoal({ ...newGoal, type })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">Weight Loss</SelectItem>
                  <SelectItem value="protein">Protein Intake</SelectItem>
                  <SelectItem value="water">Water Intake</SelectItem>
                  <SelectItem value="activity">Activity Minutes</SelectItem>
                  <SelectItem value="calories">Calorie Target</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Current"
                  value={newGoal.current}
                  onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Target"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                />
              </div>
              <Input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              />
              <Button onClick={handleSubmit} className="w-full gradient-accent text-white border-0">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)' }}>No active goals. Create one to get started!</p>
          </div>
        ) : (
          goals.map((goal, index) => {
            const progress = getProgress(goal);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl"
                style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {goal.title}
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {goal.current}{goal.unit} / {goal.target}{goal.unit}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {progress >= 100 && <Check className="w-5 h-5 text-green-500" />}
                    <span className={`text-lg font-bold ${getStatusColor(progress)}`}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <Progress value={progress} className="h-3 mb-2" />
                {goal.deadline && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </p>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </Card>
  );
}