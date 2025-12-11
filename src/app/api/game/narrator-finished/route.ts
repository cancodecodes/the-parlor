import { NextRequest, NextResponse } from 'next/server';
import { getGame, updateGameState, getNextPlayerTurn } from '@/lib/gameState';
import { triggerGameEvent } from '@/lib/pusher/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { nextAction } = body;

    const game = getGame();
    if (!game) {
      return NextResponse.json({ error: 'No game in progress' }, { status: 400 });
    }

    // Handle different narrator actions
    if (nextAction === 'ask_p1_name') {
      updateGameState('ASKING_PLAYER1_NAME');
      await triggerGameEvent('game-state', { state: 'ASKING_PLAYER1_NAME', game: getGame() });
    } else if (nextAction === 'ask_p2_name') {
      updateGameState('ASKING_PLAYER2_NAME');
      await triggerGameEvent('game-state', { state: 'ASKING_PLAYER2_NAME', game: getGame() });
    } else if (nextAction === 'start_investigation') {
      // Murder reveal finished, start player turns
      const nextTurn = getNextPlayerTurn();
      const nextState = nextTurn === 'player1' ? 'PLAYER_1_TURN' : 'PLAYER_2_TURN';
      updateGameState(nextState);
      await triggerGameEvent('game-state', { state: nextState, game: getGame() });
    } else if (game.state !== 'GAME_OVER') {
      // Normal turn progression after narrator response
      const nextTurn = getNextPlayerTurn();
      const nextState = nextTurn === 'player1' ? 'PLAYER_1_TURN' : 'PLAYER_2_TURN';
      updateGameState(nextState);
      await triggerGameEvent('game-state', { state: nextState, game: getGame() });
    }

    await triggerGameEvent('narrator-finished', { state: game.state });

    return NextResponse.json({ success: true, state: game.state });
  } catch (error) {
    console.error('Narrator finished error:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
