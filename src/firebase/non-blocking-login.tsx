
'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  UserCredential,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** 
 * Initiate email/password sign-up (BLOCKING).
 * This function now orchestrates the entire user creation flow to prevent race conditions.
 * It creates the user, updates their auth profile, and returns the credential.
 * The Firestore document creation is now handled by the calling component.
 */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string, firstName: string, lastName: string): Promise<UserCredential> {
  try {
    // 1. Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    const user = userCredential.user;
    const displayName = `${firstName} ${lastName}`;

    // 2. Update the user's profile in Firebase Auth and wait for it to complete.
    await updateProfile(user, { displayName });

    // 3. Return the user credential. The caller is responsible for Firestore document creation.
    return userCredential;

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
