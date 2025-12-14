
'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { setUserData } from '@/firebase';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** 
 * Initiate email/password sign-up (BLOCKING).
 * This function now orchestrates the entire user creation flow to prevent race conditions.
 * It creates the user, updates their auth profile, and creates the Firestore document.
 */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string, firstName: string, lastName: string): Promise<void> {
  try {
    // 1. Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    const user = userCredential.user;
    const displayName = `${firstName} ${lastName}`;

    // 2. Update the user's profile in Firebase Auth and wait for it to complete.
    await updateProfile(user, { displayName });

    // 3. Create the user's document in Firestore.
    // By this point, the `user` object from the credential might not yet have the updated displayName.
    // It's safer to pass the auth user object and let setUserData handle the details.
    setUserData(user);

  } catch (error) {
    // Log the error for debugging and re-throw it so the calling component can handle it.
    console.error("Error during the sign-up process:", error);
    throw error;
  }
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
