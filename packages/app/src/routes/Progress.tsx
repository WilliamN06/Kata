import { Link } from 'react-router-dom';
import { useStore } from '@kata/db';
import { ALL_DOMAINS } from '../registry';
import { MASTERY } from '@kata/core';

export function Progress() {
  const variables = useStore((s) => s.variables);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link to="/" className="text-neutral-400 hover:text-neutral-200 mb-8 inline-block">
        ← Home
      </Link>
      <h1 className="text-4xl font-bold mb-2">Progress</h1>
      <p className="text-neutral-400 mb-10">
        Mastery tracking across all tracked variables
      </p>

      {ALL_DOMAINS.map((domain) => {
        const domainVariables = variables.filter(
          (v) =>
            domain.subskills.some((s) => s.id === v.subskillId) && v.domain === domain.id
        );

        if (domainVariables.length === 0) return null;

        const mastered = domainVariables.filter((v) => v.accuracy >= MASTERY.L1A).length;

        return (
          <div key={domain.id} className="mb-10">
            <h2 className="text-xl font-semibold mb-1">{domain.name}</h2>
            <p className="text-sm text-neutral-500 mb-4">
              {mastered} of {domainVariables.length} variables mastered (≥ 90%)
            </p>

            <div className="space-y-2">
              {domainVariables.map((v) => {
                const subskill = domain.subskills.find((s) => s.id === v.subskillId);
                const variable = subskill?.variables.find((x) => x.id === v.variableId);
                const mastered = v.accuracy >= MASTERY.L1A;

                return (
                  <div
                    key={v.id}
                    className="flex items-center gap-4 p-3 bg-neutral-900 border border-neutral-800 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-neutral-500">
                          {v.variableId}
                        </span>
                        <span className="text-sm font-medium truncate">
                          {variable?.name ?? v.variableId}
                        </span>
                        <span className="text-xs text-neutral-500 truncate">
                          · {subskill?.name ?? v.subskillId}
                        </span>
                      </div>
                    </div>

                    <div className="w-32 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          mastered ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, v.accuracy * 100)}%` }}
                      />
                    </div>

                    <span className="text-xs font-mono text-neutral-400 w-12 text-right">
                      {Math.round(v.accuracy * 100)}%
                    </span>

                    <span className="text-xs text-neutral-600 w-16 text-right">
                      {v.trialCount} trials
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {variables.length === 0 && (
        <div className="text-center py-16">
          <p className="text-neutral-400 mb-2">No progress yet.</p>
          <p className="text-neutral-500 text-sm">
            Complete a drill to start tracking your accuracy.
          </p>
        </div>
      )}
    </div>
  );
}