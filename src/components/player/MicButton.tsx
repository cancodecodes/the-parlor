'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface MicButtonProps {
  disabled: boolean;
  onSpeechResult: (text: string) => void;
  onSpeechStart?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionType = any;

export default function MicButton({ disabled, onSpeechResult, onSpeechStart }: MicButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionType>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const windowWithSpeech = window as any;
    const SpeechRecognitionClass = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      console.warn('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);

      if (final) {
        onSpeechResult(final.trim());
        setInterimTranscript('');
        setIsListening(false);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [onSpeechResult]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || disabled) return;

    try {
      setIsListening(true);
      setInterimTranscript('');
      recognitionRef.current.start();
      onSpeechStart?.();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);
    }
  }, [disabled, onSpeechStart]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Failed to stop recognition:', error);
    }
  }, [isListening]);

  return (
    <div className="flex flex-col items-center">
      {/* Mic button */}
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          startListening();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          stopListening();
        }}
        onMouseDown={startListening}
        onMouseUp={stopListening}
        onMouseLeave={stopListening}
        disabled={disabled}
        className={`
          w-36 h-36 rounded-full flex items-center justify-center
          transition-all duration-200 select-none touch-none
          ${disabled
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : isListening
              ? 'bg-red-600 scale-110 shadow-lg shadow-red-500/50 animate-pulse'
              : 'bg-amber-600 hover:bg-amber-500 active:scale-95'
          }
        `}
      >
        <div className="text-center">
          <svg
            className="w-14 h-14 mx-auto mb-2"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
          <span className="text-sm font-semibold">
            {disabled ? 'WAIT' : isListening ? 'LISTENING...' : 'HOLD TO TALK'}
          </span>
        </div>
      </button>

      {/* Interim transcript */}
      {interimTranscript && (
        <div className="mt-4 px-4 py-2 bg-gray-800/50 rounded-lg max-w-xs">
          <p className="text-gray-400 text-sm italic text-center">
            {interimTranscript}...
          </p>
        </div>
      )}
    </div>
  );
}
