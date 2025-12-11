'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import NarratorDisplay from '@/components/game/NarratorDisplay';
import SuspectBar from '@/components/game/SuspectBar';
import PlayerStatus from '@/components/game/PlayerStatus';
import SceneImage from '@/components/game/SceneImage';
import AccusationButton from '@/components/game/AccusationButton';

// Predefined narrator lines
const NARRATOR_LINES = {
  intro: "Welcome to The Parlor. I am Mrs. Hartwell. Thank you for coming on such short notice.",
  ask_p1_name: "Now then... what is your name, detective?",
  ask_p2_name: "A pleasure. And you, the other detective... your name?",
  murder_reveal: "Detectives, I must tell you why I've summoned you. My daughter Eleanor... was found dead in the garden this morning. Her throat... slit with a kitchen knife from my own kitchen. Last night, I hosted a dinner party. Three guests attended. I believe one of them killed my daughter. Dr. Marcus Webb, Eleanor's former fiance. Clara Finch, her childhood friend. And Henry Vance, my late husband's business partner. Please... help me find the monster who did this.",
  game_won: "Justice has been served. Dr. Webb will pay for what he has done to my Eleanor. Thank you, detectives. Thank you.",
  game_lost: "No... that cannot be right. Please, detectives, think again. The killer still walks free.",
};

