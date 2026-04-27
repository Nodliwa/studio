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
import type { ElementType } from "react";
import type { Budget, BudgetCategory, BirthdayMeta } from "@/lib/types";
import { getAgeGroup, isMilestoneBirthday } from "@/lib/utils";
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
  Zap,
  Loader2,
  ArrowRight,
  ClipboardList,
  Share2,
  Bell,
  Lightbulb,
  ClipboardCheck,
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
import { collectionGroup, query as firestoreQuery, where as firestoreWhere, getDocs as firestoreGetDocs } from "firebase/firestore";
import usePlacesAutocomplete from "use-places-autocomplete";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";

const eventTypeImages: { [key: string]: string } = {
  wedding: "/images/wedding.jpg",
  funeral: "/images/funeral2.jpg",
  umemulo: "/images/umemulo.jpg",
  umgidi: "/images/umgidi1.jpg",
  birthday: "/images/birthday.pic.jpg",
};

// ── Empty-state static data ───────────────────────────────────────────────────

interface BenefitItem {
  icon: ElementType;
  title: string;
  description: string;
}

const EVENT_TYPE_CARDS = [
  {
    type: "birthday",
    label: "Birthday",
    image: "/images/birthday.pic.jpg",
    description: "Parties, milestones and special birthdays",
  },
  {
    type: "wedding",
    label: "Wedding",
    image: "/images/wedding.jpg",
    description: "Traditional, white or cultural weddings",
  },
  {
    type: "umemulo",
    label: "uMemulo",
    image: "/images/umemulo.jpg",
    description: "Celebrate womanhood with the ceremony it deserves",
  },
  {
    type: "umgidi",
    label: "uMgidi",
    image: "/images/umgidi1.jpg",
    description: "First-year baby celebration for family and community",
  },
  {
    type: "funeral",
    label: "Funeral",
    image: "/images/funeral2.jpg",
    description: "Dignified and respectful funeral planning",
  },
] as const;

const BENEFITS: BenefitItem[] = [
  { icon: ClipboardList, title: "Stay Organised",       description: "Keep tasks, checklists and deadlines in one place" },
  { icon: Users,         title: "Manage Guests",        description: "Guest lists, RSVPs and seating made easy" },
  { icon: Wallet,        title: "Track Budget",         description: "Set budgets, track expenses and stay in control" },
  { icon: Bell,          title: "Never Miss a Must-Do", description: "Smart reminders keep you on track" },
  { icon: Share2,        title: "Share & Collaborate",  description: "Invite family or friends and plan together" },
];

const POPULAR_PLANS = [
  {
    title: "21st Birthday Party",
    location: "Durban, South Africa",
    guests: "80 guests",
    budget: "R80 000 – R120 000",
    gradient: "linear-gradient(135deg, #1D9E75 0%, #0e6b4e 100%)",
  },
  {
    title: "December Wedding",
    location: "KwaZulu-Natal",
    guests: "120 guests",
    budget: "R150 000 – R250 000",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
  },
  {
    title: "Umgidi Ceremony",
    location: "Mpumalanga",
    guests: "60 guests",
    budget: "R60 000 – R100 000",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
  },
];

// ── Static illustration components ───────────────────────────────────────────

