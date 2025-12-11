import { NextResponse } from 'next/server';
import { resetGame } from '@/lib/gameState';
import { triggerGameEvent } from '@/lib/pusher/server';

export async function POST() {
  try {
    const game = resetGame();

    // Broadcast reset to ALL clients globally
    await triggerGameEvent('game-reset', {
      timestamp: Date.now(),
      message: 'Game has been reset by host'
    });

    await triggerGameEvent('game-state', {
      state: game.state,
      game: game,
    });

    return NextResponse.json({ success: true, game });
  } catch (error) {
    console.error('Game reset error:', error);
    return NextResponse.json({ error: 'Failed to reset game' }, { status: 500 });
  }
}
