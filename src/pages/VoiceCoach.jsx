import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Square, Radio, Sparkles, Volume2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import apiClient from "../components/api/apiClient";
import SEOHead from "../components/SEOHead";

export default function VoiceCoach() {
  const [sessionStatus, setSessionStatus] = useState('idle'); // idle, connecting, active, stopped
  const [sessionId, setSessionId] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    let interval;
    if (sessionStatus === 'active') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStatus]);

  const handleStartSession = async () => {
    try {
      setSessionStatus('connecting');
      const response = await apiClient.startVoiceSession({
        userId: 'current-user-id',
        timestamp: new Date().toISOString(),
      });

      setSessionId(response.sessionId);
      setSessionStatus('active');
      setIsListening(true);
      setDuration(0);
      setTranscript('');
      toast.success('Voice session started!');

      // Start listening for updates
      pollVoiceStatus(response.sessionId);
    } catch (error) {
      console.error('Failed to start voice session:', error);
      toast.error('Failed to start voice session');
      setSessionStatus('idle');
    }
  };

  const handleStopSession = async () => {
    try {
      if (sessionId) {
        await apiClient.stopVoiceSession(sessionId);
      }
      setSessionStatus('stopped');
      setIsListening(false);
      toast.success('Voice session ended');
      
      // Show summary after a delay
      setTimeout(() => {
        setSessionStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Failed to stop voice session:', error);
      toast.error('Failed to stop voice session');
    }
  };

  const pollVoiceStatus = async (sid) => {
    const interval = setInterval(async () => {
      if (sessionStatus !== 'active') {
        clearInterval(interval);
        return;
      }

      try {
        const status = await apiClient.getVoiceStatus(sid);
        if (status.transcript) {
          setTranscript(status.transcript);
        }
      } catch (error) {
        console.error('Failed to get voice status:', error);
      }
    }, 2000);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <SEOHead 
        title="AI Voice Coach - DishCore"
        description="Get real-time nutrition advice through voice conversations with your AI nutrition coach"
      />

      <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              AI Voice Coach
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Have a voice conversation about your nutrition and get personalized advice
            </p>
          </div>

          {/* Main Session Card */}
          <Card className="gradient-card border-0 p-8 rounded-3xl text-center">
            <AnimatePresence mode="wait">
              {sessionStatus === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="w-32 h-32 mx-auto rounded-full gradient-accent flex items-center justify-center">
                    <Mic className="w-16 h-16 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Ready to start?
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                      Click the button below to begin your voice session
                    </p>
                  </div>
                  <Button
                    onClick={handleStartSession}
                    className="gradient-accent text-white border-0 px-8 py-6 text-lg shadow-xl"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Start Voice Session
                  </Button>
                </motion.div>
              )}

              {sessionStatus === 'connecting' && (
                <motion.div
                  key="connecting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <motion.div
                    className="w-32 h-32 mx-auto rounded-full gradient-accent flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Radio className="w-16 h-16 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Connecting...
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                      Setting up your AI coach
                    </p>
                  </div>
                </motion.div>
              )}

              {sessionStatus === 'active' && (
                <motion.div
                  key="active"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <motion.div
                    className="w-32 h-32 mx-auto rounded-full gradient-accent flex items-center justify-center relative"
                    animate={isListening ? {
                      boxShadow: [
                        '0 0 0 0 rgba(45, 163, 255, 0.7)',
                        '0 0 0 20px rgba(45, 163, 255, 0)',
                        '0 0 0 0 rgba(45, 163, 255, 0)',
                      ]
                    } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Volume2 className="w-16 h-16 text-white" />
                  </motion.div>

                  <div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Session Active
                      </h2>
                    </div>
                    <div className="flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <Clock className="w-4 h-4" />
                      <p>{formatDuration(duration)}</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleStopSession}
                    variant="destructive"
                    className="px-8 py-6 text-lg"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    End Session
                  </Button>
                </motion.div>
              )}

              {sessionStatus === 'stopped' && (
                <motion.div
                  key="stopped"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="w-32 h-32 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Session Complete!
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                      Duration: {formatDuration(duration)}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Transcript Card */}
          {(sessionStatus === 'active' || transcript) && (
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
                Session Transcript
              </h3>
              <div className="p-4 rounded-xl min-h-[200px]" style={{ background: 'var(--background)' }}>
                {transcript ? (
                  <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                    {transcript}
                  </p>
                ) : (
                  <p className="text-center" style={{ color: 'var(--text-muted)' }}>
                    Start speaking to see your transcript...
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="gradient-card border-0 p-6 rounded-2xl text-center">
              <Mic className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--accent-from)' }} />
              <h4 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Natural Conversations
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Talk naturally about your nutrition goals
              </p>
            </Card>

            <Card className="gradient-card border-0 p-6 rounded-2xl text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--accent-from)' }} />
              <h4 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Real-time Advice
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Get instant personalized recommendations
              </p>
            </Card>

            <Card className="gradient-card border-0 p-6 rounded-2xl text-center">
              <Volume2 className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--accent-from)' }} />
              <h4 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Voice Responses
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Hear your coach's advice out loud
              </p>
            </Card>
          </div>

          {/* Note */}
          <Card className="gradient-card border-0 p-4 rounded-2xl border-2 border-blue-500/20">
            <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              💡 <strong>Note:</strong> Voice Coach is currently in development. 
              Full functionality will be available after deployment to Vercel with voice AI integration.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}