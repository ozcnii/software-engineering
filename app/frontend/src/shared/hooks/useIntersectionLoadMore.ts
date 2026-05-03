import { useEffect, type RefObject } from 'react';

export function useIntersectionLoadMore(
  sentinelRef: RefObject<HTMLElement | null>,
  onLoadMore: () => void,
  rootMargin = '240px',
) {
  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore();
        }
      },
      { rootMargin },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [onLoadMore, rootMargin, sentinelRef]);
}
