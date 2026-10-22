import { useEffect, useState } from 'react';

interface FeedbackOverlayProps {
  correct: boolean;
  message?: string;
  detail?: string;
  duration?: number;
  onDismiss?: () => void;
}

export function FeedbackOverlay({
  correct,
  message,
  detail,
  duration = 1000,
  onDismiss,
}: FeedbackOverlayProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [correct, duration, onDismiss]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div
        className={`px-12 py-8 rounded-2xl text-center shadow-2xl animate-in fade-in zoom-in-95 ${
          correct ? 'bg-green-600' : 'bg-red-600'
        }`}
        style={{ animation: 'feedbackPop 200ms ease-out' }}
      >
        <div className="text-3xl font-bold text-white mb-2">
          {correct ? '✓ CORRECT' : '✗ INCORRECT'}
        </div>
        {message && <div className="text-white/90 text-base">{message}</div>}
        {detail && <div className="text-white/70 text-sm mt-1">{detail}</div>}
      </div>
    </div>
  );
}