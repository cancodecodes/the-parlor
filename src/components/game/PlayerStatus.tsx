import { Player } from '@/types/game';

interface PlayerStatusProps {
  player: Player;
  isCurrentTurn: boolean;
  lastInput?: string;
  playerNumber: 1 | 2;
}

export default function PlayerStatus({
  player,
  isCurrentTurn,
  lastInput,
  playerNumber,
}: PlayerStatusProps) {
  return (
    <div
      className={`
        rounded-lg p-4 border transition-all duration-300
        ${isCurrentTurn
          ? 'bg-green-900/20 border-green-500/50 pulse-glow'
          : 'bg-gray-800/50 border-gray-700/50 opacity-60'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-3 h-3 rounded-full ${
            isCurrentTurn ? 'bg-green-500' : 'bg-gray-600'
          }`}
        />
        <span className="text-gray-400 text-sm uppercase tracking-wider">
          Player {playerNumber}
        </span>
      </div>

      {/* Name */}
      <h4 className={`font-serif text-xl mb-2 ${
        isCurrentTurn ? 'text-white' : 'text-gray-400'
      }`}>
        {player.name || 'Detective'}
      </h4>

      {/* Turn status */}
      <p className={`text-sm mb-3 ${
        isCurrentTurn ? 'text-green-400' : 'text-gray-500'
      }`}>
        {isCurrentTurn ? '✨ Your turn' : 'Waiting...'}
      </p>

      {/* Last input */}
      {lastInput && (
        <div className="bg-gray-900/50 rounded p-2 mt-2">
          <p className="text-gray-400 text-xs italic truncate">
            &ldquo;{lastInput}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
