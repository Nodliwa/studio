'use server';
/**
 * @fileOverview An AI flow to suggest 'must-do' tasks for event planning.
 *
 * - suggestMustDos - A function that suggests tasks based on event type and existing tasks.
 */

// This functionality is temporarily disabled due to dependency conflicts.
// The AI features will be restored once the conflicts are resolved.

import {
  type SuggestMustDosInput,
  type SuggestMustDosOutput,
} from './schemas';

export async function suggestMustDos(input: SuggestMustDosInput): Promise<SuggestMustDosOutput> {
  console.warn("AI suggestions are temporarily disabled.");
  return { suggestions: [] };
}
