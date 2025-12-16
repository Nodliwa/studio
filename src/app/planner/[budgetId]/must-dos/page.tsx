
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { MustDo } from "@/lib/types";
import PageHeader from "@/components/page-header";
import { MustDos } from "@/components/must-dos";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import Greeter from '@/components/greeter';
import { Budget } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';


export default function MustDosPage({ params: { budgetId } }: { params: { budgetId: string } }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
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

  if (isUserLoading || budgetLoading || mustDosLoading) {
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
            <Button asChild variant="outline">
              <Link href={`/planner/${budgetId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Budget Planner
              </Link>
            </Button>
          </div>

          <div className="mt-8">
            <MustDos 
                budgetId={budgetId} 
                budgetRef={budgetDocRef} 
                isTemplateMode={false} 
                mustDos={mustDos} 
            />
          </div>
        </main>
      </div>
    </div>
  );
}

    