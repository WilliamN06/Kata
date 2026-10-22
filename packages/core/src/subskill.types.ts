import type { Domain, SubskillId, VariableId, TaskType } from '../types.new';
import type { ReactNode } from 'react';

export interface Subskill {
  id: SubskillId;
  name: string;
  domain: Domain;
  definition: string;
  variables: VariableId[];
  drills: Record<TaskType, DrillDefinition>;
}

export interface DrillDefinition {
  variableId: VariableId;
  renderer: (props: DrillProps) => ReactNode;
  defaultTrials: number;
}

export interface DrillProps {
  variableId: VariableId;
  taskType: TaskType;
  taskConditions: {
    repetitions: number | 'endless';
    speedSeconds: number | 'untimed';
    interTrialIntervalSeconds: number;
    responseDeadlineSeconds: number | 'none';
    feedbackTiming: 'immediate' | 'delayed' | 'session-end';
    feedbackDelaySeconds: number;
    feedbackType: 'correct-incorrect' | 'specific-error' | 'timed';
    sessionLengthMinutes: number | 'endless';
    enableRatings: boolean;
  };
  variableParams: Record<string, string | number>;
  stimulusParams: Record<string, string | number>;
  currentValue: number;
  onAnswer: (result: {
    correct: boolean;
    responseTimeMs: number;
    userResponse: unknown;
    correctResponse: unknown;
    rating?: Record<string, number>;
  }) => void;
  calibratedLStar?: (target: number) => number;
}
