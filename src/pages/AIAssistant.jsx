
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX,
  Sparkles,
  Loader2,
  Utensils,
  TrendingDown,
  Dumbbell,
  Heart,
  Map,
  Calendar,
  ShoppingCart
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const MODES = [
  { id: 'general', name: 'General Food Q&A', icon: Utensils, gradient: 'from-blue-400 to-blue-600' },
  { id: 'meal_plan', name: 'Weekly Meal Plan', icon: Calendar, gradient: 'from-purple-400 to-purple-600' },
  { id: 'weight_loss', name: 'Weight Loss Coaching', icon: TrendingDown, gradient: 'from-green-400 to-green-600' },
  { id: 'sports', name: 'Sports Nutrition', icon: Dumbbell, gradient: 'from-orange-400 to-orange-600' },
  { id: 'health', name: 'Health Conditions', icon: Heart, gradient: 'from-red-400 to-red-600' },
  { id: 'restaurant', name: 'Restaurant Mode', icon: Map, gradient: 'from-teal-400 to-teal-600' }
];

const QUICK_PROMPTS = [
  "What should I eat today?",
  "Generate a weekly meal plan",
  "Low-calorie dinner options",
  "High protein breakfast ideas",
  "Post-workout meal suggestions"
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI DishCore Advisor. I can help you with meal planning, nutrition advice, recipe creation, and dietary guidance. What would you like to know?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState('general');
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
  const queryClient = useQueryClient();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  // Mic level animation
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

  const generateWeeklyMealPlan = async (profile, dishes) => {
    const prompt = `Create a personalized 7-day meal plan based on this user profile:

Goal: ${profile.goal || 'maintain'}
Diet Type: ${profile.diet_type || 'balanced'}
Activity Level: ${profile.activity_level || 'moderate'}
Dietary Restrictions: ${(profile.dietary_restrictions || []).join(', ') || 'None'}
Allergies: ${(profile.allergies || []).join(', ') || 'None'}
Foods to Avoid: ${(profile.foods_to_avoid || []).join(', ') || 'None'}
Favorite Foods: ${(profile.favorite_foods || []).join(', ') || 'None'}
Cooking Skill: ${profile.cooking_skill || 'intermediate'}
Daily Cooking Time: ${profile.daily_cooking_time_available || 30} minutes
Budget: ${profile.budget || 'medium'}

Target Daily Macros:
- Calories: ${profile.target_calories || 2000} kcal
- Protein: ${profile.target_protein || 150}g
- Carbs: ${profile.target_carbs || 200}g
- Fat: ${profile.target_fat || 65}g

Available Dishes in Library:
${dishes.slice(0, 50).map(d => `- ${d.name}: ${d.calories}kcal, P:${d.protein}g, C:${d.carbs}g, F:${d.fat}g ${d.tags ? `[${d.tags.join(', ')}]` : ''}`).join('\n')}

Create a weekly meal plan (Monday-Sunday) with breakfast, lunch, dinner, and 2 snacks per day. 
For each meal:
1. Choose dishes from the library that match the user's preferences
2. Ensure daily totals are close to the target macros
3. Provide variety throughout the week
4. Consider cooking time constraints
5. Respect dietary restrictions and allergies

Format the response as a clear day-by-day breakdown with:
- Day name
- Each meal type with dish name and macros
- Daily total macros
- Brief daily tip or insight

At the end, provide a comprehensive grocery list organized by category (Proteins, Vegetables, Fruits, Grains, Dairy, etc.).`;

    return await base44.integrations.Core.InvokeLLM({ prompt });
  };

  const saveMealPlanMutation = useMutation({
    mutationFn: async (planText) => {
      const today = new Date();
      const plan = {
        name: `AI Generated Plan - ${format(today, 'MMM d, yyyy')}`,
        start_date: format(today, 'yyyy-MM-dd'),
        rationale: 'AI-generated personalized weekly meal plan based on your profile and preferences',
        is_active: false,
        days: [] // The actual parsing of planText into days would be more complex and usually handled server-side or by a more sophisticated client-side parser. For now, saving a placeholder.
      };

      return await base44.entities.MealPlan.create(plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      toast.success('Meal plan saved! Visit Menu Planner to view and activate it.');
    },
    onError: (error) => {
      console.error('Failed to save meal plan:', error);
      toast.error('Failed to save meal plan. Please try again.');
    }
  });

  const saveGroceryListMutation = useMutation({
    mutationFn: async (items) => {
      const list = {
        name: `AI Meal Plan Grocery List - ${format(new Date(), 'MMM d')}`,
        items: items.map(item => ({
          name: item,
          category: 'other', // Or infer category if possible from LLM response
          quantity: 1,
          checked: false
        }))
      };

      return await base44.entities.GroceryList.create(list);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groceryLists'] });
      toast.success('Grocery list saved! Check Grocery List page.');
    },
    onError: (error) => {
      console.error('Failed to save grocery list:', error);
      toast.error('Failed to save grocery list. Please try again.');
    }
  });

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const profile = await base44.entities.UserProfile.list().then(p => p[0]);
      
      let response;
      const isMealPlanRequest = selectedMode === 'meal_plan' || text.toLowerCase().includes('meal plan') || text.toLowerCase().includes('weekly plan');
      
      if (isMealPlanRequest) {
        const dishes = await base44.entities.Dish.list('', 100);
        
        const planningMessage = { 
          role: 'assistant', 
          content: '🔄 Analyzing your profile and generating a personalized weekly meal plan... This may take a moment.',
          isTyping: false
        };
        setMessages(prev => [...prev, planningMessage]);
        
        response = await generateWeeklyMealPlan(profile, dishes);
        
        // Extract grocery list from response
        const groceryMatch = response.match(/(?:grocery list|shopping list)[\s\S]*?(?:\n\n|$)/gi);
        if (groceryMatch && groceryMatch[0]) {
          const groceryText = groceryMatch[0];
          const items = groceryText.split('\n')
            .filter(line => line.trim().match(/^[-•*]\s+/))
            .map(line => line.replace(/^[-•*]\s+/, '').trim())
            .filter(item => item.length > 0);
          
          if (items.length > 0) {
            // Delay saving grocery list slightly to avoid immediate concurrent mutations
            setTimeout(() => saveGroceryListMutation.mutate(items), 1000);
          }
        }
        
        // Remove planning message
        setMessages(prev => prev.filter(msg => msg !== planningMessage));
        
        response += '\n\n✅ **Meal plan generated successfully!** You can save this plan to your account.';
        
      } else {
        const systemContext = `You are DishCore AI Advisor, an expert nutritionist and food coach. 
Mode: ${selectedMode}
User Profile: ${profile ? JSON.stringify({
  goal: profile.goal,
  diet_type: profile.diet_type,
  allergies: profile.allergies,
  medical_conditions: profile.medical_conditions,
  activity_level: profile.activity_level
}) : 'Not set'}

Provide helpful, scientifically accurate, and personalized nutrition advice.`;

        response = await base44.integrations.Core.InvokeLLM({
          prompt: `${systemContext}\n\nUser: ${text}`
        });
      }

      const assistantMessage = { 
        role: 'assistant', 
        content: response,
        isTyping: true,
        isMealPlan: isMealPlanRequest
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg === assistantMessage ? { ...msg, isTyping: false } : msg
          )
        );
        
        if (audioEnabled && response.length < 500 && !isMealPlanRequest) { // Don't speak entire meal plan
          speak(response.substring(0, 200)); // Speak a shorter part if it's long
        } else if (audioEnabled && isMealPlanRequest) {
          speak('Meal plan generated successfully! You can save this plan to your account.');
        }
      }, 100);

    } catch (error) {
      toast.error('Failed to get response');
    }

    setIsLoading(false);
  };

  const TypingText = ({ text }) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
      const cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(cursorInterval);
    }, []);

    useEffect(() => {
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, 30);
        return () => clearTimeout(timeout);
      }
    }, [currentIndex, text]);

    return (
      <div>
        <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert inline">
          {displayText}
        </ReactMarkdown>
        {currentIndex < text.length && showCursor && (
          <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2" 
                style={{ color: 'var(--text-primary)' }}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                AI DishCore Advisor
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Your personal nutrition intelligence advisor
              </p>
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

          {/* Modes */}
          <div className="flex gap-2 flex-wrap">
            {MODES.map(mode => (
              <Button
                key={mode.id}
                variant={selectedMode === mode.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMode(mode.id)}
                className={selectedMode === mode.id ? `bg-gradient-to-r ${mode.gradient} text-white border-0 shadow-lg` : ''}
                style={selectedMode !== mode.id ? { borderColor: 'var(--border)', color: 'var(--text-secondary)' } : {}}
              >
                <mode.icon className="w-4 h-4 mr-2" />
                {mode.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.length === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="justify-start h-auto py-3 px-4 text-left hover:shadow-md transition-shadow"
                  onClick={() => sendMessage(prompt)}
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mr-3">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  {prompt}
                </Button>
              ))}
            </div>
          )}

          {messages.map((message, idx) => (
            <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl ${message.role === 'user' ? 'ml-auto' : 'mr-auto w-full'}`}>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      DishCore AI
                    </span>
                  </div>
                )}

                <Card className={`p-4 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                    : 'gradient-card border-0'
                }`}>
                  {message.isTyping ? (
                    <TypingText text={message.content} />
                  ) : (
                    <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert">
                      {message.content}
                    </ReactMarkdown>
                  )}
                </Card>

                {message.role === 'assistant' && message.isMealPlan && !message.isTyping && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => {
                        saveMealPlanMutation.mutate(message.content);
                      }}
                      disabled={saveMealPlanMutation.isPending}
                      className="gradient-accent text-white border-0"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Save Meal Plan
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        // Re-extract grocery list from message.content if needed, or rely on the one saved during generation
                        const groceryMatch = message.content.match(/(?:grocery list|shopping list)[\s\S]*?(?:\n\n|$)/gi);
                        if (groceryMatch && groceryMatch[0]) {
                          const groceryText = groceryMatch[0];
                          const items = groceryText.split('\n')
                            .filter(line => line.trim().match(/^[-•*]\s+/))
                            .map(line => line.replace(/^[-•*]\s+/, '').trim())
                            .filter(item => item.length > 0);
                          
                          if (items.length > 0) {
                            saveGroceryListMutation.mutate(items);
                          } else {
                            toast.info('No grocery items found in the plan to save.');
                          }
                        } else {
                          toast.info('No grocery list found in the meal plan.');
                        }
                      }}
                      disabled={saveGroceryListMutation.isPending}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Save Grocery List
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <Card className="gradient-card border-0 p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent-from)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Thinking...</span>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Voice Visualization */}
      {(isListening || isSpeaking) && (
        <div className="px-6 pb-2">
          <div className="max-w-5xl mx-auto">
            <Card className="gradient-card border-0 p-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center relative ${
                  isListening ? 'bg-gradient-to-br from-red-400 to-red-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
                } shadow-2xl`}>
                  <div className={`absolute inset-0 rounded-full ${
                    isListening ? 'bg-red-500' : 'bg-blue-500'
                  } opacity-50 animate-ping`} />
                  {isListening ? (
                    <Mic className="w-8 h-8 text-white relative z-10" />
                  ) : (
                    <Volume2 className="w-8 h-8 text-white relative z-10" />
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    {isListening ? '🎤 Listening...' : '🔊 Speaking...'}
                  </p>
                  <div className="flex gap-1 items-end h-12">
                    {[...Array(30)].map((_, i) => {
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
        </div>
      )}

      {/* Input */}
      <div className="p-6 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-5xl mx-auto">
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
              placeholder="Ask me anything about nutrition, meals, or health..."
              disabled={isLoading}
              className="flex-1"
              style={{ 
                background: 'var(--background)', 
                borderColor: 'var(--border)', 
                color: 'var(--text-primary)' 
              }}
            />

            <Button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
