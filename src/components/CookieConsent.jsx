import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setTimeout(() => setShowBanner(true), 2000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
      >
        <Card className="max-w-4xl mx-auto gradient-card border-0 p-6 rounded-3xl shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
              <Cookie className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                We use cookies
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                By clicking "Accept", you consent to our use of cookies.{' '}
                <a href="/privacy-policy" className="gradient-text font-semibold">
                  Learn more
                </a>
              </p>
            </div>

            <div className="flex gap-3 flex-shrink-0">
              <Button onClick={declineCookies} variant="outline">
                Decline
              </Button>
              <Button onClick={acceptCookies} className="gradient-accent text-white border-0">
                Accept
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}