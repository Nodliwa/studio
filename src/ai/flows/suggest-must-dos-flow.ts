
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
    priority: z.enum(['low', 'medium', 'high']).describe("The suggested priority for the task."),
    reminderType: z.enum(['none', 'email', 'sms', 'whatsapp']).describe("The default reminder type, which should be 'email'."),
    reminderDaysBefore: z.number().describe("How many days before a deadline to send a reminder. Default to 3."),
});

// Define the schema for the output of the flow.
export const SuggestMustDosOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('An array of 3 to 5 suggested must-do items.'),
});
export type SuggestMustDosOutput = z.infer<typeof SuggestMustDosOutputSchema>;

// Define the Genkit prompt for generating suggestions.
const suggestMustDosPrompt = ai.definePrompt(
    {
      name: 'suggestMustDosPrompt',
      input: { schema: SuggestMustDosInputSchema },
      output: { schema: SuggestMustDosOutputSchema },
      prompt: `
        You are an expert event planner specializing in South African cultural events.
        Your task is to suggest 3 to 5 critical, non-budgetary "must-do" action items for a {{eventType}}.
  
        These are tasks that need to be done, not items to be bought.
        Good Suggestion: "Book a venue" or "Send out invitations".
        Bad Suggestion: "Buy a cake" or "Flowers".
  
        The response MUST be in the JSON format described by the output schema.
        For each suggestion, provide a concise title and a brief, helpful note.
        Also provide a default priority, which should be 'medium'.
        For each suggestion, also provide default values for the reminder settings: reminderType should be 'email', and reminderDaysBefore should be 3.

        Do not suggest any of the following tasks, as they already exist in the user's plan:
        {{#if existingTitles}}
          {{#each existingTitles}}
            - {{this}}
          {{/each}}
        {{else}}
          (No existing tasks)
        {{/if}}
      `,
    }
  );

// Define the main Genkit flow.
const suggestMustDosFlow = ai.defineFlow(
  {
    name: 'suggestMustDosFlow',
    inputSchema: SuggestMustDosInputSchema,
    outputSchema: SuggestMustDosOutputSchema,
  },
  async (input) => {
    const llmResponse = await suggestMustDosPrompt(input);
    const output = llmResponse.output;

    if (!output) {
      // Throw an error if the model returns no output, which will be caught by the client.
      throw new Error('The AI model failed to return a valid structured response.');
    }
    
    return output;
  }
);


/**
 * An asynchronous wrapper function that executes the suggestMustDosFlow.
 * This is the primary function to be called from the UI.
 * @param input The input data matching the SuggestMustDosInput schema.
 * @returns A promise that resolves to the flow's output.
 */
export async function suggestMustDos(input: SuggestMustDosInput): Promise<SuggestMustDosOutput> {
  return suggestMustDosFlow(input);
}
