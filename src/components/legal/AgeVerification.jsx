import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function AgeVerification({ onVerified }) {
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('age-verified') === 'true';
    if (verified) {
      setIsVerified(true);
      onVerified?.(true);
    }
  }, [onVerified]);

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleVerify = () => {
    if (!birthDate) {
      setError('Please enter your birth date');
      return;
    }

    const age = calculateAge(birthDate);
    
    if (age < 13) {
      setError('You must be at least 13 years old to use DishCore');
      return;
    }

    localStorage.setItem('age-verified', 'true');
    localStorage.setItem('birth-date', birthDate);
    setIsVerified(true);
    onVerified?.(true);
  };

  if (isVerified) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" 
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="gradient-card border-0 p-8 rounded-3xl max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Age Verification Required
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              You must be at least 13 years old to use DishCore
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="birthdate">Date of Birth</Label>
              <Input
                id="birthdate"
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  setError('');
                }}
                max={new Date().toISOString().split('T')[0]}
                className="mt-2"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              onClick={handleVerify}
              className="w-full gradient-accent text-white border-0"
              size="lg"
            >
              Verify Age
            </Button>

            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              By continuing, you confirm that you meet the age requirement and agree to our{' '}
              <a href="/terms" className="underline">Terms of Service</a>.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export function useAgeVerification() {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('age-verified') === 'true';
    setIsVerified(verified);
  }, []);

  return { isVerified };
}