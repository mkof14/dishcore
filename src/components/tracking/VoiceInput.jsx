import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function VoiceInput({ onFoodDetected }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Listening... Speak now!');
    };

    recognition.onresult = async (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      setIsListening(false);
      setProcessing(true);

      try {
        // Use AI to parse the speech input
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Parse this food description and extract nutrition information. Return JSON with: name, calories, protein, carbs, fat, portion_size.
          
User said: "${speechResult}"

Be intelligent about portions and typical serving sizes. If user says "chicken breast", assume ~200g. If they say "small apple", assume ~150g.`,
          response_json_schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              portion_size: { type: "string" },
              calories: { type: "number" },
              protein: { type: "number" },
              carbs: { type: "number" },
              fat: { type: "number" }
            }
          }
        });

        if (onFoodDetected && result) {
          onFoodDetected(result);
          toast.success(`Added: ${result.name}`);
        }
      } catch (error) {
        console.error('Voice parsing failed:', error);
        toast.error('Could not understand. Try again?');
      } finally {
        setProcessing(false);
        setTranscript('');
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast.error('Could not hear you. Try again?');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={isListening ? stopListening : startListening}
        disabled={processing}
        className={`w-16 h-16 rounded-full ${
          isListening ? 'gradient-accent animate-pulse' : 'btn-secondary'
        }`}
      >
        {processing ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isListening ? (
          <Mic className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </Button>
      {transcript && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          "{transcript}"
        </p>
      )}
      {isListening && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Listening...
        </p>
      )}
    </div>
  );
}