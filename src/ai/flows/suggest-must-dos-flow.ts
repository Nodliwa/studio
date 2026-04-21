
'use server';
/**
 * @fileOverview Robust AI flow for suggesting "must-do" tasks for event planning.
 * Optimized for South African event contexts and Genkit 1.x.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// ✅ Input Schema
export const SuggestMustDosInputSchema = z.object({
  eventType: z.string().describe('The type of event, e.g., "Wedding", "Funeral", "uMemulo", "uMgidi".'),
  existingTitles: z.array(z.string()).describe('Titles of tasks that already exist, to avoid duplicates.'),
});
export type SuggestMustDosInput = z.infer<typeof SuggestMustDosInputSchema>;

// ✅ Suggestion Schema
const SuggestionSchema = z.object({
  title: z.string().describe('Short, actionable title (e.g., "Book photographer").'),
  note: z.string().describe('Brief helpful note (e.g., "Get quotes from 3 vendors.").'),
  priority: z.enum(['low', 'medium', 'high']).describe('Suggested priority.'),
});

// ✅ Output Schema
export const SuggestMustDosOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('Array of 5 suggested must-do items.'),
});
export type SuggestMustDosOutput = z.infer<typeof SuggestMustDosOutputSchema>;

// ✅ Refined Prompt
const suggestMustDosPrompt = ai.definePrompt({
  name: 'suggestMustDosPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: SuggestMustDosInputSchema },
  output: { schema: SuggestMustDosOutputSchema },
  system: `You are an expert event planner specializing in South African celebrations. 
Your goal is to suggest 5 critical, non-budgetary tasks that are essential for the success of a specific event type.`,
  prompt: `
For a celebration of type: "{{eventType}}", suggest exactly 5 important tasks.

Rules:
1. Do NOT suggest tasks that are already in this list: {{#each existingTitles}}- {{this}} {{/each}}.
2. If the event is traditional (like uMemulo or uMgidi), suggest tasks related to cultural protocols, attire, or community announcements.
3. Assign priority:
   - "high": Critical early-stage tasks.
   - "medium": Important logistics.
   - "low": Final touches.
4. Your response must be a valid JSON object matching the requested schema.
`,
});

// ✅ Main Flow
const suggestMustDosFlow = ai.defineFlow(
  {
    name: 'suggestMustDosFlow',
    inputSchema: SuggestMustDosInputSchema,
    outputSchema: SuggestMustDosOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await suggestMustDosPrompt(input);
      if (!output) {
        console.error('SuggestMustDosFlow: No output from model');
        return { suggestions: [] };
      }
      return output;
    } catch (error) {
      console.error('SuggestMustDosFlow Error:', error);
      return { suggestions: [] };
    }
  }
);

export async function suggestMustDos(input: SuggestMustDosInput): Promise<SuggestMustDosOutput> {
  return await suggestMustDosFlow(input);
}
