
'use server';
/**
 * @fileOverview Robust AI flow for suggesting "must-do" tasks for event planning.
 * Includes strict JSON enforcement, simplified prompt, safe parsing, and fallback handling.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// ✅ Input Schema
export const SuggestMustDosInputSchema = z.object({
  eventType: z.string().describe('The type of event, e.g., "Wedding", "Funeral".'),
  existingTitles: z.array(z.string()).describe('Titles of tasks that already exist, to avoid duplicates.'),
});
export type SuggestMustDosInput = z.infer<typeof SuggestMustDosInputSchema>;

// ✅ Suggestion Schema
const SuggestionSchema = z.object({
  title: z.string().describe('Short, actionable title (e.g., "Book photographer").'),
  note: z.string().describe('Brief helpful note (e.g., "Get quotes from 3 vendors.").'),
  priority: z.enum(['low', 'medium', 'high']).describe('Suggested priority.'),
  reminderType: z.enum(['none', 'email', 'sms', 'whatsapp']).describe('Default reminder type.'),
  reminderDaysBefore: z.number().describe('Days before deadline to send reminder.'),
});

// ✅ Output Schema
export const SuggestMustDosOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('Array of 3–5 suggested must-do items.'),
});
export type SuggestMustDosOutput = z.infer<typeof SuggestMustDosOutputSchema>;

// ✅ Simplified Prompt
const suggestMustDosPrompt = ai.definePrompt({
  name: 'suggestMustDosPrompt',
  input: { schema: SuggestMustDosInputSchema },
  output: { schema: SuggestMustDosOutputSchema },
  prompt: `
You are an expert event planner. Suggest 3–5 critical, non-budgetary tasks for a {{eventType}}.

Rules:
- Do NOT suggest any tasks from this list: {{#each existingTitles}}- {{this}} {{/each}}.
- If no new tasks are found, return an empty array for "suggestions".
- Respond ONLY with valid JSON matching this schema:
{
  "suggestions": [
    {
      "title": "string",
      "note": "string",
      "priority": "low|medium|high",
      "reminderType": "email|sms|whatsapp|none",
      "reminderDaysBefore": number
    }
  ]
}
No extra text, no explanations.
`,
});

// ✅ Main Flow with Safe Parsing & Fallback
const suggestMustDosFlow = ai.defineFlow(
  {
    name: 'suggestMustDosFlow',
    inputSchema: SuggestMustDosInputSchema,
    outputSchema: SuggestMustDosOutputSchema,
  },
  async (input) => {
    const llmResponse = await suggestMustDosPrompt(input);

    // Validate output using Zod safeParse
    const parsed = SuggestMustDosOutputSchema.safeParse(llmResponse.output);
    if (!parsed.success) {
      console.error('Validation error:', parsed.error);
      // Log raw response for debugging
      console.error('Raw AI response:', llmResponse.raw);
      throw new Error('AI returned invalid JSON or missing fields.');
    }

    // Fallback if no suggestions
    if (!parsed.data.suggestions) {
      return { suggestions: [] };
    }

    return parsed.data;
  }
);

// ✅ Wrapper Function
export async function suggestMustDos(input: SuggestMustDosInput): Promise<SuggestMustDosOutput> {
  return suggestMustDosFlow(input);
}
