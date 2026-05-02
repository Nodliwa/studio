"use client";

import { useMemo, lazy, Suspense } from 'react';
import type { MustDo } from "@/lib/types";
import PageHeader from "@/components/page-header";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import Greeter from '@/components/greeter';
import { Budget } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const MustDos = lazy(() =>
  import('@/components/must-dos').then(m => ({ default: m.MustDos }))
);

export default function MustDosPage({ params: { budgetId } }: { params: { budgetId: string } }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTemplateMode = budgetId === 'template';

  const budgetDocRef = useMemoFirebase(() => (
    user && budgetId && !isTemplateMode ? doc(firestore, 'users', user.uid, 'budgets', budgetId) : null
  ), [user, firestore, budgetId, isTemplateMode]);

  const { data: budget, isLoading: budgetLoading } = useDoc<Budget>(budgetDocRef);

  const mustDosCollection = useMemoFirebase(() => (
    user && budgetDocRef ? collection(budgetDocRef, 'mustDos') : null
  ), [user, budgetDocRef]);

  const mustDosQuery = useMemoFirebase(() => (
    mustDosCollection ? query(mustDosCollection, orderBy('createdAt', 'desc')) : null
  ), [mustDosCollection]);

  const { data: mustDos, isLoading: mustDosLoading } = useCollection<MustDo>(mustDosQuery);

  const eventType = isTemplateMode
    ? (searchParams.get('eventType') || undefined)
    : budget?.eventType;

  if (isUserLoading) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-secondary">
      <div className="bg-background shadow-2xl min-h-full container mx-auto flex flex-col">
        <PageHeader />
        <main className="container mx-auto px-4 flex-grow flex flex-col mb-16">
          <Greeter />
          <div className="mt-8">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plan
            </Button>
          </div>
          <div className="mt-8">
            {(budgetLoading || mustDosLoading) && !isTemplateMode ? (
              <Skeleton className="w-full h-[400px] rounded-lg" />
            ) : (
              <Suspense fallback={<div className="flex justify-center p-8"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
                <MustDos
                  budgetId={budgetId}
                  budgetRef={budgetDocRef}
                  isTemplateMode={isTemplateMode}
                  mustDos={mustDos}
                  eventType={eventType}
                  birthdayMeta={budget?.birthdayMeta}
                />
              </Suspense>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}