import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Search, Lock, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";

export default function CommunityGroups() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['communityGroups'],
    queryFn: () => base44.entities.CommunityGroup.list('-created_date', 100),
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['groupMemberships', user?.email],
    queryFn: () => base44.entities.GroupMembership.filter({ user_email: user?.email }),
    enabled: !!user,
  });

  const joinGroupMutation = useMutation({
    mutationFn: (groupId) => base44.entities.GroupMembership.create({
      group_id: groupId,
      user_email: user.email,
      joined_date: new Date().toISOString()
    }),
    onSuccess: (data, groupId) => {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        base44.entities.CommunityGroup.update(groupId, {
          member_count: (group.member_count || 0) + 1
        });
      }
      queryClient.invalidateQueries(['groupMemberships']);
      queryClient.invalidateQueries(['communityGroups']);
      toast.success('Joined group!');
    },
  });

  const filteredGroups = groups.filter(group =>
    group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isMember = (groupId) => memberships.some(m => m.group_id === groupId);

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
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
                Community Groups
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                Join groups and connect with like-minded people
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="gradient-card border-0 p-4 rounded-3xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: 'var(--text-muted)' }} />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        </Card>

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <Card key={group.id} className="gradient-card border-0 p-6 rounded-3xl hover:shadow-lg transition-shadow">
              {group.image_url && (
                <img src={group.image_url} alt={group.name} className="w-full h-32 object-cover rounded-2xl mb-4" />
              )}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold flex-1" style={{ color: 'var(--text-primary)' }}>
                  {group.name}
                </h3>
                {group.is_private && <Lock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
              </div>
              <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {group.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {group.category}
                  </Badge>
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Users className="w-3 h-3" />
                    {group.member_count || 0}
                  </span>
                </div>
                {isMember(group.id) ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Joined
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => joinGroupMutation.mutate(group.id)}
                    disabled={!user}
                    className="gradient-accent text-white border-0"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Join
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}