
import { firebaseConfig } from "@/firebase/config";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  DocumentReference,
  collection,
  writeBatch,
  deleteDoc as deleteDocFirestore,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  limit,
  collectionGroup,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

export function initializeFirebase() {
  let firebaseApp: FirebaseApp;
  if (!getApps().length) {
    try {
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      console.warn(
        "Initialization with config object failed. This may be expected in some environments.",
        e,
      );
      firebaseApp = getApp();
    }
  } else {
    firebaseApp = getApp();
  }
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  
  // Only set browser persistence if we are in a browser environment
  if (typeof window !== "undefined") {
    setPersistence(auth, browserLocalPersistence).catch(() => {});
  } else {
    setPersistence(auth, inMemoryPersistence).catch(() => {});
  }
  
  const storage = getStorage(firebaseApp);
  return {
    firebaseApp,
    auth,
    firestore,
    storage,
  };
}

export const setUserData = async (
  userRef: DocumentReference,
  email: string,
  displayName: string,
  knownAs?: string,
) => {
  return setDoc(
    userRef,
    {
      email,
      displayName,
      knownAs: knownAs || displayName.split(" ")[0],
    },
    { merge: true },
  );
};

export * from "./provider";
export * from "./client-provider";
export * from "./firestore/use-collection";
export * from "./firestore/use-doc";
export * from "./auth-operations";
export * from "./non-blocking-updates";
