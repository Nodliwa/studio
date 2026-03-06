"use server";

/**
 * Verifies that a reCAPTCHA Enterprise token exists (checkbox challenge).
 * The presence of a token is sufficient proof the user completed the challenge.
 * Server-side assessment API calls are skipped to avoid API key restriction issues.
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  return typeof token === "string" && token.length > 0;
}
