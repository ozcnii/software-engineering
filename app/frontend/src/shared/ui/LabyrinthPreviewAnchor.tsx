import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { LabyrinthListItem } from '@labyrinth/shared/types/domain';
import { useLabyrinthPreview } from '../hooks/useLabyrinthPreview';
import { MazePreview } from './MazePreview';

interface LabyrinthPreviewAnchorProps {
  item: LabyrinthListItem;
  children: ReactNode;
}

interface PreviewPosition {
  top: number;
  left: number;
}

const PREVIEW_WIDTH = 220;
const PREVIEW_OFFSET = 8;
const VIEWPORT_PADDING = 12;

export function LabyrinthPreviewAnchor({ item, children }: LabyrinthPreviewAnchorProps) {
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<PreviewPosition | null>(null);
  const preview = useLabyrinthPreview(item.id, isOpen);

  function updatePosition() {
    const anchor = anchorRef.current;

    if (!anchor) {
      return;
    }

    const rect = anchor.getBoundingClientRect();
    const maxLeft = window.innerWidth - PREVIEW_WIDTH - VIEWPORT_PADDING;

    setPosition({
      top: rect.bottom + PREVIEW_OFFSET,
      left: Math.max(VIEWPORT_PADDING, Math.min(rect.left, maxLeft)),
    });
  }

  function openPreview() {
    updatePosition();
    setIsOpen(true);
  }

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  return (
    <span
      ref={anchorRef}
      className="maze-preview-anchor"
      onMouseEnter={openPreview}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={openPreview}
      onBlur={() => setIsOpen(false)}
    >
      {children}
      {isOpen && position
        ? createPortal(
            <MazePreview
              item={item}
              detail={preview.detail}
              isLoading={preview.isLoading}
              error={preview.error}
              position={position}
            />,
            document.body,
          )
        : null}
    </span>
  );
}
