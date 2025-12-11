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
    recognition.continuous = true; // Keep listening until stopped
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
        // Stop listening after getting final result
        recognition.stop();
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

  // Toggle listening on/off
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current || disabled) return;

    if (isListening) {
      // Stop listening
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        setInterimTranscript('');
      } catch (error) {
        console.error('Failed to stop recognition:', error);
      }
    } else {
      // Start listening
      try {
        setIsListening(true);
        setInterimTranscript('');
        recognitionRef.current.start();
        onSpeechStart?.();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        setIsListening(false);
      }
    }
  }, [disabled, isListening, onSpeechStart]);

  return (
    <div className="flex flex-col items-center">
      {/* Mic button - TAP TO TOGGLE */}
      <button
        onClick={toggleListening}
        disabled={disabled}
        className={`
          w-36 h-36 rounded-full flex items-center justify-center
          transition-all duration-200 select-none
          ${disabled
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : isListening
              ? 'bg-red-600 scale-110 shadow-lg shadow-red-500/50 animate-pulse'
              : 'bg-amber-600 hover:bg-amber-500 active:scale-95'
          }
        `}
      >
        <div className="text-center">
          {isListening ? (
            // Mute icon (stop listening)
            <svg
              className="w-14 h-14 mx-auto mb-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
            </svg>
          ) : (
            // Mic icon (start listening)
            <svg
              className="w-14 h-14 mx-auto mb-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
          <span className="text-sm font-semibold">
            {disabled ? 'WAIT' : isListening ? 'TAP TO STOP' : 'TAP TO SPEAK'}
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

      {/* Listening indicator */}
      {isListening && (
        <p className="mt-2 text-red-400 text-xs animate-pulse">
          🔴 Listening... tap to stop
        </p>
      )}
    </div>
  );
}
