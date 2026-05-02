'use server';

import OpenAI from 'openai';

export type SuggestMustDosInput = {
  eventType: string;
  existingTitles: string[];
  birthdayMeta?: {
    birthdayAge: number;
    ageGroup: string;
    isMilestone: boolean;
  };
};

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

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const existingList = input.existingTitles.length > 0
      ? 'Do NOT suggest any of these existing tasks: ' + input.existingTitles.join(', ')
      : '';

    let eventContext = `${input.eventType} event`;
    let birthdayFocus = '';

    if (input.eventType === 'birthday' && input.birthdayMeta) {
      const { birthdayAge, ageGroup, isMilestone } = input.birthdayMeta;
      eventContext = `birthday celebration for a ${ageGroup} turning ${birthdayAge}${isMilestone ? '. This is a milestone birthday' : ''}`;
      const focusByGroup: Record<string, string> = {
        child: 'Focus on: jumping castle booking, themed cake order, party pack preparation, sending invitations to parents.',
        teen: 'Focus on: sound system or DJ setup, photo booth booking, ensuring non-alcoholic drinks, venue setup coordination.',
        adult: isMilestone
          ? 'Focus on: photographer booking, sending invitations early, creating a memory book, ordering a premium cake.'
          : 'Focus on: venue confirmation, catering coordination, entertainment booking, guest list management.',
        senior: 'Focus on: arranging shuttle for elderly guests, live band booking, preparing a family slideshow, confirming formal seating plan.',
      };
      birthdayFocus = focusByGroup[ageGroup] ?? '';
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert event planner specializing in South African celebrations. Always respond with valid JSON only, no markdown, no explanation.'
        },
        {
          role: 'user',
          content: `For a ${eventContext}, suggest exactly 5 critical non-budgetary planning tasks.
${existingList}
${birthdayFocus}
Consider cultural protocols if the event is traditional (uMemulo, uMgidi, etc).
Focus on actionable planning steps.

Respond with ONLY this JSON format:
{"suggestions":[{"title":"task title","note":"brief helpful note","priority":"high"},{"title":"task title","note":"brief helpful note","priority":"medium"},{"title":"task title","note":"brief helpful note","priority":"high"},{"title":"task title","note":"brief helpful note","priority":"low"},{"title":"task title","note":"brief helpful note","priority":"medium"}]}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const text = response.choices[0]?.message?.content || '';
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
