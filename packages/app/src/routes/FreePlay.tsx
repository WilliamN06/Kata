import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ALL_DOMAINS, getDomain } from '../registry';

export function FreePlay() {
  const navigate = useNavigate();
  const [domainId, setDomainId] = useState('drawing');
  const [subskillId, setSubskillId] = useState('p3-value');
  const [drillId, setDrillId] = useState('V1');

  const domain = getDomain(domainId);
  const subskill = domain?.subskills.find((s) => s.id === subskillId);
  const drills = subskill ? Object.keys(subskill.drills) : [];

  const handleStart = () => {
    if (!domain || !subskill || !drillId) return;
    navigate(`/${domainId}/${subskillId}/${drillId}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link to="/" className="text-neutral-400 hover:text-neutral-200 mb-8 inline-block">
        ← Home
      </Link>
      <h1 className="text-4xl font-bold mb-2">Free Play</h1>
      <p className="text-neutral-400 mb-10">
        Pick any drill and configure your settings
      </p>

      <div className="space-y-6">
        <Section title="Domain">
          <div className="flex flex-wrap gap-2">
            {ALL_DOMAINS.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setDomainId(d.id);
                  const firstSub = d.subskills[0];
                  if (firstSub) {
                    setSubskillId(firstSub.id);
                    const firstDrill = Object.keys(firstSub.drills)[0];
                    if (firstDrill) setDrillId(firstDrill);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  domainId === d.id
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </Section>

        {domain && (
          <Section title="Subskill">
            <div className="flex flex-wrap gap-2">
              {domain.subskills.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSubskillId(s.id);
                    const firstDrill = Object.keys(s.drills)[0];
                    if (firstDrill) setDrillId(firstDrill);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                    subskillId === s.id
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </Section>
        )}

        {subskill && drills.length > 0 && (
          <Section title="Drill">
            <div className="flex flex-wrap gap-2">
              {drills.map((id) => {
                const variable = subskill.variables.find((v) => v.id === id);
                return (
                  <button
                    key={id}
                    onClick={() => setDrillId(id)}
                    className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                      drillId === id
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {id} · {variable?.name ?? id}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        <div className="pt-4">
          <button
            onClick={handleStart}
            disabled={!subskill || !drillId}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 rounded-lg font-semibold transition-colors"
          >
            START DRILL
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-neutral-500 tracking-wider uppercase mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}