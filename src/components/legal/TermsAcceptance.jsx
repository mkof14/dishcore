import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { logAuditEvent, AUDIT_EVENTS } from '../security/AuditLog';

const TERMS_VERSION = '1.0.0';
const PRIVACY_VERSION = '1.0.0';

export function TermsAcceptance({ onAccepted }) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    const acceptedTerms = localStorage.getItem('terms-accepted');
    const acceptedPrivacy = localStorage.getItem('privacy-accepted');
    const termsVersion = localStorage.getItem('terms-version');
    const privacyVersion = localStorage.getItem('privacy-version');

    // Check if user has accepted current versions
    const isUpToDate = 
      acceptedTerms === 'true' && 
      acceptedPrivacy === 'true' &&
      termsVersion === TERMS_VERSION &&
      privacyVersion === PRIVACY_VERSION;

    if (isUpToDate) {
      setHasAccepted(true);
      onAccepted?.(true);
    }
  }, [onAccepted]);

  const handleAccept = async () => {
    if (!termsAccepted || !privacyAccepted) {
      alert('Please accept both Terms of Service and Privacy Policy to continue');
      return;
    }

    const timestamp = new Date().toISOString();
    
    localStorage.setItem('terms-accepted', 'true');
    localStorage.setItem('privacy-accepted', 'true');
    localStorage.setItem('terms-version', TERMS_VERSION);
    localStorage.setItem('privacy-version', PRIVACY_VERSION);
    localStorage.setItem('terms-accepted-at', timestamp);

    // Log acceptance
    await logAuditEvent(AUDIT_EVENTS.SETTINGS_CHANGED, {
      action: 'terms_accepted',
      terms_version: TERMS_VERSION,
      privacy_version: PRIVACY_VERSION,
      timestamp
    });

    setHasAccepted(true);
    onAccepted?.(true);
  };

  if (hasAccepted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" 
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="gradient-card border-0 p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Welcome to DishCore
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Please review and accept our terms to continue
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-6 rounded-2xl" style={{ background: 'var(--bg-surface-alt)' }}>
              <div className="flex items-start gap-4">
                <FileText className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--accent-from)' }} />
                <div className="flex-1">
                  <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Terms of Service
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Our terms outline your rights and responsibilities when using DishCore.
                  </p>
                  <a 
                    href="/terms" 
                    target="_blank"
                    className="text-sm underline"
                    style={{ color: 'var(--accent-from)' }}
                  >
                    Read full Terms of Service →
                  </a>
                  <div className="flex items-center gap-2 mt-4">
                    <Checkbox 
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={setTermsAccepted}
                    />
                    <label htmlFor="terms" className="text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                      I have read and agree to the Terms of Service
                    </label>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl" style={{ background: 'var(--bg-surface-alt)' }}>
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--accent-from)' }} />
                <div className="flex-1">
                  <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Privacy Policy
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Learn how we collect, use, and protect your personal information.
                  </p>
                  <a 
                    href="/privacy-policy" 
                    target="_blank"
                    className="text-sm underline"
                    style={{ color: 'var(--accent-from)' }}
                  >
                    Read full Privacy Policy →
                  </a>
                  <div className="flex items-center gap-2 mt-4">
                    <Checkbox 
                      id="privacy"
                      checked={privacyAccepted}
                      onCheckedChange={setPrivacyAccepted}
                    />
                    <label htmlFor="privacy" className="text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                      I have read and agree to the Privacy Policy
                    </label>
                  </div>
                </div>
              </div>
            </Card>

            <div className="p-4 rounded-lg" style={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border-soft)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <strong>Important:</strong> By accepting, you confirm that:
              </p>
              <ul className="text-xs mt-2 space-y-1" style={{ color: 'var(--text-muted)' }}>
                <li>• You are at least 13 years old</li>
                <li>• You understand DishCore is not a medical service</li>
                <li>• You agree to our data collection and usage practices</li>
                <li>• You accept responsibility for the accuracy of your input data</li>
              </ul>
            </div>

            <Button
              onClick={handleAccept}
              disabled={!termsAccepted || !privacyAccepted}
              className="w-full gradient-accent text-white border-0"
              size="lg"
            >
              Accept and Continue
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export function useTermsAcceptance() {
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    const acceptedTerms = localStorage.getItem('terms-accepted');
    const acceptedPrivacy = localStorage.getItem('privacy-accepted');
    const termsVersion = localStorage.getItem('terms-version');
    const privacyVersion = localStorage.getItem('privacy-version');

    const isUpToDate = 
      acceptedTerms === 'true' && 
      acceptedPrivacy === 'true' &&
      termsVersion === TERMS_VERSION &&
      privacyVersion === PRIVACY_VERSION;

    setHasAccepted(isUpToDate);
  }, []);

  return { hasAccepted };
}