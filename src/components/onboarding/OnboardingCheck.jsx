import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function OnboardingCheck({ children }) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0] || null;
    },
  });

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboarding-completed');
    
    if (!isLoading && !profile && !onboardingCompleted) {
      // Redirect to onboarding if profile doesn't exist and onboarding not completed
      window.location.href = createPageUrl('Onboarding');
    }
  }, [profile, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--accent-from)' }} />
      </div>
    );
  }

  return children;
}