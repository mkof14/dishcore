import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Filter, Download, UserCog, Ban, Eye, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { hasPermission, PERMISSIONS } from '../components/admin/permissions';
import { AccessDenied } from '../components/admin/PermissionGate';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Check permissions
  if (currentUser && !hasPermission(currentUser, PERMISSIONS.VIEW_ALL_USERS)) {
    return <AccessDenied />;
  }

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users-detailed', searchQuery, planFilter, statusFilter],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminUsers', { 
        query: searchQuery,
        plan: planFilter !== 'all' ? planFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      return res.data;
    },
  });

  const exportToCSV = () => {
    const csv = [
      ['Email', 'Plan', 'Status', 'Meals Logged', 'Created At', 'Last Activity'],
      ...(usersData?.users || []).map(u => [
        u.email,
        u.plan,
        u.stats?.status || 'active',
        u.stats?.mealsLogged || 0,
        new Date(u.created_at).toLocaleDateString(),
        u.stats?.lastActivity ? new Date(u.stats.lastActivity).toLocaleDateString() : 'Never'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              User Management
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              {usersData?.count || 0} total users
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Link to={createPageUrl('Admin')}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" 
                style={{ color: 'var(--text-muted)' }} />
              <Input
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="lite">Lite</SelectItem>
                <SelectItem value="core">Core</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="test">Test</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-12">
                <p style={{ color: 'var(--text-muted)' }}>Loading users...</p>
              </div>
            ) : usersData?.users?.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-muted)' }}>No users found</p>
              </div>
            ) : (
              usersData?.users?.map((user) => (
                <div
                  key={user.id}
                  className="p-4 rounded-2xl flex items-center justify-between hover:scale-[1.01] transition-transform"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {user.email}
                      </p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <Badge className="bg-blue-500/20 text-blue-400 border-0">
                          {user.plan}
                        </Badge>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {user.stats?.mealsLogged || 0} meals logged
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                      {user.stats?.lastActivity && (
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Active {new Date(user.stats.lastActivity).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <UserCog className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Ban className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}