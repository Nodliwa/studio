import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { dotprompt } from '@genkit-ai/dotprompt';
import { genkitEval } from 'genkit';
import { textEmbeddingGecko } from '@genkit-ai/vertexai';

// Initialize the Genkit framework and plugins
export const ai = genkit({
    plugins: [
        googleAI({
            apiVersion: "v1beta",
        }),
        dotprompt,
        genkitEval({
            judge: 'gemini-1.5-pro-latest',
            metrics: ['ragas'],
            embedder: textEmbeddingGecko,
        }),
    ],
    logLevel: "debug",
    enableTracingAndMetrics: true,
});
