"use client";
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
  signInWithCredential,
  signOut as firebaseSignOut,
} from "firebase/auth";

// Google OAuth client ID (public value — safe to expose in frontend code)
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "1065920530402-nukibr0kjhf9rn45m0ctlrjoli291emd.apps.googleusercontent.com";

/** Dynamically loads the Google Identity Services script (idempotent). */
function loadGISScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Not in browser"));
    // Already loaded
    if ((window as any).google?.accounts?.oauth2) return resolve();
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("GIS load failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/**
 * Initiate email/password sign-up (BLOCKING).
 * This function orchestrates the entire user creation flow to prevent race conditions.
 * It creates the user, updates their auth profile, and returns the credential.
 * The Firestore document creation is handled by the calling component.
 */
export async function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string,
  displayName: string,
): Promise<UserCredential> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      authInstance,
      email,
      password,
    );
    const user = userCredential.user;
    await updateProfile(user, { displayName });
    return userCredential;
  } catch (error) {
    console.error("Error during the sign-up process:", error);
    throw error;
  }
}

/**
 * Initiates Google Sign-In using Google Identity Services (GIS) directly.
 * This bypasses Firebase's /__/auth/handler popup entirely, which avoids the
 * auth/internal-error caused by missing clientId in Firebase Studio projects.
 * Gets an OAuth access token from Google, then signs in to Firebase with it.
 */
export async function initiateGoogleSignIn(
  authInstance: Auth,
  _isMobile?: boolean,
): Promise<UserCredential | null> {
  await loadGISScript();
  return new Promise((resolve, reject) => {
    const google = (window as any).google;
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "email profile",
      callback: async (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        try {
          const credential = GoogleAuthProvider.credential(null, response.access_token);
          const result = await signInWithCredential(authInstance, credential);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
    });
    tokenClient.requestAccessToken({ prompt: "select_account" });
  });
}

/**
 * Initiates Facebook Sign-In using signInWithPopup.
 */
export async function initiateFacebookSignIn(
  authInstance: Auth,
  _isMobile?: boolean,
): Promise<UserCredential | null> {
  const provider = new FacebookAuthProvider();
  try {
    const result = await signInWithPopup(authInstance, provider);
    return result;
  } catch (error) {
    console.error("Error during Facebook sign-in:", error);
    throw error;
  }
}

/**
 * Initiates Twitter (X) Sign-In using signInWithPopup.
 */
export async function initiateTwitterSignIn(
  authInstance: Auth,
  _isMobile?: boolean,
): Promise<UserCredential | null> {
  const provider = new OAuthProvider("twitter.com");
  try {
    const result = await signInWithPopup(authInstance, provider);
    return result;
  } catch (error) {
    console.error("Error during Twitter/X sign-in:", error);
    throw error;
  }
}

/**
 * No-op kept for backward compatibility. With signInWithPopup there is no
 * redirect result to fetch — always returns null.
 */
export async function signOutUser(authInstance: Auth): Promise<void> {
  await firebaseSignOut(authInstance);
}

export async function handleRedirectResult(
  _auth: Auth,
): Promise<UserCredential | null> {
  return null;
}

export async function handleGoogleRedirectResult(
  auth: Auth,
): Promise<UserCredential | null> {
  return handleRedirectResult(auth);
}
