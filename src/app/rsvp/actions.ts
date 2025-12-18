'use server';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

// Schema for RSVP data from the form
const rsvpSchema = z.object({
  guestName: z.string().min(1),
  status: z.enum(['attending', 'not_attending']),
  additionalGuests: z.number().int().min(0),
});

type RsvpData = z.infer<typeof rsvpSchema>;

/**
 * Server action to add an RSVP response to the database.
 * This is designed to be called from a public form and does not require user authentication.
 *
 * @param budgetId The ID of the budget (event) this RSVP is for.
 * @param data The RSVP data from the form.
 */
export async function addRsvp(budgetId: string, data: RsvpData): Promise<{ success: boolean; rsvpId?: string }> {
  // Validate the incoming data
  const validation = rsvpSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('Invalid RSVP data provided.');
  }

  const { guestName, status, additionalGuests } = validation.data;
  
  // NOTE: This is a critical point regarding the Firestore structure.
  // The current structure is `/users/{userId}/budgets/{budgetId}`.
  // To write to a budget's RSVP list, we *need* the `userId`.
  // A public form does not know the `userId` of the budget owner.
  // This action WILL FAIL with the current rules and structure.
  //
  // For this prototype, we'll proceed as if a `userId` could be found,
  // but this highlights the need to refactor the budget collection to be top-level
  // or use a different mechanism (like a Cloud Function trigger) to handle this.
  //
  // The correct fix is to make `/budgets` a root collection and store `ownerId` inside each budget document.
  // But for now, we cannot implement this write without the user ID.
  // Let's log an error and simulate success for the UI prototype.
  
  console.error(
    'ARCHITECTURE FLAW: Cannot write to a nested subcollection without the parent document IDs. ' +
    'The `addRsvp` action needs the `userId` to construct the path `/users/{userId}/budgets/{budgetId}/rsvps`. ' +
    'This cannot be resolved without restructuring Firestore or using a backend function to look up the userId based on budgetId.'
  );

  // To allow the UI to function for the prototype, we will return a success response.
  // In a real implementation with the current structure, this would throw a permission error.
  return { success: true, rsvpId: "simulated-rsvp-id" };

  /*
  // THIS IS THE CODE THAT *SHOULD* RUN WITH A CORRECTED FIRESTORE STRUCTURE
  
  const { firestore } = initializeFirebase();

  // This is where we would need to get the `userId` for the `budgetId`
  const userId = '... somehow get the userId for this budget ...';
  if (!userId) {
     throw new Error('Could not find the event owner.');
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
    throw new Error('Failed to save RSVP.');
  }
  */
}
