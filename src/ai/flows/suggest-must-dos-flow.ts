
'use server';
/**
 * @fileOverview An AI flow for suggesting "must-do" tasks for event planning.
 *
 * This file defines a Genkit flow that uses an AI model to generate a list of
 * critical, non-budgetary tasks for a given event type. It takes the event type
 * and a list of existing task titles to avoid duplicates.
 *
 * - suggestMustDos: The main function to call the AI flow.
 * - SuggestMustDosInputSchema: The Zod schema for the input.
 * - SuggestMustDosOutputSchema: The Zod schema for the output.
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
 * This is the primary function to be called from the UI.
 * @param input The input data matching the SuggestMustDosInput schema.
 * @returns A promise that resolves to the flow's output.
 */
export async function suggestMustDos(input: SuggestMustDosInput): Promise<SuggestMustDosOutput> {
  return suggestMustDosFlow(input);
}

// Define the main Genkit flow. This new implementation is more direct and robust.
const suggestMustDosFlow = ai.defineFlow(
  {
    name: 'suggestMustDosFlow',
    inputSchema: SuggestMustDosInputSchema,
    outputSchema: SuggestMustDosOutputSchema,
  },
  async (input) => {
    // Construct the prompt string using Handlebars-like syntax.
    // This is a more direct way to build the prompt for the `generate` call.
    const prompt = `
      You are an expert event planner specializing in South African cultural events.
      Your task is to suggest 3 to 5 critical, non-budgetary "must-do" action items for a ${input.eventType}.

      These are tasks that need to be done, not items to be bought.
      Good Suggestion: "Book a venue" or "Send out invitations".
      Bad Suggestion: "Buy a cake" or "Flowers".

      The response MUST be in the JSON format described by the output schema.
      Do not suggest any of the following tasks, as they already exist in the user's plan:
      ${input.existingTitles.length > 0 ? input.existingTitles.map(title => `- ${title}`).join('\n') : '(No existing tasks)'}

      Generate creative, practical, and essential suggestions. For each suggestion, provide a concise title and a brief, helpful note.
    `;

    // Directly call the AI model with the structured prompt and output schema.
    const llmResponse = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-pro',
      output: {
        schema: SuggestMustDosOutputSchema,
      },
    });
    
    const output = llmResponse.output;

    // Add explicit error handling to ensure a valid response is returned.
    if (!output) {
      throw new Error('The AI model failed to return a valid structured response. The output was empty.');
    }
    
    return output;
  }
);
