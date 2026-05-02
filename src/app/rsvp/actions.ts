
'use server';

import { z } from 'zod';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const rsvpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  attending: z.enum(['yes', 'no', 'maybe']),
  guests: z.coerce.number().min(0, 'Guest count cannot be negative'),
  dietaryRequirements: z.string().optional(),
  budgetId: z.string().min(1, 'Budget ID is required'),
  userId: z.string().min(1, 'Owner ID is required'),
});

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-1406892914-3d877',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function submitRSVP(data: z.infer<typeof rsvpSchema>) {
  const parsed = rsvpSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: 'Invalid RSVP data provided.' };
  }

  const { userId, budgetId, ...rsvpData } = parsed.data;

  try {
    const db = getFirestore(getAdminApp());
    await db
      .collection('users')
      .doc(userId)
      .collection('budgets')
      .doc(budgetId)
      .collection('rsvps')
      .add({
        ...rsvpData,
        budgetId,
        createdAt: FieldValue.serverTimestamp(),
      });

    return { success: true };
  } catch (error) {
    console.error('RSVP Submission Error:', error);
    return { success: false, message: 'Could not submit your RSVP. Please try again.' };
  }
}
