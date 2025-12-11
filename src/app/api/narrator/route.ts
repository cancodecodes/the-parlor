import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  getGame,
  updateGameState,
  addRevealedClue,
  markSuspectMentioned,
  setNarratorText,
  setGameOver,
} from '@/lib/gameState';
import { triggerGameEvent } from '@/lib/pusher/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `You are Mrs. Hartwell, a wealthy widow in 1920s America. Your daughter Eleanor was murdered last night. You are being questioned by two detectives.

STORY FACTS:
- Eleanor was found dead in the garden, throat slit with a kitchen knife
- Three suspects attended dinner last night:
  1. Dr. Marcus Webb (ex-fiance, arrived angry) - THE KILLER
  2. Clara Finch (childhood friend, left early, nervous)
  3. Henry Vance (business partner, stayed late, was arguing with Eleanor)

THE TRUTH (reveal gradually based on detective questions):
- Henry was embezzling from the company. Eleanor confronted him. They argued at midnight in the garden.
- Clara left at 10pm. She saw Dr. Webb lurking near the garden but was too scared to mention it.
- Dr. Webb, consumed by jealousy over Eleanor rejecting him, waited until Henry left, then killed Eleanor.
- The knife has Dr. Webb's fingerprints.
- The wound is "surgical, precise" — Webb is a doctor.

KEY REVELATION TRIGGERS:
- If asked who saw Eleanor last/last person: Reveal Henry was last to leave, they were arguing in the garden around midnight
- If asked about the argument: Reveal Eleanor discovered Henry was embezzling from her father's company
- If asked to examine body/wound: Reveal the cut is clean, precise, almost surgical, with defensive wounds on her hands
- If asked about evidence/fingerprints on knife: Reveal there are clear fingerprints on the handle
- If asked whose fingerprints: DRAMATICALLY reveal "The prints belong to... Dr. Marcus Webb"
- If asked about Clara leaving early: Reveal she saw something in the garden but was scared
- If pressed about what Clara saw: Reveal she saw Dr. Webb lurking near the garden

RESPONSE RULES:
1. Stay in character as a grieving, aristocratic 1920s widow
2. Give information gradually — never volunteer everything at once
3. When detectives ask about examining evidence, describe it dramatically
4. When fingerprints are matched to Dr. Webb, pause dramatically before revealing
5. Keep responses to 2-3 sentences unless revealing major plot points
6. If detectives ask irrelevant questions, gently redirect to the investigation
7. Be theatrical and emotional — you lost your daughter
8. Address the detectives formally`;

export async function POST(request: NextRequest) {
  try {
    const { playerInput, playerId, isAccusation } = await request.json() as {
      playerInput: string;
      playerId: 'player1' | 'player2';
      isAccusation: boolean;
    };

    const game = getGame();
    if (!game) {
      return NextResponse.json({ error: 'No game in progress' }, { status: 400 });
    }

    // Handle accusation
    if (isAccusation) {
      const accusedWebb = /webb|marcus|doctor/i.test(playerInput);

      let narratorResponse: string;
      if (accusedWebb) {
        narratorResponse = `*gasps* Dr. Webb? *trembles* Yes... yes, it makes terrible sense now. He was consumed by jealousy after Eleanor rejected him. He must have waited in the garden while Henry argued with her... waited for his moment. Guards! Seize Dr. Marcus Webb! Justice for my Eleanor at last!`;
        setGameOver(true, 'webb');
      } else {
        const accusedName = /clara/i.test(playerInput) ? 'Clara Finch' :
                          /henry|vance/i.test(playerInput) ? 'Henry Vance' :
                          'that person';
        narratorResponse = `*shakes head slowly* No, detectives. ${accusedName} may have their secrets, but they did not kill my Eleanor. I can feel it in my bones. Please... look deeper. The truth is still out there.`;
        // Don't end game on wrong accusation, let them continue
        const nextTurn = playerId === 'player1' ? 'PLAYER_2_TURN' : 'PLAYER_1_TURN';
        updateGameState(nextTurn);
      }

      setNarratorText(narratorResponse);

      await triggerGameEvent('narrator-response', {
        text: narratorResponse,
        nextState: game.state,
        gameOver: accusedWebb,
        won: accusedWebb,
      });

      return NextResponse.json({
        narratorResponse,
        nextState: game.state,
        gameOver: accusedWebb,
        won: accusedWebb,
      });
    }

    // Build context for LLM
    const playerName = game.players[playerId].name || 'Detective';
    const otherPlayer = playerId === 'player1' ? 'player2' : 'player1';
    const otherPlayerName = game.players[otherPlayer].name || 'Detective';

    const context = `Current investigation state:
- Clues already revealed: ${game.revealedClues.length > 0 ? game.revealedClues.join(', ') : 'None yet'}
- Suspects discussed: ${game.suspects.filter(s => s.mentioned).map(s => s.name).join(', ') || 'None yet'}
- Detective ${playerName} asks: "${playerInput}"

Respond as Mrs. Hartwell. Remember to be dramatic and reveal information gradually. Keep response to 2-3 sentences unless this is a major revelation.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: context }],
    });

    const narratorResponse = (message.content[0] as { type: string; text: string }).text;

    // Check for clue reveals based on response content
    const cluePatterns = [
      { pattern: /henry.*argu|argu.*henry|midnight.*garden/i, clue: 'henry_argument' },
      { pattern: /embezzl/i, clue: 'embezzlement' },
      { pattern: /surgical|precise.*cut|clean.*cut/i, clue: 'surgical_wound' },
      { pattern: /defensive wound/i, clue: 'defensive_wounds' },
      { pattern: /fingerprint.*handle|print.*knife/i, clue: 'fingerprints_exist' },
      { pattern: /webb.*fingerprint|fingerprint.*webb|prints belong.*webb/i, clue: 'webb_fingerprints' },
      { pattern: /clara.*saw|saw.*garden|lurking/i, clue: 'clara_witness' },
    ];

    cluePatterns.forEach(({ pattern, clue }) => {
      if (pattern.test(narratorResponse)) {
        addRevealedClue(clue);
      }
    });

    // Check suspect mentions in both question and response
    const fullText = playerInput + ' ' + narratorResponse;
    if (/webb|marcus|doctor(?!\s+finch)/i.test(fullText)) markSuspectMentioned('webb');
    if (/clara|finch/i.test(fullText)) markSuspectMentioned('clara');
    if (/henry|vance/i.test(fullText)) markSuspectMentioned('henry');

    // Determine next turn
    const nextTurn = playerId === 'player1' ? 'PLAYER_2_TURN' : 'PLAYER_1_TURN';

    setNarratorText(narratorResponse);

    await triggerGameEvent('narrator-response', {
      text: narratorResponse,
      nextState: nextTurn,
      gameOver: false,
      won: null,
    });

    return NextResponse.json({
      narratorResponse,
      nextState: nextTurn,
      gameOver: false,
    });
  } catch (error) {
    console.error('Narrator error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
