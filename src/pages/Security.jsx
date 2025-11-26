import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Key, Clock, Smartphone, AlertTriangle, CheckCircle } from 'lucide-react';
import TwoFactorAuth from '../components/security/TwoFactorAuth';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Security() {
  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome on Windows', location: 'New York, US', lastActive: '5 min ago', current: true },
    { id: 2, device: 'Safari on iPhone', location: 'New York, US', lastActive: '2 hours ago', current: false }
  ]);

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Security Settings
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage your account security and authentication methods
          </p>
        </div>

        {/* Security Score */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Security Score
            </h3>
            <div className="text-3xl font-bold text-green-500">
              {currentUser?.two_factor_enabled ? '95' : '60'}/100
            </div>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--background)' }}>
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
              style={{ width: currentUser?.two_factor_enabled ? '95%' : '60%' }}
            />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              {currentUser?.two_factor_enabled ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Two-factor authentication
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Strong password
              </span>
            </div>
          </div>
        </Card>

        {/* 2FA Setup */}
        <TwoFactorAuth user={currentUser} />

        {/* Active Sessions */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Smartphone className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            Active Sessions
          </h3>
          <div className="space-y-3">
            {sessions.map(session => (
              <div key={session.id} className="p-4 rounded-2xl flex items-center justify-between"
                style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {session.device}
                      {session.current && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-500">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {session.location} • {session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <Button size="sm" variant="outline">
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Security Recommendations */}
        <Card className="gradient-card border-0 p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Security Recommendations
          </h3>
          <div className="space-y-3">
            {!currentUser?.two_factor_enabled && (
              <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-500 mb-1">
                      Enable Two-Factor Authentication
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Add an extra layer of security to protect your account from unauthorized access.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="p-4 rounded-2xl" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Review Your Privacy Settings
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Control who can see your profile and activity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Link to={createPageUrl('Settings')} className="flex-1">
            <Button variant="outline" className="w-full">
              Back to Settings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}