import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Download, Filter, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminAudit() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7d');

  // Mock audit log data
  const auditLogs = [
    { id: 1, timestamp: '2025-11-18 14:32:15', user: 'admin@dishcore.life', action: 'USER_CREATED', resource: 'User', details: 'Created new user: test@example.com', ip: '192.168.1.1' },
    { id: 2, timestamp: '2025-11-18 14:28:42', user: 'admin@dishcore.life', action: 'SETTINGS_UPDATED', resource: 'Settings', details: 'Updated system settings', ip: '192.168.1.1' },
    { id: 3, timestamp: '2025-11-18 14:15:33', user: 'admin@dishcore.life', action: 'USER_BLOCKED', resource: 'User', details: 'Blocked user: spam@example.com', ip: '192.168.1.1' },
    { id: 4, timestamp: '2025-11-18 13:45:12', user: 'moderator@dishcore.life', action: 'CONTENT_DELETED', resource: 'Recipe', details: 'Deleted recipe ID: 12345', ip: '192.168.1.5' },
    { id: 5, timestamp: '2025-11-18 13:22:08', user: 'admin@dishcore.life', action: 'BACKUP_CREATED', resource: 'Database', details: 'Manual backup created', ip: '192.168.1.1' },
    { id: 6, timestamp: '2025-11-18 12:10:55', user: 'admin@dishcore.life', action: 'API_KEY_GENERATED', resource: 'API', details: 'Generated new API key', ip: '192.168.1.1' },
  ];

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Details', 'IP'],
      ...auditLogs.map(log => [
        log.timestamp,
        log.user,
        log.action,
        log.resource,
        log.details,
        log.ip
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  const getActionColor = (action) => {
    if (action.includes('CREATED') || action.includes('GENERATED')) return 'bg-green-500/20 text-green-400';
    if (action.includes('DELETED') || action.includes('BLOCKED')) return 'bg-red-500/20 text-red-400';
    if (action.includes('UPDATED')) return 'bg-blue-500/20 text-blue-400';
    return 'bg-purple-500/20 text-purple-400';
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Audit Logs
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Track all administrative actions
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportLogs} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
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
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl"
                style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {log.resource}
                        </span>
                      </div>
                      <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                        {log.details}
                      </p>
                      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span>User: {log.user}</span>
                        <span>IP: {log.ip}</span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}