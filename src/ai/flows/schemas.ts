/**
 * @fileOverview Zod schemas for AI flows.
 * This file centralizes schema definitions to be shared between server-side
 * flows and client-side components without violating "use server" constraints.
 */

import { z } from 'genkit';

const SuggestedMustDoSchema = z.object({
  title: z.string().describe('The concise title of the suggested task.'),
  note: z.string().describe('A brief, helpful note or detail for the task.'),
  priority: z.enum(['low', 'medium', 'high']).describe('The suggested priority of the task.'),
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
