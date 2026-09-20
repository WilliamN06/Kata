import type { DrillProps } from '@kata/core';
import { V1IntervalDrill, V2ChordDrill, V3TonalCentreDrill } from '../drills';

export const GroupAIntegration = () => {
  return (
    <div className="p-8 bg-neutral-900 min-h-[70vh]">
      <h2 className="text-2xl font-bold mb-4">Integration Group A</h2>
      <p className="text-neutral-400 mb-6">
        Combines V1 (interval), V2 (chord), and V3 (tonal centre) perception
      </p>
      <button
        onClick={() => {}} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">
          Start Integration Drill
        </button>
    </div>
  );
};