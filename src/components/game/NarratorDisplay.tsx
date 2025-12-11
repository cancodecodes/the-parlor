'use client';

import { useState, useEffect } from 'react';

interface NarratorDisplayProps {
  text: string;
  isAnimating: boolean;
}

export default function NarratorDisplay({ text, isAnimating }: NarratorDisplayProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      return;
    }

    if (isAnimating) {
      // Typewriter effect
      let index = 0;
      setDisplayedText('');

      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText((prev) => prev + text[index]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 30);

      return () => clearInterval(interval);
    } else {
      setDisplayedText(text);
    }
  }, [text, isAnimating]);

  if (!text && !displayedText) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 my-6 border border-amber-900/30">
      <div className="flex items-start gap-4">
        {/* Narrator portrait */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-900/50 to-gray-800 flex items-center justify-center flex-shrink-0 border-2 border-amber-700/50">
          <span className="text-3xl">👵</span>
        </div>

        {/* Text content */}
        <div className="flex-1">
          <h3 className="text-amber-400 font-serif text-lg mb-2">Mrs. Hartwell</h3>
          <p className="text-gray-200 leading-relaxed italic text-lg">
            &ldquo;{displayedText}&rdquo;
            {isAnimating && displayedText.length < text.length && (
              <span className="cursor-blink ml-1">|</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
