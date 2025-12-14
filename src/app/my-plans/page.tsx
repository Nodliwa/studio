
'use client';

import { useUser, useCollection, useMemoFirebase, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Budget } from '@/lib/types';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Greeter from '@/components/greeter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Heart, ListChecks, Wallet } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CrossIcon } from 'lucide-react';

function MyPlansPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const [dialogOpen, setDialogOpen] = useState(false);

    const budgetsCollection = useMemoFirebase(() => (
        user && !user.isAnonymous ? collection(firestore, 'users', user.uid, 'budgets') : null
    ), [user, firestore]);

    const { data: budgets, isLoading: budgetsLoading } = useCollection<Budget>(budgetsCollection);

     useEffect(() => {
        // Wait until user loading is complete before making routing decisions
        if (isUserLoading) return;
    
        // If loading is done and there's still no user or user is anonymous, redirect
        if (!user || user.isAnonymous) {
          router.push('/register');
        }
      }, [user, isUserLoading, router]);

    const handleNewPlan = async (eventType: string) => {
        setDialogOpen(false); 
        if (user && !user.isAnonymous) {
            const newBudgetId = uuidv4();
            const newBudget: Omit<Budget, 'id'> = {
                name: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} Plan`,
                grandTotal: 0,
                userId: user.uid,
                eventType: eventType,
            };
            
            const newBudgetWithId = { ...newBudget, id: newBudgetId };
            
            const budgetsCol = collection(firestore, 'users', user.uid, 'budgets');
            addDocumentNonBlocking(budgetsCol, newBudgetWithId);

            router.push(`/planner/${newBudgetId}?eventType=${eventType}`);
        } else {
             router.push(`/planner/template?eventType=${eventType}`);
        }
    };
    
    if (isUserLoading || !user || (user && user.isAnonymous)) {
        return (
            <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (budgetsLoading) {
        return (
            <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
                <p>Loading plans...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary px-20 md:px-40 lg:px-40">
            <div className="bg-background shadow-lg min-h-screen">
                <PageHeader />
                <main className="container mx-auto p-4 md:p-8">
                    <Greeter name={user.displayName || 'there'} />

                    <div className="flex items-center justify-between my-8">
                        <div>
                            <h2 className="text-3xl font-bold font-headline">Check your plans below</h2>
                            <p className="text-muted-foreground">Click a plan to edit or review</p>
                        </div>
                    </div>

                    {budgets && budgets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {budgets.map(budget => (
                                <Card key={budget.id}>
                                    <CardHeader>
                                        <CardTitle>{budget.name}</CardTitle>
                                        {budget.eventDate && <CardDescription>{new Date(budget.eventDate).toLocaleDateString()}</CardDescription>}
                                    </CardHeader>
                                    <CardContent>
                                        <p>Total: {budget.grandTotal > 0 ? new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(budget.grandTotal) : 'R0.00'}</p>
                                        <Button asChild variant="link" className="p-0 mt-4">
                                            <Link href={`/planner/${budget.id}`}>View Details</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-16">
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <p className="text-lg text-muted-foreground">
                                    You currently do not have an active plan,{' '}
                                    <DialogTrigger asChild>
                                        <button className="font-bold text-primary hover:underline focus:outline-none">add plan</button>
                                    </DialogTrigger>
                                </p>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Create a new plan</DialogTitle>
                                        <DialogDescription>
                                            Select an event type to get started with a template.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                                        <Button variant="outline" size="lg" className="h-20 flex-col gap-2" onClick={() => handleNewPlan('wedding')}>
                                            <Heart />
                                            Wedding
                                        </Button>
                                        <Button variant="outline" size="lg" className="h-20 flex-col gap-2" onClick={() => handleNewPlan('funeral')}>
                                            <CrossIcon />
                                            Funeral
                                        </Button>
                                        <Button variant="outline" size="lg" className="h-20 flex-col gap-2" onClick={() => handleNewPlan('birthday')}>
                                            <ListChecks />
                                            Birthday
                                        </Button>
                                        <Button variant="outline" size="lg" className="h-20 flex-col gap-2" onClick={() => handleNewPlan('other')}>
                                            <Wallet />
                                            Other
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default MyPlansPage;
