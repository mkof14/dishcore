import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Link2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ShareRecipeDialog({ open, onClose, dish }) {
  const [description, setDescription] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  const shareToComm = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.SharedContent.create(data);
    },
    onSuccess: (result) => {
      const url = `${window.location.origin}/community/${result.id}`;
      setShareUrl(url);
      toast.success('Recipe shared to community!');
    },
  });

  const handleShare = () => {
    shareToComm.mutate({
      content_type: 'recipe',
      title: dish.name,
      description: description || dish.description,
      content_data: dish,
      image_url: dish.image_url,
      is_public: true
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied!');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--text-primary)' }}>
            Share Recipe
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {!shareUrl ? (
            <>
              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Add a message (optional)</Label>
                <Textarea
                  placeholder="Share why you love this recipe..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-2"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <Button
                onClick={handleShare}
                disabled={shareToComm.isPending}
                className="w-full gradient-accent text-white border-0"
              >
                {shareToComm.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4 mr-2" />
                )}
                Share to Community
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl text-center" style={{ background: 'var(--background)' }}>
                <Check className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Recipe Shared!
                </p>
              </div>

              <div>
                <Label style={{ color: 'var(--text-secondary)' }}>Shareable Link</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                  <Button onClick={handleCopyLink} className="gradient-accent text-white border-0">
                    <Link2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}