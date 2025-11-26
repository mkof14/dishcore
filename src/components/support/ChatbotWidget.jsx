import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! How can I help you today? Ask me anything about DishCore!' }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [typingMessage, setTypingMessage] = useState('');
  const messagesEndRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: faqs = [] } = useQuery({
    queryKey: ['chatbot-faqs'],
    queryFn: () => base44.entities.ChatbotFAQ.filter({ is_active: true }),
  });

  const updateFAQMutation = useMutation({
    mutationFn: ({ id, helpful }) => {
      const faq = faqs.find(f => f.id === id);
      return base44.entities.ChatbotFAQ.update(id, {
        times_used: (faq.times_used || 0) + 1,
        helpful_count: helpful ? (faq.helpful_count || 0) + 1 : faq.helpful_count
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chatbot-faqs']);
    },
  });

  const findAnswer = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    // Try to match by keywords
    const matched = faqs.find(faq => 
      faq.keywords?.some(keyword => lowerQuestion.includes(keyword.toLowerCase())) ||
      lowerQuestion.includes(faq.question.toLowerCase())
    );

    return matched;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingMessage]);

  const speakText = (text) => {
    if (!isSoundEnabled || !('speechSynthesis' in window)) return;
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    if (isSpeaking) {
      stopSpeaking();
    }
  };

  const typeMessage = (text, callback) => {
    let index = 0;
    setTypingMessage('');
    const interval = setInterval(() => {
      if (index < text.length) {
        setTypingMessage(prev => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        setTypingMessage('');
        callback();
        if (isSoundEnabled) {
          speakText(text);
        }
      }
    }, 30);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');

    const answer = findAnswer(userInput);
    
    if (answer) {
      typeMessage(answer.answer, () => {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: answer.answer,
          faqId: answer.id
        }]);
      });
      updateFAQMutation.mutate({ id: answer.id, helpful: true });
    } else {
      const fallbackText = "I couldn't find an answer to that. Would you like to create a support ticket? Our team will help you!";
      typeMessage(fallbackText, () => {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: fallbackText
        }]);
      });
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording
      if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsRecording(false);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.start();
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50"
            style={{ 
              background: 'linear-gradient(135deg, #00A3E3, #0080FF)',
              border: 'none',
              pointerEvents: 'auto'
            }}
            aria-label="DishCore Assistant"
          >
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6917c77b0e566a8b7a19860e/dd7f3a395_Copilot_20251117_182213.png"
              alt="DishCore Assistant"
              className="w-8 h-8 object-contain"
            />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] rounded-3xl shadow-2xl z-50 flex flex-col"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', pointerEvents: 'auto' }}
          >
            {/* Header */}
            <div className="p-4 border-b rounded-t-3xl flex items-center justify-between"
              style={{ 
                background: 'linear-gradient(135deg, #00A3E3, #0080FF)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="flex items-center gap-2">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6917c77b0e566a8b7a19860e/dd7f3a395_Copilot_20251117_182213.png"
                  alt="DishCore Assistant"
                  className="w-5 h-5 object-contain"
                />
                <h3 className="font-bold text-white">DishCore Assistant</h3>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleSound}
                  className="text-white hover:opacity-80 transition-opacity relative p-1"
                >
                  {isSoundEnabled ? (
                    <>
                      <Volume2 className="w-5 h-5" />
                      {isSpeaking && (
                        <motion.div
                          className="absolute -right-0.5 -top-0.5"
                          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                        >
                          <div className="w-2 h-2 bg-green-400 rounded-full" />
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </motion.button>
                <button onClick={() => setIsOpen(false)} className="text-white hover:opacity-70 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'bot' && (
                    <div className="w-8 h-8 rounded-full mr-2 flex-shrink-0 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #00A3E3, #0080FF)' }}>
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6917c77b0e566a8b7a19860e/dd7f3a395_Copilot_20251117_182213.png"
                        alt="AI"
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                    style={msg.role === 'bot' ? { color: 'var(--text-primary)' } : {}}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    {msg.faqId && msg.role === 'bot' && (
                      <div className="flex gap-2 mt-2">
                        <button 
                          className="text-xs opacity-70 hover:opacity-100 transition-opacity"
                          onClick={() => updateFAQMutation.mutate({ id: msg.faqId, helpful: true })}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button 
                          className="text-xs opacity-70 hover:opacity-100 transition-opacity"
                          onClick={() => updateFAQMutation.mutate({ id: msg.faqId, helpful: false })}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {typingMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="w-8 h-8 rounded-full mr-2 flex-shrink-0 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #00A3E3, #0080FF)' }}>
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6917c77b0e566a8b7a19860e/dd7f3a395_Copilot_20251117_182213.png"
                      alt="AI"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <div className="max-w-[75%] p-3 rounded-2xl bg-gray-100 dark:bg-gray-800"
                    style={{ color: 'var(--text-primary)' }}>
                    <p className="text-sm whitespace-pre-wrap">{typingMessage}<span className="animate-pulse">|</span></p>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleRecording}
                  className={`p-3 rounded-xl transition-all ${
                    isRecording 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {isRecording ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <MicOff className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </motion.button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask anything..."
                  className="flex-1"
                  disabled={isRecording}
                />
                <Button 
                  onClick={handleSend} 
                  className="gradient-accent text-white border-0 px-6"
                  disabled={!input.trim() || isRecording}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {isRecording && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 mt-2 text-xs text-red-500"
                >
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ scaleY: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
                        className="w-1 h-3 bg-red-500 rounded-full"
                      />
                    ))}
                  </div>
                  Listening...
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}