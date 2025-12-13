
'use client';

import { useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Budget } from '@/lib/types';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Greeter from '@/components/greeter';

function MyPlansPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    const budgetsCollection = useMemoFirebase(() => (
        user ? collection(user.firestore, 'users', user.uid, 'budgets') : null
    ), [user]);

    const { data: budgets, isLoading: budgetsLoading } = useCollection<Budget>(budgetsCollection);

    useEffect(() => {
        if (!isUserLoading && (!user || user.isAnonymous)) {
            router.push('/register');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || budgetsLoading || !user || user.isAnonymous) {
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
                    <h2 className="text-3xl font-bold font-headline">My Plans</h2>
                    <Button asChild>
                        <Link href="/planner">Create New Plan</Link>
                    </Button>
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
                                    <p>Total: {budget.grandTotal}</p>
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
                        <Button asChild className="mt-4">
                           <Link href="/planner">Create a Plan</Link>
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default MyPlansPage;