export default function GamePage() {
  const {
    game,
    isConnected,
    narratorText,
    isNarratorSpeaking,
    currentPlayerInput,
    gameOver,
    won,
    narratorAction,
    setNarratorSpeaking,
    clearNarratorAction,
  } = useGame();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [displayText, setDisplayText] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showAccusationModal, setShowAccusationModal] = useState(false);
  const [lastPlayerInputs, setLastPlayerInputs] = useState<{
    player1?: string;
    player2?: string;
  }>({});

  // Track player inputs
  useEffect(() => {
    if (currentPlayerInput) {
      setLastPlayerInputs((prev) => ({
        ...prev,
        [currentPlayerInput.playerId]: currentPlayerInput.text,
      }));
    }
  }, [currentPlayerInput]);

  // Play TTS audio
  const playNarratorAudio = useCallback(async (text: string) => {
    if (isPlayingAudio) return;

    setIsPlayingAudio(true);
    setNarratorSpeaking(true);
    setDisplayText(text);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('TTS failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('TTS playback failed:', error);
      // Still show text even if audio fails
      setIsPlayingAudio(false);
      setNarratorSpeaking(false);
    }
  }, [isPlayingAudio, setNarratorSpeaking]);

  // Handle audio end
  const handleAudioEnd = useCallback(async () => {
    setIsPlayingAudio(false);
    setNarratorSpeaking(false);

    // Determine next action based on current state
    let nextAction = '';
    if (game?.state === 'NARRATOR_INTRO') {
      nextAction = 'ask_p1_name';
    } else if (game?.state === 'ASKING_PLAYER1_NAME' && game.players.player1.name) {
      nextAction = 'ask_p2_name';
    } else if (game?.state === 'ASKING_PLAYER2_NAME' && game.players.player2.name) {
      nextAction = 'start_investigation';
    }

    // Notify server narrator finished
    await fetch('/api/game/narrator-finished', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nextAction }),
    });
  }, [game?.state, game?.players, setNarratorSpeaking]);

  // Handle narrator actions
  useEffect(() => {
    if (!narratorAction) return;

    if (narratorAction === 'murder_reveal') {
      playNarratorAudio(NARRATOR_LINES.murder_reveal);
      clearNarratorAction();
    }
  }, [narratorAction, playNarratorAudio, clearNarratorAction]);

  // Handle game state changes for automatic narration
  useEffect(() => {
    if (!game || isPlayingAudio) return;

    if (game.state === 'NARRATOR_INTRO' && !displayText) {
      playNarratorAudio(NARRATOR_LINES.intro);
    } else if (game.state === 'ASKING_PLAYER1_NAME' && displayText === NARRATOR_LINES.intro) {
      playNarratorAudio(NARRATOR_LINES.ask_p1_name);
    } else if (game.state === 'ASKING_PLAYER2_NAME' && game.players.player1.name && !displayText.includes('other detective')) {
      playNarratorAudio(NARRATOR_LINES.ask_p2_name);
    }
  }, [game?.state, game?.players, isPlayingAudio, displayText, playNarratorAudio]);

  // Handle narrator response from player questions
  useEffect(() => {
    if (narratorText && narratorText !== displayText) {
      playNarratorAudio(narratorText);
    }
  }, [narratorText, displayText, playNarratorAudio]);

  // Determine scene based on game state
  const getScene = (): 'mansion' | 'garden' | 'parlor' => {
    if (gameOver) return 'garden';
    if (game?.state === 'NARRATOR_INTRO') return 'mansion';
    return 'parlor';
  };

  // Loading state
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center scene-mansion">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-amber-100 mb-4">The Parlor</h1>
          <p className="text-gray-400">Connecting...</p>
        </div>
      </div>
    );
  }

  // Waiting for game to start
  if (!game || game.state === 'WAITING_TO_START') {
    return (
      <div className="min-h-screen flex items-center justify-center scene-mansion">
        <div className="text-center">
          <h1 className="text-5xl font-serif text-amber-100 mb-4">The Parlor</h1>
          <p className="text-gray-400 mb-8">Waiting for game to start...</p>
          <p className="text-amber-500/60 text-sm">
            Press START on the landing page to begin
          </p>
        </div>
      </div>
    );
  }

  // Game over screen
  if (gameOver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center scene-garden p-6">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl font-serif text-amber-100 mb-6">
            {won ? 'Case Solved!' : 'Investigation Failed'}
          </h1>

          <div className="bg-gray-800/60 rounded-lg p-8 mb-8 border border-amber-900/30">
            <NarratorDisplay
              text={displayText || (won ? NARRATOR_LINES.game_won : NARRATOR_LINES.game_lost)}
              isAnimating={false}
            />
          </div>

          {won && (
            <div className="text-green-400 text-xl mb-4">
              🎉 Dr. Marcus Webb has been arrested!
            </div>
          )}

          <a
            href="/"
            className="inline-block bg-amber-700 hover:bg-amber-600 text-white font-serif py-3 px-8 rounded-lg transition-colors"
          >
            Play Again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 scene-mansion">
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        className="hidden"
      />

      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-serif text-amber-100">The Parlor</h1>
        <p className="text-amber-500/60 text-sm">A Murder Mystery</p>
      </header>

      {/* Scene */}
      <SceneImage scene={getScene()} />

      {/* Narrator */}
      <NarratorDisplay
        text={displayText}
        isAnimating={isNarratorSpeaking}
      />

      {/* Suspects */}
      {game.suspects && <SuspectBar suspects={game.suspects} />}

      {/* Player statuses */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <PlayerStatus
          player={game.players.player1}
          isCurrentTurn={game.state === 'PLAYER_1_TURN' || game.state === 'ASKING_PLAYER1_NAME'}
          lastInput={lastPlayerInputs.player1}
          playerNumber={1}
        />
        <PlayerStatus
          player={game.players.player2}
          isCurrentTurn={game.state === 'PLAYER_2_TURN' || game.state === 'ASKING_PLAYER2_NAME'}
          lastInput={lastPlayerInputs.player2}
          playerNumber={2}
        />
      </div>

      {/* Accusation button */}
      {(game.state === 'PLAYER_1_TURN' || game.state === 'PLAYER_2_TURN') && (
        <AccusationButton
          disabled={isNarratorSpeaking}
          onClick={() => setShowAccusationModal(true)}
        />
      )}

      {/* Accusation modal */}
      {showAccusationModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-amber-900/50">
            <h2 className="text-2xl font-serif text-amber-100 mb-4">Make Your Accusation</h2>
            <p className="text-gray-400 mb-6">
              Use your phone to speak the name of the murderer, or say &ldquo;I accuse [name]&rdquo;
            </p>
            <button
              onClick={() => setShowAccusationModal(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Status indicator */}
      <div className="fixed bottom-4 right-4 text-xs text-gray-600">
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
    </div>
  );
}
