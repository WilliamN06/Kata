import React from 'react';
import type { DrillProps } from '@kata/core';

export function ProportionDrillWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      {children}
    </div>
  );
}
