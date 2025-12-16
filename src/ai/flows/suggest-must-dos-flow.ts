
'use server';
/**
 * @fileOverview An AI flow to suggest 'must-do' tasks for event planning.
 *
 * - suggestMustDos - A function that suggests tasks based on event type and existing tasks.
 */
import { ai } from '@/ai/genkit';
import {
  SuggestMustDosInputSchema,
  type SuggestMustDosInput,
  SuggestMustDosOutputSchema,
  type SuggestMustDosOutput,
} from './schemas';
import { gemini15Flash } from 'genkitx-googleai';

// Define the prompt for the AI
const suggestionPrompt = ai.definePrompt({
    name: 'mustDoSuggestionPrompt',
    input: { schema: SuggestMustDosInputSchema },
    output: { schema: SuggestMustDosOutputSchema },
    prompt: `You are an expert event planner. Based on the event type, suggest a list of 3-5 critical "must-do" tasks.
  
    Event Type: {{eventType}}
    
    Do not suggest any of the following tasks that already exist:
    {{#if existingMustDos}}
    {{#each existingMustDos}}
    - {{this}}
    {{/each}}
    {{else}}
    (No existing tasks)
    {{/if}}
    
    Provide creative, practical, and essential tasks that are not obvious but are crucial for a successful event.
    Focus on tasks related to coordination, guest experience, and logistical details that are often overlooked.`,
      config: {
        model: 'gemini-1.5-flash-latest',
    }
  });
  

// Define the flow
export const suggestMustDosFlow = ai.defineFlow(
  {
    name: 'suggestMustDosFlow',
    inputSchema: SuggestMustDosInputSchema,
    outputSchema: SuggestMustDosOutputSchema,
  },
  async (input) => {
    const { output } = await suggestionPrompt(input);
    return output!;
  }
);

// Expose the flow as a server function
export async function suggestMustDos(input: SuggestMustDosInput): Promise<SuggestMustDosOutput> {
  return await suggestMustDosFlow(input);
}
