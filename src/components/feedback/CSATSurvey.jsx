import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Smile, Meh, Frown } from 'lucide-react';
import { toast } from 'sonner';

export default function CSATSurvey({ ticketId, onComplete }) {
  const [rating, setRating] = useState(null);
  const [feedback, setFeedback] = useState('');
  const queryClient = useQueryClient();

  const submitCSATMutation = useMutation({
    mutationFn: async (data) => {
      // Update ticket with CSAT rating
      await base44.entities.SupportTicket.update(ticketId, {
        csat_rating: data.rating,
        csat_feedback: data.feedback
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['support-ticket', ticketId]);
      toast.success('Thank you for your feedback!');
      onComplete?.();
    },
  });

  const ratings = [
    { value: 'satisfied', icon: Smile, label: 'Satisfied', color: 'text-green-500' },
    { value: 'neutral', icon: Meh, label: 'Neutral', color: 'text-yellow-500' },
    { value: 'unsatisfied', icon: Frown, label: 'Unsatisfied', color: 'text-red-500' }
  ];

  return (
    <Card className="gradient-card border-0 p-6 rounded-3xl">
      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        How satisfied are you with the support?
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        Your feedback helps us improve our service
      </p>

      <div className="flex gap-4 mb-6 justify-center">
        {ratings.map(({ value, icon: Icon, label, color }) => (
          <button
            key={value}
            onClick={() => setRating(value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
              rating === value
                ? 'bg-blue-500/20 border-2 border-blue-500'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Icon className={`w-12 h-12 ${rating === value ? color : 'text-gray-400'}`} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {label}
            </span>
          </button>
        ))}
      </div>

      <Textarea
        placeholder="Tell us more about your experience..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={3}
        className="mb-4"
      />

      <Button
        onClick={() => submitCSATMutation.mutate({ rating, feedback })}
        disabled={!rating || submitCSATMutation.isPending}
        className="w-full gradient-accent text-white border-0"
      >
        Submit Feedback
      </Button>
    </Card>
  );
}