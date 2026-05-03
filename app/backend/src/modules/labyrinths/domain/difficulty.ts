export function computeDifficulty(width: number, height: number) {
  const maxSide = Math.max(width, height);

  if (maxSide <= 7) {
    return 1;
  }

  if (maxSide <= 13) {
    return 2;
  }

  return 3;
}
