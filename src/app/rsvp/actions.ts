
'use server';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, getDocs, doc, updateDoc, collectionGroup, query, where, limit } from 'firebase/firestore';
import { z } from 'zod';

const rsvpSchema = z.object({
  guestName: z.string().min(1),
  status: z.enum(['attending', 'not_attending']),
  additionalGuests: z.number().int().min(0),
});

type RsvpData = z.infer<typeof rsvpSchema>;

async function findBudgetOwnerId(budgetId: string): Promise<string | null> {
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
    console.error("Error finding budget owner for RSVP:", error);
  }
  return null;
}


export async function addRsvp(budgetId: string, data: RsvpData): Promise<{ success: boolean; rsvpId?: string }> {
  const validation = rsvpSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('Invalid RSVP data provided.');
  }

  const { guestName, status, additionalGuests } = validation.data;
  
  const { firestore } = initializeFirebase();

  const userId = await findBudgetOwnerId(budgetId);
  if (!userId) {
     throw new Error('Could not find the event owner. The event may no longer exist.');
  }

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

    // This is important: We update the document with its own ID.
    await updateDoc(docRef, { id: docRef.id });

    return { success: true, rsvpId: docRef.id };
  } catch (error) {
    console.error('Error adding RSVP:', error);
    throw new Error('Failed to save RSVP. Please try again later.');
  }
}
