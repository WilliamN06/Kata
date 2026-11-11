import { useNavigate } from 'react-router-dom';
import { DRAWING_SUBSKILLS, MUSIC_SUBSKILLS } from '../registry';
import { useProgress } from '../hooks/useProgress';
import { STAGES, formatThreshold, todaysSession } from '../mastery';

export function Home() {
  const navigate = useNavigate();
  const { summary } = useProgress();
  const today = summary ? todaysSession(summary.states) : [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-5xl font-bold mb-2">KATA</h1>
        <p className="text-neutral-500 mb-12">Perceptual skill trainer</p>

        {today.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Today's session</h2>
            <div className="space-y-2">
              {today.map((m) => {
                const stage = STAGES[m.stage]!;
                return (
                  <button
                    key={m.variable.id}
                    onClick={() => navigate(`/drill/${m.subskillId}/${m.variable.id}/${stage.task}`)}
                    className="w-full text-left p-4 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-xl flex items-center gap-4"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{m.variable.name}</div>
                      <div className="text-xs text-neutral-500">
                        Stage {m.stage + 1}/{STAGES.length} · {stage.label}
                      </div>
                    </div>
                    <div className="text-right text-xs font-mono text-neutral-400">
                      <div>now {formatThreshold(m.current, m.unit)}</div>
                      <div className="text-neutral-600">target {formatThreshold(m.target * stage.multiplier, m.unit)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <DomainCard
            title="Drawing"
            subtitle={`${DRAWING_SUBSKILLS.length} subskills · Proportion, Colour`}
            onClick={() => navigate('/drill-picker/drawing')}
          />
          <DomainCard
            title="Music"
            subtitle={`${MUSIC_SUBSKILLS.length} subskills · ${MUSIC_SUBSKILLS.map((s) => s.name).join(', ')}`}
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
