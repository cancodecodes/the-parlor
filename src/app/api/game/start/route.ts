import { NextResponse } from 'next/server';
import { createGame, getGame, updateGameState } from '@/lib/gameState';
import { triggerGameEvent } from '@/lib/pusher/server';

export async function POST() {
  try {
    // Create or reset game
    let game = getGame();
    if (!game || game.state === 'GAME_OVER') {
      game = createGame();
    }

    // Start the intro sequence
    game = updateGameState('NARRATOR_INTRO')!;

    // Broadcast game state to all clients
    await triggerGameEvent('game-state', {
      state: game.state,
      game: game,
    });

    return NextResponse.json({ success: true, game });
  } catch (error) {
    console.error('Game start error:', error);
    return NextResponse.json({ error: 'Failed to start game' }, { status: 500 });
  }
}
