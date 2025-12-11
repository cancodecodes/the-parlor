export type GameState =
  | 'WAITING_TO_START'
  | 'NARRATOR_INTRO'
  | 'ASKING_PLAYER1_NAME'
  | 'ASKING_PLAYER2_NAME'
  | 'NARRATOR_SPEAKING'
  | 'PLAYER_1_TURN'
  | 'PLAYER_2_TURN'
  | 'ACCUSATION_PHASE'
  | 'GAME_OVER';

export interface Player {
  id: 'player1' | 'player2';
  name: string | null;
  connected: boolean;
}

export interface Suspect {
  id: string;
  name: string;
  relation: string;
  clue: string;
  mentioned: boolean;
}

export interface GameSession {
  id: string;
  state: GameState;
  players: {
    player1: Player;
    player2: Player;
  };
  suspects: Suspect[];
  revealedClues: string[];
  currentTranscript: string;
  narratorText: string;
  accusedSuspect: string | null;
  gameResult: 'won' | 'lost' | null;
  lastPlayerTurn: 'player1' | 'player2';
}

export interface NarratorResponse {
  text: string;
  nextState: GameState;
  gameOver: boolean;
  won: boolean | null;
}

export interface PlayerInput {
  playerId: 'player1' | 'player2';
  text: string;
  isAccusation: boolean;
}
