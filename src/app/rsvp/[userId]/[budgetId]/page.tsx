import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import Link from 'next/link';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Budget } from '@/lib/types';
import RsvpForm from './RsvpForm';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-1406892914-3d877',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function PublicRsvpPage({
  params: { userId, budgetId },
}: {
  params: { userId: string; budgetId: string };
}) {
  let budget: Budget | null = null;

  try {
    const db = getFirestore(getAdminApp());
    const snap = await db.doc(`users/${userId}/budgets/${budgetId}`).get();
    if (snap.exists) {
      budget = { id: snap.id, ...snap.data() } as Budget;
    }
  } catch (error) {
    console.error('Failed to load RSVP budget:', error);
  }

  if (!budget) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Invitation Not Found</CardTitle>
            <CardDescription>
              The link you followed may be incorrect or the celebration is no longer active.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full"><Link href="/">Go to SimpliPlan</Link></Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <RsvpForm budget={budget} userId={userId} budgetId={budgetId} />;
}
