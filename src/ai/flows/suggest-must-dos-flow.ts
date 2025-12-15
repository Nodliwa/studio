'use server';
/**
 * @fileOverview An AI flow to suggest 'must-do' tasks for event planning.
 *
 * - suggestMustDos - A function that suggests tasks based on event type and existing tasks.
 */

import { ai } from '@/ai/genkit';
import {
  SuggestMustDosInputSchema,
  SuggestMustDosOutputSchema,
  type SuggestMustDosInput,
  type SuggestMustDosOutput,
} from './schemas';

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
