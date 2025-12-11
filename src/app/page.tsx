'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  async function startGame() {
    setIsStarting(true);
    try {
      await fetch('/api/game/start', { method: 'POST' });
      router.push('/game');
    } catch (error) {
      console.error('Failed to start game:', error);
      setIsStarting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 scene-mansion">
      <div className="text-center max-w-2xl">
        {/* Title */}
        <h1 className="text-6xl md:text-7xl font-serif text-amber-100 mb-2 tracking-wide">
          The Parlor
        </h1>
        <p className="text-amber-500/80 text-lg mb-8 italic">
          A Voice-Narrated Murder Mystery
        </p>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-16 bg-amber-700/50"></div>
          <span className="text-amber-600 text-2xl">&#9830;</span>
          <div className="h-px w-16 bg-amber-700/50"></div>
        </div>

        {/* Story teaser */}
        <div className="bg-gray-900/60 backdrop-blur rounded-lg p-6 mb-8 border border-amber-900/30">
          <p className="text-gray-300 leading-relaxed italic">
            &ldquo;A dinner party. A murder. Three suspects. Two detectives. One truth.&rdquo;
          </p>
          <p className="text-gray-400 text-sm mt-4">
            Interrogate Mrs. Hartwell using your voice to uncover who killed her daughter Eleanor.
          </p>
        </div>

        {/* How to play */}
        <div className="bg-gray-800/40 rounded-lg p-6 mb-8 text-left border border-gray-700/50">
          <h2 className="text-amber-400 font-serif text-xl mb-4 text-center">How to Play</h2>
          <ol className="text-gray-300 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-amber-500 font-bold">1.</span>
              <span>Open <code className="bg-gray-700/50 px-2 py-0.5 rounded text-amber-300">/p1</code> on Player 1&apos;s phone</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-500 font-bold">2.</span>
              <span>Open <code className="bg-gray-700/50 px-2 py-0.5 rounded text-amber-300">/p2</code> on Player 2&apos;s phone</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-500 font-bold">3.</span>
              <span>Display <code className="bg-gray-700/50 px-2 py-0.5 rounded text-amber-300">/game</code> on the main screen</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-500 font-bold">4.</span>
              <span>Take turns asking questions to solve the mystery!</span>
            </li>
          </ol>
        </div>

        {/* Start button */}
        <button
          onClick={startGame}
          disabled={isStarting}
          className="bg-amber-700 hover:bg-amber-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-serif text-xl py-4 px-12 rounded-lg transition-all duration-200 btn-press glow-amber"
        >
          {isStarting ? 'Starting...' : 'Begin Investigation'}
        </button>

        {/* Quick links */}
        <div className="mt-8 flex justify-center gap-6 text-sm">
          <a
            href="/game"
            className="text-gray-400 hover:text-amber-400 transition-colors"
          >
            Main Display &rarr;
          </a>
          <a
            href="/p1"
            className="text-gray-400 hover:text-amber-400 transition-colors"
          >
            Player 1 &rarr;
          </a>
          <a
            href="/p2"
            className="text-gray-400 hover:text-amber-400 transition-colors"
          >
            Player 2 &rarr;
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-gray-600 text-xs">
        Built for ElevenLabs Worldwide Hackathon 2025
      </footer>
    </div>
  );
}
