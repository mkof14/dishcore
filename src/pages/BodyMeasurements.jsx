import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Heart,
  Scale,
  Ruler,
  Save,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BodySilhouette from "../components/body/BodySilhouette";

export default function BodyMeasurements() {
  const [measurement, setMeasurement] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: '',
    height: '',
    chest: '',
    waist: '',
    hips: '',
    body_fat_percentage: '',
    muscle_mass: '',
    notes: ''
  });
  const [hoveredZone, setHoveredZone] = useState(null);

  const queryClient = useQueryClient();

  const { data: measurements = [] } = useQuery({
    queryKey: ['bodyMeasurements'],
    queryFn: () => base44.entities.BodyMeasurement.list('-date', 50),
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const bmi = data.weight && data.height ? 
        (data.weight / Math.pow(data.height / 100, 2)).toFixed(1) : null;
      const waistHeightRatio = data.waist && data.height ? 
        (data.waist / data.height).toFixed(2) : null;

      return await base44.entities.BodyMeasurement.create({
        ...data,
        weight: parseFloat(data.weight) || 0,
        height: parseFloat(data.height) || 0,
        chest: parseFloat(data.chest) || 0,
        waist: parseFloat(data.waist) || 0,
        hips: parseFloat(data.hips) || 0,
        body_fat_percentage: parseFloat(data.body_fat_percentage) || 0,
        muscle_mass: parseFloat(data.muscle_mass) || 0,
        bmi: parseFloat(bmi) || 0,
        waist_height_ratio: parseFloat(waistHeightRatio) || 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bodyMeasurements']);
      toast.success('Measurements saved successfully!');
      setMeasurement({
        date: format(new Date(), 'yyyy-MM-dd'),
        weight: '',
        height: '',
        chest: '',
        waist: '',
        hips: '',
        body_fat_percentage: '',
        muscle_mass: '',
        notes: ''
      });
    },
  });

  const latest = measurements[0] || {};
  const previous = measurements[1] || {};
  const baseline = measurements[measurements.length - 1] || {};

  const calculateChange = (current, prev) => {
    if (!current || !prev) return null;
    const change = current - prev;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  const weightChange = calculateChange(latest.weight, previous.weight);
  const waistChange = calculateChange(latest.waist, previous.waist);

  const bmi = latest.bmi || 0;
  const bmiCategory = bmi < 18.5 ? 'Underweight' : 
                      bmi < 25 ? 'Normal' : 
                      bmi < 30 ? 'Overweight' : 'Obese';
  const bmiColor = bmi < 18.5 ? 'text-blue-500' : 
                   bmi < 25 ? 'text-green-500' : 
                   bmi < 30 ? 'text-orange-500' : 'text-red-500';

  const waistHeightRatio = latest.waist_height_ratio || 0;
  const whrRisk = waistHeightRatio < 0.5 ? 'Low Risk' : 
                  waistHeightRatio < 0.6 ? 'Moderate Risk' : 'High Risk';
  const whrColor = waistHeightRatio < 0.5 ? 'text-green-500' : 
                   waistHeightRatio < 0.6 ? 'text-orange-500' : 'text-red-500';

  const weightData = measurements.slice(0, 10).reverse().map(m => ({
    date: format(new Date(m.date), 'MMM d'),
    weight: m.weight
  }));

  const waistData = measurements.slice(0, 10).reverse().map(m => ({
    date: format(new Date(m.date), 'MMM d'),
    waist: m.waist
  }));

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Body Measurements & Indicators
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
            Track your body composition and progress over time
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Body Silhouette */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" 
                style={{ color: 'var(--text-primary)' }}>
                <User className="w-5 h-5" />
                Body Map
              </h3>
              <BodySilhouette 
                hoveredZone={hoveredZone}
                measurements={latest}
              />
            </Card>
          </motion.div>

          {/* Center: Measurement Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2" 
                  style={{ color: 'var(--text-primary)' }}>
                  <Calendar className="w-5 h-5" />
                  New Measurement
                </h3>
                {saveMutation.isSuccess && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-500"
                  >
                    <Activity className="w-5 h-5" />
                  </motion.div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={measurement.date}
                    onChange={(e) => setMeasurement({...measurement, date: e.target.value})}
                    style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div onMouseEnter={() => setHoveredZone('weight')} 
                       onMouseLeave={() => setHoveredZone(null)}>
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      value={measurement.weight}
                      onChange={(e) => setMeasurement({...measurement, weight: e.target.value})}
                      placeholder="70"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                    />
                  </div>

                  <div>
                    <Label>Height (cm)</Label>
                    <Input
                      type="number"
                      value={measurement.height}
                      onChange={(e) => setMeasurement({...measurement, height: e.target.value})}
                      placeholder="175"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div onMouseEnter={() => setHoveredZone('chest')} 
                       onMouseLeave={() => setHoveredZone(null)}>
                    <Label>Chest (cm)</Label>
                    <Input
                      type="number"
                      value={measurement.chest}
                      onChange={(e) => setMeasurement({...measurement, chest: e.target.value})}
                      placeholder="95"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                    />
                  </div>

                  <div onMouseEnter={() => setHoveredZone('waist')} 
                       onMouseLeave={() => setHoveredZone(null)}>
                    <Label>Waist (cm)</Label>
                    <Input
                      type="number"
                      value={measurement.waist}
                      onChange={(e) => setMeasurement({...measurement, waist: e.target.value})}
                      placeholder="80"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                    />
                  </div>

                  <div onMouseEnter={() => setHoveredZone('hips')} 
                       onMouseLeave={() => setHoveredZone(null)}>
                    <Label>Hips (cm)</Label>
                    <Input
                      type="number"
                      value={measurement.hips}
                      onChange={(e) => setMeasurement({...measurement, hips: e.target.value})}
                      placeholder="95"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Body Fat (%)</Label>
                    <Input
                      type="number"
                      value={measurement.body_fat_percentage}
                      onChange={(e) => setMeasurement({...measurement, body_fat_percentage: e.target.value})}
                      placeholder="20"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                    />
                  </div>

                  <div>
                    <Label>Muscle Mass (kg)</Label>
                    <Input
                      type="number"
                      value={measurement.muscle_mass}
                      onChange={(e) => setMeasurement({...measurement, muscle_mass: e.target.value})}
                      placeholder="30"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                    />
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={measurement.notes}
                    onChange={(e) => setMeasurement({...measurement, notes: e.target.value})}
                    placeholder="How do you feel today?"
                    style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                  />
                </div>

                <Button
                  onClick={() => saveMutation.mutate(measurement)}
                  disabled={saveMutation.isPending || !measurement.weight}
                  className="w-full gradient-accent text-white border-0"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveMutation.isPending ? 'Saving...' : 'Save Measurement'}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Right: Status & Indicators */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" 
                style={{ color: 'var(--text-primary)' }}>
                <Activity className="w-5 h-5" />
                Current Status
              </h3>

              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 rounded-2xl" 
                  style={{ background: 'var(--background)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>BMI</span>
                    <span className={`font-bold ${bmiColor}`}>{bmiCategory}</span>
                  </div>
                  <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {bmi.toFixed(1)}
                  </div>
                  <Progress value={(bmi / 40) * 100} className="h-2" />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 rounded-2xl" 
                  style={{ background: 'var(--background)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Waist/Height Ratio</span>
                    <span className={`font-bold ${whrColor}`}>{whrRisk}</span>
                  </div>
                  <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {waistHeightRatio.toFixed(2)}
                  </div>
                  <Progress value={waistHeightRatio * 150} className="h-2" />
                </motion.div>

                {weightChange && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl" 
                    style={{ background: 'var(--background)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {weightChange.isPositive ? (
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-green-500" />
                      )}
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Weight Change
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {weightChange.isPositive ? '+' : '-'}{weightChange.value.toFixed(1)} kg since last measurement
                    </p>
                  </motion.div>
                )}
              </div>
            </Card>

            {measurements.length > 1 && (
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" 
                  style={{ color: 'var(--text-primary)' }}>
                  <Sparkles className="w-5 h-5" />
                  AI Insight
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {weightChange && weightChange.isPositive === false ? 
                    `Great progress! You've lost ${weightChange.value.toFixed(1)} kg since your last measurement. Keep up the consistent effort!` :
                    weightChange && weightChange.isPositive ?
                    `You've gained ${weightChange.value.toFixed(1)} kg. This could be muscle growth or water retention. Monitor your trends.` :
                    'Start tracking your measurements to get personalized insights and progress reports.'
                  }
                </p>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Trend Charts */}
        {measurements.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Weight Trend
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#00E38C" 
                    strokeWidth={3}
                    dot={{ fill: '#00E38C', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Waist Trend
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={waistData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="waist" 
                    stroke="#FB923C" 
                    strokeWidth={3}
                    dot={{ fill: '#FB923C', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}