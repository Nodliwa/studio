
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { getStorage } from 'firebase/storage';
import type { User as AuthUser } from 'firebase/auth';
import type { User as AppUser } from '@/lib/types';


// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    let firebaseApp;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
    } catch (e) {
      // Only warn in production because it's normal to use the firebaseConfig to initialize
      // during development
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp),
  };
}

/**
 * Creates or updates a user document in Firestore.
 * This function is non-blocking.
 * @param authUser The Firebase Auth user object.
 */
export function setUserData(authUser: AuthUser) {
    const firestore = getFirestore();
    if (!authUser.email) {
      console.warn('Cannot create user profile without an email.');
      return;
    }
  
    const userRef = doc(firestore, 'users', authUser.uid);
    const userData: AppUser = {
      id: authUser.uid,
      email: authUser.email,
      displayName: authUser.displayName || 'New User', // Fallback display name
    };
  
    // Use setDoc with merge:true to create or update the document without overwriting existing fields
    // This is a non-blocking operation.
    setDoc(userRef, userData, { merge: true }).catch(error => {
      console.error("Error writing user document:", error);
      // In a real app, you might want to emit a global error here
    });
  }

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export { useUser } from './provider';
