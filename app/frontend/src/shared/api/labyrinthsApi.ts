import { apiRequest } from './client';
import type {
  EntryMode,
  GenerationAlgorithm,
  LabyrinthDetail,
  LabyrinthListItem,
  LabyrinthTheme,
  MazeGrid,
  SolvingAlgorithm,
  SolveLabyrinthResponse,
} from '../types/domain';

export interface LabyrinthListResponse {
  items: LabyrinthListItem[];
  nextCursor: string | null;
}

export interface LabyrinthListQuery {
  search?: string;
  cursor?: string | null;
  limit?: number;
}

export interface GenerateLabyrinthPayload {
  width: number;
  height: number;
  theme: LabyrinthTheme;
  generationAlgorithm: GenerationAlgorithm;
  entryMode: EntryMode;
}

export interface GenerateLabyrinthResponse extends GenerateLabyrinthPayload {
  grid: MazeGrid;
}

export interface CreateLabyrinthPayload extends GenerateLabyrinthPayload {
  name: string;
  grid: MazeGrid;
}

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
