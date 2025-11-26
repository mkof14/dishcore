import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Users, Globe, Sparkles } from "lucide-react";

export default function ShareScoreDialog({ open, onClose, score, scoreComponents, period = "week" }) {
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("public");
  const queryClient = useQueryClient();

  const { data: groups = [] } = useQuery({
    queryKey: ['communityGroups'],
    queryFn: () => base44.entities.CommunityGroup.list('-created_date', 50),
  });

  const shareScoreMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.SharedContent.create(data);
      
      // Create activity feed entry
      await base44.entities.ActivityFeed.create({
        user_email: (await base44.auth.me()).email,
        activity_type: 'goal_achieved',
        content: `Shared ${period} DishCore Score: ${score}/100`,
        metadata: { score, period }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sharedContent']);
      queryClient.invalidateQueries(['activityFeed']);
      toast.success('Score shared successfully!');
      onClose();
      setCaption("");
    },
  });

  const handleShare = () => {
    if (!caption.trim()) {
      toast.error('Please add a caption');
      return;
    }

    const content = {
      content_type: 'success_story',
      title: `My ${period === 'week' ? 'Weekly' : 'Monthly'} DishCore Score: ${score}/100`,
      description: caption,
      content_data: {
        score,
        scoreComponents,
        period
      },
      is_public: visibility === "public"
    };

    shareScoreMutation.mutate(content);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--text-primary)' }}>
            Share Your DishCore Score
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Score Preview */}
          <div className="p-6 rounded-2xl text-center" style={{ background: 'var(--background)' }}>
            <div className="text-6xl font-bold gradient-text mb-2">{score}</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {period === 'week' ? 'Weekly' : 'Monthly'} Average
            </p>
          </div>

          {/* Caption */}
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
              Caption
            </label>
            <Textarea
              placeholder="Share your progress and inspire others..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
              Share to
            </label>
            <div className="flex gap-2">
              <Button
                variant={visibility === "public" ? "default" : "outline"}
                onClick={() => setVisibility("public")}
                className={visibility === "public" ? "gradient-accent text-white border-0 flex-1" : "flex-1"}
                style={visibility !== "public" ? { borderColor: 'var(--border)', color: 'var(--text-primary)' } : {}}
              >
                <Globe className="w-4 h-4 mr-2" />
                Community Feed
              </Button>
              <Button
                variant={visibility === "friends" ? "default" : "outline"}
                onClick={() => setVisibility("friends")}
                className={visibility === "friends" ? "gradient-accent text-white border-0 flex-1" : "flex-1"}
                style={visibility !== "friends" ? { borderColor: 'var(--border)', color: 'var(--text-primary)' } : {}}
              >
                <Users className="w-4 h-4 mr-2" />
                Friends Only
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1" 
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={shareScoreMutation.isPending}
              className="flex-1 gradient-accent text-white border-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {shareScoreMutation.isPending ? 'Sharing...' : 'Share'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}