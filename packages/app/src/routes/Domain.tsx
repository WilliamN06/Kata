import { Link, useParams } from 'react-router-dom';
import { useStore } from '@kata/db';
import { getDomain } from '../registry';

export function Domain() {
  const { domainId } = useParams<{ domainId: string }>();
  const variables = useStore((s) => s.variables);

  if (!domainId) return null;
  const domain = getDomain(domainId);

  if (!domain) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Link to="/" className="text-neutral-400 hover:text-neutral-200 mb-8 inline-block">
          ← Home
        </Link>
        <p className="text-neutral-400">Domain not found.</p>
      </div>
    );
  }

  const layerGroups = {
    perception: domain.subskills.filter((s) => s.layer === 'perception'),
    representation: domain.subskills.filter((s) => s.layer === 'representation'),
    decision: domain.subskills.filter((s) => s.layer === 'decision'),
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link to="/" className="text-neutral-400 hover:text-neutral-200 mb-8 inline-block">
        ← Home
      </Link>
      <h1 className="text-4xl font-bold mb-2">{domain.name}</h1>
      <p className="text-neutral-400 mb-12">
        {domain.subskills.length} subskills
      </p>

      {(['perception', 'representation', 'decision'] as const).map((layer) => {
        const subs = layerGroups[layer];
        if (subs.length === 0) return null;

        return (
          <div key={layer} className="mb-10">
            <h2 className="text-xs font-semibold text-neutral-500 tracking-widest mb-4 uppercase">
              {layer}
            </h2>
            <div className="space-y-3">
              {subs.map((subskill) => {
                const masteredCount = subskill.variables.filter((v) => {
                  const state = variables.find(
                    (s) => s.id === `${domainId}:${subskill.id}:${v.id}`
                  );
                  return (state?.accuracy ?? 0) >= 0.9;
                }).length;

                const totalVars = subskill.variables.length;

                return (
                  <Link
                    key={subskill.id}
                    to={`/${domainId}/${subskill.id}`}
                    className="block p-5 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold mb-1">{subskill.name}</h3>
                        <p className="text-neutral-400 text-sm">
                          {subskill.variables.length} variables · {subskill.drills ? Object.keys(subskill.drills).length : 0} drills
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-neutral-200">
                          {masteredCount}/{totalVars}
                        </div>
                        <div className="text-xs text-neutral-500">mastered</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}