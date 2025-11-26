import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, UserCog, Search, ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS, getRoleName, getRoleBadgeColor, hasPermission } from '../components/admin/permissions';
import { AccessDenied } from '../components/admin/PermissionGate';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function AdminRoles() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: users } = useQuery({
    queryKey: ['all-users', searchQuery],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list();
      return searchQuery
        ? allUsers.filter(u => u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
        : allUsers;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      await base44.entities.User.update(userId, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      toast.success('User role updated successfully');
      setSelectedUser(null);
    },
    onError: () => {
      toast.error('Failed to update user role');
    }
  });

  const handleRoleChange = () => {
    if (selectedUser && newRole) {
      updateRoleMutation.mutate({ userId: selectedUser.id, role: newRole });
    }
  };

  // Check if current user has permission to manage roles
  if (!hasPermission(currentUser, PERMISSIONS.EDIT_USERS)) {
    return <AccessDenied message="Only administrators can manage user roles" />;
  }

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Role Management
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Manage user roles and permissions
            </p>
          </div>
          <Link to={createPageUrl('Admin')}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* Role Descriptions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <Shield className="w-10 h-10 mb-3 text-purple-500" />
            <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Administrator</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Full access to all system features and settings
            </p>
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <UserCog className="w-10 h-10 mb-3 text-green-500" />
            <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Finance Manager</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Access to billing, revenue, and financial reports
            </p>
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <UserCog className="w-10 h-10 mb-3 text-blue-500" />
            <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Support Staff</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              User support, tickets, and content moderation
            </p>
          </Card>

          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <UserCog className="w-10 h-10 mb-3 text-gray-500" />
            <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Regular User</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Standard user access to the application
            </p>
          </Card>
        </div>

        {/* Users List */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              User Roles
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" 
                style={{ color: 'var(--text-muted)' }} />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>

          <div className="space-y-2">
            {users?.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-2xl flex items-center justify-between"
                style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
                    <UserCog className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {user.email}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {user.full_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {getRoleName(user.role)}
                  </Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user);
                          setNewRole(user.role);
                        }}
                      >
                        Change Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                          Update role for {selectedUser?.email}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Select value={newRole} onValueChange={setNewRole}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ROLES.USER}>Regular User</SelectItem>
                            <SelectItem value={ROLES.SUPPORT}>Support Staff</SelectItem>
                            <SelectItem value={ROLES.FINANCE}>Finance Manager</SelectItem>
                            <SelectItem value={ROLES.ADMIN}>Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={handleRoleChange}
                          className="w-full gradient-accent text-white border-0"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Permissions Matrix */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Permissions Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left p-3" style={{ color: 'var(--text-primary)' }}>Permission</th>
                  <th className="text-center p-3" style={{ color: 'var(--text-primary)' }}>Admin</th>
                  <th className="text-center p-3" style={{ color: 'var(--text-primary)' }}>Finance</th>
                  <th className="text-center p-3" style={{ color: 'var(--text-primary)' }}>Support</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(PERMISSIONS).slice(0, 12).map(([key, permission]) => (
                  <tr key={permission} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="p-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {key.replace(/_/g, ' ').toLowerCase()}
                    </td>
                    <td className="text-center p-3">
                      {ROLE_PERMISSIONS[ROLES.ADMIN].includes(permission) && '✓'}
                    </td>
                    <td className="text-center p-3">
                      {ROLE_PERMISSIONS[ROLES.FINANCE].includes(permission) && '✓'}
                    </td>
                    <td className="text-center p-3">
                      {ROLE_PERMISSIONS[ROLES.SUPPORT].includes(permission) && '✓'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}