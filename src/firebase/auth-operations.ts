
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  updateProfile,
  UserCredential,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
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
 * Initiates Facebook Sign-In.
 */
export async function initiateFacebookSignIn(authInstance: Auth, isMobile: boolean): Promise<UserCredential | null> {
    const provider = new FacebookAuthProvider();
    try {
        if (isMobile) {
            await signInWithRedirect(authInstance, provider);
            return null;
        } else {
            return await signInWithPopup(authInstance, provider);
        }
    } catch (error) {
        console.error("Error during Facebook sign-in initiation:", error);
        throw error;
    }
}

/**
 * Initiates Twitter (X) Sign-In.
 */
export async function initiateTwitterSignIn(authInstance: Auth, isMobile: boolean): Promise<UserCredential | null> {
    const provider = new OAuthProvider('twitter.com');
    try {
        if (isMobile) {
            await signInWithRedirect(authInstance, provider);
            return null;
        } else {
            return await signInWithPopup(authInstance, provider);
        }
    } catch (error) {
        console.error("Error during Twitter/X sign-in initiation:", error);
        throw error;
    }
}


/**
 * Handles the result of a Sign-In redirect for any provider.
 * This should be called once when the application loads after a redirect.
 */
export async function handleRedirectResult(auth: Auth): Promise<UserCredential | null> {
    try {
        // This promise resolves with the signed-in user credential after a redirect.
        // It resolves to `null` if the page was loaded without a pending redirect.
        const result = await getRedirectResult(auth);
        return result;
    } catch (error) {
        console.error('Error handling social sign-in redirect result:', error);
        throw error; // Re-throw to be caught by the calling component
    }
}

// This function is being replaced by the more generic handleRedirectResult
// and can be considered deprecated for new usage.
export async function handleGoogleRedirectResult(auth: Auth): Promise<UserCredential | null> {
    return handleRedirectResult(auth);
}

    