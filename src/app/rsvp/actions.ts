
'use server';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { z } from 'zod';

const rsvpSchema = z.object({
  guestName: z.string().min(1),
  status: z.enum(['attending', 'not_attending']),
  additionalGuests: z.number().int().min(0),
});

type RsvpData = z.infer<typeof rsvpSchema>;

async function findBudgetOwnerId(budgetId: string): Promise<string | null> {
  const { firestore } = initializeFirebase();
  const usersCollectionRef = collection(firestore, 'users');
  const usersSnapshot = await getDocs(usersCollectionRef);

  for (const userDoc of usersSnapshot.docs) {
    const budgetsCollectionRef = collection(userDoc.ref, 'budgets');
    const budgetQuery = query(budgetsCollectionRef, where('id', '==', budgetId), limit(1));
    const budgetSnapshot = await getDocs(budgetQuery);
    
    if (!budgetSnapshot.empty) {
      return userDoc.id; // Found the owner
    }
  }

  return null; // Budget not found
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
    const docRef = await addDoc(rsvpCollectionRef, {
      budgetId,
      guestName,
      status,
      additionalGuests: status === 'attending' ? additionalGuests : 0,
      respondedAt: serverTimestamp(),
    });

    return { success: true, rsvpId: docRef.id };
  } catch (error) {
    console.error('Error adding RSVP:', error);
    throw new Error('Failed to save RSVP. Please try again later.');
  }
}

    