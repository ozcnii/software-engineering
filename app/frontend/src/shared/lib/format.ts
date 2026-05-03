export function formatDifficultyStars(difficulty: number) {
  const normalizedDifficulty = Math.max(1, Math.min(3, difficulty));

  return `${'★'.repeat(normalizedDifficulty)}${'☆'.repeat(3 - normalizedDifficulty)}`;
}

export function formatElapsedTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return `${minutes}:${String(rest).padStart(2, '0')}`;
}
