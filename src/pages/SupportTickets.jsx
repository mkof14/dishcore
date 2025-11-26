import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ticket, UserCircle, Send, ArrowLeft, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { hasPermission, PERMISSIONS } from '../components/admin/permissions';
import { AccessDenied } from '../components/admin/PermissionGate';
import { toast } from 'sonner';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function SupportTickets() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const canAssign = hasPermission(currentUser, PERMISSIONS.ASSIGN_TICKETS);
  const canViewAll = hasPermission(currentUser, PERMISSIONS.VIEW_ALL_TICKETS);

  const { data: tickets = [] } = useQuery({
    queryKey: ['support-tickets', filterStatus],
    queryFn: async () => {
      let query = {};
      if (!canViewAll) {
        query.assigned_to = currentUser.email;
      }
      if (filterStatus !== 'all') {
        query.status = filterStatus;
      }
      return await base44.entities.SupportTicket.filter(query, '-created_date');
    },
  });

  const { data: supportTeam = [] } = useQuery({
    queryKey: ['support-team'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list();
      return allUsers.filter(u => ['support', 'support_lead', 'admin'].includes(u.role));
    },
    enabled: canAssign,
  });

  const respondMutation = useMutation({
    mutationFn: ({ ticketId, message }) => {
      const ticket = tickets.find(t => t.id === ticketId);
      const updatedResponses = [...(ticket.responses || []), {
        responder: currentUser.email,
        message,
        timestamp: new Date().toISOString()
      }];
      return base44.entities.SupportTicket.update(ticketId, {
        responses: updatedResponses,
        status: 'in_progress'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['support-tickets']);
      toast.success('Response sent');
      setResponse('');
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ ticketId, assignTo }) => 
      base44.entities.SupportTicket.update(ticketId, {
        assigned_to: assignTo,
        assigned_by: currentUser.email,
        status: 'assigned'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['support-tickets']);
      toast.success('Ticket assigned');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ ticketId, status }) => {
      const updates = { status };
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }
      return base44.entities.SupportTicket.update(ticketId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['support-tickets']);
      toast.success('Status updated');
    },
  });

  const updatePriorityMutation = useMutation({
    mutationFn: ({ ticketId, priority }) => 
      base44.entities.SupportTicket.update(ticketId, { priority }),
    onSuccess: () => {
      queryClient.invalidateQueries(['support-tickets']);
      toast.success('Priority updated');
    },
  });

  if (!currentUser || !hasPermission(currentUser, PERMISSIONS.VIEW_SUPPORT_TICKETS)) {
    return <AccessDenied />;
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'medium': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-yellow-500/20 text-yellow-400';
      case 'assigned': return 'bg-blue-500/20 text-blue-400';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400';
      case 'resolved': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const myTickets = tickets.filter(t => t.assigned_to === currentUser.email);
  const unassignedTickets = tickets.filter(t => !t.assigned_to);
  const openTickets = tickets.filter(t => ['open', 'assigned', 'in_progress'].includes(t.status));

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Support Tickets
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Manage and respond to support requests
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
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>My Tickets</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {myTickets.length}
                </p>
              </div>
              <UserCircle className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Unassigned</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {unassignedTickets.length}
                </p>
              </div>
              <Ticket className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Open</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {openTickets.length}
                </p>
              </div>
              <Ticket className="w-8 h-8 text-green-500" />
            </div>
          </Card>
        </div>

        <div className="flex gap-2 mb-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 rounded-2xl cursor-pointer hover:scale-[1.01] transition-all"
                style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        #{ticket.ticket_number || ticket.id.slice(0, 8)} - {ticket.subject}
                      </h4>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                      {ticket.description?.substring(0, 100)}...
                    </p>
                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span>User: {ticket.user_email || ticket.created_by}</span>
                      {ticket.assigned_to && <span>Assigned to: {ticket.assigned_to}</span>}
                      <span>{new Date(ticket.created_date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {tickets.length === 0 && (
              <div className="text-center py-12">
                <Ticket className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-muted)' }}>No tickets found</p>
              </div>
            )}
          </div>
        </Card>

        {/* Ticket Detail Dialog */}
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ticket Details</DialogTitle>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </Badge>
                  <Badge className={getStatusColor(selectedTicket.status)}>
                    {selectedTicket.status}
                  </Badge>
                  <Badge>{selectedTicket.category}</Badge>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">{selectedTicket.subject}</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    {selectedTicket.description}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    From: {selectedTicket.user_email || selectedTicket.created_by}
                  </p>
                </div>

                <div className="flex gap-2">
                  {canAssign && (
                    <Select
                      value={selectedTicket.assigned_to || ''}
                      onValueChange={(value) => assignMutation.mutate({ ticketId: selectedTicket.id, assignTo: value })}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Assign to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {supportTeam.map((member) => (
                          <SelectItem key={member.email} value={member.email}>
                            {member.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {hasPermission(currentUser, PERMISSIONS.MANAGE_TICKET_PRIORITY) && (
                    <Select
                      value={selectedTicket.priority}
                      onValueChange={(priority) => updatePriorityMutation.mutate({ ticketId: selectedTicket.id, priority })}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(status) => updateStatusMutation.mutate({ ticketId: selectedTicket.id, status })}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="waiting_user">Waiting User</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Responses</h4>
                  <div className="space-y-2 mb-4">
                    {selectedTicket.responses?.map((resp, idx) => (
                      <div key={idx} className="p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                        <p className="text-sm font-semibold mb-1">{resp.responder}</p>
                        <p className="text-sm">{resp.message}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                          {new Date(resp.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Type your response..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={4}
                  />
                  <Button
                    className="mt-2 gradient-accent text-white border-0 gap-2"
                    onClick={() => respondMutation.mutate({ ticketId: selectedTicket.id, message: response })}
                    disabled={!response}
                  >
                    <Send className="w-4 h-4" />
                    Send Response
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