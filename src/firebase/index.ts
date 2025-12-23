
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, DocumentReference, serverTimestamp, updateDoc, collection, writeBatch, deleteDoc as deleteDocFirestore, addDoc, getDocs, getDoc, query, where, limit } from 'firebase/firestore'
import { getStorage } from 'firebase/storage';

export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      console.warn('Initialization with config object failed. This may be expected in some environments.', e);
      firebaseApp = getApp();
    }
    return getSdks(firebaseApp);
  }
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  const storage = getStorage(firebaseApp);
  return {
    firebaseApp,
    auth,
    firestore,
    storage,
  };
}

export const setUserData = async (userRef: DocumentReference, email: string, displayName: string, knownAs?: string) => {
    return setDoc(userRef, {
        email,
        displayName,
        knownAs: knownAs || displayName.split(' ')[0]
    }, { merge: true });
};

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth-operations';
export * from './non-blocking-updates';

    