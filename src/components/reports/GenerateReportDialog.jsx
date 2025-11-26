import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Sparkles } from "lucide-react";

export default function GenerateReportDialog({ open, onClose, onGenerate }) {
  const [config, setConfig] = useState({
    range: '30d',
    sections: ['body', 'nutrition', 'activity', 'goals', 'insights']
  });

  const toggleSection = (section) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.includes(section)
        ? prev.sections.filter(s => s !== section)
        : [...prev.sections, section]
    }));
  };

  const handleGenerate = () => {
    if (config.sections.length === 0) {
      return;
    }
    onGenerate(config);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--text-primary)' }}>
            Generate Advanced Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Time Range */}
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
              Time Period
            </label>
            <Select value={config.range} onValueChange={(value) => setConfig({...config, range: value})}>
              <SelectTrigger style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sections */}
          <div>
            <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-primary)' }}>
              Include Sections
            </label>
            <div className="space-y-3">
              {[
                { id: 'body', label: 'Body Measurements & Progress', icon: '📏' },
                { id: 'nutrition', label: 'Nutrition Logs & Macros', icon: '🍽️' },
                { id: 'activity', label: 'Activity & Wearable Data', icon: '🏃' },
                { id: 'goals', label: 'Goals & Achievements', icon: '🎯' },
                { id: 'insights', label: 'AI-Powered Insights', icon: '🧠' },
                { id: 'food_impact', label: 'Food Impact Analysis', icon: '🔬' }
              ].map(section => (
                <div 
                  key={section.id}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-800/30 transition-colors"
                  onClick={() => toggleSection(section.id)}
                  style={{ background: config.sections.includes(section.id) ? 'var(--background)' : 'transparent' }}
                >
                  <Checkbox 
                    checked={config.sections.includes(section.id)}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <span className="text-xl">{section.icon}</span>
                  <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-primary)' }}>
                    {section.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="flex-1"
              style={{ borderColor: 'var(--border)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={config.sections.length === 0}
              className="flex-1 gradient-accent text-white border-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}