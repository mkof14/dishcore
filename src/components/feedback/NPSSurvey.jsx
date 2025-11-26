import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Send } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function NPSSurvey() {
  const [isVisible, setIsVisible] = useState(() => {
    const lastShown = localStorage.getItem('nps-last-shown');
    if (!lastShown) return true;
    const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
    return daysSince > 30;
  });

  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitNPSMutation = useMutation({
    mutationFn: async (data) => {
      // Store NPS data in UserProgress or separate entity
      await base44.integrations.Core.SendEmail({
        to: 'feedback@dishcore.com',
        subject: `NPS Score: ${data.score}`,
        body: `Score: ${data.score}/10\nFeedback: ${data.feedback}`
      });
      return data;
    },
    onSuccess: () => {
      setSubmitted(true);
      localStorage.setItem('nps-last-shown', Date.now().toString());
      setTimeout(() => setIsVisible(false), 3000);
      toast.success('Thank you for your feedback!');
    },
  });

  const handleSubmit = () => {
    if (score === null) {
      toast.error('Please select a score');
      return;
    }
    submitNPSMutation.mutate({ score, feedback });
    setIsVisible(false);
    localStorage.setItem('nps-last-shown', Date.now().toString());
  };

  const handleDismiss = () => {
    localStorage.setItem('nps-last-shown', Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)]"
      >
        <Card className="gradient-card border-0 p-6 rounded-3xl shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {submitted ? '🎉 Thank You!' : '💭 Quick Question'}
            </h3>
            <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!submitted ? (
            <>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                How likely are you to recommend DishCore to a friend?
              </p>

              <div className="grid grid-cols-11 gap-1 mb-4">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setScore(num);
                    }}
                    className={`h-10 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                      score === num
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    style={score !== num ? { color: 'var(--text-primary)', pointerEvents: 'auto' } : { pointerEvents: 'auto' }}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex justify-between text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                <span>Not likely</span>
                <span>Very likely</span>
              </div>

              <Textarea
                placeholder="What's the main reason for your score? (optional)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="mb-4"
              />

              <Button
                onClick={handleSubmit}
                className="w-full gradient-accent text-white border-0"
                disabled={submitNPSMutation.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                {submitNPSMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </>
          ) : (
            <div className="text-center py-4">
              <p style={{ color: 'var(--text-secondary)' }}>
                Your feedback helps us improve DishCore for everyone!
              </p>
            </div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}