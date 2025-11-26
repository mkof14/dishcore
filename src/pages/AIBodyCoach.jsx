import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  Sparkles,
  TrendingUp,
  Target,
  Activity,
  Heart,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';

const QUICK_QUESTIONS = [
  "Explain my current body status",
  "How far am I from my goals?",
  "What should I focus on this week?",
  "Is my waist size healthy?",
  "How to reduce waist safely?",
  "Combine diet and workouts?"
];

export default function AIBodyCoach() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const { data: measurements = [] } = useQuery({
    queryKey: ['bodyMeasurements'],
    queryFn: () => base44.entities.BodyMeasurement.list('-date', 50),
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['bodyGoals'],
    queryFn: () => base44.entities.BodyGoal.list('-created_date'),
  });

  const current = measurements[0] || {};
  const previous = measurements[1] || {};
  const baseline = measurements[measurements.length - 1] || {};
  const activeGoal = goals.find(g => g.is_active) || goals[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (current.weight && messages.length === 0) {
      generateInitialInsight();
    }
  }, [current.weight]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error('Speech recognition error');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    synthesisRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startMicAnimation = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const animate = () => {
        if (!isListening) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setMicLevel(average);
        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animate();
    } catch (error) {
      console.error('Mic animation error:', error);
    }
  };

  const stopMicAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setMicLevel(0);
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      stopMicAnimation();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        startMicAnimation();
        setIsListening(true);
      } else {
        toast.error('Speech recognition not supported');
      }
    }
  };

  const speak = (text) => {
    if (!audioEnabled || !synthesisRef.current) return;

    synthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    synthesisRef.current?.cancel();
    setIsSpeaking(false);
  };

  const generateInitialInsight = async () => {
    setIsLoading(true);
    try {
      const context = buildContext();
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${getSystemPrompt()}\n\nBased on the user's current data, provide an initial insight about their body status. Be supportive and specific.\n\nContext: ${JSON.stringify(context)}`
      });

      const message = { role: 'assistant', content: response };
      setMessages([message]);
      
      if (audioEnabled) {
        speak(response);
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const buildContext = () => {
    const weightChange = current.weight && baseline.weight ? current.weight - baseline.weight : 0;
    const waistChange = current.waist && baseline.waist ? current.waist - baseline.waist : 0;

    return {
      current: {
        weightKg: current.weight,
        heightCm: current.height,
        waistCm: current.waist,
        hipsCm: current.hips,
        chestCm: current.chest,
        bmi: current.bmi,
        waistToHeight: current.waist_height_ratio,
        bodyFatPercentage: current.body_fat_percentage
      },
      baseline: baseline.weight ? {
        weightKg: baseline.weight,
        waistCm: baseline.waist,
        date: baseline.date
      } : null,
      goal: activeGoal ? {
        targetWeightKg: activeGoal.target_weight,
        targetWaistCm: activeGoal.target_waist,
        targetDate: activeGoal.target_date,
        mainGoal: activeGoal.main_goal
      } : null,
      trend: {
        weightChangeKg: weightChange,
        waistChangeCm: waistChange,
        measurements: measurements.length
      }
    };
  };

  const getSystemPrompt = () => {
    return `You are DishCore AI Body Coach, part of the BioMath Core ecosystem.

Your job:
- Interpret body measurements (height, weight, waist, hips, chest, ratios) and their changes over time.
- Explain to the user in simple, calm language:
  - where they are now,
  - how far they are from their goals,
  - what has improved,
  - what needs attention.
- Always be supportive, realistic, and health-focused. No extreme advice, no crash diets.
- Use science-based principles, but keep language human and understandable.
- When possible, quantify changes.
- Encourage gradual, sustainable progress.

Be concise but thorough. Limit responses to 4-6 sentences unless more detail is specifically requested.`;
  };

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = buildContext();
      const chatHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${getSystemPrompt()}\n\nContext: ${JSON.stringify(context)}\n\nChat History:\n${chatHistory}\n\nUser: ${text}\n\nProvide a helpful, specific response:`
      });

      const assistantMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);

      if (audioEnabled) {
        speak(response);
      }
    } catch (error) {
      toast.error('Failed to get response');
    }
    setIsLoading(false);
  };

  const highlights = [];
  if (current.waist_height_ratio && previous.waist_height_ratio) {
    const improvement = ((previous.waist_height_ratio - current.waist_height_ratio) / previous.waist_height_ratio) * 100;
    if (improvement > 0) {
      highlights.push({
        text: `Waist-to-height ratio improved by ${improvement.toFixed(1)}%`,
        icon: TrendingUp,
        color: 'text-green-500'
      });
    }
  }

  if (current.weight && previous.weight) {
    const change = current.weight - previous.weight;
    if (Math.abs(change) < 0.5) {
      highlights.push({
        text: 'Weight trend is stable, no dangerous drops',
        icon: Activity,
        color: 'text-blue-500'
      });
    }
  }

  if (current.bmi && current.bmi >= 18.5 && current.bmi < 25) {
    highlights.push({
      text: 'BMI is in healthy range',
      icon: Heart,
      color: 'text-green-500'
    });
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  AI Body Coach
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Personal body composition advisor
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              style={{ borderColor: 'var(--border)' }}
            >
              {audioEnabled ? (
                <Volume2 className="w-4 h-4 mr-2 text-blue-500" />
              ) : (
                <VolumeX className="w-4 h-4 mr-2" />
              )}
              Voice {audioEnabled ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex gap-6 p-6">
          {/* Main Chat */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-6 mb-6">
              {/* Summary Card */}
              {current.weight && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="gradient-card border-0 p-6 rounded-3xl">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Weight</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                          {current.weight?.toFixed(1)} kg
                        </p>
                        {baseline.weight && (
                          <p className="text-sm text-green-500">
                            {(current.weight - baseline.weight).toFixed(1)} kg from start
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Waist</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                          {current.waist?.toFixed(0)} cm
                        </p>
                        {baseline.waist && (
                          <p className="text-sm text-orange-500">
                            {(current.waist - baseline.waist).toFixed(0)} cm from start
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Status</p>
                        <p className="text-2xl font-bold text-green-500">
                          {current.bmi < 25 ? 'Healthy' : 'Improving'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Quick Questions */}
              {messages.length === 0 && (
                <div className="grid md:grid-cols-2 gap-3">
                  {QUICK_QUESTIONS.map((question, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto py-3 px-4 text-left"
                        onClick={() => sendMessage(question)}
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <Sparkles className="w-4 h-4 mr-3 text-teal-500 flex-shrink-0" />
                        <span style={{ color: 'var(--text-secondary)' }}>{question}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Messages */}
              {messages.map((message, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <Card className={`max-w-3xl p-4 rounded-3xl ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0' 
                      : 'gradient-card border-0'
                  }`}>
                    <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert">
                      {message.content}
                    </ReactMarkdown>
                  </Card>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <Card className="gradient-card border-0 p-4 rounded-3xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                      <span style={{ color: 'var(--text-muted)' }}>Analyzing...</span>
                    </div>
                  </Card>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Voice Visualization */}
            {(isListening || isSpeaking) && (
              <div className="mb-4">
                <Card className="gradient-card border-0 p-4 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center relative ${
                      isListening ? 'bg-gradient-to-br from-red-400 to-red-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
                    } shadow-2xl`}>
                      <div className={`absolute inset-0 rounded-full ${
                        isListening ? 'bg-red-500' : 'bg-blue-500'
                      } opacity-50 animate-ping`} />
                      {isListening ? (
                        <Mic className="w-6 h-6 text-white relative z-10" />
                      ) : (
                        <Volume2 className="w-6 h-6 text-white relative z-10" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        {isListening ? '🎤 Listening...' : '🔊 Speaking...'}
                      </p>
                      <div className="flex gap-1 items-end h-8">
                        {[...Array(25)].map((_, i) => {
                          const height = isListening 
                            ? Math.max(10, Math.abs(Math.sin((i * 0.5) + (micLevel * 0.05))) * 100)
                            : Math.max(10, Math.sin(i * 0.3 + Date.now() * 0.01) * 40 + 50);
                          
                          return (
                            <div
                              key={i}
                              className={`flex-1 rounded-full transition-all duration-150 ${
                                isListening 
                                  ? 'bg-gradient-to-t from-red-500 to-red-300' 
                                  : 'bg-gradient-to-t from-blue-500 to-blue-300'
                              }`}
                              style={{
                                height: `${height}%`,
                                opacity: 0.6 + (height / 100) * 0.4
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {isSpeaking && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={stopSpeaking}
                        style={{ borderColor: 'var(--border)' }}
                      >
                        Stop
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVoiceInput}
                disabled={isLoading}
                className={isListening ? 'bg-gradient-to-br from-red-400 to-red-600 text-white border-0 shadow-lg animate-pulse' : ''}
                style={!isListening ? { borderColor: 'var(--border)' } : {}}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about your body measurements, progress, or goals..."
                disabled={isLoading}
                className="flex-1"
                style={{ 
                  background: 'var(--surface)', 
                  borderColor: 'var(--border)' 
                }}
              />

              <Button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className="gradient-accent text-white border-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Highlights Sidebar */}
          <div className="w-80 space-y-4">
            <Card className="gradient-card border-0 p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" 
                style={{ color: 'var(--text-primary)' }}>
                <Target className="w-5 h-5" />
                Key Highlights
              </h3>
              <div className="space-y-4">
                {highlights.length > 0 ? (
                  highlights.map((highlight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-2xl"
                      style={{ background: 'var(--background)' }}
                    >
                      <highlight.icon className={`w-5 h-5 ${highlight.color} flex-shrink-0 mt-0.5`} />
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {highlight.text}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                    Add more measurements to see insights
                  </p>
                )}
              </div>
            </Card>

            {activeGoal && (
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
                  Current Goal
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Target Weight</span>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {activeGoal.target_weight} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Target Waist</span>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {activeGoal.target_waist} cm
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}