
'use server';

import { initializeFirebase } from '@/firebase';
import { collectionGroup, query, where, getDocs, limit } from 'firebase/firestore';
import nodemailer from 'nodemailer';

/**
 * Finds the UID of the user who owns a budget using a collection group query.
 * This is much more efficient than scanning all users.
 */
export async function findBudgetOwnerId(budgetId: string): Promise<string | null> {
  const { firestore } = initializeFirebase();
  
  // Use a collection group query to find the budget document by its ID
  const budgetsQuery = query(
    collectionGroup(firestore, 'budgets'),
    where('id', '==', budgetId),
    limit(1)
  );

  try {
    const snapshot = await getDocs(budgetsQuery);
    if (!snapshot.empty) {
      return snapshot.docs[0].data().userId || null;
    }
  } catch (error) {
    console.error("Error finding budget owner:", error);
  }
  return null;
}

/**
 * Sends an invitation email to a collaborator.
 * Uses hello@simpliplan.co.za as the sender.
 */
export async function sendCollaboratorInvite(data: {
  collaboratorName: string;
  collaboratorEmail: string;
  inviterName: string;
  planName: string;
  planUrl: string;
}) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  
  // Sender is specifically set to hello@simpliplan.co.za
  const senderEmail = 'hello@simpliplan.co.za';

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error('SMTP settings missing. Invite link for development:', data.planUrl);
    return { success: false, message: 'Server email not configured.' };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: parseInt(SMTP_PORT, 10) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const mailOptions = {
    from: `"SimpliPlan" <${senderEmail}>`,
    to: data.collaboratorEmail,
    subject: `Invitation to collaborate on ${data.planName}`,
    text: `Hello ${data.collaboratorName}, ${data.inviterName} has invited you to collaborate on creating a plan on the event '${data.planName}'. Use the link below to access the plan: ${data.planUrl}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #17a2b8; margin: 0;">Plan Collaboration Invite</h2>
        </div>
        <p>Hello <strong>${data.collaboratorName}</strong>,</p>
        <p><strong>${data.inviterName}</strong> has invited you to collaborate on creating a plan on the event '<strong>${data.planName}</strong>'.</p>
        <p>Use the link below to access the plan:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${data.planUrl}" style="background-color: #17a2b8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View and Edit Plan</a>
        </div>
        <p style="color: #666; font-size: 0.85em; word-break: break-all;">
          Or copy and paste this link into your browser:<br />
          <a href="${data.planUrl}" style="color: #17a2b8;">${data.planUrl}</a>
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;" />
        <p style="font-size: 0.85em; color: #888; background-color: #f9f9f9; padding: 10px; border-radius: 5px; text-align: center;">
          <strong>Note:</strong> You will need to sign up or log in to access the plan.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send invite email:', error);
    return { success: false, error: 'Failed to send email.' };
  }
}
