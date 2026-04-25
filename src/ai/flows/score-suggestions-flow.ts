export type ScoredSuggestion = {
  title: string;
  score: number;
};

export function scoreByPriority(
  suggestions: Array<{ title: string; priority: string }>
): ScoredSuggestion[] {
  return suggestions.map(s => ({
    title: s.title,
    score: s.priority === 'high' ? 0.9 : s.priority === 'medium' ? 0.7 : 0.5,
  }));
}
