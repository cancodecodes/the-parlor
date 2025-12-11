'use client';

import { useState } from 'react';

interface TextFallbackProps {
  disabled: boolean;
  onSubmit: (text: string) => void;
  placeholder?: string;
}

export default function TextFallback({ disabled, onSubmit, placeholder }: TextFallbackProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          placeholder={placeholder || "Type your question..."}
          className={`
            flex-1 px-4 py-3 rounded-lg bg-gray-800 border
            ${disabled
              ? 'border-gray-700 text-gray-500 cursor-not-allowed'
              : 'border-gray-600 text-white focus:border-amber-500 focus:outline-none'
            }
          `}
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className={`
            px-6 py-3 rounded-lg font-medium transition-colors
            ${disabled || !text.trim()
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-amber-600 text-white hover:bg-amber-500'
            }
          `}
        >
          Send
        </button>
      </div>
    </form>
  );
}
