import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@kata/db';
import { buildTodaySession, type DrillSlot } from '@kata/core';

export function AdaptiveSession() {
  const navigate = useNavigate();
  const variables = useStore((s) => s.variables);
  const settings = useStore((s) => s.settings);

  const [slots, setSlots] = useState<DrillSlot[]>([]);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());

  const sessionLengthMinutes = useMemo(() => 10, []);

  useEffect(() => {
    const built = buildTodaySession(variables, settings, sessionLengthMinutes);
    setSlots(built);
  }, [variables, settings, sessionLengthMinutes]);

  const visible = slots.filter((s) => !skipped.has(s.stateId));

  const handleSkip = (stateId: string) => {
    setSkipped((prev) => new Set([...prev, stateId]));
  };

  const handleStart = () => {
    const first = visible[0];
    if (!first) return;

    const [domainId, subskillId, drillId] = first.stateId.split(':');
    navigate(`/${domainId}/${subskillId}/${drillId}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link to="/" className="text-neutral-400 hover:text-neutral-200 mb-8 inline-block">
        ← Home
      </Link>
      <h1 className="text-4xl font-bold mb-2">Today's Session</h1>
      <p className="text-neutral-400 mb-8">
        Adaptive training based on your weaknesses · ~{sessionLengthMinutes} min
      </p>

      {visible.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-400 mb-4">
            No drills available yet. Complete a few free-play drills first.
          </p>
          <Link
            to="/free-play"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
          >
            Free Play
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-8">
            {visible.map((slot, i) => (
              <div
                key={slot.stateId}
                className="p-5 bg-neutral-900 border border-neutral-800 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-neutral-500">
                        {i + 1}.
                      </span>
                      <span className="font-semibold">{slot.variableId}</span>
                      <span className="text-xs text-neutral-500">
                        {slot.subskillId}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400">{slot.reason}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500">
                      {slot.estimatedMinutes} min
                    </span>
                    <button
                      onClick={() => handleSkip(slot.stateId)}
                      className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      SKIP
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleStart}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
            >
              START SESSION
            </button>
            <Link
              to="/free-play"
              className="px-6 py-4 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-semibold transition-colors text-center"
            >
              Customize
            </Link>
          </div>
        </>
      )}
    </div>
  );
}