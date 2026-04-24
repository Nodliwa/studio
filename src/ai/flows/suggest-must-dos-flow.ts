'use server';
/**
 * @fileOverview A flow for suggesting critical must-do tasks for an event.
 *
 * - suggestMustDos - A function that returns AI-generated planning suggestions.
 * - SuggestMustDosInput - Input type for the flow.
 * - SuggestMustDosOutput - Output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestMustDosInputSchema = z.object({
  eventType: z.string().describe('The type of event (e.g., Wedding, Birthday, Funeral).'),
  existingTitles: z.array(z.string()).describe('A list of tasks that already exist and should not be suggested again.'),
});
export type SuggestMustDosInput = z.infer<typeof SuggestMustDosInputSchema>;

const SuggestMustDosOutputSchema = z.object({
  suggestions: z.array(z.object({
    title: z.string().describe('A short, action-oriented title for the task.'),
    note: z.string().describe('A brief helpful note or context for the task.'),
    priority: z.enum(['low', 'medium', 'high']).describe('The priority level of the task.'),
  })).describe('Exactly 5 critical planning tasks.'),
});
export type SuggestMustDosOutput = z.infer<typeof SuggestMustDosOutputSchema>;

export async function suggestMustDos(input: SuggestMustDosInput): Promise<SuggestMustDosOutput> {
  return suggestMustDosFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMustDosPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: SuggestMustDosInputSchema },
  output: { schema: SuggestMustDosOutputSchema },
  config: {
    temperature: 0.7,
  },
  prompt: `You are an expert event planner specializing in South African celebrations.
For a {{eventType}} event, suggest exactly 5 critical non-budgetary planning tasks.

{{#if existingTitles}}
Do NOT suggest any of these existing tasks: {{#each existingTitles}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
{{/if}}

Consider cultural protocols if the event is traditional (uMemulo, uMgidi, etc).
Focus on actionable planning steps. Your output MUST be valid JSON following the schema provided.`,
});

const suggestMustDosFlow = ai.defineFlow(
  {
    name: 'suggestMustDosFlow',
    inputSchema: SuggestMustDosInputSchema,
    outputSchema: SuggestMustDosOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      return { suggestions: [] };
    }
    return output;
  }
);
