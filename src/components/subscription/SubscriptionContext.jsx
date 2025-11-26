import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const SubscriptionContext = createContext();

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}

export function SubscriptionProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  // Fetch subscription from localStorage (temporary until Stripe integration)
  const { data: subscription, refetch } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const stored = localStorage.getItem('dishcore-subscription');
      if (stored) {
        return JSON.parse(stored);
      }
      return {
        tier: 'lite',
        status: 'active',
        expiresAt: null
      };
    }
  });

  const handleCheckout = async (priceId, tier) => {
    setLoading(true);
    try {
      // TODO: Replace with actual Stripe Checkout
      // const response = await fetch('/api/stripe/create-checkout', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ priceId })
      // });
      // const { sessionId } = await response.json();
      // const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
      // await stripe.redirectToCheckout({ sessionId });

      // Temporary: simulate subscription
      const newSubscription = {
        tier,
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        stripeSubscriptionId: 'temp_' + Date.now()
      };
      
      localStorage.setItem('dishcore-subscription', JSON.stringify(newSubscription));
      await refetch();
      
      alert(`Successfully upgraded to ${tier}! (Demo mode - no actual payment)`);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual Stripe cancellation
      // await fetch('/api/stripe/cancel-subscription', {
      //   method: 'POST',
      //   body: JSON.stringify({ subscriptionId: subscription.stripeSubscriptionId })
      // });

      const newSubscription = {
        tier: 'lite',
        status: 'canceled',
        expiresAt: null
      };
      
      localStorage.setItem('dishcore-subscription', JSON.stringify(newSubscription));
      await refetch();
      
      alert('Subscription canceled. You still have access until the end of the billing period.');
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Cancellation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Feature gates
  const hasFeature = (feature) => {
    if (!subscription) return false;
    
    const tier = subscription.tier;
    
    // Define feature access
    const features = {
      'unlimited_menus': ['core', 'studio'],
      'unlimited_scanner': ['core', 'studio'],
      'adaptive_portions': ['core', 'studio'],
      'restaurant_mode': ['core', 'studio'],
      'grocery_list': ['core', 'studio'],
      'studio_score': ['studio'],
      'metabolism_map': ['studio'],
      'adaptive_menu_engine': ['studio'],
      'advanced_reports': ['studio'],
      'pdf_export': ['studio'],
      'voice_ai': ['studio']
    };
    
    return features[feature]?.includes(tier) || false;
  };

  const value = {
    subscription,
    loading,
    user,
    handleCheckout,
    handleCancelSubscription,
    hasFeature,
    isLite: subscription?.tier === 'lite',
    isCore: subscription?.tier === 'core',
    isStudio: subscription?.tier === 'studio'
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}