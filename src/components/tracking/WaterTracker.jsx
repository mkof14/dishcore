import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Plus, Minus } from "lucide-react";

export default function WaterTracker({ date }) {
  const [glasses, setGlasses] = useState(() => {
    const stored = localStorage.getItem(`water-${date}`);
    return stored ? parseInt(stored) : 0;
  });

  const updateGlasses = (change) => {
    const newValue = Math.max(0, Math.min(12, glasses + change));
    setGlasses(newValue);
    localStorage.setItem(`water-${date}`, newValue.toString());
  };

  const targetGlasses = 8;
  const percentage = Math.min((glasses / targetGlasses) * 100, 100);

  return (
    <Card className="gradient-card border-0 p-5 rounded-3xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
          <Droplet className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Water</p>
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {glasses}/{targetGlasses}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateGlasses(-1)}
          disabled={glasses === 0}
          style={{ borderColor: 'var(--border)' }}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateGlasses(1)}
          disabled={glasses >= 12}
          style={{ borderColor: 'var(--border)' }}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
        {percentage >= 100 ? '🎉 Goal reached!' : `${Math.round(percentage)}% of daily goal`}
      </p>
    </Card>
  );
}