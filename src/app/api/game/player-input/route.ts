import { NextRequest, NextResponse } from 'next/server';
import {
  getGame,
  updateGameState,
  setPlayerName,
  setCurrentTranscript,
  setLastPlayerTurn,
} from '@/lib/gameState';
import { triggerGameEvent } from '@/lib/pusher/server';

export async function POST(request: NextRequest) {
  try {
    const { playerId, text, isAccusation, isNameResponse } = await request.json();

    const game = getGame();
    if (!game) {
      return NextResponse.json({ error: 'No game in progress' }, { status: 400 });
    }

    // Handle name responses
    if (isNameResponse) {
      setPlayerName(playerId, text);
      setCurrentTranscript(text);

      await triggerGameEvent('player-input', {
        playerId,
        text,
        isNameResponse: true,
      });

      // Determine next state
      if (playerId === 'player1') {
        updateGameState('ASKING_PLAYER2_NAME');
        await triggerGameEvent('game-state', { state: 'ASKING_PLAYER2_NAME', game: getGame() });
      } else {
        // Both names collected, start the murder reveal
        updateGameState('NARRATOR_SPEAKING');
        await triggerGameEvent('game-state', { state: 'NARRATOR_SPEAKING', game: getGame() });
        await triggerGameEvent('narrator-action', { action: 'murder_reveal' });
      }

      return NextResponse.json({ success: true });
    }

    // Validate turn for regular gameplay
    const expectedState = playerId === 'player1' ? 'PLAYER_1_TURN' : 'PLAYER_2_TURN';
    if (game.state !== expectedState && game.state !== 'ACCUSATION_PHASE') {
      return NextResponse.json({ error: 'Not your turn' }, { status: 400 });
    }

    // Lock turns while narrator processes
    updateGameState('NARRATOR_SPEAKING');
    setCurrentTranscript(text);
    setLastPlayerTurn(playerId);

    // Broadcast player's speech to all clients
    await triggerGameEvent('player-input', {
      playerId,
      text,
      isAccusation,
    });

    await triggerGameEvent('game-state', { state: 'NARRATOR_SPEAKING', game: getGame() });

    // Call narrator API to process the question
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const narratorResponse = await fetch(`${baseUrl}/api/narrator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerInput: text, playerId, isAccusation }),
    });

    const result = await narratorResponse.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Player input error:', error);
    return NextResponse.json({ error: 'Failed to process input' }, { status: 500 });
  }
}
