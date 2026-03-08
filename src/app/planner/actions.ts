
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
  // Note: This requires a Firestore index for 'budgets' collection group.
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
 */
export async function sendCollaboratorInvite(data: {
  collaboratorName: string;
  collaboratorEmail: string;
  inviterName: string;
  planName: string;
  planUrl: string;
}) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM_EMAIL) {
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
    from: `"SimpliPlan" <${SMTP_FROM_EMAIL}>`,
    to: data.collaboratorEmail,
    subject: `Invitation to collaborate on ${data.planName}`,
    text: `Hello ${data.collaboratorName}, ${data.inviterName} has invited you to collaborate on creating a plan on the event '${data.planName}'. Use the link below to access the plan: ${data.planUrl}. Note: You will need to sign up or log in to access the plan.`,
    html: `
      <h1>Plan Collaboration Invite</h1>
      <p>Hello <strong>${data.collaboratorName}</strong>,</p>
      <p><strong>${data.inviterName}</strong> has invited you to collaborate on creating a plan on the event '<strong>${data.planName}</strong>'.</p>
      <p>Use the link below to access the plan:</p>
      <p><a href="${data.planUrl}">${data.planUrl}</a></p>
      <hr />
      <p><small>Note: You will need to sign up or log in to access the plan.</small></p>
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
