
import { genkit, genkitEval } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { dotprompt } from '@genkit-ai/dotprompt';
import { textEmbeddingGecko } from '@genkit-ai/vertexai';

// Initialize the Genkit framework and plugins
export const ai = genkit({
    plugins: [
        googleAI({
            apiVersion: "v1beta",
        }),
        dotprompt,
        genkitEval(),
    ],
    logLevel: "debug",
    enableTracingAndMetrics: true,
});
