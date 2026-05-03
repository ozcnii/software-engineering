import type { GenerationAlgorithm, LabyrinthTheme } from '../types/domain';

export const themeLabels: Record<LabyrinthTheme, string> = {
  winter: 'Зима',
  summer: 'Лето',
  autumn: 'Осень',
  spring: 'Весна',
};

export const themeMarks: Record<LabyrinthTheme, string> = {
  winter: '*',
  summer: '+',
  autumn: '~',
  spring: '.',
};

export const algorithmLabels: Record<GenerationAlgorithm, string> = {
  prim: 'Прима',
  kruskal: 'Краскала',
};
