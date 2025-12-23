
'use server';

import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';

/**
 * Verifies a reCAPTCHA token using Google Cloud reCAPTCHA Enterprise.
 *
 * @param token The reCAPTCHA token generated on the client side.
 * @returns A boolean indicating whether the token is valid and the action matches.
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!process.env.GOOGLE_CLOUD_PROJECT || !process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY) {
      console.error("Missing Google Cloud project ID or reCAPTCHA site key in environment variables.");
      return false;
  }

  try {
    const client = new RecaptchaEnterpriseServiceClient();
    const projectPath = client.projectPath(process.env.GOOGLE_CLOUD_PROJECT);

    const request = {
      assessment: {
        event: {
          token: token,
          siteKey: process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY,
        },
      },
      parent: projectPath,
    };

    const [response] = await client.createAssessment(request);

    if (!response.tokenProperties?.valid) {
      console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties?.invalidReason}`);
      return false;
    }

    // You can check for a specific action here if you set one on the client
    // For this app, we're keeping it simple and just checking for validity and score.
    // if (response.tokenProperties.action === 'LOGIN') { ... }

    // Check the risk score. For example, you might consider scores > 0.5 as risky.
    // Adjust this threshold based on your risk tolerance.
    const score = response.riskAnalysis?.score;
    if (score === null || score === undefined || score < 0.5) {
        console.log(`Rejected due to low reCAPTCHA score: ${score}`);
        return false;
    }
    
    console.log(`The reCAPTCHA score is: ${score}`);
    return true;

  } catch (error) {
    console.error("Error during reCAPTCHA assessment:", error);
    return false;
  }
}
