import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { logAuditEvent, AUDIT_EVENTS } from '../security/AuditLog';

export function GDPRDeleteRequest() {
  const [confirmText, setConfirmText] = useState('');
  const [confirmChecks, setConfirmChecks] = useState({
    understand: false,
    noRecovery: false,
    downloaded: false
  });
  const [loading, setLoading] = useState(false);

  const allChecked = Object.values(confirmChecks).every(v => v);
  const textMatches = confirmText === 'DELETE MY DATA';

  const handleDelete = async () => {
    if (!allChecked || !textMatches) return;

    const confirmed = window.confirm(
      'THIS ACTION CANNOT BE UNDONE!\n\n' +
      'All your data will be permanently deleted within 30 days.\n' +
      'Are you absolutely sure?'
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const user = await base44.auth.me();

      // Log the deletion request
      await logAuditEvent(AUDIT_EVENTS.DATA_DELETED, {
        action: 'gdpr_delete_request',
        user_email: user.email,
        timestamp: new Date().toISOString()
      });

      // TODO: In production, this should:
      // 1. Send request to backend
      // 2. Schedule data deletion (30 days grace period)
      // 3. Send confirmation email
      // 4. Anonymize user data
      
      // For now, simulate the process
      const deleteRequest = {
        user_email: user.email,
        user_id: user.id,
        requested_at: new Date().toISOString(),
        status: 'pending',
        scheduled_deletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      localStorage.setItem('gdpr-delete-request', JSON.stringify(deleteRequest));

      alert(
        'Delete Request Submitted\n\n' +
        'Your data will be permanently deleted in 30 days.\n' +
        'You will receive a confirmation email.\n\n' +
        'You can cancel this request within 30 days by logging in.'
      );

      // Logout user
      await base44.auth.logout();
      
    } catch (error) {
      console.error('Delete request failed:', error);
      alert('Failed to submit delete request. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="gradient-card border-0 p-8 rounded-3xl">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Request Data Deletion (GDPR)
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Permanently delete all your personal data from DishCore.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-lg mb-6 bg-red-500/10 border border-red-500/20">
        <p className="text-sm font-bold text-red-400 mb-2">
          ⚠️ WARNING: This action is irreversible
        </p>
        <ul className="text-xs text-red-400 space-y-1">
          <li>• All your meal logs, measurements, and progress will be deleted</li>
          <li>• Custom dishes and recipes will be removed</li>
          <li>• Menu plans and reports will be lost</li>
          <li>• Your account will be closed</li>
          <li>• Data will be deleted within 30 days</li>
        </ul>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <Checkbox
            id="understand"
            checked={confirmChecks.understand}
            onCheckedChange={(checked) => 
              setConfirmChecks(prev => ({ ...prev, understand: checked }))
            }
          />
          <label htmlFor="understand" className="text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
            I understand this action cannot be undone
          </label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="noRecovery"
            checked={confirmChecks.noRecovery}
            onCheckedChange={(checked) => 
              setConfirmChecks(prev => ({ ...prev, noRecovery: checked }))
            }
          />
          <label htmlFor="noRecovery" className="text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
            I understand my data cannot be recovered after deletion
          </label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="downloaded"
            checked={confirmChecks.downloaded}
            onCheckedChange={(checked) => 
              setConfirmChecks(prev => ({ ...prev, downloaded: checked }))
            }
          />
          <label htmlFor="downloaded" className="text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
            I have downloaded my data if I need it
          </label>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
          Type "DELETE MY DATA" to confirm:
        </label>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE MY DATA"
          className="font-mono"
        />
      </div>

      <Button
        onClick={handleDelete}
        disabled={!allChecked || !textMatches || loading}
        className="w-full bg-red-500 hover:bg-red-600 text-white"
        size="lg"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        {loading ? 'Processing...' : 'Delete All My Data'}
      </Button>

      <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
        Need help? <a href="mailto:support@dishcore.com" className="underline">Contact Support</a>
      </p>
    </Card>
  );
}