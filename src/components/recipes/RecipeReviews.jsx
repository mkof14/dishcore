import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function RecipeReviews({ dishId, dishName }) {
  const [newReview, setNewReview] = useState({ rating: 5, text: '' });
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: reviews = [] } = useQuery({
    queryKey: ['dishReviews', dishId],
    queryFn: () => base44.entities.DishReview.filter({ dish_id: dishId }),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const createReviewMutation = useMutation({
    mutationFn: (reviewData) => base44.entities.DishReview.create(reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries(['dishReviews', dishId]);
      setNewReview({ rating: 5, text: '' });
      setShowForm(false);
      toast.success('Review posted!');
    },
  });

  const updateHelpfulMutation = useMutation({
    mutationFn: ({ reviewId, count }) => 
      base44.entities.DishReview.update(reviewId, { helpful_count: count }),
    onSuccess: () => {
      queryClient.invalidateQueries(['dishReviews', dishId]);
    },
  });

  const handleSubmit = () => {
    if (!newReview.text.trim()) {
      toast.error('Please write a review');
      return;
    }

    createReviewMutation.mutate({
      dish_id: dishId,
      rating: newReview.rating,
      review_text: newReview.text,
    });
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const userHasReviewed = reviews.some(r => r.created_by === currentUser?.email);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className="p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {avgRating}
              </div>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {dishName}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
          {!userHasReviewed && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowForm(!showForm)}
            >
              Write Review
            </Button>
          )}
        </div>
      </Card>

      {/* Review Form */}
      {showForm && (
        <Card className="p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setNewReview({ ...newReview, rating })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${rating <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                Your Review
              </label>
              <Textarea
                value={newReview.text}
                onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                placeholder="Share your experience with this recipe..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createReviewMutation.isPending}
                className="gradient-accent text-white border-0"
              >
                Post Review
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.map(review => (
          <Card key={review.id} className="p-4 rounded-2xl" 
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {review.created_by?.split('@')[0] || 'Anonymous'}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {format(new Date(review.created_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              {review.review_text}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => updateHelpfulMutation.mutate({ 
                reviewId: review.id, 
                count: (review.helpful_count || 0) + 1 
              })}
            >
              <ThumbsUp className="w-3 h-3 mr-1" />
              Helpful ({review.helpful_count || 0})
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}