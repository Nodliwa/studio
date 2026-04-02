
'use server';

import { z } from 'zod';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const rsvpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  attending: z.enum(['yes', 'no', 'maybe']),
  guests: z.coerce.number().min(0, 'Guest count cannot be negative'),
  dietaryRequirements: z.string().optional(),
  budgetId: z.string().min(1, 'Budget ID is required'),
  userId: z.string().min(1, 'Owner ID is required'),
});

/**
 * Submits a new RSVP response to Firestore.
 * Saves the response under the budget owner's document for security consistency.
 */
export async function submitRSVP(data: z.infer<typeof rsvpSchema>) {
  const parsed = rsvpSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: 'Invalid RSVP data provided.' };
  }

  const { firestore } = initializeFirebase();
  const { userId, budgetId, ...rsvpData } = parsed.data;

  try {
    const rsvpCollection = collection(
      firestore, 
      'users', 
      userId, 
      'budgets', 
      budgetId, 
      'rsvps'
    );

    await addDoc(rsvpCollection, {
      ...rsvpData,
      budgetId,
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('RSVP Submission Error:', error);
    return { success: false, message: 'Could not submit your RSVP. Please try again.' };
  }
}
