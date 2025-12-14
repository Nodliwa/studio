
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
import { PlusCircle, PartyPopper, Heart, Briefcase, ListChecks, CalendarDays, Wallet, RefreshCw } from 'lucide-react';
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
        if (!isUserLoading) {
            if (!user || user.isAnonymous) {
                router.push('/register');
            }
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
        <div className="min-h-screen bg-secondary px-20 md:px-40 lg:px-60">
            <div className="bg-background shadow-lg min-h-screen">
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
                    
                    <div className="mt-24 w-full max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold font-headline text-center">Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="flex flex-col items-center gap-2 text-base font-semibold">
                            <ListChecks className="h-6 w-6 text-primary" />
                            <span>Don’t forget a thing</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground">We give you a handy list of items to think about for your event, so nothing slips through the cracks.</p>
                        </CardContent>
                        </Card>
                        <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="flex flex-col items-center gap-2 text-base font-semibold">
                            <CalendarDays className="h-6 w-6 text-primary" />
                            <span>Planning That Fits Your Life</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground">Plan anywhere, with anyone, whenever it suits you — simple, flexible, and stress-free.</p>
                        </CardContent>
                        </Card>
                        <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="flex flex-col items-center gap-2 text-base font-semibold">
                            <Wallet className="h-6 w-6 text-primary" />
                            <span>Effortless Budgeting</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground">Forget diaries & spreadsheets - Organise your spending and see where your money goes, all in one place</p>
                        </CardContent>
                        </Card>
                        <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="flex flex-col items-center gap-2 text-base font-semibold">
                            <RefreshCw className="h-6 w-6 text-primary" />
                            <span>Real-Time Updates</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground">See your grand total update instantly as you adjust quantities and prices. No surprises.</p>
                        </CardContent>
                        </Card>
                    </div>
                    </div>
                    
                </main>
            </div>
        </div>
    );
}

export default MyPlansPage;

    
    
