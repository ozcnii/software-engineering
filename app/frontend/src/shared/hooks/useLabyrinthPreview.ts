import { useEffect, useState } from 'react';
import { labyrinthsApi } from '../api/labyrinthsApi';
import { getErrorMessage } from '../lib/errors';
import type { LabyrinthDetail } from '@labyrinth/shared/types/domain';

const previewCache = new Map<string, LabyrinthDetail>();

export function useLabyrinthPreview(labyrinthId: string, enabled: boolean) {
  const [detail, setDetail] = useState<LabyrinthDetail | null>(
    () => previewCache.get(labyrinthId) ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const cached = previewCache.get(labyrinthId);

    if (cached) {
      setDetail(cached);
      setIsLoading(false);
      setError('');
      return undefined;
    }

    let isMounted = true;

    setIsLoading(true);
    setError('');

    labyrinthsApi
      .detail(labyrinthId)
      .then((response) => {
        previewCache.set(labyrinthId, response);

        if (isMounted) {
          setDetail(response);
        }
      })
      .catch((previewError: unknown) => {
        if (isMounted) {
          setError(getErrorMessage(previewError, 'Не удалось загрузить предпросмотр'));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [enabled, labyrinthId]);

  return {
    detail,
    isLoading,
    error,
  };
}
