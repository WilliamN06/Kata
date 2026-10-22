import { useNavigate } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { getVariable } from '../registry';

export function Progress() {
  const navigate = useNavigate();
  const { summary, loading, refresh } = useProgress();

  if (loading || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-400">
        Loading progress…
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

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Progress</h1>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm"
          >
            REFRESH
          </button>
        </div>

        {/* By subskill */}
        <Section title="By Subskill">
          <div className="space-y-2">
            {Object.entries(summary.bySubskill).map(([id, data]) => (
              <div
                key={id}
                className="flex items-center gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-lg"
              >
                <div className="flex-1 text-sm font-mono">{id}</div>
                <div className="w-48 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${data.accuracy * 100}%` }}
                  />
                </div>
                <div className="text-xs text-neutral-500 font-mono w-16 text-right">
                  {Math.round(data.accuracy * 100)}%
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Weakest */}
        <Section title="Weakest Variables">
          <div className="space-y-2">
            {summary.weakest.map((s) => {
              const v = getVariable(s.variableId);
              return (
                <div
                  key={s.variableId}
                  className="flex items-center gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-lg"
                >
                  <div className="flex-1 text-sm">
                    {v?.name ?? s.variableId}
                  </div>
                  <div className="text-xs text-neutral-500 font-mono">
                    {Math.round(s.accuracy * 100)}%
                  </div>
                </div>
              );
            })}
            {summary.weakest.length === 0 && (
              <p className="text-sm text-neutral-500">Not enough data yet.</p>
            )}
          </div>
        </Section>

        {/* Recently practiced */}
        <Section title="Recently Practiced">
          <div className="space-y-2">
            {summary.recentlyPracticed.map((s) => {
              const v = getVariable(s.variableId);
              return (
                <div
                  key={s.variableId}
                  className="flex items-center gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-lg"
                >
                  <div className="flex-1 text-sm">
                    {v?.name ?? s.variableId}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {s.lastPracticed
                      ? new Date(s.lastPracticed).toLocaleDateString()
                      : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}