function HeroIllustration() {
  return (
    <div className="relative w-full max-w-[300px] h-[280px] select-none" aria-hidden="true">
      <svg viewBox="0 0 300 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Soft blob */}
        <ellipse cx="150" cy="140" rx="135" ry="120" fill="#1D9E75" fillOpacity="0.07" />
        <ellipse cx="155" cy="135" rx="105"  ry="95"  fill="#1D9E75" fillOpacity="0.05" />

        {/* Calendar */}
        <rect x="55" y="60" width="90" height="85" rx="10" fill="white" stroke="#1D9E75" strokeWidth="1.5" strokeOpacity="0.5" />
        <rect x="55" y="60" width="90" height="26" rx="10" fill="#1D9E75" fillOpacity="0.9" />
        <rect x="55" y="75" width="90" height="11"        fill="#1D9E75" fillOpacity="0.9" />
        <rect x="70" y="67" width="40" height="5"  rx="2.5" fill="white" fillOpacity="0.55" />
        {[72, 90, 108].map((x) =>
          [100, 114, 128].map((y) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" rx="2" fill="#1D9E75" fillOpacity="0.2" />
          ))
        )}
        <rect x="108" y="114" width="16" height="14" rx="3" fill="#1D9E75" fillOpacity="0.85" />

        {/* Gift box */}
        <rect x="178" y="85" width="62" height="52" rx="8" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="1.5" />
        <rect x="172" y="77" width="74" height="16" rx="6" fill="#f9a8d4" />
        <rect x="205" y="77" width="10" height="60" rx="3" fill="#f472b6" fillOpacity="0.8" />
        <ellipse cx="196" cy="77" rx="10" ry="7" fill="#f472b6" transform="rotate(-15 196 77)" />
        <ellipse cx="214" cy="77" rx="10" ry="7" fill="#f472b6" transform="rotate(15 214 77)" />
        <circle cx="210" cy="77" r="5" fill="#fce7f3" />

        {/* Birthday cake */}
        <rect x="75" y="168" width="70" height="42" rx="8" fill="#fef9c3" stroke="#fbbf24" strokeWidth="1.5" />
        <path d="M75 182 Q110 172 145 182 L145 210 Q110 200 75 210 Z" fill="#fbbf24" fillOpacity="0.25" />
        <rect x="96"  y="155" width="7" height="17" rx="3.5" fill="#f472b6" />
        <rect x="109" y="153" width="7" height="19" rx="3.5" fill="#1D9E75" />
        <rect x="122" y="155" width="7" height="17" rx="3.5" fill="#f59e0b" />
        <ellipse cx="99.5"  cy="153" rx="3.5" ry="5" fill="#fbbf24" />
        <ellipse cx="112.5" cy="151" rx="3.5" ry="5" fill="#fbbf24" />
        <ellipse cx="125.5" cy="153" rx="3.5" ry="5" fill="#fbbf24" />

        {/* Party hat */}
        <path d="M218 165 L196 218 L240 218 Z" fill="#7c3aed" fillOpacity="0.75" />
        <ellipse cx="218" cy="218" rx="22" ry="6" fill="#7c3aed" fillOpacity="0.45" />
        <path d="M204 200 L232 200" stroke="#f9a8d4" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M210 186 L226 186" stroke="#fbbf24" strokeWidth="2"   strokeLinecap="round" strokeOpacity="0.7" />
        <circle cx="218" cy="170" r="6" fill="#fbbf24" />

        {/* Confetti */}
        <circle cx="48"  cy="110" r="4" fill="#fbbf24" fillOpacity="0.55" />
        <circle cx="258" cy="75"  r="5" fill="#f472b6" fillOpacity="0.50" />
        <circle cx="50"  cy="200" r="3" fill="#1D9E75" fillOpacity="0.45" />
        <circle cx="260" cy="185" r="3" fill="#7c3aed" fillOpacity="0.40" />
        <rect x="38"  y="148" width="9" height="9" rx="2" fill="#f472b6" fillOpacity="0.35" transform="rotate(22 42 152)" />
        <rect x="252" y="140" width="8" height="8" rx="2" fill="#fbbf24" fillOpacity="0.45" transform="rotate(-18 256 144)" />
        <rect x="162" y="45"  width="8" height="8" rx="2" fill="#1D9E75" fillOpacity="0.35" transform="rotate(12 166 49)" />
      </svg>
    </div>
  );
}

