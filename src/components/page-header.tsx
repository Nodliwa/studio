
'use client';
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useUser, useFirestore } from "@/firebase";
import { getAuth, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { LogOut, PlusCircle, Heart, ListChecks, Wallet, CrossIcon } from 'lucide-react';
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

  const handleComingSoon = () => {
    toast({
        title: "Feature Coming Soon!",
        description: "We're working hard to bring this to you.",
    });
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm shadow-sm">
      <div className="flex h-14 items-center justify-between mx-auto px-40">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/brand2.png"
              alt="SimpliPlan Logo"
              width={250}
              height={63}
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
                        <Button variant="outline" size="lg" className="h-20 flex-col gap-2" onClick={() => handleNewPlan('funeral')}>
                          <CrossIcon />
                          Funeral
                        </Button>
                         <Button variant="outline" size="lg" className="h-20 flex-col gap-2" onClick={handleComingSoon}>
                            <ListChecks />
                            uMemulo
                        </Button>
                        <Button variant="outline" size="lg" className="h-20 flex-col gap-2" onClick={handleComingSoon}>
                            <Wallet />
                            umGidi
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                 <Button variant="ghost" onClick={handleLogout} className="text-lg font-bold text-foreground/60 hover:text-foreground/80">
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                 </Button>
            </div>
          ) : (
            <>
              {pathname === '/' && (
                <>
                    <Button asChild variant="outline">
                        <Link href="/login" className="text-lg">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/register" className="text-lg">Sign Up</Link>
                    </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
