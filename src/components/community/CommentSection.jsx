import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function CommentSection({ contentId, contentType = "shared_content" }) {
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // For forum replies
  const { data: replies = [] } = useQuery({
    queryKey: ['forumReplies', contentId],
    queryFn: () => base44.entities.ForumReply.filter({ topic_id: contentId }, '-created_date'),
    enabled: contentType === "forum" && !!contentId,
  });

  const createReplyMutation = useMutation({
    mutationFn: (content) => base44.entities.ForumReply.create({
      topic_id: contentId,
      content
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['forumReplies']);
      
      // Update topic reply count
      base44.entities.ForumTopic.filter({ id: contentId }).then(topics => {
        if (topics[0]) {
          base44.entities.ForumTopic.update(contentId, {
            replies_count: (topics[0].replies_count || 0) + 1,
            last_reply_date: new Date().toISOString()
          });
        }
      });
      
      setNewComment("");
      toast.success('Reply posted!');
    },
  });

  const deleteReplyMutation = useMutation({
    mutationFn: (replyId) => base44.entities.ForumReply.delete(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries(['forumReplies']);
      toast.success('Reply deleted');
    },
  });

  const likeReplyMutation = useMutation({
    mutationFn: (replyId) => {
      const reply = replies.find(r => r.id === replyId);
      return base44.entities.ForumReply.update(replyId, {
        likes: (reply?.likes || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['forumReplies']);
      toast.success('Liked!');
    },
  });

  const handleSubmit = () => {
    if (!newComment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    if (!user) {
      toast.error('Please log in to comment');
      return;
    }
    createReplyMutation.mutate(newComment);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <MessageSquare className="w-5 h-5" />
        {contentType === "forum" ? "Replies" : "Comments"} ({replies.length})
      </h3>

      {/* Add Comment */}
      <div className="p-4 rounded-2xl" style={{ background: 'var(--background)' }}>
        <Textarea
          placeholder={contentType === "forum" ? "Write your reply..." : "Add a comment..."}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-3"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />
        <Button
          onClick={handleSubmit}
          disabled={!newComment.trim() || createReplyMutation.isPending}
          className="gradient-accent text-white border-0"
        >
          <Send className="w-4 h-4 mr-2" />
          Post {contentType === "forum" ? "Reply" : "Comment"}
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {replies.map((reply, idx) => (
          <motion.div
            key={reply.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 rounded-2xl"
            style={{ background: 'var(--background)' }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-sm font-bold text-white">
                  {reply.created_by?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {reply.created_by?.split('@')[0]}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {format(new Date(reply.created_date), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
              </div>
              {user?.email === reply.created_by && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteReplyMutation.mutate(reply.id)}
                >
                  <Trash2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </Button>
              )}
            </div>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              {reply.content}
            </p>
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => likeReplyMutation.mutate(reply.id)}
                className="flex items-center gap-1 text-xs"
              >
                👍 {reply.likes || 0}
              </Button>
              {reply.is_solution && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                  ✓ Solution
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {replies.length === 0 && (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No {contentType === "forum" ? "replies" : "comments"} yet. Be the first!</p>
        </div>
      )}
    </div>
  );
}