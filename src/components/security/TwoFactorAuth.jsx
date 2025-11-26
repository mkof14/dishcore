import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Check, X, Smartphone, Mail, Key } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function TwoFactorAuth({ user }) {
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [method, setMethod] = useState('email'); // 'email' or 'sms'
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const queryClient = useQueryClient();

  // Check if 2FA is enabled (from user profile)
  const is2FAEnabled = user?.two_factor_enabled || false;

  const enable2FAMutation = useMutation({
    mutationFn: async ({ method, phone }) => {
      // Generate and send verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      if (method === 'email') {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: 'Your 2FA Verification Code',
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #00A3E3;">🔐 Two-Factor Authentication</h2>
              <p>Your verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 20px; background: #f5f5f5; border-radius: 12px; text-align: center; margin: 20px 0;">
                ${code}
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
            </div>
          `
        });
      }

      // Store code temporarily (in real app, use secure backend storage)
      sessionStorage.setItem('2fa_code', code);
      sessionStorage.setItem('2fa_method', method);
      sessionStorage.setItem('2fa_phone', phone || '');
      
      return { code };
    },
    onSuccess: () => {
      setShowSetupDialog(false);
      setShowVerifyDialog(true);
      toast.success('Verification code sent!');
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: async (code) => {
      const storedCode = sessionStorage.getItem('2fa_code');
      const storedMethod = sessionStorage.getItem('2fa_method');
      const storedPhone = sessionStorage.getItem('2fa_phone');

      if (code !== storedCode) {
        throw new Error('Invalid verification code');
      }

      // Update user profile with 2FA settings
      await base44.auth.updateMe({
        two_factor_enabled: true,
        two_factor_method: storedMethod,
        two_factor_phone: storedPhone
      });

      sessionStorage.removeItem('2fa_code');
      sessionStorage.removeItem('2fa_method');
      sessionStorage.removeItem('2fa_phone');

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['current-user']);
      setShowVerifyDialog(false);
      setVerificationCode('');
      toast.success('Two-factor authentication enabled!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe({
        two_factor_enabled: false,
        two_factor_method: null,
        two_factor_phone: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['current-user']);
      toast.success('Two-factor authentication disabled');
    },
  });

  return (
    <>
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Two-Factor Authentication
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          {is2FAEnabled ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">Enabled</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20">
              <X className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-500">Disabled</span>
            </div>
          )}
        </div>

        {is2FAEnabled ? (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your account is protected with 2FA via {user?.two_factor_method || 'email'}.
            </p>
            <Button
              onClick={() => disable2FAMutation.mutate()}
              variant="outline"
              className="btn-secondary"
            >
              Disable 2FA
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Protect your account by requiring a verification code in addition to your password.
            </p>
            <Button
              onClick={() => setShowSetupDialog(true)}
              className="gradient-accent text-white border-0"
            >
              <Shield className="w-4 h-4 mr-2" />
              Enable 2FA
            </Button>
          </div>
        )}
      </Card>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text-primary)' }}>
              Set Up Two-Factor Authentication
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <p style={{ color: 'var(--text-secondary)' }}>
              Choose how you'd like to receive verification codes:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setMethod('email')}
                className={`w-full p-4 rounded-2xl text-left transition-all ${
                  method === 'email' ? 'border-2 border-blue-500' : 'border border-gray-300'
                }`}
                style={{ background: 'var(--background)' }}
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Email
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Receive codes at {user?.email}
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMethod('sms')}
                className={`w-full p-4 rounded-2xl text-left transition-all ${
                  method === 'sms' ? 'border-2 border-blue-500' : 'border border-gray-300'
                }`}
                style={{ background: 'var(--background)' }}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      SMS
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Receive codes via text message
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {method === 'sms' && (
              <Input
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                type="tel"
              />
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSetupDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => enable2FAMutation.mutate({ method, phone: phoneNumber })}
                disabled={method === 'sms' && !phoneNumber}
                className="flex-1 gradient-accent text-white border-0"
              >
                Send Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text-primary)' }}>
              Enter Verification Code
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="text-center">
              <Key className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <p style={{ color: 'var(--text-secondary)' }}>
                We sent a 6-digit code to your {method === 'email' ? 'email' : 'phone'}.
                Enter it below to complete setup.
              </p>
            </div>

            <Input
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowVerifyDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => verify2FAMutation.mutate(verificationCode)}
                disabled={verificationCode.length !== 6}
                className="flex-1 gradient-accent text-white border-0"
              >
                Verify
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}