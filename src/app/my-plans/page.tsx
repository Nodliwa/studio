
'use client';

import { useUser, useCollection, useMemoFirebase, useFirestore, deleteDocument, useAuth } from '@/firebase';
import { collection, doc, writeBatch, getDocs, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Budget } from '@/lib/types';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlusCircle, Heart, ListChecks, Wallet, CalendarDays, RefreshCw, Menu, MapPin, Users, MessageSquare, Star, Gift } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CrossIcon } from 'lucide-react';
import { budgetTemplates } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import MotivationalQuote from '@/components/motivational-quote';

function calculateInitialTotal(categories: any[]): number {
    let grandTotal = 0;
    categories.forEach(category => {
        (category.items || []).forEach(item => {
            grandTotal += (item.quantity || 0) * (item.unitPrice || 0);
        });
        if (category.subCategories) {
            grandTotal += calculateInitialTotal(category.subCategories);
        }
    });
    return grandTotal;
}

const eventTypeImages: { [key: string]: string } = {
    wedding: '/images/wedding.jpg',
    funeral: '/images/funeral2.png',
};

function PlanCard({ budget, onDelete }: { budget: Budget, onDelete: (id: string) => void }) {
    const router = useRouter();
    const imageUrl = budget.eventType ? eventTypeImages[budget.eventType] : undefined;

    const formattedDate = budget.eventDate 
        ? new Date(budget.eventDate).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : null;

    return (
        <Card className="overflow-hidden group relative flex flex-col bg-card shadow-sm">
            <div className="relative w-full aspect-[4/3]">
                <Link href={`/planner/${budget.id}`} className="block w-full h-full">
                    {imageUrl ? (
                        <>
                            <Image
                                src={imageUrl}
                                alt={budget.name || 'Event image'}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/10" />
                        </>
                    ) : (
                        <div className="h-full w-full bg-gradient-to-t from-primary/80 to-primary/40" />
                    )}
                </Link>

                <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold truncate text-shadow" title={budget.name}>{budget.name}</h3>
                        <div className='space-y-1 text-sm text-white/90 text-shadow-sm'>
                            {formattedDate ? (
                                <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0" /> {formattedDate}</p>
                            ) : (
                                <p className="flex items-center gap-2 italic"><CalendarDays className="h-4 w-4 shrink-0" /> No date set</p>
                            )}
                            {budget.eventLocation ? (
                                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> <span className="truncate">{budget.eventLocation}</span></p>
                            ) : (
                                <p className="flex items-center gap-2 italic"><MapPin className="h-4 w-4 shrink-0" /> No location set</p>
                            )}
                            {budget.expectedGuests ? (
                                <p className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0" /> {budget.expectedGuests} guests</p>
                            ) : (
                                <p className="flex items-center gap-2 italic"><Users className="h-4 w-4 shrink-0" /> No guests set</p>
                            )}
                        </div>
                    </div>

                    <p className="flex items-start gap-2 text-2xl font-bold text-white text-shadow mt-3 self-end">
                        <Wallet className="inline-block h-6 w-6 mt-1 shrink-0" />
                        {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(budget.grandTotal)}
                    </p>
                </div>
            </div>

            <AlertDialog>
                <div className="absolute top-2 right-2 z-30">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative h-8 w-8 hover:bg-white/20 text-white">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background/80 backdrop-blur text-foreground">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/planner/${budget.id}`); }}>
                                Edit Budget
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your plan and all of its data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(budget.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
             <CardFooter className="p-0 border-t bg-card">
                <Button variant="default" className="w-full rounded-t-none text-lg font-bold py-4" onClick={() => router.push(`/planner/${budget.id}/must-dos`)}>
                    <ListChecks className="mr-2 h-4 w-4" />
                    Must-Do's
                </Button>
            </CardFooter>
        </Card>
    );
}


function MyPlansPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const [dialogOpen, setDialogOpen] = useState(false);
    const { toast } = useToast();
    
    const budgetsCollection = useMemoFirebase(() => (
        user && !user.isAnonymous ? collection(firestore, 'users', user.uid, 'budgets') : null
    ), [user, firestore]);

    const { data: budgets, isLoading: budgetsLoading, error } = useCollection<Budget>(budgetsCollection);

     useEffect(() => {
        if (isUserLoading) return;
    
        if (!user || user.isAnonymous) {
          router.push('/register');
        }
      }, [user, isUserLoading, router]);

    const handleNewPlan = async (eventType: string) => {
        setDialogOpen(false); 
        if (user && !user.isAnonymous) {
            const newBudgetId = uuidv4();
            const template = budgetTemplates[eventType as keyof typeof budgetTemplates] || budgetTemplates.other;
            const initialTotal = calculateInitialTotal(template);

            const newBudget: Budget = {
                id: newBudgetId,
                name: "My Celebration Plan",
                grandTotal: initialTotal,
                userId: user.uid,
                eventType: eventType,
                eventDate: '',
                eventLocation: '',
                expectedGuests: 0
            };
            
            const budgetDocRef = doc(firestore, 'users', user.uid, 'budgets', newBudgetId);
            await setDoc(budgetDocRef, newBudget, {});

            router.push(`/planner/${newBudgetId}?eventType=${eventType}`);
        } else {
             router.push(`/planner/template?eventType=${eventType}`);
        }
    };
    
    const handleDeletePlan = async (budgetId: string) => {
        if (!user || !firestore) return;
        
        const budgetDocRef = doc(firestore, 'users', user.uid, 'budgets', budgetId);
        
        try {
            const categoriesCollectionRef = collection(budgetDocRef, 'categories');
            const categoriesSnapshot = await getDocs(categoriesCollectionRef);
    
            const batch = writeBatch(firestore);
    
            for (const categoryDoc of categoriesSnapshot.docs) {
                const itemsCollectionRef = collection(categoryDoc.ref, 'items');
                const itemsSnapshot = await getDocs(itemsCollectionRef);
                itemsSnapshot.forEach(itemDoc => {
                    batch.delete(itemDoc.ref);
                });
                batch.delete(categoryDoc.ref);
            }

            batch.delete(budgetDocRef);
            
            await batch.commit();

            toast({ title: "Plan deleted successfully" });

        } catch (e) {
            console.error("Error deleting plan:", e);
            toast({ variant: 'destructive', title: "Error", description: "Could not delete plan." });
            deleteDocument(budgetDocRef); 
        }

    };

    if (isUserLoading || !user || (user && user.isAnonymous) || (budgetsLoading && budgets === null)) {
        return (
            <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-secondary flex flex-col">
            <div className="bg-background shadow-2xl container mx-auto flex flex-col flex-grow">
                <PageHeader />
                <main className="container mx-auto px-4 flex-grow flex flex-col mb-16">
                    <div className="flex-grow">
                        <Greeter />

                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <Card className="mt-8">
                                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold font-headline">
                                            {!budgetsLoading && budgets ? (budgets.length > 0 ? `You have ${budgets.length} active plan(s).` : "You have no active plans.") : "Loading plans..."}
                                        </h3>
                                        <p className="text-muted-foreground">Ready to start planning your next celebration?</p>
                                    </div>
                                    <DialogTrigger asChild>
                                        <Button size="lg">
                                            <PlusCircle className="mr-2 h-5 w-5" />
                                            Add New Plan
                                        </Button>
                                    </DialogTrigger>
                                </CardContent>
                            </Card>

                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Create a new plan</DialogTitle>
                                    <DialogDescription>
                                        Select an event type to get started with a template.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                    <div className="group cursor-pointer" onClick={() => handleNewPlan('wedding')}>
                                        <Card className="relative overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1 aspect-video">
                                            <Image src="/images/wedding.jpg" alt="Wedding" fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/40" />
                                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                                <h3 className="text-xl font-semibold text-white">Wedding</h3>
                                            </div>
                                        </Card>
                                    </div>
                                    <div className="group cursor-pointer" onClick={() => handleNewPlan('funeral')}>
                                        <Card className="relative overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1 aspect-video">
                                            <Image src="/images/funeral2.png" alt="Funeral" fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/40" />
                                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                                <h3 className="text-xl font-semibold text-white">Funeral</h3>
                                            </div>
                                        </Card>
                                    </div>
                                    <div className="group cursor-pointer" onClick={() => alert('Coming Soon!')}>
                                        <Card className="relative overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1 aspect-video">
                                            <Image src="/images/umemulo.jpg" alt="uMemulo" fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/40" />
                                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                                <h3 className="text-xl font-semibold text-white">uMemulo</h3>
                                            </div>
                                        </Card>
                                    </div>
                                     <div className="group cursor-pointer" onClick={() => alert('Coming Soon!')}>
                                        <Card className="relative overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1 aspect-video">
                                            <Image src="/images/umgidi1.jpg" alt="umGidi" fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/40" />
                                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                                <h3 className="text-xl font-semibold text-white">umGidi</h3>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {budgetsLoading && (
                             <div className="text-center py-16">
                                <p className="text-lg text-muted-foreground">Loading your plans...</p>
                            </div>
                        )}

                        {!budgetsLoading && budgets && budgets.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                                {budgets.map(budget => (
                                <PlanCard key={budget.id} budget={budget} onDelete={handleDeletePlan} />
                                ))}
                            </div>
                        ) : !budgetsLoading && (
                            <div className="text-center py-16">
                                <p className="text-lg text-muted-foreground">
                                    Click "Add New Plan" above to create your first celebration budget.
                                </p>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-12 w-full max-w-6xl mx-auto">
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
                                <p className="text-sm text-muted-foreground text-center">We give you a handy list of items to think about for your event, so nothing slips through the cracks.</p>
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
                                <p className="text-sm text-muted-foreground text-center">Plan anywhere, with anyone, whenever it suits you — simple, flexible, and stress-free.</p>
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
                                <p className="text-sm text-muted-foreground text-center">Forget diaries & spreadsheets - Organise your spending and see where your money goes, all in one place</p>
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
                                <p className="text-sm text-muted-foreground text-center">See your grand total update instantly as you adjust quantities and prices. No surprises.</p>
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

    