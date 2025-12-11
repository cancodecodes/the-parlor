import { GameSession, GameState, Suspect } from '@/types/game';

const DEFAULT_SUSPECTS: Suspect[] = [
  {
    id: 'webb',
    name: 'Dr. Marcus Webb',
    relation: "Eleanor's ex-fiance",
    clue: 'Arrived angry',
    mentioned: false,
  },
  {
    id: 'clara',
    name: 'Clara Finch',
    relation: 'Childhood friend',
    clue: 'Left early, seemed nervous',
    mentioned: false,
  },
  {
    id: 'henry',
    name: 'Henry Vance',
    relation: 'Business partner',
    clue: 'Stayed late, alone with Eleanor',
    mentioned: false,
  },
];

// In-memory game state (for hackathon MVP)
let currentGame: GameSession | null = null;

export function createGame(): GameSession {
  currentGame = {
    id: crypto.randomUUID(),
    state: 'WAITING_TO_START',
    players: {
      player1: { id: 'player1', name: null, connected: false },
      player2: { id: 'player2', name: null, connected: false },
    },
    suspects: JSON.parse(JSON.stringify(DEFAULT_SUSPECTS)),
    revealedClues: [],
    currentTranscript: '',
    narratorText: '',
    accusedSuspect: null,
    gameResult: null,
    lastPlayerTurn: 'player2', // So player1 goes first
  };
  return currentGame;
}

export function getGame(): GameSession | null {
  return currentGame;
}

export function updateGameState(state: GameState): GameSession | null {
  if (currentGame) {
    currentGame.state = state;
  }
  return currentGame;
}

export function setPlayerName(
  playerId: 'player1' | 'player2',
  name: string
): GameSession | null {
  if (currentGame) {
    currentGame.players[playerId].name = name;
  }
  return currentGame;
}

export function setPlayerConnected(
  playerId: 'player1' | 'player2',
  connected: boolean
): GameSession | null {
  if (currentGame) {
    currentGame.players[playerId].connected = connected;
  }
  return currentGame;
}

export function addRevealedClue(clue: string): void {
  if (currentGame && !currentGame.revealedClues.includes(clue)) {
    currentGame.revealedClues.push(clue);
  }
}

export function markSuspectMentioned(suspectId: string): void {
  if (currentGame) {
    const suspect = currentGame.suspects.find((s) => s.id === suspectId);
    if (suspect) {
      suspect.mentioned = true;
    }
  }
}

export function setNarratorText(text: string): void {
  if (currentGame) {
    currentGame.narratorText = text;
  }
}

export function setCurrentTranscript(transcript: string): void {
  if (currentGame) {
    currentGame.currentTranscript = transcript;
  }
}

export function getNextPlayerTurn(): 'player1' | 'player2' {
  if (!currentGame) return 'player1';
  return currentGame.lastPlayerTurn === 'player1' ? 'player2' : 'player1';
}

export function setLastPlayerTurn(playerId: 'player1' | 'player2'): void {
  if (currentGame) {
    currentGame.lastPlayerTurn = playerId;
  }
}

export function setGameOver(won: boolean, accusedSuspect: string): void {
  if (currentGame) {
    currentGame.state = 'GAME_OVER';
    currentGame.gameResult = won ? 'won' : 'lost';
    currentGame.accusedSuspect = accusedSuspect;
  }
}

export function resetGame(): GameSession {
  return createGame();
}
