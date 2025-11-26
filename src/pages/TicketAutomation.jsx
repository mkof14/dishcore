import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Plus, Trash2, ArrowLeft, Clock, AlertTriangle } from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function TicketAutomation() {
  const queryClient = useQueryClient();
  const [newRule, setNewRule] = useState({
    rule_name: '',
    trigger_type: 'keyword',
    trigger_value: '',
    action_type: 'assign',
    action_value: ''
  });
  const [newSLA, setNewSLA] = useState({
    priority: 'medium',
    response_time_hours: 4,
    resolution_time_hours: 24,
    escalation_time_hours: 48,
    escalate_to_role: 'support_lead'
  });
  const [newFAQ, setNewFAQ] = useState({
    question: '',
    answer: '',
    keywords: '',
    category: ''
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: rules = [] } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: () => base44.entities.TicketAutomation.list(),
  });

  const { data: slaConfigs = [] } = useQuery({
    queryKey: ['sla-configs'],
    queryFn: () => base44.entities.SLAConfig.list(),
  });

  const { data: faqs = [] } = useQuery({
    queryKey: ['chatbot-faqs-manage'],
    queryFn: () => base44.entities.ChatbotFAQ.list('-times_used'),
  });

  const createRuleMutation = useMutation({
    mutationFn: (rule) => base44.entities.TicketAutomation.create(rule),
    onSuccess: () => {
      queryClient.invalidateQueries(['automation-rules']);
      toast.success('Rule created');
      setNewRule({ rule_name: '', trigger_type: 'keyword', trigger_value: '', action_type: 'assign', action_value: '' });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id) => base44.entities.TicketAutomation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['automation-rules']);
      toast.success('Rule deleted');
    },
  });

  const createSLAMutation = useMutation({
    mutationFn: (sla) => base44.entities.SLAConfig.create(sla),
    onSuccess: () => {
      queryClient.invalidateQueries(['sla-configs']);
      toast.success('SLA config created');
      setNewSLA({ priority: 'medium', response_time_hours: 4, resolution_time_hours: 24, escalation_time_hours: 48, escalate_to_role: 'support_lead' });
    },
  });

  const createFAQMutation = useMutation({
    mutationFn: (faq) => base44.entities.ChatbotFAQ.create({
      ...faq,
      keywords: faq.keywords.split(',').map(k => k.trim()).filter(Boolean)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['chatbot-faqs-manage']);
      toast.success('FAQ created');
      setNewFAQ({ question: '', answer: '', keywords: '', category: '' });
    },
  });

  const deleteFAQMutation = useMutation({
    mutationFn: (id) => base44.entities.ChatbotFAQ.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['chatbot-faqs-manage']);
      toast.success('FAQ deleted');
    },
  });

  if (!currentUser || !hasPermission(currentUser, PERMISSIONS.MANAGE_SETTINGS)) {
    return <AccessDenied />;
  }

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Ticket Automation
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Configure auto-assignment, escalation, and SLAs
            </p>
          </div>
          <Link to={createPageUrl('Admin')}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="rules" className="space-y-6">
          <TabsList>
            <TabsTrigger value="rules">Assignment Rules ({rules.length})</TabsTrigger>
            <TabsTrigger value="sla">SLA Config ({slaConfigs.length})</TabsTrigger>
            <TabsTrigger value="chatbot">Chatbot FAQs ({faqs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="rules">
            <div className="grid gap-6">
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Create Assignment Rule
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Rule name"
                    value={newRule.rule_name}
                    onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
                  />
                  <Select value={newRule.trigger_type} onValueChange={(v) => setNewRule({ ...newRule, trigger_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keyword">Keyword Match</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Trigger value (e.g., 'billing', 'technical')"
                    value={newRule.trigger_value}
                    onChange={(e) => setNewRule({ ...newRule, trigger_value: e.target.value })}
                  />
                  <Select value={newRule.action_type} onValueChange={(v) => setNewRule({ ...newRule, action_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assign">Auto-Assign</SelectItem>
                      <SelectItem value="set_priority">Set Priority</SelectItem>
                      <SelectItem value="add_tag">Add Tag</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Action value (agent email, priority, tag)"
                    value={newRule.action_value}
                    onChange={(e) => setNewRule({ ...newRule, action_value: e.target.value })}
                    className="md:col-span-2"
                  />
                </div>
                <Button onClick={() => createRuleMutation.mutate(newRule)} className="mt-4 gradient-accent text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rule
                </Button>
              </Card>

              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Active Rules
                </h3>
                <div className="space-y-2">
                  {rules.map((rule) => (
                    <div key={rule.id} className="p-4 rounded-2xl flex justify-between items-center"
                      style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                      <div>
                        <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {rule.rule_name}
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          When {rule.trigger_type} contains "{rule.trigger_value}" → {rule.action_type}: {rule.action_value}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => deleteRuleMutation.mutate(rule.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sla">
            <div className="grid gap-6">
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Create SLA Configuration
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Select value={newSLA.priority} onValueChange={(v) => setNewSLA({ ...newSLA, priority: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="First response time (hours)"
                    value={newSLA.response_time_hours}
                    onChange={(e) => setNewSLA({ ...newSLA, response_time_hours: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Resolution time (hours)"
                    value={newSLA.resolution_time_hours}
                    onChange={(e) => setNewSLA({ ...newSLA, resolution_time_hours: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Escalation time (hours)"
                    value={newSLA.escalation_time_hours}
                    onChange={(e) => setNewSLA({ ...newSLA, escalation_time_hours: Number(e.target.value) })}
                  />
                  <Select value={newSLA.escalate_to_role} onValueChange={(v) => setNewSLA({ ...newSLA, escalate_to_role: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escalate to" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="support_lead">Support Lead</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => createSLAMutation.mutate(newSLA)} className="mt-4 gradient-accent text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Create SLA Config
                </Button>
              </Card>

              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  SLA Configurations
                </h3>
                <div className="space-y-2">
                  {slaConfigs.map((sla) => (
                    <div key={sla.id} className="p-4 rounded-2xl"
                      style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>
                          {sla.priority} Priority
                        </h4>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p style={{ color: 'var(--text-muted)' }}>Response</p>
                          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{sla.response_time_hours}h</p>
                        </div>
                        <div>
                          <p style={{ color: 'var(--text-muted)' }}>Resolution</p>
                          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{sla.resolution_time_hours}h</p>
                        </div>
                        <div>
                          <p style={{ color: 'var(--text-muted)' }}>Escalation</p>
                          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{sla.escalation_time_hours}h</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chatbot">
            <div className="grid gap-6">
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Add Chatbot FAQ
                </h3>
                <div className="space-y-4">
                  <Input
                    placeholder="Question"
                    value={newFAQ.question}
                    onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                  />
                  <Textarea
                    placeholder="Answer"
                    value={newFAQ.answer}
                    onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                    rows={3}
                  />
                  <Input
                    placeholder="Keywords (comma-separated)"
                    value={newFAQ.keywords}
                    onChange={(e) => setNewFAQ({ ...newFAQ, keywords: e.target.value })}
                  />
                  <Input
                    placeholder="Category (optional)"
                    value={newFAQ.category}
                    onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
                  />
                </div>
                <Button onClick={() => createFAQMutation.mutate(newFAQ)} className="mt-4 gradient-accent text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Add FAQ
                </Button>
              </Card>

              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Chatbot Knowledge Base
                </h3>
                <div className="space-y-2">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="p-4 rounded-2xl"
                      style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {faq.question}
                        </h4>
                        <Button variant="outline" size="sm" onClick={() => deleteFAQMutation.mutate(faq.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                        {faq.answer}
                      </p>
                      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span>Used: {faq.times_used || 0} times</span>
                        <span>Helpful: {faq.helpful_count || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}