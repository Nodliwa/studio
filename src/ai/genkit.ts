
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';


// Initialize the Genkit framework and plugins
export const ai = genkit({
    plugins: [
        googleAI(),
    ],
    logLevel: "debug",
    enableTracingAndMetrics: true,
});
