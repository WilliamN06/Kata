import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@kata/db';
import { ValueScale } from '@kata/rendering';

export function Calibration() {
  const navigate = useNavigate();
  const saveCalibration = useStore((s) => s.saveCalibration);
  const calibration = useStore((s) => s.calibration);
  const [step, setStep] = useState<'intro' | 'black' | 'white' | 'done'>(
    calibration ? 'done' : 'intro'
  );
  const [selectedBlack, setSelectedBlack] = useState<number | null>(null);
  const [selectedWhite, setSelectedWhite] = useState<number | null>(null);

  const handleComplete = async () => {
    // ValueScale reports a step index (0..4). The black scale spans L* 0–20
    // and the white scale spans L* 80–100, so map back to L* values.
    const blackPoint = selectedBlack === null ? 0 : selectedBlack * 5;
    const whitePoint = selectedWhite === null ? 100 : 80 + selectedWhite * 5;
    await saveCalibration({
      gamma: 1.0,
      blackPoint,
      whitePoint,
      date: new Date().toISOString(),
    });
    navigate('/');
  };

  if (step === 'done' && calibration) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <Link to="/" className="text-neutral-400 hover:text-neutral-200 mb-8 inline-block">
          ← Home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Calibration Complete</h1>
        <p className="text-neutral-400 mb-8">
          Last calibrated: {new Date(calibration.date).toLocaleDateString()}
        </p>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-neutral-500 mb-1">Gamma</div>
              <div className="font-mono">{calibration.gamma.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-neutral-500 mb-1">Black point</div>
              <div className="font-mono">{calibration.blackPoint.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-neutral-500 mb-1">White point</div>
              <div className="font-mono">{calibration.whitePoint.toFixed(1)}</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setStep('intro');
            setSelectedBlack(null);
            setSelectedWhite(null);
          }}
          className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-semibold transition-colors"
        >
          RE-CALIBRATE
        </button>
      </div>
    );
  }

  if (step === 'intro') {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <Link to="/" className="text-neutral-400 hover:text-neutral-200 mb-8 inline-block">
          ← Home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Screen Calibration</h1>
        <p className="text-neutral-400 mb-8">
          Value perception training requires a calibrated screen. Without calibration, all measurements are invalid.
        </p>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 mb-8">
          <h2 className="font-semibold mb-3">Before you begin:</h2>
          <ul className="text-sm text-neutral-400 space-y-2 list-disc list-inside">
            <li>Set screen brightness to 50%</li>
            <li>Turn off auto-brightness</li>
            <li>Turn off Night Shift / True Tone (macOS)</li>
            <li>View the screen in neutral lighting</li>
            <li>Remove colour-tinted glasses</li>
          </ul>
        </div>

        <button
          onClick={() => setStep('black')}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
        >
          BEGIN CALIBRATION
        </button>
      </div>
    );
  }

  if (step === 'black') {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-2">Black Level</h1>
        <p className="text-neutral-400 mb-8">
          Tap the darkest patch you can see. If you can't see all 5, tap the leftmost visible.
        </p>

        <ValueScale
          steps={5}
          width={500}
          height={80}
          selectedStep={selectedBlack}
          onSelect={setSelectedBlack}
        />

        <div className="flex justify-between text-xs text-neutral-500 mt-3" style={{ width: 500 }}>
          <span>L* 0 (black)</span>
          <span>L* 20</span>
        </div>

        <button
          onClick={() => setStep('white')}
          disabled={selectedBlack === null}
          className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 rounded-lg font-semibold transition-colors"
        >
          NEXT
        </button>
      </div>
    );
  }

  // White level
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">White Level</h1>
      <p className="text-neutral-400 mb-8">
        Tap the lightest patch you can distinguish from pure white.
      </p>

      <ValueScale
        steps={5}
        width={500}
        height={80}
        selectedStep={selectedWhite}
        onSelect={setSelectedWhite}
      />

      <div className="flex justify-between text-xs text-neutral-500 mt-3" style={{ width: 500 }}>
        <span>L* 80</span>
        <span>L* 100 (white)</span>
      </div>

      <button
        onClick={handleComplete}
        disabled={selectedWhite === null}
        className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 rounded-lg font-semibold transition-colors"
      >
        COMPLETE CALIBRATION
      </button>
    </div>
  );
}