
'use server';

/**
 * Verifies a reCAPTCHA token using the reCAPTCHA Enterprise REST API.
 * This function is designed to be called from a Server Action.
 *
 * @param token The reCAPTCHA token generated on the client side.
 * @returns A boolean indicating whether the token is valid and the interaction is likely legitimate.
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || "studio-1406892914-3d877";
  const siteKey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!projectId || !siteKey || !apiKey) {
    console.error("Missing Google Cloud project ID, reCAPTCHA site key, or API key in environment variables.");
    return false;
  }

  const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: {
          token: token,
          siteKey: siteKey,
          // 'expectedAction' can be added here if you use actions on the client
        },
      }),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error(`reCAPTCHA verification failed with status: ${response.status}`, errorBody);
        return false;
    }
    
    const data = await response.json();

    // Check if the token is valid
    if (!data.tokenProperties?.valid) {
      console.log(`The CreateAssessment call failed because the token was: ${data.tokenProperties?.invalidReason}`);
      return false;
    }

    // You can check for a specific action here if you set one on the client
    // For this app, we're keeping it simple and just checking for validity and score.

    // Check the risk score. For example, you might consider scores > 0.5 as legitimate.
    // Adjust this threshold based on your risk tolerance.
    const score = data.riskAnalysis?.score;
    if (score === null || score === undefined || score < 0.5) {
      console.log(`Rejected due to low reCAPTCHA score: ${score}`);
      return false;
    }

    console.log(`The reCAPTCHA score is: ${score}`);
    return true;

  } catch (error) {
    console.error("Error during reCAPTCHA assessment HTTP request:", error);
    return false;
  }
}
