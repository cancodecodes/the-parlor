import { Suspect } from '@/types/game';
import SuspectCard from './SuspectCard';

interface SuspectBarProps {
  suspects: Suspect[];
}

export default function SuspectBar({ suspects }: SuspectBarProps) {
  return (
    <div className="mt-6">
      <h3 className="text-gray-400 text-sm mb-3 uppercase tracking-wider font-medium">
        Suspects
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {suspects.map((suspect) => (
          <SuspectCard key={suspect.id} suspect={suspect} />
        ))}
      </div>
    </div>
  );
}
