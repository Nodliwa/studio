
"use client";

import { useMemo } from 'react';
import type { MustDo } from "@/lib/types";
import PageHeader from "@/components/page-header";
import { MustDos } from "@/components/must-dos";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import Greeter from '@/components/greeter';
import { Budget } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


export default function MustDosPage({ params: { budgetId } }: { params: { budgetId: string } }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  
  const budgetDocRef = useMemoFirebase(() => (
    user && budgetId ? doc(firestore, 'users', user.uid, 'budgets', budgetId) : null
  ), [user, firestore, budgetId]);

  const { data: budget, isLoading: budgetLoading } = useDoc<Budget>(budgetDocRef);

  const mustDosCollection = useMemoFirebase(() => (
    user && budgetDocRef ? collection(budgetDocRef, 'mustDos') : null
  ), [user, budgetDocRef]);

  const mustDosQuery = useMemoFirebase(() => (
    mustDosCollection ? query(mustDosCollection, orderBy('createdAt', 'desc')) : null
  ), [mustDosCollection]);

  const { data: mustDos, isLoading: mustDosLoading } = useCollection<MustDo>(mustDosQuery);

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
             {(budgetLoading || mustDosLoading) ? (
                 <Skeleton className="w-full h-[400px] rounded-lg" />
             ) : (
                <MustDos 
                    budgetId={budgetId} 
                    budgetRef={budgetDocRef} 
                    isTemplateMode={false} 
                    mustDos={mustDos} 
                    eventType={budget?.eventType}
                />
             )}
          </div>
        </main>
      </div>
    </div>
  );
}

    