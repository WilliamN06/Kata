import type { DrillProps } from '@kata/core';
import { V9MicrotonalDrill, V10InversionDrill, V11EnharmonicDrill } from '../drills';

export const GroupCIntegration = () => {
  return (
    <div className="p-8 bg-neutral-900 min-h-[70vh]">
      <h2 className="text-2xl font-bold mb-4">Integration Group C</h2>
      <p className="text-neutral-400 mb-6">
        Combines V9 (microtonal), V10 (interval inversion), and V11 (enharmonic) perception
      </p>
      <button
        onClick={() => {}} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">
          Start Integration Drill
        </button>
    </div>
  );
};