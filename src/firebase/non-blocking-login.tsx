
'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, firstName: string, lastName: string): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT `await`.
  // The onAuthStateChanged listener in FirebaseProvider will handle creating the user doc in Firestore.
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => {
        // Once the user is created, update their auth profile with the display name.
        // This is a crucial step for the `onAuthStateChanged` listener to pick up the name.
        const user = userCredential.user;
        return updateProfile(user, {
            displayName: `${firstName} ${lastName}`
        });
    })
    .catch(error => {
        // The onAuthStateChanged listener in the provider will likely not see an auth state
        // change if creation fails, so the UI won't proceed. We can log this error
        // for debugging, but the user-facing error is handled in the component.
        console.error("Error during sign-up or profile update:", error);
    });
  // Code continues immediately.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
