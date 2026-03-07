"use client";

import {
  useUser,
  useCollection,
  useMemoFirebase,
  useFirestore,
  deleteDocument,
} from "@/firebase";
import {
  collection,
  doc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Budget } from "@/lib/types";
import PageHeader from "@/components/page-header";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Greeter from "@/components/greeter";
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
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ListChecks,
  Wallet,
  CalendarDays,
  RefreshCw,
  Menu,
  MapPin,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const eventTypeImages: { [key: string]: string } = {
  wedding: "/images/wedding.jpg",
  funeral: "/images/funeral2.png",
  umgidi: "/images/umgidi1.jpg",
};

function PlanCard({
  budget,
  onDelete,
}: {
  budget: Budget;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const imageUrl = budget.eventType
    ? eventTypeImages[budget.eventType]
    : undefined;

  const formattedDate = budget.eventDate
    ? new Date(budget.eventDate).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const handleCardClick = () => {
    router.push(`/planner/${budget.id}`);
  };

  return (
    <Card
      className="overflow-hidden group relative flex flex-col bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative w-full aspect-[4/3]">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={budget.name || "Event image"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/10" />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-t from-primary/80 to-primary/40" />
        )}

        <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
          <div className="space-y-2">
            <h3
              className="text-xl font-bold truncate text-shadow"
              title={budget.name}
            >
              {budget.name || "My Celebration Plan"}
            </h3>
            <div className="space-y-1 text-sm text-white/90 text-shadow-sm">
              {formattedDate ? (
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 shrink-0" /> {formattedDate}
                </p>
              ) : (
                <p className="flex items-center gap-2 italic">
                  <CalendarDays className="h-4 w-4 shrink-0" /> No date set
                </p>
              )}
              {budget.eventLocation ? (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />{" "}
                  <span className="truncate">{budget.eventLocation}</span>
                </p>
              ) : (
                <p className="flex items-center gap-2 italic">
                  <MapPin className="h-4 w-4 shrink-0" /> No location set
                </p>
              )}
              {budget.expectedGuests ? (
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0" /> {budget.expectedGuests}{" "}
                  guests
                </p>
              ) : (
                <p className="flex items-center gap-2 italic">
                  <Users className="h-4 w-4 shrink-0" /> No guests set
                </p>
              )}
            </div>
          </div>

          <p className="flex items-start gap-2 text-2xl font-bold text-white text-shadow mt-3 self-end">
            <Wallet className="inline-block h-6 w-6 mt-1 shrink-0" />
            {new Intl.NumberFormat("en-ZA", {
              style: "currency",
              currency: "ZAR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(budget.grandTotal)}
          </p>
        </div>
      </div>

      <AlertDialog>
        <div
          className="absolute top-2 right-2 z-30"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 hover:bg-white/20 text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-background/80 backdrop-blur text-foreground"
            >
              <DropdownMenuItem
                onClick={() => router.push(`/planner/${budget.id}`)}
              >
                Edit Budget
              </DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
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
              This action cannot be undone. This will permanently delete your
              plan and all of its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(budget.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CardFooter className="p-0 border-t bg-card">
        <Button
          variant="default"
          className="w-full rounded-t-none text-lg font-bold py-4 z-10"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/planner/${budget.id}/must-dos`);
          }}
        >
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
  const { toast } = useToast();

  const budgetsCollection = useMemoFirebase(
    () =>
      user && !user.isAnonymous
        ? collection(firestore, "users", user.uid, "budgets")
        : null,
    [user, firestore],
  );

  const {
    data: budgets,
    isLoading: budgetsLoading,
  } = useCollection<Budget>(budgetsCollection);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user || user.isAnonymous) {
      router.push("/register");
    }
  }, [user, isUserLoading, router]);

  const handleDeletePlan = async (budgetId: string) => {
    if (!user || !firestore) return;

    const budgetDocRef = doc(firestore, "users", user.uid, "budgets", budgetId);

    try {
      const categoriesCollectionRef = collection(budgetDocRef, "categories");
      const categoriesSnapshot = await getDocs(categoriesCollectionRef);

      const batch = writeBatch(firestore);

      for (const categoryDoc of categoriesSnapshot.docs) {
        const itemsCollectionRef = collection(categoryDoc.ref, "items");
        const itemsSnapshot = await getDocs(itemsCollectionRef);
        itemsSnapshot.forEach((itemDoc) => {
          batch.delete(itemDoc.ref);
        });
        batch.delete(categoryDoc.ref);
      }

      batch.delete(budgetDocRef);

      await batch.commit();

      toast({ title: "Plan deleted successfully" });
    } catch (e) {
      console.error("Error deleting plan:", e);
      deleteDocument(budgetDocRef);
    }
  };

  if (
    isUserLoading ||
    !user ||
    (user && user.isAnonymous) ||
    (budgetsLoading && budgets === null)
  ) {
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

            <div className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold font-headline">
                    {!budgetsLoading && budgets
                      ? budgets.length > 0
                        ? `You have ${budgets.length} active celebration plan(s).`
                        : "You have no active plans yet."
                      : null}
                  </h3>
                  <p className="text-muted-foreground">
                    All your saved celebrations are listed below.
                  </p>
                </CardContent>
              </Card>
            </div>

            {!budgetsLoading && budgets && budgets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {budgets.map((budget) => (
                  <PlanCard
                    key={budget.id}
                    budget={budget}
                    onDelete={handleDeletePlan}
                  />
                ))}
              </div>
            ) : (
              !budgetsLoading && (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground">
                    You haven't saved any celebration plans yet. 
                    Explore templates on the <Link href="/" className="underline font-bold">Home Page</Link> to get started.
                  </p>
                </div>
              )
            )}
          </div>

          <div className="mt-12 w-full max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold font-headline text-center">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <Card>
                <CardFooter className="flex flex-col items-center gap-2 p-4 pt-6">
                  <ListChecks className="h-6 w-6 text-primary" />
                  <span className="text-base font-semibold">Don’t forget a thing</span>
                  <p className="text-sm text-muted-foreground text-center">
                    We give you a handy list of items to think about for your
                    event, so nothing slips through the cracks.
                  </p>
                </CardFooter>
              </Card>
              <Card>
                <CardFooter className="flex flex-col items-center gap-2 p-4 pt-6">
                  <CalendarDays className="h-6 w-6 text-primary" />
                  <span className="text-base font-semibold">Planning That Fits Your Life</span>
                  <p className="text-sm text-muted-foreground text-center">
                    Plan anywhere, with anyone, whenever it suits you — simple,
                    flexible, and stress-free.
                  </p>
                </CardFooter>
              </Card>
              <Card>
                <CardFooter className="flex flex-col items-center gap-2 p-4 pt-6">
                  <Wallet className="h-6 w-6 text-primary" />
                  <span className="text-base font-semibold">Effortless Budgeting</span>
                  <p className="text-sm text-muted-foreground text-center">
                    Forget diaries & spreadsheets - Organise your spending and
                    see where your money goes, all in one place
                  </p>
                </CardFooter>
              </Card>
              <Card>
                <CardFooter className="flex flex-col items-center gap-2 p-4 pt-6">
                  <RefreshCw className="h-6 w-6 text-primary" />
                  <span className="text-base font-semibold">Real-Time Updates</span>
                  <p className="text-sm text-muted-foreground text-center">
                    See your grand total update instantly as you adjust
                    quantities and prices. No surprises.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MyPlansPage;