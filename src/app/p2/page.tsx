'use client';

import { useState, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import MicButton from '@/components/player/MicButton';
import TextFallback from '@/components/player/TextFallback';
import TurnIndicator from '@/components/player/TurnIndicator';
import TranscriptDisplay from '@/components/player/TranscriptDisplay';

export default function Player2Page() {
  const playerId = 'player2' as const;
  const { game, isConnected, isNarratorSpeaking, gameOver, won } = useGame();
  const [transcript, setTranscript] = useState('');
  const [isSending, setIsSending] = useState(false);

  const isMyTurn = game?.state === 'PLAYER_2_TURN' || game?.state === 'ASKING_PLAYER2_NAME';
  const isNamePhase = game?.state === 'ASKING_PLAYER2_NAME';
  const canSpeak = isMyTurn && !isNarratorSpeaking && !isSending;

  const submitInput = useCallback(async (text: string, isAccusation = false) => {
    if (!text.trim() || isSending) return;

    setIsSending(true);
    setTranscript(text);

    try {
      await fetch('/api/game/player-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          text,
          isAccusation,
          isNameResponse: isNamePhase,
        }),
      });
    } catch (error) {
      console.error('Failed to submit input:', error);
    } finally {
      setIsSending(false);
    }
  }, [isSending, isNamePhase]);

  const handleSpeechResult = useCallback((text: string) => {
    // Check if it's an accusation
    const isAccusation = /accuse|guilty|murderer|killer/i.test(text);
    submitInput(text, isAccusation);
  }, [submitInput]);

  // Not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-amber-100 mb-4">The Parlor</h1>
          <p className="text-gray-400">Connecting to game...</p>
        </div>
      </div>
    );
  }

  // Waiting for game
  if (!game || game.state === 'WAITING_TO_START') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-amber-100 mb-4">The Parlor</h1>
          <p className="text-amber-500 mb-2">Player 2</p>
          <p className="text-gray-400">Waiting for game to start...</p>
          <p className="text-gray-600 text-sm mt-4">
            The host will start the game from the main display
          </p>
        </div>
      </div>
    );
  }

  // Game over
  if (gameOver) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-serif text-amber-100 mb-4">
            {won ? 'Case Solved!' : 'Mystery Remains...'}
          </h1>
          <div className="text-6xl mb-6">{won ? '🎉' : '🔍'}</div>
          <p className="text-gray-400 mb-6">
            {won
              ? 'Justice has been served!'
              : 'The investigation continues...'}
          </p>
          <a
            href="/"
            className="inline-block bg-amber-700 hover:bg-amber-600 text-white py-2 px-6 rounded-lg transition-colors"
          >
            Play Again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col">
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-2xl font-serif text-amber-100">The Parlor</h1>
        <p className="text-amber-500/80 text-sm">
          Player 2: {game.players.player2.name || 'Detective'}
        </p>
      </header>

      {/* Turn Indicator */}
      <TurnIndicator
        isMyTurn={isMyTurn}
        isNarratorSpeaking={isNarratorSpeaking}
        waitingMessage={
          game.state === 'ASKING_PLAYER1_NAME'
            ? 'Player 1 is introducing themselves'
            : game.state === 'PLAYER_1_TURN'
            ? 'Player 1 is asking a question'
            : undefined
        }
        isNamePhase={isNamePhase}
      />

      {/* Main interaction area */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <MicButton
          disabled={!canSpeak}
          onSpeechResult={handleSpeechResult}
        />
      </div>

      {/* Text fallback */}
      <div className="mb-4">
        <p className="text-gray-500 text-xs text-center mb-2">
          Or type your {isNamePhase ? 'name' : 'question'}:
        </p>
        <TextFallback
          disabled={!canSpeak}
          onSubmit={(text) => submitInput(text, false)}
          placeholder={isNamePhase ? "Enter your name..." : "Type your question..."}
        />
      </div>

      {/* Last transcript */}
      {transcript && <TranscriptDisplay text={transcript} />}

      {/* Status bar */}
      <div className="mt-4 flex justify-between text-xs text-gray-600">
        <span>{isConnected ? '🟢 Connected' : '🔴 Disconnected'}</span>
        <span>State: {game.state}</span>
      </div>
    </div>
  );
}
