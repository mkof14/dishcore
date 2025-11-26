import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Link2, Mail, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function ShareDialog({ open, onClose, report }) {
  const [privacy, setPrivacy] = useState('anyone');
  const [coachEmail, setCoachEmail] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const shareLink = `https://dishcore.app/shared/report/${Math.random().toString(36).substr(2, 9)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const shareWithCoach = () => {
    if (!coachEmail) {
      toast.error('Please enter coach email');
      return;
    }
    toast.success(`Report shared with ${coachEmail}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl gradient-card border-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            Share Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Share Link */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4" />
              Share Link
            </Label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1"
                style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
              />
              <Button onClick={copyLink} variant="outline" className="relative">
                <AnimatePresence mode="wait">
                  {linkCopied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Copy className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <Label className="mb-3 block">Privacy</Label>
            <Select value={privacy} onValueChange={setPrivacy}>
              <SelectTrigger style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anyone">Anyone with link</SelectItem>
                <SelectItem value="private">Private (coaches only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Share with Coach */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4" />
              Share with Coach/Trainer
            </Label>
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="coach@example.com"
                value={coachEmail}
                onChange={(e) => setCoachEmail(e.target.value)}
                style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
              />
              <Button onClick={shareWithCoach} className="w-full gradient-accent text-white border-0">
                Send Report
              </Button>
            </div>
          </div>

          {/* Social Share Card Preview */}
          <div>
            <Label className="mb-3 block">Share Card Preview</Label>
            <div className="p-6 rounded-3xl gradient-accent text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">My DishCore Progress</h3>
                <div className="grid grid-cols-3 gap-4 my-4">
                  <div>
                    <p className="text-sm opacity-80">Weight</p>
                    <p className="text-xl font-bold">{report?.measurements[0]?.weight?.toFixed(1)} kg</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Waist</p>
                    <p className="text-xl font-bold">{report?.measurements[0]?.waist?.toFixed(0)} cm</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">BMI</p>
                    <p className="text-xl font-bold">{report?.measurements[0]?.bmi?.toFixed(1)}</p>
                  </div>
                </div>
                <p className="text-sm opacity-90">Powered by DishCore - Food Intelligence Platform</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}