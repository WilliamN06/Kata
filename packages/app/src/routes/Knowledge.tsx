import { Link, useParams } from 'react-router-dom';
import { getSubskill } from '../registry';

export function Knowledge() {
  const { domainId, subskillId } = useParams<{ domainId: string; subskillId: string }>();

  if (!domainId || !subskillId) return null;
  const subskill = getSubskill(domainId, subskillId);

  if (!subskill) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <p className="text-neutral-400">Subskill not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link
        to={`/${domainId}/${subskillId}`}
        className="text-neutral-400 hover:text-neutral-200 mb-8 inline-block"
      >
        ← {subskill.name}
      </Link>
      <h1 className="text-4xl font-bold mb-2">{subskill.name} · Knowledge</h1>
      <p className="text-neutral-400 mb-10">
        Conceptual, declarative, and procedural knowledge for this subskill.
      </p>

      <Section title="Conceptual Knowledge" subtitle="Relationships between variables">
        <ul className="space-y-2 text-sm text-neutral-300">
          <li>• JND is smallest detectable Δvalue. Midrange (3–7) most sensitive (JND ~1%).</li>
          <li>• Simultaneous contrast: a gray appears darker on white, lighter on black.</li>
          <li>• Lightness constancy: white paper in shadow seen as white, not gray.</li>
          <li>• Mach bands exaggerate contrast at value boundaries.</li>
        </ul>
      </Section>

      <Section title="Declarative Knowledge" subtitle="Facts about values">
        <ul className="space-y-2 text-sm text-neutral-300">
          <li>• Untrained artists: JND ~3–5%. Trained: 1–2%.</li>
          <li>• Yellow inherent value = 8. Red = 5. Blue = 4. Green = 5. Purple = 3.</li>
          <li>• Memory decay: ~2–3% error per 5 seconds without rehearsal.</li>
          <li>• Scale matching: untrained 5–15% error; trained 2–5%.</li>
        </ul>
      </Section>

      <Section title="Procedural Knowledge" subtitle="Methods for control">
        <ol className="space-y-2 text-sm text-neutral-300 list-decimal list-inside">
          <li>Calibrate: dark-adapt 30s, allow adaptation to scene brightness, place value scale in same lighting.</li>
          <li>Judge: isolate target, squint to eliminate detail/colour, compare to value scale, judge away from edges.</li>
          <li>Transfer: rehearse value verbally, draw immediately, compare to scale.</li>
          <li>Verify: check ordering (is drawn value lighter or darker than adjacent?), re-check against reference.</li>
        </ol>
      </Section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-xs text-neutral-500 mb-4">{subtitle}</p>
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">{children}</div>
    </div>
  );
}