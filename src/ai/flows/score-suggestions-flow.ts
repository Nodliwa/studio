
'use server';
/**
 * @fileOverview Refactored scoring flow using Genkit and Google AI.
 * Ranks suggestions based on relevance to the specific event context.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const ScoredSuggestionSchema = z.object({
  title: z.string(),
  score: z.number().min(0).max(1),
});
export type ScoredSuggestion = z.infer<typeof ScoredSuggestionSchema>;

const ScoreSuggestionsInputSchema = z.object({
  suggestions: z.array(z.string()),
  context: z.string(),
});

const ScoreSuggestionsOutputSchema = z.object({
  rankedSuggestions: z.array(ScoredSuggestionSchema),
});

const scoreSuggestionsPrompt = ai.definePrompt({
  name: 'scoreSuggestionsPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: ScoreSuggestionsInputSchema },
  output: { schema: ScoreSuggestionsOutputSchema },
  prompt: `
You are an expert event planner's assistant. Rank these suggestions based on their relevance to: "{{context}}".

Suggestions to rank:
{{#each suggestions}}
- {{this}}
{{/each}}

Instructions:
1. Assign a score from 0.0 (not relevant) to 1.0 (highly relevant).
2. Ensure the titles match the input exactly.
3. Return the result as a JSON array named "rankedSuggestions".
`,
});

const scoreSuggestionsFlow = ai.defineFlow(
  {
    name: 'scoreSuggestionsFlow',
    inputSchema: ScoreSuggestionsInputSchema,
    outputSchema: z.array(ScoredSuggestionSchema),
  },
  async (input) => {
    try {
      const { output } = await scoreSuggestionsPrompt(input);
      return output?.rankedSuggestions || input.suggestions.map(s => ({ title: s, score: 0.5 }));
    } catch (error) {
      console.error('ScoreSuggestionsFlow Error:', error);
      return input.suggestions.map(s => ({ title: s, score: 0.5 }));
    }
  }
);

export async function scoreSuggestions(suggestions: string[], context: string): Promise<ScoredSuggestion[]> {
  return await scoreSuggestionsFlow({ suggestions, context });
}
