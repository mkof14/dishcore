import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Calendar, 
  TrendingDown, 
  TrendingUp,
  Edit,
  Save,
  RotateCcw,
  Sparkles,
  Award
} from "lucide-react";
import { format, differenceInDays, differenceInWeeks } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import BodyComparison from "../components/body/BodyComparison";

export default function BodyGoals() {
  const [isEditing, setIsEditing] = useState(false);
  const [goalData, setGoalData] = useState({
    main_goal: 'weight_loss',
    target_weight: '',
    target_waist: '',
    target_hips: '',
    target_chest: '',
    target_body_fat: '',
    target_date: '',
    description: ''
  });

  const queryClient = useQueryClient();

  const { data: goals = [] } = useQuery({
    queryKey: ['bodyGoals'],
    queryFn: () => base44.entities.BodyGoal.list('-created_date'),
  });

  const { data: measurements = [] } = useQuery({
    queryKey: ['bodyMeasurements'],
    queryFn: () => base44.entities.BodyMeasurement.list('-date', 50),
  });

  const activeGoal = goals.find(g => g.is_active) || goals[0];
  const currentMeasurement = measurements[0] || {};
  const baselineMeasurement = measurements[measurements.length - 1] || {};

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        start_date: format(new Date(), 'yyyy-MM-dd'),
        start_weight: currentMeasurement.weight || 0,
        start_waist: currentMeasurement.waist || 0,
        is_active: true
      };

      // Deactivate all existing goals
      await Promise.all(goals.map(g => 
        base44.entities.BodyGoal.update(g.id, { is_active: false })
      ));

      return await base44.entities.BodyGoal.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bodyGoals']);
      setIsEditing(false);
      toast.success('Body goals updated!');
    },
  });

  const calculateProgress = () => {
    if (!activeGoal || !currentMeasurement.weight) return null;

    const startWeight = activeGoal.start_weight || baselineMeasurement.weight || currentMeasurement.weight;
    const currentWeight = currentMeasurement.weight;
    const targetWeight = activeGoal.target_weight;

    const totalChange = targetWeight - startWeight;
    const currentChange = currentWeight - startWeight;
    const progressPercent = totalChange !== 0 ? (currentChange / totalChange) * 100 : 0;

    const startWaist = activeGoal.start_waist || baselineMeasurement.waist || currentMeasurement.waist;
    const currentWaist = currentMeasurement.waist || 0;
    const targetWaist = activeGoal.target_waist || 0;

    const waistTotalChange = targetWaist - startWaist;
    const waistCurrentChange = currentWaist - startWaist;
    const waistProgressPercent = waistTotalChange !== 0 ? (waistCurrentChange / waistTotalChange) * 100 : 0;

    const startDate = new Date(activeGoal.start_date);
    const targetDate = new Date(activeGoal.target_date);
    const today = new Date();

    const totalDays = differenceInDays(targetDate, startDate);
    const daysPassed = differenceInDays(today, startDate);
    const daysRemaining = differenceInDays(targetDate, today);
    const timeProgressPercent = totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;

    const weightRemaining = targetWeight - currentWeight;
    const waistRemaining = targetWaist - currentWaist;

    const isOnTrack = progressPercent >= timeProgressPercent - 10;
    const status = progressPercent >= timeProgressPercent + 10 ? 'ahead' :
                   isOnTrack ? 'on_track' :
                   progressPercent >= timeProgressPercent - 20 ? 'slightly_behind' : 'behind';

    return {
      weight: {
        start: startWeight,
        current: currentWeight,
        target: targetWeight,
        change: currentChange,
        remaining: weightRemaining,
        progress: Math.max(0, Math.min(100, progressPercent))
      },
      waist: {
        start: startWaist,
        current: currentWaist,
        target: targetWaist,
        change: waistCurrentChange,
        remaining: waistRemaining,
        progress: Math.max(0, Math.min(100, waistProgressPercent))
      },
      time: {
        totalWeeks: Math.ceil(totalDays / 7),
        weeksPassed: differenceInWeeks(today, startDate),
        weeksRemaining: Math.ceil(daysRemaining / 7),
        progress: Math.max(0, Math.min(100, timeProgressPercent))
      },
      overall: Math.round((progressPercent + waistProgressPercent) / 2),
      status,
      isOnTrack
    };
  };

  const progress = calculateProgress();

  const statusConfig = {
    ahead: { text: 'Ahead of Plan', color: 'text-green-500', icon: TrendingUp },
    on_track: { text: 'On Track', color: 'text-green-500', icon: Target },
    slightly_behind: { text: 'Slightly Behind', color: 'text-orange-500', icon: TrendingDown },
    behind: { text: 'Far Behind', color: 'text-red-500', icon: TrendingDown }
  };

  const goalLabels = {
    weight_loss: 'Weight Loss',
    muscle_gain: 'Muscle Gain',
    get_fit: 'Get Fit',
    maintain: 'Maintain Weight',
    improve_proportions: 'Improve Proportions'
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Body Goals & Ideal Shape
            </h1>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
              Track your progress towards your body transformation goals
            </p>
          </div>
          {activeGoal && !isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Goals
            </Button>
          )}
        </div>

        {!activeGoal || isEditing ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                {activeGoal ? 'Update Your Goals' : 'Set Your Body Goals'}
              </h3>

              <div className="space-y-6">
                <div>
                  <Label>Main Goal</Label>
                  <Select 
                    value={goalData.main_goal}
                    onValueChange={(val) => setGoalData({...goalData, main_goal: val})}
                  >
                    <SelectTrigger className="mt-2" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(goalLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Goal Description</Label>
                  <Textarea
                    value={goalData.description}
                    onChange={(e) => setGoalData({...goalData, description: e.target.value})}
                    placeholder="Describe your goal in your own words..."
                    className="mt-2"
                    style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Target Weight (kg)</Label>
                    <Input
                      type="number"
                      value={goalData.target_weight}
                      onChange={(e) => setGoalData({...goalData, target_weight: e.target.value})}
                      placeholder="75"
                      className="mt-2"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                    />
                  </div>
                  <div>
                    <Label>Target Waist (cm)</Label>
                    <Input
                      type="number"
                      value={goalData.target_waist}
                      onChange={(e) => setGoalData({...goalData, target_waist: e.target.value})}
                      placeholder="80"
                      className="mt-2"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                    />
                  </div>
                  <div>
                    <Label>Target Date</Label>
                    <Input
                      type="date"
                      value={goalData.target_date}
                      onChange={(e) => setGoalData({...goalData, target_date: e.target.value})}
                      className="mt-2"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Target Hips (cm) <span className="text-xs text-muted">(optional)</span></Label>
                    <Input
                      type="number"
                      value={goalData.target_hips}
                      onChange={(e) => setGoalData({...goalData, target_hips: e.target.value})}
                      placeholder="95"
                      className="mt-2"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                    />
                  </div>
                  <div>
                    <Label>Target Body Fat % <span className="text-xs text-muted">(optional)</span></Label>
                    <Input
                      type="number"
                      value={goalData.target_body_fat}
                      onChange={(e) => setGoalData({...goalData, target_body_fat: e.target.value})}
                      placeholder="15"
                      className="mt-2"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  {activeGoal && (
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={() => saveMutation.mutate(goalData)}
                    disabled={!goalData.target_weight || !goalData.target_date}
                    className="gradient-accent text-white border-0"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Goals
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Goal Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="gradient-card border-0 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Main Goal</p>
                      <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                        {goalLabels[activeGoal.main_goal]}
                      </h3>
                    </div>
                  </div>
                  {activeGoal.description && (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {activeGoal.description}
                    </p>
                  )}
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="gradient-card border-0 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Timeline</p>
                      <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                        {progress?.time.weeksRemaining} weeks left
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span>Started: {format(new Date(activeGoal.start_date), 'MMM d')}</span>
                    <span>Target: {format(new Date(activeGoal.target_date), 'MMM d')}</span>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="gradient-card border-0 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${
                      progress?.status === 'ahead' || progress?.status === 'on_track' ? 
                      'from-green-400 to-green-600' : 'from-orange-400 to-orange-600'
                    } flex items-center justify-center`}>
                      {React.createElement(statusConfig[progress?.status]?.icon || Target, { className: "w-6 h-6 text-white" })}
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Status</p>
                      <h3 className={`font-bold text-lg ${statusConfig[progress?.status]?.color}`}>
                        {statusConfig[progress?.status]?.text}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--background)' }}>
                      <motion.div
                        className="h-full rounded-full gradient-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress?.overall || 0}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {progress?.overall || 0}%
                    </span>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Progress Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                  Weight Progress
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Start</p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {progress?.weight.start?.toFixed(1)} kg
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Current</p>
                      <p className="text-2xl font-bold text-blue-500">
                        {progress?.weight.current?.toFixed(1)} kg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Goal</p>
                      <p className="text-2xl font-bold text-green-500">
                        {progress?.weight.target?.toFixed(1)} kg
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Progress</span>
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {Math.abs(progress?.weight.change || 0).toFixed(1)} kg / {Math.abs(progress?.weight.remaining || 0).toFixed(1)} kg left
                      </span>
                    </div>
                    <div className="h-4 rounded-full overflow-hidden" style={{ background: 'var(--background)' }}>
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress?.weight.progress || 0}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                  Waist Progress
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Start</p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {progress?.waist.start?.toFixed(0)} cm
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Current</p>
                      <p className="text-2xl font-bold text-orange-500">
                        {progress?.waist.current?.toFixed(0)} cm
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Goal</p>
                      <p className="text-2xl font-bold text-green-500">
                        {progress?.waist.target?.toFixed(0)} cm
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Progress</span>
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {Math.abs(progress?.waist.change || 0).toFixed(0)} cm / {Math.abs(progress?.waist.remaining || 0).toFixed(0)} cm left
                      </span>
                    </div>
                    <div className="h-4 rounded-full overflow-hidden" style={{ background: 'var(--background)' }}>
                      <motion.div
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress?.waist.progress || 0}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Body Comparison */}
            <BodyComparison
              current={currentMeasurement}
              target={{
                weight: activeGoal.target_weight,
                waist: activeGoal.target_waist,
                hips: activeGoal.target_hips,
                chest: activeGoal.target_chest
              }}
            />

            {/* AI Insight */}
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  AI Progress Insight
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {progress?.status === 'ahead' || progress?.status === 'on_track' ? 
                  `Excellent progress! You've completed ${progress.overall}% of your body goals. You've lost ${Math.abs(progress.weight.change).toFixed(1)} kg and reduced your waist by ${Math.abs(progress.waist.change).toFixed(0)} cm. Keep up this consistent effort and you'll reach your target on time!` :
                  progress?.status === 'slightly_behind' ?
                  `You're making good progress at ${progress.overall}%, though slightly behind schedule. You've made ${Math.abs(progress.weight.change).toFixed(1)} kg of progress. Consider reviewing your nutrition plan and increasing activity slightly to get back on track.` :
                  `You've completed ${progress.overall}% of your goals. You're behind schedule, but don't get discouraged - sustainable change takes time. Focus on consistency rather than perfection, and consider adjusting your target date to make it more achievable.`
                }
              </p>
            </Card>
          </>
        )}
      </motion.div>
    </div>
  );
}