import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, MessageSquare, Pin, Lock, Heart } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import CommentSection from "../components/community/CommentSection";
import { motion } from "framer-motion";

export default function ForumTopic() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const topicId = urlParams.get('id');

  const { data: topic, isLoading } = useQuery({
    queryKey: ['forumTopic', topicId],
    queryFn: async () => {
      const topics = await base44.entities.ForumTopic.filter({ id: topicId });
      if (topics[0]) {
        // Increment view count
        await base44.entities.ForumTopic.update(topicId, {
          views: (topics[0].views || 0) + 1
        });
      }
      return topics[0];
    },
    enabled: !!topicId,
  });

  if (isLoading || !topic) {
    return (
      <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="max-w-4xl mx-auto">
          <p style={{ color: 'var(--text-primary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button 
            onClick={() => window.location.href = createPageUrl('CommunityForums')}
            className="w-12 h-12 rounded-2xl btn-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Forum Topic
          </h1>
        </motion.div>

        {/* Topic Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="gradient-card border-0 p-8 rounded-3xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-xl font-bold text-white">
                {topic.created_by?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {topic.is_pinned && <Pin className="w-4 h-4 text-yellow-500" />}
                  {topic.is_locked && <Lock className="w-4 h-4 text-gray-500" />}
                  <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {topic.title}
                  </h2>
                </div>
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <span 
                    className="text-sm hover:underline cursor-pointer" 
                    style={{ color: 'var(--text-secondary)' }}
                    onClick={() => window.location.href = createPageUrl('UserProfile') + '?email=' + topic.created_by}
                  >
                    by {topic.created_by?.split('@')[0]}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {format(new Date(topic.created_date), 'MMMM d, yyyy • h:mm a')}
                  </span>
                  <Badge>{topic.category}</Badge>
                </div>
              </div>
            </div>

            <div className="prose max-w-none mb-6">
              <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {topic.content}
              </p>
            </div>

            {topic.tags && topic.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {topic.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Eye className="w-4 h-4" />
                {topic.views || 0} views
              </span>
              <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <MessageSquare className="w-4 h-4" />
                {topic.replies_count || 0} replies
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Comments/Replies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <CommentSection contentId={topicId} contentType="forum" />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}