'use client';
/**
 * @fileOverview Centralized Firestore helpers for managing Must-Do tasks.
 */

import { collection, doc, serverTimestamp, writeBatch, Firestore, setDoc } from 'firebase/firestore';
import type { MustDo } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Returns the correct Must-Do collection path based on userId and budgetId.
 */
export function getMustDosCollection(firestore: Firestore, userId: string, budgetId: string) {
  // Matches Firestore rules path: users/{userId}/budgets/{budgetId}/mustDos
  return collection(firestore, 'users', userId, 'budgets', budgetId, 'mustDos');
}

/**
 * Add a single Must-Do item safely without blocking the UI thread.
 */
export function addMustDo(
  firestore: Firestore,
  userId: string,
  budgetId: string,
  title: string,
  note?: string,
  priority: MustDo['priority'] = 'medium',
  reminderType: MustDo['reminderType'] = 'none',
  reminderDaysBefore = 1,
  deadline?: string
) {
  const mustDosCollection = getMustDosCollection(firestore, userId, budgetId);
  const newDocRef = doc(mustDosCollection);

  const newItem: Omit<MustDo, 'id'> = {
    budgetId,
    userId,
    title,
    note: note || '',
    status: 'todo',
    priority,
    createdAt: serverTimestamp(),
    reminderType,
    reminderDaysBefore,
    deadline: deadline || '',
  };

  // Non-blocking write
  setDoc(newDocRef, newItem).catch(error => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: newDocRef.path,
        operation: 'create',
        requestResourceData: newItem
    }));
  });
  
  return newDocRef.id;
}

/**
 * Batch add multiple Must-Dos (e.g., from AI suggestions).
 */
export function addMustDosBatch(
  firestore: Firestore,
  userId: string,
  budgetId: string,
  titles: string[]
) {
  if (!titles.length) return;
  
  const mustDosCollection = getMustDosCollection(firestore, userId, budgetId);
  const batch = writeBatch(firestore);

  titles.forEach(title => {
    const newDocRef = doc(mustDosCollection);
    const newItem = {
      budgetId,
      userId,
      title,
      note: '',
      status: 'todo',
      priority: 'medium',
      createdAt: serverTimestamp(),
      reminderType: 'none',
      reminderDaysBefore: 1,
      deadline: '',
    };
    batch.set(newDocRef, newItem);
  });

  batch.commit().catch(error => {
      console.error("Batch commit failed:", error);
      // We emit a generic error since we can't context-link a batch easily to one path
      errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: mustDosCollection.path,
          operation: 'write',
          requestResourceData: { count: titles.length }
      }));
  });
}
