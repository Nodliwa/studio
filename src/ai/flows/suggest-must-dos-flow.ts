'use server';
/**
 * @fileOverview An AI flow for suggesting "must-do" tasks for event planning.
 *
 * This file defines a Genkit flow that uses an AI model to generate a list of
 * critical, non-budgetary tasks for a given event type. It takes the event type
 * and a list of existing task titles to avoid duplicates.
 *
 * - suggestMustDos: The main function to call the AI flow.
 * - SuggestMustDosInput: The Zod schema for the input.
 * - SuggestMustDosOutput: The Zod schema for the output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the schema for the input of the flow.
export const SuggestMustDosInputSchema = z.object({
  eventType: z.string().describe('The type of event, e.g., "Wedding", "Funeral".'),
  existingTitles: z.array(z.string()).describe('A list of titles of must-do items that already exist, to avoid suggesting duplicates.'),
});
export type SuggestMustDosInput = z.infer<typeof SuggestMustDosInputSchema>;

// Define the schema for a single suggestion.
const SuggestionSchema = z.object({
    title: z.string().describe('A short, actionable title for the task (e.g., "Book photographer").'),
    note: z.string().describe('A brief, helpful note or context for the task (e.g., "Get quotes from at least 3 vendors.").'),
});

// Define the schema for the output of the flow.
export const SuggestMustDosOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('An array of 3 to 5 suggested must-do items.'),
});
export type SuggestMustDosOutput = z.infer<typeof SuggestMustDosOutputSchema>;

/**
 * An asynchronous wrapper function that executes the suggestMustDosFlow.
 * @param input The input data matching the SuggestMustDosInput schema.
 * @returns A promise that resolves to the flow's output.
 */
export async function suggestMustDos(input: SuggestMustDosInput): Promise<SuggestMustDosOutput> {
  return suggestMustDosFlow(input);
}

// Define the AI prompt for generating suggestions.
const suggestMustDosPrompt = ai.definePrompt({
  name: 'suggestMustDosPrompt',
  input: {schema: SuggestMustDosInputSchema},
  output: {schema: SuggestMustDosOutputSchema},
  prompt: `
    You are an expert event planner for various cultural events in South Africa.
    Your task is to suggest 3 to 5 critical, non-budgetary "must-do" action items for a {{eventType}}.

    These are tasks that need to be done, not items to be bought. For example, "Book a venue" is a great suggestion, but "Buy a cake" is not.

    Do not suggest any of the following tasks, as they already exist:
    {{#each existingTitles}}
    - {{this}}
    {{/each}}

    Provide creative, practical, and essential suggestions. For each suggestion, provide a concise title and a brief, helpful note. Your response MUST be in the format described by the output schema.
  `,
});

// Define the main Genkit flow.
const suggestMustDosFlow = ai.defineFlow(
  {
    name: 'suggestMustDosFlow',
    inputSchema: SuggestMustDosInputSchema,
    outputSchema: SuggestMustDosOutputSchema,
  },
  async input => {
    const {output} = await suggestMustDosPrompt(input);
    // Ensure the output is not null. If it is, return an empty array.
    return output ?? { suggestions: [] };
  }
);