function TipChecklistSVG() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true" className="shrink-0 hidden md:block">
      <rect x="10" y="16" width="48" height="50" rx="6" fill="white" stroke="#1D9E75" strokeWidth="1.5" strokeOpacity="0.4" />
      <rect x="26" y="9"  width="20" height="14" rx="4" fill="white" stroke="#1D9E75" strokeWidth="1.5" strokeOpacity="0.4" />
      <rect x="30" y="12" width="12" height="6"  rx="2" fill="#1D9E75" fillOpacity="0.12" />
      {/* Row 1 */}
      <circle cx="22" cy="34" r="5" fill="#1D9E75" fillOpacity="0.12" />
      <path d="M20 34 L22 36.5 L25 31.5" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="30" y="31" width="20" height="3" rx="1.5" fill="#1D9E75" fillOpacity="0.25" />
      {/* Row 2 */}
      <circle cx="22" cy="45" r="5" fill="#1D9E75" fillOpacity="0.12" />
      <path d="M20 45 L22 47.5 L25 42.5" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="30" y="42" width="16" height="3" rx="1.5" fill="#1D9E75" fillOpacity="0.25" />
      {/* Row 3 (blank) */}
      <circle cx="22" cy="56" r="5" fill="#1D9E75" fillOpacity="0.07" />
      <rect x="30" y="53" width="18" height="3" rx="1.5" fill="#1D9E75" fillOpacity="0.12" />
      {/* Pen */}
      <rect x="48" y="52" width="5" height="14" rx="2" fill="#1D9E75" fillOpacity="0.65" transform="rotate(-30 50.5 59)" />
      <path d="M48 63 L50.5 68 L53 64 Z" fill="#1D9E75" fillOpacity="0.65" />
    </svg>
  );
}

// ── Form schema ───────────────────────────────────────────────────────────────

const planSchema = z.object({
  name: z.string().min(1, "Celebration name is required"),
  eventType: z.string().min(1, "Event type is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventLocation: z.string().min(1, "Event location is required"),
  expectedGuests: z.coerce.number().int().min(1, "At least 1 guest expected"),
  birthdayAge: z.coerce.number().int().min(1).max(120).optional(),
}).superRefine((data, ctx) => {
  if (data.eventType === 'birthday' && !data.birthdayAge) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Age being celebrated is required",
      path: ['birthdayAge'],
    });
  }
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

