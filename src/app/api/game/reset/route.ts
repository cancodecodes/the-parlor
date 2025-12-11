import { NextResponse } from 'next/server';
import { resetGame } from '@/lib/gameState';
import { triggerGameEvent } from '@/lib/pusher/server';

export async function POST() {
  try {
    const game = resetGame();

    await triggerGameEvent('game-state', {
      state: game.state,
      game: game,
    });

    await triggerGameEvent('game-reset', {});

    return NextResponse.json({ success: true, game });
  } catch (error) {
    console.error('Game reset error:', error);
    return NextResponse.json({ error: 'Failed to reset game' }, { status: 500 });
  }
}
