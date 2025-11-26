import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Eye, Flag, TrendingUp, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { hasPermission, PERMISSIONS } from '../components/admin/permissions';
import { AccessDenied } from '../components/admin/PermissionGate';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ContentModeration() {
  const queryClient = useQueryClient();
  const [selectedContent, setSelectedContent] = useState(null);
  const [moderationNotes, setModerationNotes] = useState('');

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: pendingContent = [] } = useQuery({
    queryKey: ['pending-content'],
    queryFn: () => base44.entities.ContentSubmission.filter({ status: 'pending' }, '-created_date'),
  });

  const { data: flaggedContent = [] } = useQuery({
    queryKey: ['flagged-content'],
    queryFn: async () => {
      const all = await base44.entities.ContentSubmission.list('-created_date', 100);
      return all.filter(c => c.flags && c.flags.length > 0);
    },
  });

  const { data: sharedContent = [] } = useQuery({
    queryKey: ['shared-content-mod'],
    queryFn: () => base44.entities.SharedContent.filter({ is_public: true }, '-created_date', 50),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, status, notes }) => 
      base44.entities.ContentSubmission.update(id, {
        status,
        moderation_notes: notes,
        moderated_by: currentUser.email,
        moderated_at: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-content']);
      queryClient.invalidateQueries(['flagged-content']);
      toast.success('Content moderated successfully');
      setSelectedContent(null);
      setModerationNotes('');
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: (id) => base44.entities.SharedContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['shared-content-mod']);
      toast.success('Content deleted');
    },
  });

  if (!currentUser || !hasPermission(currentUser, PERMISSIONS.MODERATE_CONTENT)) {
    return <AccessDenied />;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Content Moderation
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Review and moderate user-submitted content
            </p>
          </div>
          <Link to={createPageUrl('Admin')}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Pending Review</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {pendingContent.length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Flagged Content</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {flaggedContent.length}
                </p>
              </div>
              <Flag className="w-8 h-8 text-red-500" />
            </div>
          </Card>
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Public</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {sharedContent.length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingContent.length})</TabsTrigger>
            <TabsTrigger value="flagged">Flagged ({flaggedContent.length})</TabsTrigger>
            <TabsTrigger value="published">Published ({sharedContent.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <div className="space-y-3">
                {pendingContent.map((content) => (
                  <div
                    key={content.id}
                    className="p-4 rounded-2xl"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {content.title}
                          </h4>
                          <Badge className={getStatusColor(content.status)}>
                            {content.content_type}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                          Submitted by: {content.submitter_email || content.created_by}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(content.created_date).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedContent(content)}
                          variant="outline"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        {hasPermission(currentUser, PERMISSIONS.APPROVE_CONTENT) && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white border-0"
                              onClick={() => moderateMutation.mutate({ id: content.id, status: 'approved', notes: '' })}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 text-white border-0"
                              onClick={() => moderateMutation.mutate({ id: content.id, status: 'rejected', notes: '' })}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {pendingContent.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p style={{ color: 'var(--text-muted)' }}>No pending content to review</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="flagged">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <div className="space-y-3">
                {flaggedContent.map((content) => (
                  <div
                    key={content.id}
                    className="p-4 rounded-2xl border-red-500/20"
                    style={{ background: 'var(--background)', border: '2px solid' }}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Flag className="w-5 h-5 text-red-500" />
                          <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {content.title}
                          </h4>
                          <Badge className="bg-red-500/20 text-red-400">
                            {content.flags.length} flag{content.flags.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                          Reasons: {content.flags.map(f => f.reason).join(', ')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setSelectedContent(content)} variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        {hasPermission(currentUser, PERMISSIONS.DELETE_CONTENT) && (
                          <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white border-0"
                            onClick={() => moderateMutation.mutate({ id: content.id, status: 'rejected', notes: 'Flagged content removed' })}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="published">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <div className="space-y-3">
                {sharedContent.map((content) => (
                  <div
                    key={content.id}
                    className="p-4 rounded-2xl"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                          {content.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                          <span>Views: {content.views}</span>
                          <span>Likes: {content.likes}</span>
                          <span>By: {content.created_by}</span>
                        </div>
                      </div>
                      {hasPermission(currentUser, PERMISSIONS.DELETE_CONTENT) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500"
                          onClick={() => deleteContentMutation.mutate(content.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Content</DialogTitle>
            </DialogHeader>
            {selectedContent && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">{selectedContent.title}</h4>
                  <Badge className={getStatusColor(selectedContent.status)}>
                    {selectedContent.content_type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                    Content Preview:
                  </p>
                  <pre className="p-4 rounded-xl bg-gray-900 text-white text-xs overflow-auto max-h-60">
                    {JSON.stringify(selectedContent.content_data, null, 2)}
                  </pre>
                </div>
                <Textarea
                  placeholder="Moderation notes (optional)"
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white border-0"
                    onClick={() => moderateMutation.mutate({
                      id: selectedContent.id,
                      status: 'approved',
                      notes: moderationNotes
                    })}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0"
                    onClick={() => moderateMutation.mutate({
                      id: selectedContent.id,
                      status: 'rejected',
                      notes: moderationNotes
                    })}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}