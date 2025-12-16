
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  updateProfile,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** 
 * Initiate email/password sign-up (BLOCKING).
 * This function now orchestrates the entire user creation flow to prevent race conditions.
 * It creates the user, updates their auth profile, and returns the credential.
 * The Firestore document creation is now handled by the calling component.
 */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string, displayName: string): Promise<UserCredential> {
  try {
    // 1. Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    const user = userCredential.user;

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

/**
 * Initiates Google Sign-In.
 * Uses redirect on mobile and popup on desktop.
 */
export async function initiateGoogleSignIn(authInstance: Auth, isMobile: boolean): Promise<UserCredential | null> {
    const provider = new GoogleAuthProvider();
    try {
        if (isMobile) {
            await signInWithRedirect(authInstance, provider);
            // signInWithRedirect doesn't return a credential directly.
            // The result is retrieved after the redirect.
            return null; 
        } else {
            const result = await signInWithPopup(authInstance, provider);
            return result;
        }
    } catch (error) {
        console.error("Error during Google sign-in initiation:", error);
        throw error;
    }
}

/**
 * Handles the result of a Google Sign-In redirect.
 */
export async function handleGoogleRedirectResult(auth: Auth): Promise<UserCredential | null> {
    try {
        const result = await getRedirectResult(auth);
        return result;
    } catch (error) {
        console.error('Error handling Google redirect result:', error);
        throw error;
    }
}
