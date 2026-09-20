import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '@kata/db';
import type { DrillSettings } from '@kata/core';

export function Settings() {
  const store = useStore();
  const settings = store.settings;
  const saveSettings = store.saveSettings;

  const [local, setLocal] = useState<DrillSettings>({ ...settings });

  const update = <K extends keyof DrillSettings>(key: K, value: DrillSettings[K]) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    void saveSettings(next);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <h2 className="font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );

  const SelectInput = ({
    settingKey,
    label,
    options,
  }: {
    settingKey: keyof DrillSettings;
    label: string;
    options: { value: DrillSettings[keyof DrillSettings]; label: string }[];
  }) => (
    <div className="mb-4">
      <label className="block text-xs text-neutral-500 mb-1">{label}</label>
      <select
        value={String(local[settingKey] ?? '')}
        onChange={(e) => update(settingKey, e.target.value as DrillSettings[keyof DrillSettings])}
        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 focus:border-blue-500 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const CheckboxInput = ({ key, label }: { key: keyof DrillSettings; label: string }) => (
    <label className="flex items-center gap-2 mb-4">
      <input
        type="checkbox"
        checked={Boolean(local[key])}
        onChange={(e) => update(key as keyof DrillSettings, e.target.checked)}
        className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-blue-600 focus:ring-blue-505"
      />
      <span className="text-sm text-neutral-300">{label}</span>
    </label>
  );

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link to="/" className="text-neutral-400 hover:text-neutral-200 mb-8 inline-block">← Home</Link>
      <h1 className="text-4xl font-bold mb-2">Settings</h1>
      <p className="text-neutral-400 mb-10">Global defaults. Override per subskill or drill in their screens.</p>

      <div className="space-y-8">
        <Section title="Difficulty Mode">
          <SelectInput settingKey="difficultyMode" label="Mode" options={[
            { value: 'auto', label: 'Auto (Adaptive Staircase)' },
            { value: 'manual', label: 'Manual (Fixed Difficulty)' },
          ]} />
        </Section>

        <div className={local.difficultyMode === 'auto' ? 'opacity-40 pointer-events-none' : ''}>
          <Section title="1. Range">
            <SelectInput settingKey="range" label="Range" options={[
              { value: 'narrow', label: 'Narrow' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'wide', label: 'Wide' },
            ]} />
          </Section>

          <Section title="2. Tolerance">
            <SelectInput settingKey="tolerance" label="Tolerance" options={[
              { value: 'loose', label: 'Loose ±5%' },
              { value: 'moderate', label: 'Moderate ±2%' },
              { value: 'tight', label: 'Tight ±1%' },
            ]} />
          </Section>

          <Section title="3. Timing">
            <div className="space-y-4">
              <CheckboxInput key="timed" label="Enable timed trials" />
              <div className={local.timed ? '' : 'opacity-40 pointer-events-none'}>
                <label className="block text-xs text-neutral-500 mb-1">Seconds per trial</label>
                <select
                  value={String(local.secondsPerTrial ?? 15)}
                  onChange={(e) => update('secondsPerTrial', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100"
                >
                  <option value="5">5s</option>
                  <option value="10">10s</option>
                  <option value="15">15s</option>
                  <option value="30">30s</option>
                  <option value="60">60s</option>
                </select>
              </div>
            </div>
          </Section>

          <Section title="4. Interaction">
            <SelectInput settingKey="interaction" label="Interaction" options={[
              { value: 'independent', label: 'Independent' },
              { value: 'sequential', label: 'Sequential' },
              { value: 'simultaneous', label: 'Simultaneous' },
            ]} />
          </Section>

          <Section title="5. Variability">
            <SelectInput settingKey="variability" label="Variability" options={[
              { value: 'predictable', label: 'Predictable' },
              { value: 'semi', label: 'Semi-predictable' },
              { value: 'unpredictable', label: 'Unpredictable' },
            ]} />
          </Section>

          <Section title="6. Conditions">
            <SelectInput settingKey="conditions" label="Conditions" options={[
              { value: '1', label: '1' },
              { value: '3', label: '3' },
              { value: '6+', label: '6+' },
            ]} />
          </Section>

          <Section title="7. Task Condition">
            <SelectInput settingKey="taskCondition" label="Task Condition" options={[
              { value: 'none', label: 'None' },
              { value: 'media', label: 'Media' },
              { value: 'time', label: 'Time' },
              { value: 'subject', label: 'Subject' },
              { value: 'scale', label: 'Scale' },
            ]} />
          </Section>

          <Section title="8. Background Condition">
            <SelectInput settingKey="backgroundCondition" label="Background Condition" options={[
              { value: 'none', label: 'None' },
              { value: 'lighting', label: 'Lighting' },
              { value: 'background_value', label: 'Background Value' },
              { value: 'colour', label: 'Colour' },
              { value: 'surface', label: 'Surface' },
              { value: 'distance', label: 'Distance' },
              { value: 'angle', label: 'Angle' },
              { value: 'noise', label: 'Noise' },
              { value: 'temperature', label: 'Temperature' },
              { value: 'time_of_day', label: 'Time of Day' },
            ]} />
          </Section>
        </div>

        <Section title="Step Size Range (%)">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="stepSizeMin" className="block text-xs text-neutral-500 mb-1">Min Step %</label>
              <input id="stepSizeMin" type="number" min="1" max="20" step={1}
                value={local.stepSizeMin ?? 1}
                onChange={(e) => setLocal({ ...local, stepSizeMin: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100" />
            </div>
            <div>
              <label htmlFor="stepSizeMax" className="block text-xs text-neutral-500 mb-1">Max Step %</label>
              <input id="stepSizeMax" type="number" min="1" max="20" step={1}
                value={local.stepSizeMax ?? 5}
                onChange={(e) => setLocal({ ...local, stepSizeMax: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100" />
            </div>
          </div>
        </Section>

        <Section title="Session Settings">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="trialsPerSession" className="block text-xs text-neutral-500 mb-1">Questions per Session</label>
              <input id="trialsPerSession" type="number" min="1" max="200" step={1}
                value={local.trialsPerSession ?? 20}
                onChange={(e) => setLocal({ ...local, trialsPerSession: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100" />
            </div>
            <div>
              <label htmlFor="streakThreshold" className="block text-xs text-neutral-500 mb-1">Streak Threshold</label>
              <input id="streakThreshold" type="number" min="1" max="50" step={1}
                value={local.streakThreshold ?? 5}
                onChange={(e) => setLocal({ ...local, streakThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="answerDisplayDuration" className="block text-xs text-neutral-500 mb-1">Feedback Duration (ms)</label>
              <input id="answerDisplayDuration" type="number" min="500" max="10000" step={100}
                value={local.answerDisplayDuration ?? 1500}
                onChange={(e) => setLocal({ ...local, answerDisplayDuration: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Endless Mode</label>
              <label className="flex items-center gap-2">
                <input type="checkbox"
                  checked={Boolean(local.endless)}
                  onChange={(e) => update('endless', e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-neutral-300">Enable</span>
              </label>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

