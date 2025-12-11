interface AccusationButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export default function AccusationButton({ disabled, onClick }: AccusationButtonProps) {
  return (
    <div className="mt-8 text-center">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          px-8 py-3 rounded-lg font-serif text-lg transition-all duration-200 btn-press
          ${disabled
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-red-900 hover:bg-red-800 text-red-100 glow-red'
          }
        `}
      >
        🔴 Make Accusation
      </button>
      <p className="text-gray-500 text-xs mt-2">
        Ready to accuse? Make sure you have enough evidence!
      </p>
    </div>
  );
}
