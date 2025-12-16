
'use client';
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useUser, useFirestore } from "@/firebase";
import { getAuth, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { LogOut, PlusCircle, Heart, ListChecks, Wallet, CrossIcon, Menu, Star, Gift } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import type { Budget, BudgetCategory } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';
import { budgetTemplates } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Card } from "./ui/card";


function calculateInitialTotal(categories: BudgetCategory[]): number {
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

export default function PageHeader() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = getAuth();
  const router = useRouter();
  const firestore = useFirestore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    signOut(auth).then(() => {
        router.push('/');
    });
  };
  
  const handleNewPlan = async (eventType: string) => {
    setDialogOpen(false);
    if (user && !user.isAnonymous) {
      const newBudgetId = uuidv4();
      const template = budgetTemplates[eventType as keyof typeof budgetTemplates] || budgetTemplates.other;
      const initialTotal = calculateInitialTotal(template as BudgetCategory[]);

      const newBudget: Budget = {
        id: newBudgetId,
        name: "My Celebration Plan",
        grandTotal: initialTotal,
        userId: user.uid,
        eventType: eventType,
      };

      const budgetDocRef = doc(firestore, 'users', user.uid, 'budgets', newBudgetId);
      await setDoc(budgetDocRef, newBudget, {});

      router.push(`/planner/${newBudgetId}?eventType=${eventType}`);
    } else {
      router.push(`/planner/template?eventType=${eventType}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm shadow-sm">
      <div className="container flex h-20 items-center justify-between mx-auto">
        <div className="flex items-center ml-3">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/brand2.png"
              alt="SimpliPlan Logo"
              width={143}
              height={36}
              priority
            />
          </Link>
        </div>
        <nav className="hidden md:flex items-center justify-center gap-6 text-lg absolute left-1/2 -translate-x-1/2">
            <Link href="/" className={cn("font-bold transition-colors hover:text-foreground/80", pathname === "/" ? "text-foreground" : "text-foreground/60")}>
              Home
            </Link>
            <Link href="/my-plans" className={cn("font-bold transition-colors hover:text-foreground/80", pathname?.startsWith("/my-plans") || pathname?.startsWith("/planner") ? "text-foreground" : "text-foreground/60")}>
                MyPlans
            </Link>
        </nav>
        <div className="flex items-center justify-end gap-2">
          {isUserLoading ? (
            <div className="w-24 h-10 bg-muted rounded-md animate-pulse" />
          ) : user && !user.isAnonymous ? (
            <div className="flex items-center gap-2">
                {pathname === '/my-plans' && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="px-3">
                        <PlusCircle className="mr-1 h-4 w-4" />
                        Add Plan
                      </Button>
                    </DialogTrigger>
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
                )}
                 <Button variant="ghost" onClick={handleLogout} className="hidden md:flex text-lg font-bold text-foreground/60 hover:text-foreground/80">
                    <LogOut className="mr-1 h-5 w-5" />
                    Logout
                 </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                  <Link href="/login" className="text-lg">Login</Link>
              </Button>
              <Button asChild size="sm">
                  <Link href="/register" className="text-lg">Sign Up</Link>
              </Button>
            </div>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-6 text-lg font-medium mt-8">
                <SheetClose asChild>
                    <Link href="/" className={cn("transition-colors hover:text-foreground/80", pathname === "/" ? "text-foreground" : "text-foreground/60")}>
                    Home
                    </Link>
                </SheetClose>
                <SheetClose asChild>
                    <Link href="/my-plans" className={cn("transition-colors hover:text-foreground/80", pathname?.startsWith("/my-plans") || pathname?.startsWith("/planner") ? "text-foreground" : "text-foreground/60")}>
                        MyPlans
                    </Link>
                </SheetClose>
                 {user && !user.isAnonymous ? (
                    <Button variant="ghost" onClick={handleLogout} className="justify-start p-0 text-lg font-medium text-foreground/60 hover:text-foreground/80">
                        <LogOut className="mr-1 h-5 w-5" />
                        Logout
                    </Button>
                 ) : (
                   <>
                    <SheetClose asChild>
                      <Link href="/login" className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium">
                        Login
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/register" className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium">
                        Sign Up
                      </Link>
                    </SheetClose>
                   </>
                 )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
