import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getSubskillsByDomain, getVariablesForSubskill, getTaskTypes } from '../registry';

export function DrillPicker() {
  const { domain } = useParams<{ domain: 'drawing' | 'music' }>();
  const navigate = useNavigate();

  const subskills = getSubskillsByDomain(domain ?? 'drawing');
  const [selectedSubskill, setSelectedSubskill] = useState(subskills[0]?.id ?? '');
  const [selectedVariable, setSelectedVariable] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState('T2-discrimination');

  const variables = selectedSubskill
    ? getVariablesForSubskill(selectedSubskill)
    : [];
  const taskTypes = getTaskTypes();

  const start = () => {
    if (!selectedSubskill || !selectedVariable || !selectedTaskType) return;
    navigate(`/drill/${selectedSubskill}/${selectedVariable}/${selectedTaskType}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <button
          onClick={() => navigate('/')}
          className="text-neutral-400 hover:text-neutral-200 text-sm mb-6"
        >
          ← Home
        </button>

        <h1 className="text-3xl font-bold mb-2 capitalize">{domain}</h1>
        <p className="text-neutral-500 mb-8">Pick a drill</p>

        <div className="space-y-6">
          <Field label="Subskill">
            <select
              value={selectedSubskill}
              onChange={(e) => {
                setSelectedSubskill(e.target.value);
                setSelectedVariable('');
              }}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg"
            >
              {subskills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Variable">
            <select
              value={selectedVariable}
              onChange={(e) => setSelectedVariable(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg"
            >
              <option value="">— pick a variable —</option>
              {variables.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.id.split(':').slice(-1)[0]} · {v.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Task type">
            <select
              value={selectedTaskType}
              onChange={(e) => setSelectedTaskType(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg"
            >
              {taskTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

          <button
            onClick={start}
            disabled={!selectedSubskill || !selectedVariable}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 rounded-lg font-semibold transition-colors"
          >
            START DRILL
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
