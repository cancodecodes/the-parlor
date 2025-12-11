interface TurnIndicatorProps {
  isMyTurn: boolean;
  isNarratorSpeaking: boolean;
  waitingMessage?: string;
  isNamePhase?: boolean;
}

export default function TurnIndicator({
  isMyTurn,
  isNarratorSpeaking,
  waitingMessage,
  isNamePhase,
}: TurnIndicatorProps) {
  if (isNarratorSpeaking) {
    return (
      <div className="text-center p-6 rounded-lg bg-amber-900/20 border border-amber-700/30">
        <div className="text-4xl mb-3">🔊</div>
        <h2 className="text-xl font-serif text-amber-200">Mrs. Hartwell is speaking...</h2>
        <p className="text-amber-400/60 text-sm mt-2">Listen carefully</p>
      </div>
    );
  }

  if (isMyTurn) {
    return (
      <div className="text-center p-6 rounded-lg bg-green-900/20 border border-green-500/30 pulse-glow">
        <div className="text-4xl mb-3">✨</div>
        <h2 className="text-xl font-serif text-green-200">
          {isNamePhase ? 'Introduce Yourself!' : 'Your Turn!'}
        </h2>
        <p className="text-green-400/60 text-sm mt-2">
          {isNamePhase
            ? 'Tell Mrs. Hartwell your name'
            : 'Ask Mrs. Hartwell a question'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="text-center p-6 rounded-lg bg-gray-800/50 border border-gray-700/50">
      <div className="text-4xl mb-3 opacity-50">⏳</div>
      <h2 className="text-xl font-serif text-gray-400">Waiting...</h2>
      <p className="text-gray-500 text-sm mt-2">
        {waitingMessage || 'The other detective is thinking'}
      </p>
    </div>
  );
}
