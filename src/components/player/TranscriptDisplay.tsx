interface TranscriptDisplayProps {
  text: string;
}

export default function TranscriptDisplay({ text }: TranscriptDisplayProps) {
  if (!text) return null;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">You said:</p>
      <p className="text-gray-200 italic">&ldquo;{text}&rdquo;</p>
    </div>
  );
}
