
import { genkit, configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { dotprompt } from '@genkit-ai/dotprompt';
import { textEmbeddingGecko } from '@genkit-ai/vertexai';

// Initialize the Genkit framework and plugins
configureGenkit({
    plugins: [
        googleAI({
            apiVersion: "v1beta",
        }),
        dotprompt,
    ],
    logLevel: "debug",
    enableTracingAndMetrics: true,
});

// Export the 'ai' object for use in flows
export const ai = genkit;
