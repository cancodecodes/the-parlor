interface SceneImageProps {
  scene: 'mansion' | 'garden' | 'parlor';
}

export default function SceneImage({ scene }: SceneImageProps) {
  // CSS gradient backgrounds representing different scenes
  const sceneStyles = {
    mansion: 'from-gray-900 via-slate-800 to-gray-900',
    garden: 'from-gray-900 via-emerald-950 to-gray-900',
    parlor: 'from-gray-900 via-amber-950/30 to-gray-900',
  };

  const sceneDescriptions = {
    mansion: 'The Hartwell Estate - 1925',
    garden: 'The Garden - Scene of the Crime',
    parlor: 'The Parlor - Investigation Room',
  };

  return (
    <div className={`
      relative w-full h-48 rounded-lg overflow-hidden
      bg-gradient-to-br ${sceneStyles[scene]}
      border border-gray-700/50
    `}>
      {/* Decorative elements */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          {scene === 'mansion' && (
            <span className="text-6xl opacity-30">🏛️</span>
          )}
          {scene === 'garden' && (
            <span className="text-6xl opacity-30">🌳</span>
          )}
          {scene === 'parlor' && (
            <span className="text-6xl opacity-30">🕯️</span>
          )}
        </div>
      </div>

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900/50" />

      {/* Scene label */}
      <div className="absolute bottom-3 left-3">
        <p className="text-amber-400/70 text-xs uppercase tracking-widest">
          {sceneDescriptions[scene]}
        </p>
      </div>
    </div>
  );
}
