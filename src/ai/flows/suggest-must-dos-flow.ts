
'use server';
/**
 * @fileOverview AI flow for suggesting "must-do" tasks.
 * Optimized for South African contexts and robust error handling.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestionSchema = z.object({
  title: z.string().describe('Short, actionable title (e.g., "Book photographer").'),
  note: z.string().describe('Brief helpful note (e.g., "Get quotes from 3 vendors.").'),
  priority: z.enum(['low', 'medium', 'high']).describe('Suggested priority.'),
});

const SuggestMustDosInputSchema = z.object({
  eventType: z.string().describe('The type of event, e.g., "Wedding", "Funeral".'),
  existingTitles: z.array(z.string()).describe('Existing tasks to avoid duplicates.'),
});
export type SuggestMustDosInput = z.infer<typeof SuggestMustDosInputSchema>;

const SuggestMustDosOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('Array of suggested must-do items.'),
});
export type SuggestMustDosOutput = z.infer<typeof SuggestMustDosOutputSchema>;

const suggestMustDosPrompt = ai.definePrompt({
  name: 'suggestMustDosPrompt',
  model: 'googleai/gemini-1.5-flash',
// @ts-ignore
// @ts-ignore
  input: { schema: SuggestMustDosInputSchema },
// @ts-ignore
  output: { schema: SuggestMustDosOutputSchema },
  system: `You are an expert event planner specializing in South African celebrations. 
Your goal is to suggest exactly 5 critical, non-budgetary tasks that are essential for a specific event type (e.g. Wedding, Funeral, uMemulo, uMgidi).
Always respond with valid JSON matching the output schema.`,
  prompt: `
For a celebration of type: "{{eventType}}", suggest 5 unique tasks.
Do NOT suggest tasks that are already in this list: {{#each existingTitles}}- {{this}} {{/each}}.
Consider cultural protocols if the event is traditional.
Focus on actionable planning steps.
`,
});

const suggestMustDosFlow = ai.defineFlow(
// @ts-ignore
// @ts-ignore
  {
// @ts-ignore
// @ts-ignore
    name: 'suggestMustDosFlow',
// @ts-ignore
// @ts-ignore
    inputSchema: SuggestMustDosInputSchema,
// @ts-ignore
    outputSchema: SuggestMustDosOutputSchema,
  },
  async (input) => {
    try {
      console.log('Generating AI suggestions for:', input.eventType);
      const { output } = await suggestMustDosPrompt(input);
      
      if (!output || !output.suggestions) {
        console.warn('AI returned empty suggestions list.');
        return { suggestions: [] };
      }
      
      return output;
    } catch (error: any) {
      console.error('SuggestMustDosFlow Error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      console.error('API Key present:', !!process.env.GOOGLE_GENAI_API_KEY);
      return { suggestions: [] };
    }
  }
);

export async function suggestMustDos(input: SuggestMustDosInput): Promise<SuggestMustDosOutput> {
  return await suggestMustDosFlow(input);
}
