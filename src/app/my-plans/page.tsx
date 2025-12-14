
'use client';

import { useUser, useCollection, useMemoFirebase, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
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
import { PlusCircle, PartyPopper, Heart, Briefcase } from 'lucide-react';
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
        // Wait until the user loading is finished
        if (!isUserLoading) {
            // If there's no user or the user is anonymous, redirect to register
            if (!user || user.isAnonymous) {
                router.push('/register');
            }
        }
    }, [user, isUserLoading, router]);

    const handleNewPlan = async (eventType: string) => {
        setDialogOpen(false); // Close the dialog first
        if (user && !user.isAnonymous) {
            const newBudgetId = uuidv4();
            const newBudget: Omit<Budget, 'id'> = {
                name: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} Plan`,
                grandTotal: 0,
                userId: user.uid,
                eventType: eventType,
            };
            
            const newBudgetWithId = { ...newBudget, id: newBudgetId };
            
            // Non-blocking write
            const budgetsCol = collection(firestore, 'users', user.uid, 'budgets');
            const newDocRef = doc(budgetsCol, newBudgetId);
            addDocumentNonBlocking(budgetsCol, newBudgetWithId);


            // Optimistically navigate
            router.push(`/planner/${newBudgetId}?eventType=${eventType}`);
        } else {
             router.push(`/planner/template?eventType=${eventType}`);
        }
    };
    
    // Show a loading screen while we verify the user's auth state.
    // This is the key fix: it prevents any rendering or redirects until we know the user's status.
    if (isUserLoading) {
        return (
            <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }
    
    // If we're done loading and there's no valid user, the redirect is happening.
    // Show a message while redirecting.
    if (!user || user.isAnonymous) {
        return (
            <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
                <p>Redirecting to registration...</p>
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
        <div className="min-h-screen bg-background">
            <PageHeader />
            <main className="container mx-auto p-4 md:p-8">
                <Greeter name={user.displayName || 'there'} />

                <div className="flex items-center justify-between my-8">
                    <div>
                        <h2 className="text-3xl font-bold font-headline">Check your plans below</h2>
                        <p className="text-muted-foreground">Click a plan to edit or review</p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                                    <CrossIcon />
                                    Funeral
                                </Button>
                                <Button variant="outline" size="lg" className="h-20 flex-col gap-2" onClick={() => handleNewPlan('other')}>
                                    <Briefcase />
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
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                                        <CrossIcon />
                                        Funeral
                                    </Button>
                                    <Button variant="outline" size="lg" className="h-20 flex-col gap-2" onClick={() => handleNewPlan('other')}>
                                        <Briefcase />
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
