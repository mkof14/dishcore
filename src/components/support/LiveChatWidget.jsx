import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Live Chat Widget
 * Placeholder for real chat integration (Intercom/Crisp/Tidio)
 * Can be replaced with actual widget script on Vercel
 */
export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! 👋 How can we help you today?",
      sender: "support",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  // Initialize real chat widget when deployed
  useEffect(() => {
    // Example: Load Intercom/Crisp script
    // if (window.Intercom) {
    //   window.Intercom('boot', {
    //     app_id: 'YOUR_APP_ID',
    //   });
    // }
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // Simulate response (replace with real API call)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Thanks for your message! Our team will respond shortly.",
        sender: "support",
        timestamp: new Date(),
      }]);
    }, 1000);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // if (window.Intercom) {
    //   window.Intercom(isOpen ? 'hide' : 'show');
    // }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={toggleChat}
          className="w-16 h-16 rounded-full bg-white border-0 shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
          style={{ boxShadow: '0 8px 30px rgba(0, 163, 227, 0.4)' }}
        >
          {isOpen ? (
            <X className="w-6 h-6" style={{ color: '#00A3E3' }} />
          ) : (
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6917c77b0e566a8b7a19860e/0490b88eb_Copilot_20251117_183905.png"
              alt="DishCore Support"
              className="w-12 h-12 object-contain"
            />
          )}
        </button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="gradient-card border-0 rounded-3xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="gradient-accent p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1">
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6917c77b0e566a8b7a19860e/0490b88eb_Copilot_20251117_183905.png"
                        alt="DishCore"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold">DishCore Support</h3>
                      <p className="text-xs opacity-90">We typically reply in a few minutes</p>
                    </div>
                  </div>
                  <button onClick={toggleChat} className="hover:bg-white/10 rounded-full p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-3" style={{ background: 'var(--background)' }}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'gradient-accent text-white'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                  />
                  <Button
                    onClick={handleSend}
                    className="gradient-accent text-white border-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
                  Powered by DishCore Support
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}