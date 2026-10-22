import { Link, useParams } from 'react-router-dom';
import { useStore } from '@kata/db';
import { getSubskill } from '../registry';
import { MASTERY } from '@kata/core';

export function Subskill() {
  const { domainId, subskillId } = useParams<{ domainId: string; subskillId: string }>();
  const variables = useStore((s) => s.variables);

  if (!domainId || !subskillId) return null;
  const subskill = getSubskill(domainId, subskillId);

  if (!subskill) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Link to="/" className="text-neutral-400 hover:text-neutral-200 mb-8 inline-block">
          ← Home
        </Link>
        <p className="text-neutral-400">Subskill not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link
        to={`/${domainId}`}
        className="text-neutral-400 hover:text-neutral-200 mb-8 inline-block"
      >
        ← {domainId.charAt(0).toUpperCase() + domainId.slice(1)}
      </Link>

      <h1 className="text-4xl font-bold mb-2">{subskill.name}</h1>
      <p className="text-neutral-400 mb-8 max-w-2xl">{subskill.definition}</p>

      <div className="flex gap-3 mb-8">
        <Link
          to={`/knowledge/${domainId}/${subskillId}`}
          className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 text-sm"
        >
          View Knowledge
        </Link>
      </div>

      {/* LEVEL 1A: VARIABLE ISOLATION */}
      <LevelSection
        title="Level 1A · Variable Isolation"
        description="Train one variable at a time"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {subskill.variables.map((variable) => {
            const stateId = `${domainId}:${subskillId}:${variable.id}`;
            const state = variables.find((v) => v.id === stateId);
            const accuracy = state?.accuracy ?? 0;
            const trialCount = state?.trialCount ?? 0;
            const mastered = accuracy >= MASTERY.L1A;
            const hasDrill = variable.id in subskill.drills;

            return (
              <Link
                key={variable.id}
                to={hasDrill ? `/${domainId}/${subskillId}/${variable.id}` : '#'}
                className={`block p-4 bg-neutral-900 border rounded-lg transition-colors ${
                  hasDrill
                    ? 'border-neutral-800 hover:bg-neutral-800'
                    : 'border-neutral-900 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-neutral-500">
                        {variable.id}
                      </span>
                      <span className="font-semibold">{variable.name}</span>
                      {mastered && (
                        <span className="text-green-500 text-sm">✓</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {variable.definition}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        mastered ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, accuracy * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-500 font-mono w-12 text-right">
                    {trialCount > 0 ? `${Math.round(accuracy * 100)}%` : '—'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </LevelSection>

      {/* LEVEL 1B: INTEGRATION */}
      <LevelSection
        title="Level 1B · Variable Integration"
        description="Combine 2–3 related variables"
      >
        {subskill.integrationGroups && subskill.integrationGroups.length > 0 ? (
          <div className="space-y-3">
            {subskill.integrationGroups.map((group) => {
              const groupDrillId = `Group${group.id}`;
              const hasDrill = groupDrillId in subskill.drills;
              return (
                <Link
                  key={group.id}
                  to={hasDrill ? `/${domainId}/${subskillId}/${groupDrillId}` : '#'}
                  className={`block p-4 bg-neutral-900 border rounded-lg transition-colors ${
                    hasDrill
                      ? 'border-neutral-800 hover:bg-neutral-800'
                      : 'border-neutral-900 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold mb-1">
                        Group {group.id} · {group.name}
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Variables: {group.variables.join(', ')}
                      </p>
                    </div>
                    <span className="text-green-500 text-sm font-semibold">Available</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-neutral-500 text-sm">No integration groups defined.</p>
        )}
      </LevelSection>

      {/* LEVEL 2A: TASK CONDITIONS */}
      <LevelSection
        title="Level 2A · Task Conditions"
        description="Vary media, time, subject, scale"
      >
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
          <p className="text-sm text-neutral-400">Available</p>
        </div>
      </LevelSection>

      {/* LEVEL 2B: BACKGROUND CONDITIONS */}
      <LevelSection
        title="Level 2B · Background Conditions"
        description="Vary lighting, background value, colour, surface, distance, etc."
      >
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
          <p className="text-sm text-neutral-400">Available</p>
        </div>
      </LevelSection>

      {/* LEVEL 3A: FULL EXECUTION */}
      <LevelSection
        title="Level 3A · Full Execution"
        description="Realistic drawing tasks"
      >
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
          <p className="text-sm text-neutral-400">Available</p>
        </div>
      </LevelSection>

      {/* AUTOMATICITY */}
      <LevelSection
        title="Automaticity"
        description="Speed, distraction, fatigue, dual task"
      >
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
          <p className="text-sm text-neutral-400">Available</p>
        </div>
      </LevelSection>
    </div>
  );
} 

function LevelSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-neutral-300 tracking-wider uppercase">
          {title}
        </h2>
        <p className="text-xs text-neutral-500 mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}