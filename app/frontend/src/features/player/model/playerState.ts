import { formatElapsedTime } from '../../../shared/lib/format';
import type { Coordinate, LabyrinthDetail } from '../../../shared/types/domain';

export type ControlMode = 'manual' | 'auto';
export type AutoDisplayMode = 'animated' | 'instant';
export type Direction = 'up' | 'down' | 'left' | 'right';
export type ProgressSource = 'none' | 'manual' | 'auto';

export interface PlayerRunState {
  position: Coordinate;
  trail: Coordinate[];
  steps: number;
  elapsedSeconds: number;
  isFinished: boolean;
  progressSource: ProgressSource;
}

export function createInitialRunState(labyrinth: LabyrinthDetail): PlayerRunState {
  return {
    position: labyrinth.entry,
    trail: [labyrinth.entry],
    steps: 0,
    elapsedSeconds: 0,
    isFinished: false,
    progressSource: 'none',
  };
}

export function hasProgress(run: PlayerRunState | null) {
  return Boolean(run && (run.steps > 0 || run.isFinished));
}

export function formatElapsed(seconds: number) {
  return formatElapsedTime(seconds);
}
