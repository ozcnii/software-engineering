import type {
  Coordinate,
  EntryMode,
  GenerationAlgorithm,
  LabyrinthDetail,
  LabyrinthListItem,
  LabyrinthTheme,
  MazeGrid,
  SolvingAlgorithm,
  SolveLabyrinthResponse,
  User,
} from './domain';

export interface ApiFieldErrors {
  [field: string]: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  fields?: ApiFieldErrors;
}

export interface ApiErrorResponse {
  error: ApiErrorPayload;
}

export interface UserResponse {
  user: User;
}

export interface LoginPayload {
  login: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  passwordConfirm: string;
}

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
  entry: Coordinate;
  exit: Coordinate;
}

export interface GenerateLabyrinthResponse extends GenerateLabyrinthPayload {
  grid: MazeGrid;
}

export interface LabyrinthNameAvailabilityResponse {
  available: boolean;
}

export interface CreateLabyrinthPayload {
  name: string;
  width: number;
  height: number;
  theme: LabyrinthTheme;
  generationAlgorithm: GenerationAlgorithm;
  entryMode: EntryMode;
  grid: MazeGrid;
}

export interface SolveLabyrinthPayload {
  algorithm: SolvingAlgorithm;
}

export type { SolveLabyrinthResponse };
