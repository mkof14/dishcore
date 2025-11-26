import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Search, TrendingUp, Pin, Lock, Eye, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";

const CATEGORIES = [
  { value: "all", label: "All Topics", icon: "💬" },
  { value: "nutrition", label: "Nutrition", icon: "🥗" },
  { value: "recipes", label: "Recipes", icon: "🍳" },
  { value: "workouts", label: "Workouts", icon: "💪" },
  { value: "weight_loss", label: "Weight Loss", icon: "📉" },
  { value: "meal_prep", label: "Meal Prep", icon: "🥡" },
  { value: "motivation", label: "Motivation", icon: "🔥" },
  { value: "general", label: "General", icon: "🌟" }
];

export default function CommunityForums() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewTopicDialog, setShowNewTopicDialog] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: "",
    content: "",
    category: "general",
    tags: []
  });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['forumTopics'],
    queryFn: () => base44.entities.ForumTopic.list('-created_date', 100),
  });

  const createTopicMutation = useMutation({
    mutationFn: (topicData) => base44.entities.ForumTopic.create(topicData),
    onSuccess: () => {
      queryClient.invalidateQueries(['forumTopics']);
      setShowNewTopicDialog(false);
      setNewTopic({ title: "", content: "", category: "general", tags: [] });
      toast.success('Topic created successfully!');
    },
  });

  const filteredTopics = topics.filter(topic => {
    const matchesCategory = selectedCategory === "all" || topic.category === selectedCategory;
    const matchesSearch = topic.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateTopic = () => {
    if (!newTopic.title || !newTopic.content) {
      toast.error('Please fill in all fields');
      return;
    }
    createTopicMutation.mutate(newTopic);
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = createPageUrl('Community')}
              className="w-12 h-12 rounded-2xl btn-secondary flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Community Forums
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                {filteredTopics.length} active discussions
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowNewTopicDialog(true)}
            className="gradient-accent text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Topic
          </Button>
        </div>

        {/* Categories & Search */}
        <Card className="gradient-card border-0 p-4 rounded-3xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: 'var(--text-muted)' }} />
              <Input
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <Button
                  key={cat.value}
                  size="sm"
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={selectedCategory === cat.value ? 'gradient-accent text-white border-0' : 'btn-secondary'}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Topics List */}
        <div className="space-y-3">
          {filteredTopics.map(topic => (
            <Card key={topic.id} className="gradient-card border-0 p-5 rounded-2xl hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => window.location.href = createPageUrl('ForumTopic') + '?id=' + topic.id}>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {topic.is_pinned && <Pin className="w-4 h-4 text-yellow-500" />}
                        {topic.is_locked && <Lock className="w-4 h-4 text-gray-500" />}
                        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                          {topic.title}
                        </h3>
                      </div>
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {topic.content}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {CATEGORIES.find(c => c.value === topic.category)?.icon} {topic.category}
                    </Badge>
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Eye className="w-3 h-3" />
                      {topic.views || 0} views
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <MessageSquare className="w-3 h-3" />
                      {topic.replies_count || 0} replies
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      by {topic.created_by} • {format(new Date(topic.created_date), 'MMM d')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredTopics.length === 0 && (
            <Card className="gradient-card border-0 p-12 rounded-3xl text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                No topics found
              </h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Be the first to start a discussion!
              </p>
            </Card>
          )}
        </div>

        {/* New Topic Dialog */}
        <Dialog open={showNewTopicDialog} onOpenChange={setShowNewTopicDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Topic</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="What's your topic about?"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={newTopic.category} onValueChange={(val) => setNewTopic({...newTopic, category: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Content</label>
                <Textarea
                  placeholder="Share your thoughts, ask questions, or start a discussion..."
                  value={newTopic.content}
                  onChange={(e) => setNewTopic({...newTopic, content: e.target.value})}
                  className="h-40"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowNewTopicDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTopic} className="gradient-accent text-white border-0">
                  Create Topic
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}