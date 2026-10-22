import { useNavigate } from 'react-router-dom';
import { DRAWING_SUBSKILLS, MUSIC_SUBSKILLS } from '../registry';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-5xl font-bold mb-2">KATA</h1>
        <p className="text-neutral-500 mb-12">Perceptual skill trainer</p>

        <div className="space-y-4 mb-8">
          <DomainCard
            title="Drawing"
            subtitle={`${DRAWING_SUBSKILLS.length} subskills · Proportion, Colour`}
            onClick={() => navigate('/drill-picker/drawing')}
          />
          <DomainCard
            title="Music"
            subtitle={`${MUSIC_SUBSKILLS.length} subskills · Pitch, Dynamic, Timbre, Rhythm, Spatial`}
            onClick={() => navigate('/drill-picker/music')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/progress')}
            className="py-3 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg font-semibold"
          >
            PROGRESS
          </button>
          <button
            onClick={() => navigate('/analysis')}
            className="py-3 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg font-semibold"
          >
            ANALYSIS
          </button>
        </div>
      </div>
    </div>
  );
}

function DomainCard({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-6 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-xl transition-colors"
    >
      <div className="text-2xl font-bold mb-1">{title}</div>
      <div className="text-sm text-neutral-500">{subtitle}</div>
    </button>
  );
}
