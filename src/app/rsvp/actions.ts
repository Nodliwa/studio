'use server';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';

const rsvpSchema = z.object({
  guestName: z.string().min(1),
  status: z.enum(['attending', 'not_attending']),
  additionalGuests: z.coerce.number().int().min(0),
});

type RsvpData = z.infer<typeof rsvpSchema>;

/**
 * Adds a new RSVP response to a specific budget.
 */
export async function addRsvp(userId: string, budgetId: string, data: RsvpData): Promise<{ success: boolean; rsvpId?: string }> {
  const validation = rsvpSchema.safeParse(data);
  if (!validation.success) {
    console.error('RSVP Validation Error:', validation.error.flatten());
    throw new Error('Invalid RSVP data provided.');
  }

  const { guestName, status, additionalGuests } = validation.data;
  const { firestore } = initializeFirebase();

  const rsvpCollectionRef = collection(firestore, 'users', userId, 'budgets', budgetId, 'rsvps');

  try {
    const newDoc = {
      budgetId,
      guestName,
      status,
      additionalGuests: status === 'attending' ? additionalGuests : 0,
      respondedAt: serverTimestamp(),
    };
    const docRef = await addDoc(rsvpCollectionRef, newDoc);

    await updateDoc(docRef, { id: docRef.id });

    return { success: true, rsvpId: docRef.id };
  } catch (error) {
    console.error('Error adding RSVP:', error);
    throw new Error('Failed to save RSVP. Please try again later.');
  }
}
