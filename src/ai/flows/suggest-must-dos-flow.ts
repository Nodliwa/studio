'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestMustDosInputSchema = z.object({
  eventType: z.string(),
  existingTitles: z.array(z.string()),
});

export type SuggestMustDosInput = z.infer<typeof SuggestMustDosInputSchema>;

export type SuggestMustDosOutput = {
  suggestions: Array<{
    title: string;
    note: string;
    priority: 'low' | 'medium' | 'high';
  }>;
};

export async function suggestMustDos(input: SuggestMustDosInput): Promise<SuggestMustDosOutput> {
  try {
    console.log('Generating AI suggestions for:', input.eventType);
    
    const existingList = input.existingTitles.length > 0 
      ? 'Do NOT suggest any of these existing tasks: ' + input.existingTitles.join(', ')
      : '';

    const prompt = `You are an expert event planner specializing in South African celebrations.
For a ${input.eventType} event, suggest exactly 5 critical non-budgetary planning tasks.
${existingList}
Consider cultural protocols if the event is traditional (uMemulo, uMgidi, etc).
Focus on actionable planning steps.

Respond with ONLY a JSON object in this exact format, no markdown, no explanation:
{"suggestions":[{"title":"task title","note":"brief helpful note","priority":"high"},{"title":"task title","note":"brief helpful note","priority":"medium"},{"title":"task title","note":"brief helpful note","priority":"high"},{"title":"task title","note":"brief helpful note","priority":"low"},{"title":"task title","note":"brief helpful note","priority":"medium"}]}`;

    const { text } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt,
    });

    console.log('Raw AI response:', text);

    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
      return { suggestions: [] };
    }

    return { suggestions: parsed.suggestions.slice(0, 5) };
  } catch (error: any) {
    console.error('SuggestMustDos Error:', error.message);
    return { suggestions: [] };
  }
}
