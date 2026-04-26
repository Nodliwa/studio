"use client";

import { collection, doc, query, where } from "firebase/firestore";
import { useFirestore, useMemoFirebase, useDoc, useCollection } from "@/firebase";
import type { Supplier, SupplierOpportunity, SupplierCredit, SupplierNotification } from "@/lib/supplier-types";

export function useSupplierProfile(uid: string | undefined) {
  const firestore = useFirestore();
  const docRef = useMemoFirebase(
    () => uid ? doc(firestore, "suppliers", uid) : null,
    [uid, firestore],
  );
  return useDoc<Supplier>(docRef);
}

export function useSupplierOpportunities(uid: string | undefined) {
  const firestore = useFirestore();
  const colRef = useMemoFirebase(
    () =>
      uid
        ? query(
            collection(firestore, "supplier_opportunities"),
            where("targetedSupplierIds", "array-contains", uid),
            where("status", "==", "active"),
          )
        : null,
    [uid, firestore],
  );
  return useCollection<SupplierOpportunity>(colRef);
}

export function useSupplierCredits(uid: string | undefined) {
  const firestore = useFirestore();
  const colRef = useMemoFirebase(
    () =>
      uid
        ? query(
            collection(firestore, "supplier_credits"),
            where("supplierId", "==", uid),
          )
        : null,
    [uid, firestore],
  );
  return useCollection<SupplierCredit>(colRef);
}

export function useAllSupplierOpportunities(uid: string | undefined) {
  const firestore = useFirestore();
  const colRef = useMemoFirebase(
    () =>
      uid
        ? query(
            collection(firestore, "supplier_opportunities"),
            where("targetedSupplierIds", "array-contains", uid),
          )
        : null,
    [uid, firestore],
  );
  return useCollection<SupplierOpportunity>(colRef);
}

export function useSupplierNotifications(uid: string | undefined) {
  const firestore = useFirestore();
  const colRef = useMemoFirebase(
    () =>
      uid
        ? query(
            collection(firestore, "supplier_notifications"),
            where("supplierId", "==", uid),
          )
        : null,
    [uid, firestore],
  );
  return useCollection<SupplierNotification>(colRef);
}
