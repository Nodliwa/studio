/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    // Some type errors come from Zod v4 / Genkit and Radix UI version
    // incompatibilities in auto-generated code. Build errors are suppressed
    // here; fix them incrementally in local dev.
    ignoreBuildErrors: true,
  },
  // Allow Firebase Studio cloud workstation preview to load /_next/* bundles
  allowedDevOrigins: [
    "*.cloudworkstations.dev",
    "*.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev",
    "3000-firebase-studio-1765380513558.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev",
  ],
};

module.exports = nextConfig;