// ── PlanCard ──────────────────────────────────────────────────────────────────

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
          Must-Do&apos;s
        </Button>
      </CardFooter>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MyPlansPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuickStartLoading, setIsQuickStartLoading] = useState(false);
  const [sharedPlans, setSharedPlans] = useState<Budget[]>([]);
  const [sharedPlansLoading, setSharedPlansLoading] = useState(false);

  const budgetsCollection = useMemoFirebase(
    () => (user && !user.isAnonymous ? collection(firestore, "users", user.uid, "budgets") : null),
    [user, firestore]
  );

  const { data: budgets, isLoading: budgetsLoading } = useCollection<Budget>(budgetsCollection);

  const {
    ready,
    suggestions: { status, data: autocompleteData },
    setValue: setAutocompleteValue,
    clearSuggestions,
  } = usePlacesAutocomplete({ debounce: 300 });

  const { control, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema) as any,
    defaultValues: {
      name: "",
      eventType: "",
      eventDate: "",
      eventLocation: "",
      expectedGuests: 50,
      birthdayAge: undefined,
    }
  });

  const watchedEventType = watch('eventType');

  useEffect(() => {
    if (watchedEventType !== 'birthday') {
      setValue('birthdayAge', undefined);
    }
  }, [watchedEventType, setValue]);

  useEffect(() => {
    if (!isUserLoading && (!user || user.isAnonymous)) {
      router.push("/auth");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!user || user.isAnonymous || !firestore || !user.email) return;
    const fetchSharedPlans = async () => {
      setSharedPlansLoading(true);
      try {
        const results: Budget[] = [];
        const contacts = [user.email, user.phoneNumber].filter(Boolean);
        for (const contact of contacts) {
          try {
            const q = firestoreQuery(
              collectionGroup(firestore, "budgets"),
              firestoreWhere("collaboratorEmails", "array-contains", contact)
            );
            const snap = await firestoreGetDocs(q);
            snap.docs.forEach(d => {
              const plan = { id: d.id, ...d.data() } as Budget;
              if (!results.find(r => r.id === plan.id) && plan.userId !== user.uid) {
                results.push(plan);
              }
            });
          } catch (e) {
            console.error("Query error for contact:", contact, e);
          }
        }
        setSharedPlans(results);
      } catch (e) {
        console.error("Error fetching shared plans:", e);
      } finally {
        setSharedPlansLoading(false);
      }
    };
    fetchSharedPlans();
  }, [user, firestore]);

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

  const handleQuickStartBirthday = async () => {
    if (!user || !firestore) return;
    setIsQuickStartLoading(true);
    const newId = uuidv4();
    const budgetRef = doc(firestore, "users", user.uid, "budgets", newId);
    const template = budgetTemplates.birthday_adult;
    const initialTotal = calculateInitialTotal(template);
    const newBudget: Budget = {
      id: newId,
      name: "My Birthday Celebration",
      grandTotal: initialTotal,
      userId: user.uid,
      eventType: 'birthday',
      expectedGuests: 20,
      birthdayMeta: {
        birthdayAge: 30,
        ageGroup: getAgeGroup(30),
        isMilestone: isMilestoneBirthday(30),
      },
    };
    try {
      const batch = writeBatch(firestore);
      batch.set(budgetRef, newBudget);
      template.forEach((category, index) => {
        const catRef = doc(collection(budgetRef, "categories"));
        batch.set(catRef, { ...category, id: catRef.id, order: index, budgetId: newId });
      });
      await batch.commit();
      router.push(`/planner/${newId}?quickStart=true`);
    } catch (error) {
      console.error("Quick start failed:", error);
      toast({ variant: "destructive", title: "Failed to create birthday plan" });
    } finally {
      setIsQuickStartLoading(false);
    }
  };

  const handleCreateNewPlan = async (data: PlanFormValues) => {
    if (!user || !firestore) return;

    const newId = uuidv4();
    const budgetRef = doc(firestore, "users", user.uid, "budgets", newId);

    let templateKey = data.eventType as keyof typeof budgetTemplates;
    let birthdayMeta: BirthdayMeta | undefined;

    if (data.eventType === 'birthday' && data.birthdayAge) {
      const ageGroup = getAgeGroup(data.birthdayAge);
      templateKey = `birthday_${ageGroup}` as keyof typeof budgetTemplates;
      birthdayMeta = {
        birthdayAge: data.birthdayAge,
        ageGroup,
        isMilestone: isMilestoneBirthday(data.birthdayAge),
      };
    }

    const template = budgetTemplates[templateKey] || budgetTemplates.other;
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
      ...(birthdayMeta && { birthdayMeta }),
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

  // Opens the dialog with an event type pre-selected
  const handleOpenDialogWithType = (type: string) => {
    setValue("eventType", type);
    setIsDialogOpen(true);
  };

  // First name for empty-state greeting
  const firstName =
    user?.displayName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  // Show Greeter + top buttons when plans exist or while loading
  const showPlansChrome = budgetsLoading || !budgets || budgets.length > 0;

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <div className="bg-background shadow-2xl container mx-auto flex flex-col flex-grow">
        <PageHeader />
        <main className="container mx-auto px-4 flex-grow flex flex-col mb-16">

          {/* ── Plans state: Greeter + action buttons ── */}
          {showPlansChrome && (
            <>
              <Greeter />
              <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left flex-1">
                  <h3 className="text-xl font-bold font-headline">
                    {budgets
                      ? budgets.length > 0
                        ? `You have ${budgets.length} active celebration plan(s).`
                        : "You have no active plans yet."
                      : "Updating plans..."}
                  </h3>
                  <p className="text-muted-foreground">Manage your celebrations or start a new one.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <Button
                    size="lg"
                    className="font-bold"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add New Plan
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="font-bold border-pink-400 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950"
                    onClick={handleQuickStartBirthday}
                    disabled={isQuickStartLoading}
                  >
                    {isQuickStartLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Zap className="mr-2 h-5 w-5" />
                    )}
                    Create Birthday Plan in 10 seconds
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* ── Dialog — always mounted so empty-state CTAs can open it ── */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) reset(); }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Start a New Celebration</DialogTitle>
                <DialogDescription>Every great event starts with a solid plan. Tell us what you&apos;re celebrating.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleCreateNewPlan as any)} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name (e.g., Mom&apos;s 60th)</Label>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="funeral">Funeral</SelectItem>
                          <SelectItem value="umemulo">uMemulo</SelectItem>
                          <SelectItem value="umgidi">uMgidi</SelectItem>
                          <SelectItem value="birthday">Birthday</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.eventType && <p className="text-xs text-destructive">{errors.eventType.message}</p>}
                </div>

                {watchedEventType === 'birthday' && (
                  <div className="space-y-2">
                    <Label htmlFor="birthdayAge">Age being celebrated</Label>
                    <Controller
                      name="birthdayAge"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="birthdayAge"
                          type="number"
                          min={1}
                          max={120}
                          placeholder="e.g. 30"
                          {...field}
                          value={field.value ?? ''}
                        />
                      )}
                    />
                    {errors.birthdayAge && <p className="text-xs text-destructive">{errors.birthdayAge.message}</p>}
                  </div>
                )}

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
                    render={({ field }) => (
                      <Popover open={ready && status === "OK" && autocompleteData.length > 0}>
                        <PopoverAnchor>
                          <Input
                            id="eventLocation"
                            {...field}
                            placeholder={ready ? "Start typing your address..." : "Loading location..."}
                            autoComplete="off"
                            onChange={(e) => {
                              field.onChange(e);
                              setAutocompleteValue(e.target.value);
                            }}
                          />
                        </PopoverAnchor>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                          {status === "OK" && (
                            <div className="flex flex-col gap-2 p-2">
                              {autocompleteData.map((suggestion) => {
                                const { place_id, structured_formatting: { main_text, secondary_text }, description } = suggestion;
                                return (
                                  <Button
                                    key={place_id}
                                    type="button"
                                    variant="ghost"
                                    className="justify-start h-auto text-left"
                                    onClick={() => {
                                      field.onChange(description);
                                      clearSuggestions();
                                    }}
                                  >
                                    <div>
                                      <strong>{main_text}</strong>
                                      <br />
                                      <small className="text-muted-foreground">{secondary_text}</small>
                                    </div>
                                  </Button>
                                );
                              })}
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    )}
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

          {/* ── Content area ── */}
          {budgetsLoading ? (
            <div className="flex justify-center items-center py-20">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>

          ) : budgets && budgets.length > 0 ? (
            /* ── Has plans: existing grid (unchanged) ── */
            <div className="mt-8">
              <h3 className="text-xl font-bold font-headline mb-2">My Plans</h3>
              <p className="text-muted-foreground text-sm mb-4">Plans you have created</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map((budget) => (
                  <PlanCard key={budget.id} budget={budget} onDelete={handleDeletePlan} />
                ))}
              </div>
            </div>

          ) : (
            /* ══════════════════════════════════════════════════════════════
               NEW EMPTY STATE — first-plan launchpad
               ══════════════════════════════════════════════════════════════ */
            <div className="flex-1">

              {/* ── Section 1: Hero ────────────────────────────────────── */}
              <section className="py-10 md:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                  {/* Left */}
                  <div className="space-y-5 text-center lg:text-left">
                    <p className="text-sm font-medium text-muted-foreground">
                      Welcome back, {firstName}! 👋
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                      Let&apos;s plan something
                      <br />
                      <span style={{ color: "#1D9E75" }}>that matters.</span>
                    </h1>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      Birthdays, weddings, funerals and ceremonies — all in one place.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                      <Button
                        size="lg"
                        className="h-12 px-6 font-bold text-base text-white"
                        style={{ backgroundColor: "#1D9E75" }}
                        onClick={() => setIsDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Start New Plan
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-12 px-6 font-bold border-pink-400 text-pink-600 hover:bg-pink-50"
                        onClick={handleQuickStartBirthday}
                        disabled={isQuickStartLoading}
                      >
                        {isQuickStartLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4 mr-2" />
                        )}
                        ⚡ Quick Birthday Plan
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Create a birthday plan in 10 seconds
                    </p>
                  </div>

                  {/* Right: illustration */}
                  <div className="flex justify-center lg:justify-end">
                    <HeroIllustration />
                  </div>
                </div>
              </section>

              {/* ── Section 2: Event Type Cards ────────────────────────── */}
              <section className="-mx-4 px-4 py-10 bg-secondary/40">
                <div className="mb-6">
                  <h2 className="text-xl font-bold">What would you like to plan?</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose a type of event to get started quickly.
                  </p>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-5 md:overflow-visible md:pb-0">
                  {EVENT_TYPE_CARDS.map((card) => (
                    <button
                      key={card.type}
                      type="button"
                      onClick={() => handleOpenDialogWithType(card.type)}
                      className="group shrink-0 w-44 md:w-auto bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{ ["--tw-ring-color" as string]: "#1D9E75" }}
                    >
                      <div className="relative h-32 w-full overflow-hidden">
                        <Image
                          src={card.image}
                          alt={card.label}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                      </div>
                      <div className="p-3 flex flex-col flex-1 gap-1">
                        <p className="font-bold text-sm text-gray-900">{card.label}</p>
                        <p className="text-xs text-gray-500 flex-1 leading-relaxed">{card.description}</p>
                        <span
                          className="text-xs font-semibold mt-2 flex items-center gap-1"
                          style={{ color: "#1D9E75" }}
                        >
                          Start Planning <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* ── Section 3: Benefits Row ─────────────────────────────── */}
              <section className="-mx-4 px-4 py-12 bg-gray-50">
                <h2 className="text-xl font-bold text-center mb-10">
                  Everything you need to plan with confidence
                </h2>
                <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
                  {BENEFITS.map((b) => (
                    <div key={b.title} className="flex flex-col items-center text-center gap-2 w-36">
                      <div
                        className="h-12 w-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "rgba(29,158,117,0.1)" }}
                      >
                        <b.icon className="h-5 w-5" style={{ color: "#1D9E75" }} />
                      </div>
                      <p className="font-semibold text-sm text-gray-900">{b.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{b.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Section 4: Popular Plans ────────────────────────────── */}
              <section className="py-10">
                <div className="flex items-start justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-xl font-bold">Popular plans this month</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      See what others are planning and get inspired.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toast({ title: "Coming soon", description: "Inspiration gallery is on its way." })
                    }
                    className="text-sm font-semibold shrink-0 hidden sm:block hover:underline underline-offset-2 transition-all"
                    style={{ color: "#1D9E75" }}
                  >
                    View all inspiration →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {POPULAR_PLANS.map((plan) => (
                    <div
                      key={plan.title}
                      className="rounded-2xl overflow-hidden relative h-52 select-none"
                    >
                      <div
                        className="absolute inset-0"
                        style={{ background: plan.gradient }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                      <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                        <h3 className="font-bold text-lg leading-tight">{plan.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-white/80">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {plan.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3 shrink-0" />
                            {plan.guests}
                          </span>
                        </div>
                        <p className="text-xs text-white/70 mt-0.5">{plan.budget}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Section 5: Planning Tip Strip ──────────────────────── */}
              <section
                className="-mx-4 px-6 py-8 mb-6"
                style={{ backgroundColor: "rgba(29,158,117,0.07)" }}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-5">
                  <div className="flex items-start gap-2.5 shrink-0">
                    <Lightbulb
                      className="h-5 w-5 shrink-0 mt-0.5"
                      style={{ color: "#1D9E75" }}
                    />
                    <p className="text-sm font-semibold text-foreground">
                      Tip: Most successful planners start with three things:
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["Set your budget", "Add your guest list", "Create your must-do list"].map((pill) => (
                      <span
                        key={pill}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white border"
                        style={{ color: "#1D9E75", borderColor: "rgba(29,158,117,0.3)" }}
                      >
                        <ClipboardCheck className="h-3.5 w-3.5 shrink-0" />
                        {pill}
                      </span>
                    ))}
                  </div>
                  <TipChecklistSVG />
                </div>
                <p
                  className="text-center text-xs italic mt-5"
                  style={{ color: "#1D9E75" }}
                >
                  We&apos;re here to help you celebrate better! ♡
                </p>
              </section>

            </div>
            /* ══ end empty state ══════════════════════════════════════════ */
          )}

          {/* ── Shared plans (always shown if present) ── */}
          {sharedPlans.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl font-bold font-headline mb-2">Shared with me</h3>
              <p className="text-muted-foreground text-sm mb-4">Plans others have invited you to collaborate on</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedPlans.map((budget) => (
                  <PlanCard key={budget.id} budget={budget} onDelete={() => {}} />
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
