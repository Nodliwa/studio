'use server';
/**
 * @fileoverview This file initializes the Genkit AI instance with necessary plugins.
 * It is configured to use Google's Generative AI models. The `ai` object exported
 * from this file should be used throughout the application to define and run AI flows.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Initialize the Genkit AI instance.
// It is crucial to configure plugins here. The googleAI plugin enables
// the use of Google's AI models (e.g., Gemini).
export const ai = genkit({
  plugins: [
    googleAI(), // Enables Google's generative AI models like Gemini.
  ],
});
