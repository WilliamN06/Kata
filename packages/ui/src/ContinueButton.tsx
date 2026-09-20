interface ContinueButtonProps {
  onClick: () => void;
  label?: string;
}

export function ContinueButton({ onClick, label = 'CONTINUE' }: ContinueButtonProps) {
  return (
    <button
      onClick={onClick}
      className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
    >
      {label}
    </button>
  );
}