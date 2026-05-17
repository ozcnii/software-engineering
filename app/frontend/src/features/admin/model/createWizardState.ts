import type {
  EntryMode,
  GenerationAlgorithm,
  LabyrinthTheme,
} from '@labyrinth/shared/types/domain';

export interface WizardParams {
  name: string;
  width: number;
  height: number;
  theme: LabyrinthTheme;
  entryMode: EntryMode;
  generationAlgorithm: GenerationAlgorithm;
}

export const defaultParams: WizardParams = {
  name: '',
  width: 11,
  height: 11,
  theme: 'winter',
  entryMode: 'auto',
  generationAlgorithm: 'prim',
};
