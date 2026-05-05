import type { ApiFieldErrors } from '@labyrinth/shared/types/api';
import type { WizardParams } from '../model/createWizardState';

export function validateParams(params: WizardParams): ApiFieldErrors {
  const errors: ApiFieldErrors = {};

  if (!params.name.trim()) {
    errors.name = 'Введите название лабиринта';
  }

  if (!isValidSize(params.width)) {
    errors.width = 'Ширина должна быть нечётным числом от 7 до 25';
  }

  if (!isValidSize(params.height)) {
    errors.height = 'Высота должна быть нечётным числом от 7 до 25';
  }

  if (!params.theme) {
    errors.theme = 'Выберите тему';
  }

  if (!params.entryMode) {
    errors.entryMode = 'Выберите режим входа и выхода';
  }

  if (!params.generationAlgorithm) {
    errors.generationAlgorithm = 'Выберите алгоритм генерации';
  }

  return errors;
}

function isValidSize(value: number) {
  return Number.isInteger(value) && value >= 7 && value <= 25 && value % 2 === 1;
}
