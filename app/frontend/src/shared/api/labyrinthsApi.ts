import { apiRequest } from './client';
import type {
  CreateLabyrinthPayload,
  GenerateLabyrinthPayload,
  GenerateLabyrinthResponse,
  LabyrinthListQuery,
  LabyrinthListResponse,
} from '@labyrinth/shared/types/api';
import type {
  LabyrinthDetail,
  SolvingAlgorithm,
  SolveLabyrinthResponse,
} from '@labyrinth/shared/types/domain';

export const labyrinthsApi = {
  list(query: LabyrinthListQuery = {}) {
    const params = new URLSearchParams();

    if (query.search) {
      params.set('search', query.search);
    }

    if (query.cursor) {
      params.set('cursor', query.cursor);
    }

    if (query.limit) {
      params.set('limit', String(query.limit));
    }

    const suffix = params.toString();

    return apiRequest<LabyrinthListResponse>(`/api/labyrinths${suffix ? `?${suffix}` : ''}`);
  },

  generate(payload: GenerateLabyrinthPayload) {
    return apiRequest<GenerateLabyrinthResponse>('/api/labyrinths/generate', {
      method: 'POST',
      body: payload,
    });
  },

  create(payload: CreateLabyrinthPayload) {
    return apiRequest<LabyrinthDetail>('/api/labyrinths', {
      method: 'POST',
      body: payload,
    });
  },

  delete(id: string) {
    return apiRequest<void>(`/api/labyrinths/${id}`, {
      method: 'DELETE',
    });
  },

  detail(id: string) {
    return apiRequest<LabyrinthDetail>(`/api/labyrinths/${id}`);
  },

  solve(id: string, algorithm: SolvingAlgorithm) {
    return apiRequest<SolveLabyrinthResponse>(`/api/labyrinths/${id}/solve`, {
      method: 'POST',
      body: { algorithm },
    });
  },
};
