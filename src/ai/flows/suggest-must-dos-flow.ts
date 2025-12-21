
'use server';
/**
 * @fileOverview Robust AI flow for suggesting "must-do" tasks for event planning.
 * Includes strict JSON enforcement, detailed priority guidance, and safe parsing.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// ✅ Input Schema
export const SuggestMustDosInputSchema = z.object({
  eventType: z.string().describe('The type of event, e.g., "Wedding", "Funeral".'),
  existingTitles: z.array(z.string()).describe('Titles of tasks that already exist, to avoid duplicates.'),
});
export type SuggestMustDosInput = z.infer<typeof SuggestMustDosInputSchema>;

// ✅ Suggestion Schema - This is what the LLM will generate
const SuggestionSchema = z.object({
  title: z.string().describe('Short, actionable title (e.g., "Book photographer").'),
  note: z.string().describe('Brief helpful note (e.g., "Get quotes from 3 vendors.").'),
  priority: z.enum(['low', 'medium', 'high']).describe('Suggested priority.'),
});

// ✅ Output Schema - The final, typed output of the flow
export const SuggestMustDosOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('Array of 5 suggested must-do items.'),
});
export type SuggestMustDosOutput = z.infer<typeof SuggestMustDosOutputSchema>;

// ✅ Improved and Strict Prompt
const suggestMustDosPrompt = ai.definePrompt({
  name: 'suggestMustDosPrompt',
  input: { schema: SuggestMustDosInputSchema },
  output: { schema: SuggestMustDosOutputSchema },
  prompt: `
You are an expert event planner. For a {{eventType}}, suggest exactly 5 critical, non-budgetary tasks.

Follow these rules strictly:
1.  Do NOT suggest any tasks from this list of existing tasks: {{#each existingTitles}}- {{this}} {{/each}}.
2.  If no new, relevant tasks come to mind, return an empty array for "suggestions".
3.  Assign priority based on these guidelines:
    - "high": For tasks that must be done early or are critical to the event's success.
    - "medium": For important but less time-sensitive tasks.
    - "low": For "nice-to-have" tasks or final touches.
4.  Your response MUST be a valid JSON object that strictly adheres to the provided output schema. Do not add any extra text, explanations, or markdown formatting.
`,
});

// ✅ Main Flow with Safe Parsing & Fallback
const suggestMustDosFlow = ai.defineFlow(
  {
    name: 'suggestMustDosFlow',
    inputSchema: SuggestMustDosInputSchema,
    outputSchema: SuggestMustDosOutputSchema,
  },
  async (input) => {
    const llmResponse = await suggestMustDosPrompt(input);
    const output = llmResponse.output();

    if (!output) {
      console.error('AI returned a null or undefined output.');
      throw new Error('AI returned no output.');
    }

    // Validate output using Zod safeParse
    const parsed = SuggestMustDosOutputSchema.safeParse(output);
    if (!parsed.success) {
      console.error('Validation error:', parsed.error);
      // Log raw response for debugging
      console.error('Raw AI response:', llmResponse.raw());
      throw new Error('AI returned invalid JSON or missing fields.');
    }

    // Fallback if no suggestions
    if (!parsed.data.suggestions) {
      return { suggestions: [] };
    }

    return parsed.data;
  }
);

// ✅ Wrapper Function
export async function suggestMustDos(input: SuggestMustDosInput): Promise<SuggestMustDosOutput> {
  return suggestMustDosFlow(input);
}
