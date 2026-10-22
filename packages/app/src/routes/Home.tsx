import { Link } from 'react-router-dom';
import { useStore } from '@kata/db';

export function Home() {
  const calibration = useStore((s) => s.calibration);
  const variables = useStore((s) => s.variables);

  const totalMastered = variables.filter((v) => v.accuracy >= 0.9).length;
  const totalTracked = variables.filter((v) => v.trialCount > 0).length;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-2">Kata</h1>
        <p className="text-neutral-400">Perceptual training through isolated variable drills</p>
      </div>

      {!calibration && (
        <Link
          to="/calibration"
          className="block p-6 mb-6 bg-amber-950/40 border border-amber-800 rounded-lg hover:bg-amber-900/40 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-1 text-amber-200">⚠ Calibrate your screen</h2>
          <p className="text-amber-300/70 text-sm">
            Value drills require a calibrated screen to be valid.
          </p>
        </Link>
      )}

      <div className="mb-8">
        <Link
          to="/adaptive"
          className="block p-8 bg-blue-950/40 border border-blue-800 rounded-xl hover:bg-blue-900/40 transition-colors"
        >
          <h2 className="text-2xl font-semibold mb-2">Today's Session</h2>
          <p className="text-blue-200/70">
            Adaptive training based on your weaknesses · ~10 min
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          to="/drawing"
          className="block p-6 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-1">Drawing</h2>
          <p className="text-neutral-400 text-sm">
            {totalTracked > 0
              ? `${totalMastered} mastered · ${totalTracked} tracked`
              : '16 subskills · P1–P8, R1–R6, D1–D2'}
          </p>
        </Link>

        <Link
          to="/music"
          className="block p-6 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-1">Music</h2>
          <p className="text-neutral-400 text-sm">Coming soon · M1–M9, R1–R13, D1–D13</p>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/free-play"
          className="px-5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors text-sm font-semibold"
        >
          Free Play
        </Link>
        <Link
          to="/progress"
          className="px-5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors text-sm font-semibold"
        >
          Progress
        </Link>
        <Link
          to="/settings"
          className="px-5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors text-sm font-semibold"
        >
          Settings
        </Link>
        <Link
          to="/calibration"
          className="px-5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors text-sm font-semibold"
        >
          Calibration
        </Link>
      </div>
    </div>
  );
}