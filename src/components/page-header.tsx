
'use client';
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { getAuth, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { LogOut, PlusCircle, User, ListChecks, Wallet, CrossIcon, Menu, Star, Gift } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react";
import type { Budget, BudgetCategory, User as AppUser } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';
import { budgetTemplates } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";


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

    const userDocRef = useMemoFirebase(() => 
        (firestore && user) ? doc(firestore, 'users', user.uid) : null,
    [firestore, user]);

    const { data: userProfile } = useDoc<AppUser>(userDocRef);


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
        name: "",
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
  
  const getUserInitials = () => {
    // Priority 1: Use 'knownAs' from the Firestore profile.
    const knownAs = userProfile?.knownAs?.trim();
    if (knownAs) {
      return knownAs
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
    }
  
    // Priority 2: Use 'displayName' from the Firestore profile.
    const displayName = userProfile?.displayName?.trim();
    if (displayName) {
      const names = displayName.split(' ');
      if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return displayName.substring(0, 2).toUpperCase();
    }
  
    // Priority 3: Fallback to the core auth display name (from Google/FB).
    const authDisplayName = user?.displayName?.trim();
    if (authDisplayName) {
        const names = authDisplayName.split(' ');
        if (names.length > 1) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return authDisplayName.substring(0, 2).toUpperCase();
    }

    // Priority 4: Fallback to email.
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
  
    // Final fallback.
    return 'U';
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm shadow-sm">
      <div className="container flex h-20 items-center justify-between mx-auto">
        <div className="flex items-center justify-start flex-1">
          <Link href="/" className="flex items-center space-x-2 ml-[20px]">
            <Image
              src="/images/brand2.png"
              alt="SimpliPlan Logo"
              width={143}
              height={36}
              priority
            />
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center justify-center gap-6 text-lg">
            <Link href="/" className={cn("font-bold transition-colors hover:text-foreground/80", pathname === "/" ? "text-foreground" : "text-foreground/60")}>
            Home
            </Link>
            <Link href="/my-plans" className={cn("font-bold transition-colors hover:text-foreground/80", pathname?.startsWith("/my-plans") || pathname?.startsWith("/planner") ? "text-foreground" : "text-foreground/60")}>
                MyPlans
            </Link>
            <Link href="/pricing" className={cn("font-bold transition-colors hover:text-foreground/80", pathname === "/pricing" ? "text-foreground" : "text-foreground/60")}>
                Pricing
            </Link>
        </nav>

        <div className="flex items-center justify-end flex-1 mr-4">
            {isUserLoading ? (
                <div className="w-24 h-10 bg-muted rounded-md animate-pulse" />
            ) : user && !user.isAnonymous ? (
                <div className="flex items-center gap-2 pr-4">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="hidden md:flex px-3">
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
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                           <Avatar>
                                <AvatarImage src={userProfile?.photoURL || user.photoURL || undefined} alt="Profile picture" />
                                <AvatarFallback>{getUserInitials()}</AvatarFallback>
                           </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuItem disabled>
                           <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{userProfile?.displayName || user.displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => router.push('/profile')}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                </div>
            ) : (
                <div className="hidden md:flex items-center gap-2">
                     <Button asChild variant="ghost" className="text-base md:text-lg mr-[5px]">
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild size="sm" className="text-base md:text-lg mr-4">
                        <Link href="/register">Sign Up</Link>
                    </Button>
                </div>
            )}
            <div className="flex items-center md:hidden">
                {!isUserLoading && (!user || user.isAnonymous) && (
                    <Button asChild size="sm" className="text-base mr-2">
                        <Link href="/register">Sign Up</Link>
                    </Button>
                )}
                 <Sheet>
                    <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
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
                        <SheetClose asChild>
                           <Link href="/pricing" className={cn("transition-colors hover:text-foreground/80", pathname === "/pricing" ? "text-foreground" : "text-foreground/60")}>
                                Pricing
                            </Link>
                        </SheetClose>
                        {user && !user.isAnonymous ? (
                            <>
                            <SheetClose asChild>
                                <Link href="/profile" className="transition-colors hover:text-foreground/80 text-foreground/60">
                                    Profile
                                </Link>
                            </SheetClose>
                            <Button variant="ghost" onClick={handleLogout} className="justify-start p-0 text-lg font-medium text-foreground/60 hover:text-foreground/80">
                                <LogOut className="mr-1 h-5 w-5" />
                                Logout
                            </Button>
                            </>
                        ) : (
                        <>
                            <SheetClose asChild>
                                <Link href="/login" className="transition-colors hover:text-foreground/80 text-foreground/60">
                                    Login
                                </Link>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/register" className="transition-colors hover:text-foreground/80 text-foreground/60">
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
      </div>
    </header>
  );
}

    