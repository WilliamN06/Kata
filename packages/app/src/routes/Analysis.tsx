import { useNavigate } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { getVariable } from '../registry';

export function Analysis() {
  const navigate = useNavigate();
  const { summary, loading } = useProgress();

  if (loading || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-400">
        Loading analysis…
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="text-neutral-400 hover:text-neutral-200 text-sm mb-6"
        >
          ← Home
        </button>

        <h1 className="text-3xl font-bold mb-2">Analysis</h1>
        <p className="text-neutral-500 mb-8">
          Your acoustic-to-perceptual mapping. This view shows how your subjective
          ratings correlate with the acoustic parameters of each stimulus.
        </p>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <p className="text-sm text-neutral-400">
            Complete drills with perceptual ratings enabled to build your mapping.
            Ratings are recorded separately from accuracy and can be analysed here.
          </p>
          <p className="text-xs text-neutral-600 mt-4">
            Variables with ratings: {Object.keys(summary.states).length}
          </p>
        </div>
      </div>
    </div>
  );
}
