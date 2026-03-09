
'use server';

import { initializeFirebase } from '@/firebase';
import { collectionGroup, query, where, getDocs, limit } from 'firebase/firestore';
import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY || 're_RPtpMhT1_HiiCL3NCwpn1GrGL7GLvHpEF');

/**
 * Finds the UID of the user who owns a budget using a collection group query.
 */
export async function findBudgetOwnerId(budgetId: string): Promise<string | null> {
  const { firestore } = initializeFirebase();
  
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
 * Sends an invitation email to a collaborator using Resend.
 */
export async function sendCollaboratorInvite(data: {
  collaboratorName: string;
  collaboratorEmail: string;
  inviterName: string;
  planName: string;
  planUrl: string;
}) {
  const senderEmail = 'hello@simpliplan.co.za';

  try {
    const { error } = await resend.emails.send({
      from: `SimpliPlan <${senderEmail}>`,
      to: [data.collaboratorEmail],
      subject: `Invitation to collaborate on ${data.planName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #00A693; margin: 0;">Plan Collaboration Invite</h2>
          </div>
          <p>Hello <strong>${data.collaboratorName}</strong>,</p>
          <p><strong>${data.inviterName}</strong> has invited you to collaborate on creating a plan on the event '<strong>${data.planName}</strong>'.</p>
          <p>Use the link below to access the plan:</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${data.planUrl}" style="background-color: #00A693; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View and Edit Plan</a>
          </div>
          <p style="color: #666; font-size: 0.85em; word-break: break-all;">
            Or copy and paste this link into your browser:<br />
            <a href="${data.planUrl}" style="color: #00A693;">${data.planUrl}</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;" />
          <p style="font-size: 0.85em; color: #888; background-color: #f9f9f9; padding: 10px; border-radius: 5px; text-align: center;">
            <strong>Note:</strong> You will need to sign up or log in to access the plan.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { 
        success: false, 
        message: 'Email delivery failed. Please ensure the sender domain is verified in Resend.' 
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send invite email:', error);
    return { 
      success: false, 
      message: error.message || 'An unexpected error occurred while sending the email.' 
    };
  }
}
