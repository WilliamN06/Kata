import { useState } from 'react';
import type { DrillSettings } from '@kata/core';

interface SettingsPanelProps {
  settings: DrillSettings;
  onChange: (settings: DrillSettings) => void;
  onClose: () => void;
}

export function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  const [local, setLocal] = useState(settings);

  const update = <K extends keyof DrillSettings>(key: K, value: DrillSettings[K]) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange(next);
  };

  const isManual = local.difficultyMode === 'manual';
  const isTimed = local.timed ?? false;
  const isEndless = local.endless ?? false;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-neutral-800">
          <h2 className="text-lg font-bold">Drill Settings</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          <Section label="Difficulty Mode">
            <RadioGroup
              value={local.difficultyMode}
              options={[ 
                { value: 'auto', label: 'Auto (Adaptive)' },
                { value: 'manual', label: 'Manual (Fixed)' },
              ]}
              onChange={(v) => update('difficultyMode', v as 'auto' | 'manual')}
            />
          </Section>

          <div className={isManual ? '' : 'opacity-40 pointer-events-none'}>
            <Section label="1. Range">
              <RadioGroup
                value={local.range}
                options={[ 
                  { value: 'narrow', label: 'Narrow' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'wide', label: 'Wide' },
                ]}
                onChange={(v) => update('range', v as DrillSettings['range'])}
              />
            </Section>

            <Section label="2. Tolerance">
              <RadioGroup
                value={local.tolerance}
                options={[ 
                  { value: 'loose', label: 'Loose ±5%' },
                  { value: 'moderate', label: 'Moderate ±2%' },
                  { value: 'tight', label: 'Tight ±1%' },
                ]}
                onChange={(v) => update('tolerance', v as DrillSettings['tolerance'])}
              />
            </Section>

            <Section label="3. Timing">
              <RadioGroup
                value={isTimed ? 'timed' : 'untimed'}
                options={[ 
                  { value: 'untimed', label: 'Untimed — no pressure' },
                  { value: 'timed', label: 'Timed — auto-fail on expiry' },
                ]}
                onChange={(v) => update('timed', v === 'timed')}
              />
            </Section>

            <div className={isTimed ? '' : 'opacity-40 pointer-events-none'}>
              <Section label="Seconds per Trial">
                <RadioGroup
                  value={String(local.secondsPerTrial ?? 15)}
                  options={[ 
                    { value: '5', label: '5s' },
                    { value: '10', label: '10s' },
                    { value: '15', label: '15s' },
                    { value: '30', label: '30s' },
                    { value: '60', label: '60s' },
                  ]}
                  onChange={(v) => update('secondsPerTrial', Number(v))}
                />
              </Section>
            </div>

            <Section label="4. Interaction">
              <RadioGroup
                value={local.interaction}
                options={[ 
                  { value: 'independent', label: 'Independent' },
                  { value: 'sequential', label: 'Sequential' },
                  { value: 'simultaneous', label: 'Simultaneous' },
                ]}
                onChange={(v) => update('interaction', v as DrillSettings['interaction'])}
              />
            </Section>

            <Section label="5. Variability">
              <RadioGroup
                value={local.variability}
                options={[ 
                  { value: 'predictable', label: 'Predictable' },
                  { value: 'semi', label: 'Semi-predictable' },
                  { value: 'unpredictable', label: 'Unpredictable' },
                ]}
                onChange={(v) => update('variability', v as DrillSettings['variability'])}
              />
            </Section>

            <Section label="6. Conditions">
              <RadioGroup
                value={local.conditions}
                options={[ 
                  { value: '1', label: '1' },
                  { value: '3', label: '3' },
                  { value: '6+', label: '6+' },
                ]}
                onChange={(v) => update('conditions', v as DrillSettings['conditions'])}
              />
            </Section>
          </div>

          <Section label="Session Length">
            <RadioGroup
              value={isEndless ? 'endless' : 'fixed'}
              options={[ 
                { value: 'fixed', label: 'Fixed trial count' },
                { value: 'endless', label: 'Endless — stop whenever' },
              ]}
              onChange={(v) => update('endless', v === 'endless')}
            />
          </Section>

          <div className={isEndless ? 'opacity-40 pointer-events-none' : ''}>
            <Section label="Trials per Session">
              <RadioGroup
                value={String(local.trialsPerSession ?? 20)}
                options={[ 
                  { value: '10', label: '10' },
                  { value: '20', label: '20' },
                  { value: '30', label: '30' },
                  { value: '50', label: '50' },
                ]}
                onChange={(v) => update('trialsPerSession', Number(v))}
              />
            </Section>
          </div>

          <Section label="Feedback">
            <RadioGroup
              value={local.autoContinue ? 'auto' : 'manual'}
              options={[ 
                { value: 'auto', label: 'Auto-continue (1.5s)' },
                { value: 'manual', label: 'Wait for me to tap Continue' },
              ]}
              onChange={(v) => update('autoContinue', v === 'auto')}
            />
          </Section>
        </div>

        <div className="p-5 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
        {label}
      </h3>
      {children}
    </div>
  );
}

function RadioGroup({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
            value === opt.value
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}