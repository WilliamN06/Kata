import type { DrillProps } from '@kata/core';
import { V4PitchClassDrill, V5ContourDrill, V6FusionDrill } from '../drills';

export const GroupBIntegration = () => {
  return (
    <div className="p-8 bg-neutral-900 min-h-[70vh]">
      <h2 className="text-2xl font-bold mb-4">Integration Group B</h2>
      <p className="text-neutral-400 mb-6">
        Combines V4 (pitch class), V5 (melodic contour), and V6 (pitch fusion) perception
      </p>
      <button
        onClick={() => {}} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">
          Start Integration Drill
        </button>
    </div>
  );
};