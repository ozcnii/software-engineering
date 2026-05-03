import { useCallback } from 'react';
import { useInterval } from '../../../shared/hooks/useInterval';

export function usePlayerTimer(isRunning: boolean, onTick: () => void) {
  const tick = useCallback(() => {
    onTick();
  }, [onTick]);

  useInterval(tick, isRunning ? 1000 : null);
}
