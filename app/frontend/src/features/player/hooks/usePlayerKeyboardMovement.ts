import { useEffect } from 'react';
import type { Direction } from '../model/playerState';

interface UsePlayerKeyboardMovementOptions {
  enabled: boolean;
  onMove: (direction: Direction) => void;
}

export function usePlayerKeyboardMovement({
  enabled,
  onMove,
}: UsePlayerKeyboardMovementOptions) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!enabled) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const direction = directionByKey[event.key];

      if (direction) {
        event.preventDefault();
        onMove(direction);
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, onMove]);
}

const directionByKey: Record<string, Direction | undefined> = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ц: 'up',
  Ц: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ы: 'down',
  Ы: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ф: 'left',
  Ф: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
  в: 'right',
  В: 'right',
};
