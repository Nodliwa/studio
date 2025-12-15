'use server';
/**
 * @fileOverview An AI flow to suggest 'must-do' tasks for event planning.
 *
 * - suggestMustDos - A function that suggests tasks based on event type and existing tasks.
 * - SuggestMustDosInput - The input type for the suggestMustDos function.
 * - SuggestMustDosOutput - The return type for the suggestMustDos function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MustDo } from '@/lib/types';

// We don't need the full MustDo schema for the output, just the relevant parts.
const SuggestedMustDoSchema = z.object({
    title: z.string().describe('The concise title of the suggested task.'),
    note: z.string().describe('A brief, helpful note or detail for the task.'),
    importance: z.enum(['none', 'important', 'critical']).describe('The suggested priority of the task.'),
    timing: z.enum(['anytime', 'before-event', 'day-before', 'on-the-day']).describe('The suggested timing for the task relative to the event.'),
});

export const SuggestMustDosInputSchema = z.object({
  eventType: z.string().describe('The type of event, e.g., "wedding", "funeral".'),
  existingMustDos: z.array(z.string()).describe('A list of titles of existing must-do tasks to avoid suggesting duplicates.'),
});
export type SuggestMustDosInput = z.infer<typeof SuggestMustDosInputSchema>;

export const SuggestMustDosOutputSchema = z.object({
  suggestions: z.array(SuggestedMustDoSchema).describe('A list of 3-5 new, relevant must-do suggestions.'),
});
export type SuggestMustDosOutput = z.infer<typeof SuggestMustDosOutputSchema>;

export async function suggestMustDos(input: SuggestMustDosInput): Promise<SuggestMustDosOutput> {
  return suggestMustDosFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMustDosPrompt',
  input: { schema: SuggestMustDosInputSchema },
  output: { schema: SuggestMustDosOutputSchema },
  prompt: `You are an expert event planner for South African cultural events.
A user is planning a '{{eventType}}' and needs help identifying important tasks.

Based on the event type, suggest 3-5 critical or important "must-do" tasks. These are non-budgetary items essential for the event's success.

Do not suggest tasks that are already in the user's list.
Existing tasks:
{{#each existingMustDos}}
- {{this}}
{{/each}}

For each suggestion, provide a title, a brief note, and classify its importance and timing.

Examples:
- For a 'funeral', you might suggest: "Arrange family transport", "Notify extended family", "Prepare the obituary".
- For a 'wedding', you might suggest: "Send out invitations", "Finalize guest list", "Book marriage officer".

Generate creative, relevant, and practical suggestions.
`,
});

const suggestMustDosFlow = ai.defineFlow(
  {
    name: 'suggestMustDosFlow',
    inputSchema: SuggestMustDosInputSchema,
    outputSchema: SuggestMustDosOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
