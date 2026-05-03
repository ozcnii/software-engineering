import { useEffect } from 'react';

export function useInterval(callback: () => void, delayMs: number | null) {
  useEffect(() => {
    if (delayMs === null) {
      return undefined;
    }

    const interval = window.setInterval(callback, delayMs);

    return () => window.clearInterval(interval);
  }, [callback, delayMs]);
}
