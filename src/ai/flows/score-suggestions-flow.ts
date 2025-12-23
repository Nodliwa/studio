
'use server';
/**
 * @fileOverview An AI flow to score and rank text suggestions based on relevance to a given context.
 * This uses the OpenAI API directly to perform the scoring.
 */

import OpenAI from "openai";

// Initialize the OpenAI client.
// It's crucial to have OPENAI_API_KEY set in your environment variables.
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Defines the structure for a single scored suggestion.
 */
export interface ScoredSuggestion {
  title: string;
  score: number;
}

/**
 * Scores an array of suggestion titles for relevance against a given context string.
 *
 * @param suggestions An array of suggestion titles (e.g., ["Book a venue", "Hire a caterer"]).
 * @param context A string describing the context for relevance (e.g., "A small, budget-friendly birthday party").
 * @returns A promise that resolves to an array of ScoredSuggestion objects, or an empty array on failure.
 */
export async function scoreSuggestions(suggestions: string[], context: string): Promise<ScoredSuggestion[]> {
  // Construct the prompt for the OpenAI API.
  const prompt = `
  You are an expert event planner's assistant. Your task is to rank a list of task suggestions based on their relevance and importance to a specific event context.
  The event context is: "${context}".

  Here are the suggestions to rank:
  ${suggestions.map(s => `- ${s}`).join("\n")}

  Instructions:
  1. Evaluate each suggestion and assign a relevance score from 0.0 (not relevant) to 1.0 (highly relevant).
  2. Your response MUST be a valid JSON array of objects, where each object contains a "title" and a "score".
  3. Do not include any text, explanations, or markdown formatting outside of the JSON array.
  4. The "title" in your response must exactly match the suggestion title from the input list.

  Example JSON response format:
  [
    { "title": "Book photographer", "score": 0.9 },
    { "title": "Send invitations", "score": 1.0 },
    { "title": "Organize transportation", "score": 0.6 }
  ]

  Now, provide the JSON response for the given suggestions and context.
  `;

  try {
    // Call the OpenAI API.
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // A fast and capable model for this task.
      messages: [{ role: "user", content: prompt }],
      temperature: 0, // Set to 0 for deterministic, consistent scoring.
      response_format: { type: "json_object" }, // Enforce JSON output format.
    });

    const content = response.choices[0].message.content;
    if (!content) {
      console.error("AI response content is null, returning default scores.");
      return suggestions.map(title => ({ title, score: 0.5 }));
    }
    
    // The model might return a root object like { "suggestions": [...] }
    let parsed;
    try {
        parsed = JSON.parse(content);
    } catch (e) {
        console.error("Initial JSON parsing failed, returning default scores.", e);
        // Fallback if parsing fails
        return suggestions.map(title => ({ title, score: 0.5 }));
    }

    if (Array.isArray(parsed)) {
        return parsed;
    }
    // Check if the response is nested under a key like "suggestions"
    const suggestionsArray = parsed.suggestions || parsed.data || parsed.items;
    if (suggestionsArray && Array.isArray(suggestionsArray)) {
        return suggestionsArray;
    }

    console.error("Parsed JSON is not in the expected array format:", parsed);
    return [];

  } catch (err) {
    console.error("Failed to process AI response, returning default scores:", err);
    // Fallback: Return the original suggestions with a default score to avoid breaking the UI
    return suggestions.map(title => ({ title, score: 0.5 }));
  }
}

    