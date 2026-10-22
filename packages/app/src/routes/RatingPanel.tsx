import { useState } from 'react';
import type { PerceptualRating } from '@kata/core';

interface RatingPanelProps {
  onSubmit: (rating: PerceptualRating) => void;
  onSkip: () => void;
}

const SCALES: Array<{
  key: keyof PerceptualRating;
  label: string;
  leftLabel: string;
  rightLabel: string;
}> = [
  { key: 'brightness', label: 'Brightness', leftLabel: 'Dull', rightLabel: 'Bright' },
  { key: 'warmth', label: 'Warmth', leftLabel: 'Cold', rightLabel: 'Warm' },
  { key: 'harshness', label: 'Harshness', leftLabel: 'Smooth', rightLabel: 'Harsh' },
  { key: 'breathiness', label: 'Breathiness', leftLabel: 'Pure', rightLabel: 'Breathy' },
  { key: 'buzziness', label: 'Buzziness', leftLabel: 'Clean', rightLabel: 'Buzzy' },
  { key: 'metallicity', label: 'Metallicity', leftLabel: 'Wooden', rightLabel: 'Metallic' },
  { key: 'noisiness', label: 'Noisiness', leftLabel: 'Tonal', rightLabel: 'Noisy' },
];

export function RatingPanel({ onSubmit, onSkip }: RatingPanelProps) {
  const [ratings, setRatings] = useState<PerceptualRating>({});

  const setRating = (key: keyof PerceptualRating, value: number) => {
    setRatings((r) => ({ ...r, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
        <div className="border-b border-neutral-800 px-6 py-4">
          <h2 className="text-lg font-bold">Rate Your Perception</h2>
          <p className="text-xs text-neutral-500 mt-1">
            This does not affect your score. It records your subjective impression.
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {SCALES.map((scale) => (
            <div key={scale.key}>
              <div className="flex justify-between text-xs text-neutral-400 mb-2">
                <span>{scale.leftLabel}</span>
                <span className="font-semibold text-neutral-300">{scale.label}</span>
                <span>{scale.rightLabel}</span>
              </div>
              <input
                type="range"
                min={-5}
                max={5}
                step={1}
                value={ratings[scale.key] ?? 0}
                onChange={(e) => setRating(scale.key, Number(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-xs text-neutral-600 mt-1 font-mono">
                {(ratings[scale.key] ?? 0) > 0 ? '+' : ''}
                {ratings[scale.key] ?? 0}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-800 px-6 py-4 flex justify-between">
          <button
            onClick={onSkip}
            className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-semibold"
          >
            SKIP
          </button>
          <button
            onClick={() => onSubmit(ratings)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold"
          >
            SUBMIT RATINGS
          </button>
        </div>
      </div>
    </div>
  );
}
