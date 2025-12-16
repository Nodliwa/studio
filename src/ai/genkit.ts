
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize the Genkit framework and plugins
const ai = genkit({
    plugins: [
        googleAI({
            apiVersion: "v1beta",
        }),
    ],
    logLevel: "debug",
    enableTracingAndMetrics: true,
});

// Export the 'ai' object for use in flows
export { ai };
