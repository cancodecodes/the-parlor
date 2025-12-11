import { Suspect } from '@/types/game';

interface SuspectCardProps {
  suspect: Suspect;
}

export default function SuspectCard({ suspect }: SuspectCardProps) {
  // Emoji based on suspect
  const emoji = suspect.id === 'webb' ? '👨‍⚕️' :
                suspect.id === 'clara' ? '👩' : '👔';

  return (
    <div
      className={`
        suspect-card bg-gray-800/80 rounded-lg p-4 text-center border
        ${suspect.mentioned
          ? 'border-amber-500/50 mentioned'
          : 'border-gray-700/50 opacity-70'
        }
      `}
    >
      {/* Portrait */}
      <div className={`
        w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-3
        ${suspect.mentioned
          ? 'bg-gradient-to-br from-amber-900/50 to-gray-700'
          : 'bg-gray-700'
        }
      `}>
        <span className="text-4xl">{emoji}</span>
      </div>

      {/* Name */}
      <h4 className={`font-serif font-semibold text-sm mb-1 ${
        suspect.mentioned ? 'text-amber-100' : 'text-gray-300'
      }`}>
        {suspect.name}
      </h4>

      {/* Relation */}
      <p className="text-gray-500 text-xs mb-2">{suspect.relation}</p>

      {/* Clue */}
      <p className={`text-xs italic ${
        suspect.mentioned ? 'text-amber-400' : 'text-gray-500'
      }`}>
        &ldquo;{suspect.clue}&rdquo;
      </p>
    </div>
  );
}
