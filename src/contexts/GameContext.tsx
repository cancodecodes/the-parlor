'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { getPusherClient } from '@/lib/pusher/client';
import { GameSession, GameState } from '@/types/game';

interface PlayerInputEvent {
  playerId: 'player1' | 'player2';
  text: string;
  isAccusation?: boolean;
  isNameResponse?: boolean;
}

interface NarratorResponseEvent {
  text: string;
  nextState: GameState;
  gameOver: boolean;
  won: boolean | null;
}

interface GameContextType {
  game: GameSession | null;
  isConnected: boolean;
  narratorText: string;
  isNarratorSpeaking: boolean;
  currentPlayerInput: PlayerInputEvent | null;
  gameOver: boolean;
  won: boolean | null;
  narratorAction: string | null;
  setNarratorSpeaking: (speaking: boolean) => void;
  clearNarratorAction: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<GameSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [narratorText, setNarratorText] = useState('');
  const [isNarratorSpeaking, setIsNarratorSpeaking] = useState(false);
  const [currentPlayerInput, setCurrentPlayerInput] = useState<PlayerInputEvent | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState<boolean | null>(null);
  const [narratorAction, setNarratorAction] = useState<string | null>(null);

  const clearNarratorAction = useCallback(() => {
    setNarratorAction(null);
  }, []);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe('parlor-game');

    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true);
    });

    channel.bind('game-state', (data: { state: GameState; game: GameSession }) => {
      setGame(data.game);
      if (data.state === 'NARRATOR_SPEAKING') {
        setIsNarratorSpeaking(true);
      }
    });

    channel.bind('narrator-response', (data: NarratorResponseEvent) => {
      setNarratorText(data.text);
      setIsNarratorSpeaking(true);
      if (data.gameOver) {
        setGameOver(true);
        setWon(data.won);
      }
    });

    channel.bind('player-input', (data: PlayerInputEvent) => {
      setCurrentPlayerInput(data);
    });

    channel.bind('narrator-finished', () => {
      setIsNarratorSpeaking(false);
    });

    channel.bind('narrator-action', (data: { action: string }) => {
      setNarratorAction(data.action);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe('parlor-game');
    };
  }, []);

  const setNarratorSpeakingCallback = useCallback((speaking: boolean) => {
    setIsNarratorSpeaking(speaking);
  }, []);

  return (
    <GameContext.Provider
      value={{
        game,
        isConnected,
        narratorText,
        isNarratorSpeaking,
        currentPlayerInput,
        gameOver,
        won,
        narratorAction,
        setNarratorSpeaking: setNarratorSpeakingCallback,
        clearNarratorAction,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
