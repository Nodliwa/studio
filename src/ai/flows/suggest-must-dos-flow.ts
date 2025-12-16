
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

// Define the prompt for the AI
const suggestionPrompt = ai.definePrompt({
    name: 'mustDoSuggestionPrompt',
    input: { schema: SuggestMustDosInputSchema },
    output: { schema: SuggestMustDosOutputSchema },
    prompt: `You are an expert event planner. Based on the event type, suggest a list of 3-5 critical "must-do" tasks.
    Each suggestion must have a title, a short note, and a priority (low, medium, or high).
  
    Event Type: {{eventType}}
    
    IMPORTANT: Do not suggest any of the following tasks because they already exist.
    {{#if existingMustDos.length}}
    {{#each existingMustDos}}
    - {{this}}
    {{/each}}
    {{else}}
    (No existing tasks to exclude)
    {{/if}}
    
    Your goal is to provide creative, practical, and essential new ideas that are not on the existing list.
    Focus on tasks related to coordination, guest experience, and logistical details that are often overlooked.`,
    config: {
        model: 'gemini-1.5-flash-latest',
    },
  });
  

// Define the flow
const suggestMustDosFlow = ai.defineFlow(
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
