
'use client';

import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
import { PlusCircle, PartyPopper, Heart, Cross } from 'lucide-react';

function MyPlansPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const budgetsCollection = useMemoFirebase(() => (
        user ? collection(firestore, 'users', user.uid, 'budgets') : null
    ), [user, firestore]);

    const { data: budgets, isLoading: budgetsLoading } = useCollection<Budget>(budgetsCollection);

    useEffect(() => {
        if (!isUserLoading && (!user || user.isAnonymous)) {
            router.push('/register');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || !user || user.isAnonymous) {
        return (
            <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
                <p>Loading plans...</p>
            </div>
        );
    }
    
    // We can only get here if user is not null.
    // The budgetsLoading check should happen after we are sure we have a user.
    if (budgetsLoading) {
        return (
            <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
                <p>Loading plans...</p>
            </div>
        );
    }


    const handleNewPlan = (eventType: string) => {
        router.push(`/planner?eventType=${eventType}`);
    }

    return (
        <div className="min-h-screen bg-background">
            <PageHeader />
            <main className="container mx-auto p-4 md:p-8">
                <Greeter name={user.displayName || 'there'} />

                <div className="flex items-center justify-between my-8">
                    <div>
                        <h2 className="text-3xl font-bold font-headline">Check your plans below</h2>
                        <p className="text-muted-foreground">Click a plan to edit or review</p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Plan
                            </Button>
                        </DialogTrigger>
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
                                <Button variant="outline" size="lg" className="h-20 flex-col gap-2" onClick={() => handleNewPlan('birthday')}>
                                    <PartyPopper />
                                    Birthday
                                </Button>
                                <Button variant="outline" size="lg" className="h-20 flex-col gap-2" onClick={() => handleNewPlan('funeral')}>
                                    <Cross />
                                    Funeral
                                </Button>
                                <Button variant="outline" size="lg" className="h-20 flex-col gap-2" onClick={() => handleNewPlan('other')}>
                                    <PlusCircle />
                                    Other
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
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
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <h2 className="text-xl font-semibold">No plans yet!</h2>
                        <p className="text-muted-foreground mt-2">Get started by creating your first celebration plan.</p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="mt-4">Create a Plan</Button>
                            </DialogTrigger>
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
                                    <Button variant="outline" size="lg" className="h-20 flex-col gap-2" onClick={() => handleNewPlan('birthday')}>
                                        <PartyPopper />
                                        Birthday
                                    </Button>
                                    <Button variant="outline" size="lg" className="h-20 flex-col gap-2" onClick={() => handleNewPlan('funeral')}>
                                        <Cross />
                                        Funeral
                                    </Button>
                                    <Button variant="outline" size="lg" className="h-20 flex-col gap-2" onClick={() => handleNewPlan('other')}>
                                        <PlusCircle />
                                        Other
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </main>
        </div>
    );
}

export default MyPlansPage;
