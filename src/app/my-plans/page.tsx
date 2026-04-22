"use client";
import {
  useUser,
  useCollection,
  useMemoFirebase,
  useFirestore,
  updateDocumentNonBlocking,
} from "@/firebase";
import {
  collection,
  doc,
  writeBatch,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import type { Budget, BudgetCategory } from "@/lib/types";
import PageHeader from "@/components/page-header";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ListChecks,
  Wallet,
  CalendarDays,
  RefreshCw,
  Menu,
  MapPin,
  Users,
  Plus,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { budgetTemplates } from "@/lib/data";

const eventTypeImages: { [key: string]: string } = {
  wedding: "/images/wedding.jpg",
  funeral: "/images/funeral2.jpg",
  umemulo: "/images/umemulo.jpg",
  umgidi: "/images/umgidi1.jpg",
};

const planSchema = z.object({
  name: z.string().min(1, "Celebration name is required"),
  eventType: z.string().min(1, "Event type is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventLocation: z.string().min(1, "Event location is required"),
  expectedGuests: z.coerce.number().int().min(1, "At least 1 guest expected"),
});

type PlanFormValues = z.infer<typeof planSchema>;

function calculateInitialTotal(categories: BudgetCategory[]): number {
  let total = 0;
  categories.forEach(cat => {
    let catTotal = 0;
    cat.items?.forEach(item => {
      catTotal += (item.quantity || 0) * (item.unitPrice || 0);
    });
    if (cat.subCategories) {
      catTotal += calculateInitialTotal(cat.subCategories);
    }
    total += catTotal;
  });
  return total;
}

function PlanCard({
  budget,
  onDelete,
}: {
  budget: Budget;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();

  const imageUrl = budget.backgroundImageUrl || (budget.eventType ? eventTypeImages[budget.eventType.toLowerCase()] : undefined);

  const formattedDate = budget.eventDate
    ? new Date(budget.eventDate).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Card
      className="overflow-hidden group relative flex flex-col bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl cursor-pointer"
      onClick={() => router.push(`/planner/${budget.id}`)}
    >
      <div className="relative w-full aspect-[4/3]">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={budget.name}
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
            <h3 className="text-xl font-bold truncate text-shadow" title={budget.name}>
              {budget.name}
            </h3>
            <div className="space-y-1 text-sm text-white/90 text-shadow-sm">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 shrink-0" /> {formattedDate || "No date set"}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" /> <span className="truncate">{budget.eventLocation || "No location set"}</span>
              </p>
              <p className="flex items-center gap-2">
                <Users className="h-4 w-4 shrink-0" /> {budget.expectedGuests || 0} guests
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-2xl font-bold text-white text-shadow mt-3 self-end">
            <Wallet className="inline-block h-6 w-6 mt-1 shrink-0" />
            {new Intl.NumberFormat("en-ZA", {
              style: "currency",
              currency: "ZAR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(budget.grandTotal || 0)}
          </div>
        </div>
      </div>

      <AlertDialog>
        <div className="absolute top-2 right-2 z-30" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 hover:bg-white/20 text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/planner/${budget.id}`)}>Edit Plan</DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your plan and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(budget.id)} className="bg-destructive hover:bg-destructive/90">
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

export default function MyPlansPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const budgetsCollection = useMemoFirebase(
    () => (user && !user.isAnonymous ? collection(firestore, "users", user.uid, "budgets") : null),
    [user, firestore]
  );

  const { data: budgets, isLoading: budgetsLoading } = useCollection<Budget>(budgetsCollection);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema) as any,
    defaultValues: {
      name: "",
      eventType: "",
      eventDate: "",
      eventLocation: "",
      expectedGuests: 50,
    }
  });

  useEffect(() => {
    if (!isUserLoading && (!user || user.isAnonymous)) {
      router.push("/auth");
    }
  }, [user, isUserLoading, router]);

  const handleDeletePlan = async (budgetId: string) => {
    if (!user || !firestore) return;
    const budgetDocRef = doc(firestore, "users", user.uid, "budgets", budgetId);
    try {
      const categoriesSnap = await getDocs(collection(budgetDocRef, "categories"));
      const batch = writeBatch(firestore);
      for (const catDoc of categoriesSnap.docs) {
        const itemsSnap = await getDocs(collection(catDoc.ref, "items"));
        itemsSnap.forEach(itemDoc => batch.delete(itemDoc.ref));
        batch.delete(catDoc.ref);
      }
      batch.delete(budgetDocRef);
      await batch.commit();
      toast({ title: "Plan deleted successfully" });
    } catch (e) {
      console.error("Error deleting plan:", e);
    }
  };

  const handleCreateNewPlan = async (data: PlanFormValues) => {
    if (!user || !firestore) return;

    const newId = uuidv4();
    const budgetRef = doc(firestore, "users", user.uid, "budgets", newId);

    const template = budgetTemplates[data.eventType as keyof typeof budgetTemplates] || budgetTemplates.other;
    const initialTotal = calculateInitialTotal(template);

    const newBudget: Budget = {
      id: newId,
      name: data.name,
      grandTotal: initialTotal,
      userId: user.uid,
      eventType: data.eventType,
      eventDate: new Date(data.eventDate).toISOString(),
      eventLocation: data.eventLocation,
      expectedGuests: data.expectedGuests,
    };

    try {
      const batch = writeBatch(firestore);
      batch.set(budgetRef, newBudget);

      template.forEach((category, index) => {
        const catRef = doc(collection(budgetRef, "categories"));
        batch.set(catRef, { ...category, id: catRef.id, order: index, budgetId: newId });
      });

      await batch.commit();
      toast({ title: "Plan created successfully!" });
      setIsDialogOpen(false);
      reset();
      router.push(`/planner/${newId}`);
    } catch (error) {
      console.error("Creation failed:", error);
      toast({ variant: "destructive", title: "Failed to create plan" });
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <div className="bg-background shadow-2xl container mx-auto flex flex-col flex-grow">
        <PageHeader />
        <main className="container mx-auto px-4 flex-grow flex flex-col mb-16">
          <Greeter />

          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left flex-1">
              <h3 className="text-xl font-bold font-headline">
                {budgets ? (budgets.length > 0 ? `You have ${budgets.length} active celebration plan(s).` : "You have no active plans yet.") : "Updating plans..."}
              </h3>
              <p className="text-muted-foreground">Manage your celebrations or start a new one.</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="font-bold">
                  <Plus className="mr-2 h-5 w-5" />
                  Add New Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Start a New Celebration</DialogTitle>
                  <DialogDescription>Every great event starts with a solid plan. Tell us what you're celebrating.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleCreateNewPlan as any)} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Plan Name (e.g., Mom's 60th)</Label>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => <Input id="name" {...field} placeholder="Life you are celebrating..." />}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventType">Celebration Type</Label>
                    <Controller
                      name="eventType"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wedding">Wedding</SelectItem>
                            <SelectItem value="funeral">Funeral</SelectItem>
                            <SelectItem value="umemulo">uMemulo</SelectItem>
                            <SelectItem value="umgidi">uMgidi</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.eventType && <p className="text-xs text-destructive">{errors.eventType.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventDate">Date</Label>
                      <Controller
                        name="eventDate"
                        control={control}
                        render={({ field }) => <Input id="eventDate" type="date" {...field} />}
                      />
                      {errors.eventDate && <p className="text-xs text-destructive">{errors.eventDate.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expectedGuests">Guests</Label>
                      <Controller
                        name="expectedGuests"
                        control={control}
                        render={({ field }) => <Input id="expectedGuests" type="number" {...field} />}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventLocation">Location</Label>
                    <Controller
                      name="eventLocation"
                      control={control}
                      render={({ field }) => <Input id="eventLocation" {...field} placeholder="City, Venue, or Address" />}
                    />
                    {errors.eventLocation && <p className="text-xs text-destructive">{errors.eventLocation.message}</p>}
                  </div>

                  <DialogFooter className="pt-4">
                    <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
                      {isSubmitting ? "Creating Plan..." : "Create and Start Planning"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {budgetsLoading ? (
            <div className="flex justify-center items-center py-20">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : budgets && budgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {budgets.map((budget) => (
                <PlanCard key={budget.id} budget={budget} onDelete={handleDeletePlan} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                You haven't saved any celebration plans yet. Start a new one above to get started!
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}