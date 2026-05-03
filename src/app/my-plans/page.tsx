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
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import type { ElementType } from "react";
import type { Budget, BudgetCategory, BirthdayMeta, MustDo } from "@/lib/types";
import { getAgeGroup, isMilestoneBirthday, cn } from "@/lib/utils";
import PageHeader from "@/components/page-header";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  CheckSquare,
  Clock,
  ChevronRight,
  PartyPopper,
  Heart,
  Cake,
  Flower,
  Star,
  Link2,
  Copy,
  MessageCircle,
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

const NEW_PLAN_PILLS = [
  { type: "birthday", label: "Birthday",  icon: Cake    },
  { type: "wedding",  label: "Wedding",   icon: Heart   },
  { type: "funeral",  label: "Funeral",   icon: Flower  },
  { type: "umemulo",  label: "Ceremony",  icon: Star    },
  { type: "umgidi",   label: "Gathering", icon: Users   },
] as const;

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

function SparklineSVG({ color }: { color: string }) {
  return (
    <svg width="48" height="20" viewBox="0 0 48 20" fill="none" aria-hidden="true">
      <polyline
        points="0,15 8,10 16,13 24,6 32,9 40,4 48,7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
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

function countTemplateItems(cats: BudgetCategory[]): number {
  return cats.reduce((sum, cat) => {
    return sum + (cat.items?.length || 0) + countTemplateItems(cat.subCategories || []);
  }, 0);
}

function markTemplateItems(cat: BudgetCategory): BudgetCategory {
  return {
    ...cat,
    items: (cat.items || []).map(item => ({ ...item, is_template: true })),
    subCategories: (cat.subCategories || []).map(markTemplateItems),
  };
}

// ── PlanCard ──────────────────────────────────────────────────────────────────

function PlanCard({
  budget,
  onDelete,
  isShared = false,
}: {
  budget: Budget;
  onDelete: (id: string) => void;
  isShared?: boolean;
}) {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [shareOpen, setShareOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await setDoc(doc(firestore, "invite_tokens", token), {
        budgetId: budget.id,
        budgetName: budget.name,
        ownerId: budget.userId,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
        used: false,
        usedAt: null,
        usedBy: null,
      });
      setGeneratedLink(window.location.origin + '/invite/' + token);
    } catch {
      toast({ variant: 'destructive', title: 'Could not generate link' });
    } finally {
      setIsGenerating(false);
    }
  };

  const imageUrl = budget.backgroundImageUrl || (budget.eventType ? eventTypeImages[budget.eventType.toLowerCase()] : undefined);
  const formattedDate = budget.eventDate
    ? new Date(budget.eventDate).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })
    : null;
  const isActive = !isShared && (budget.grandTotal ?? 0) > 0;

  return (
    <Card
      className={cn(
        "overflow-hidden group relative flex flex-col shadow-sm transition-shadow duration-300 hover:shadow-xl cursor-pointer",
        isShared
          ? "bg-indigo-50/60 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800"
          : "bg-card",
      )}
      onClick={() => router.push(`/planner/${budget.id}`)}
    >
      {/* ── Photo ── */}
      <div className="relative w-full aspect-[4/3]">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={budget.name}
              fill
              className={cn(
                "object-cover transition-transform duration-300 group-hover:scale-105",
                isShared && "opacity-85",
              )}
            />
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-t",
                isShared
                  ? "from-indigo-950/80 via-indigo-900/50 to-indigo-800/10"
                  : "from-black/80 via-black/50 to-black/10",
              )}
            />
          </>
        ) : (
          <div className={cn(
            "h-full w-full bg-gradient-to-t",
            isShared ? "from-indigo-700/80 to-indigo-500/40" : "from-primary/80 to-primary/40",
          )} />
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3 z-10">
          {isShared ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full shadow-sm">
              <Share2 className="h-2.5 w-2.5" /> Shared
            </span>
          ) : isActive ? (
            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-[#1D9E75] text-white px-2 py-0.5 rounded-full shadow-sm">
              In Progress
            </span>
          ) : (
            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-gray-500/80 text-white px-2 py-0.5 rounded-full shadow-sm">
              New
            </span>
          )}
        </div>

        {/* Info overlay */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
          <div className="space-y-2 mt-6">
            <h3 className="text-xl font-bold truncate text-shadow" title={budget.name}>
              {budget.name}
            </h3>
            <div className="space-y-1 text-sm text-white/90 text-shadow-sm">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 shrink-0" /> {formattedDate || "No date set"}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{budget.eventLocation || "No location set"}</span>
              </p>
              <p className="flex items-center gap-2">
                <Users className="h-4 w-4 shrink-0" /> {budget.expectedGuests || 0} guests
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-2xl font-bold text-white text-shadow self-end">
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

      {/* ── Progress / collaborators row ── */}
      <div className="px-4 pt-3 pb-2">
        {isShared ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex -space-x-1.5">
              {(budget.collaborators ?? []).slice(0, 4).map((c, i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-full bg-indigo-100 border-2 border-white dark:border-indigo-900 flex items-center justify-center text-[9px] font-bold text-indigo-700 uppercase"
                >
                  {c.name?.charAt(0) ?? "?"}
                </div>
              ))}
              {(budget.collaborators?.length ?? 0) === 0 && (
                <div className="h-6 w-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center">
                  <Users className="h-3 w-3 text-indigo-500" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {budget.collaborators?.length ?? 0} collaborator{(budget.collaborators?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
        ) : (
          <>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: isActive ? "30%" : "0%", background: "#1D9E75" }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-muted-foreground">
                {isActive ? "In progress" : "Not started"}
              </span>
              <span className="text-[10px] text-muted-foreground/60 italic">Full tracking — Phase 2</span>
            </div>
          </>
        )}
      </div>

      {/* ── 3-dot menu ── */}
      <div className="absolute top-2 right-2 z-30" onClick={(e) => e.stopPropagation()}>
        {isShared ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20 text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/planner/${budget.id}`)}>Open Plan</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20 text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/planner/${budget.id}`)}>Edit Plan</DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShareOpen(true); }}>
                  <Link2 className="h-3.5 w-3.5 mr-2" /> Invite Collaborator
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
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
        )}
      </div>

      {/* ── Share / Invite Dialog ── */}
      <Dialog open={shareOpen} onOpenChange={(open) => { setShareOpen(open); if (!open) setGeneratedLink(''); }}>
        <DialogContent className="max-w-sm" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" /> Invite Collaborator
            </DialogTitle>
            <DialogDescription>Generate a one-time invite link for <span className="font-semibold">{budget.name}</span>. Valid for 7 days.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            {!generatedLink ? (
              <Button className="w-full gap-2" onClick={handleGenerateLink} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                Generate One-Time Link
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input value={generatedLink} readOnly className="text-xs" />
                  <Button size="icon" variant="outline" onClick={() => { navigator.clipboard.writeText(generatedLink); toast({ title: 'Link copied!' }); }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      const msg = `Hi! I'd like you to collaborate on my ${budget.name || 'celebration'} plan on SimpliPlan. Use this link to request access (valid for 7 days, one use only): ${generatedLink}`;
                      window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
                    }}
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </Button>
                  <Button variant="outline" onClick={() => setGeneratedLink('')}>New Link</Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">One-time use · expires in 7 days</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Footer: Open Plan ── */}
      <CardFooter
        className={cn("p-3 border-t mt-auto", isShared && "border-indigo-200/60 bg-indigo-50/40")}
      >
        <Button
          variant="outline"
          className={cn(
            "w-full font-semibold text-sm",
            isShared
              ? "border-indigo-400 text-indigo-600 hover:bg-indigo-50"
              : "border-[#1D9E75] text-[#1D9E75] hover:bg-[#1D9E75]/5",
          )}
          onClick={(e) => { e.stopPropagation(); router.push(`/planner/${budget.id}`); }}
        >
          Open Plan <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
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
  const [allMustDos, setAllMustDos] = useState<MustDo[]>([]);

  const budgetsCollection = useMemoFirebase(
    () => (user && !user.isAnonymous ? collection(firestore, "users", user.uid, "budgets") : null),
    [user, firestore]
  );

  const { data: budgets, isLoading: budgetsLoading } = useCollection<Budget>(budgetsCollection);

  const {
    init: initPlaces,
    ready,
    suggestions: { status, data: autocompleteData },
    setValue: setAutocompleteValue,
    clearSuggestions,
  } = usePlacesAutocomplete({ debounce: 300, initOnMount: false });

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

  // ── Load all incomplete must-dos across the user's plans ─────────────────────
  const budgetIdsCacheKey = useMemo(
    () => budgets?.map(b => b.id).sort().join(",") ?? "",
    [budgets],
  );
  useEffect(() => {
    if (!user || user.isAnonymous || !firestore || !budgets || budgets.length === 0) {
      setAllMustDos([]);
      return;
    }
    (async () => {
      try {
        const snaps = await Promise.all(
          budgets.map(b =>
            getDocs(
              firestoreQuery(
                collection(firestore, "users", user.uid, "budgets", b.id, "mustDos"),
                firestoreWhere("status", "==", "todo"),
              )
            )
          )
        );
        const items: MustDo[] = [];
        snaps.forEach(snap => snap.docs.forEach(d => items.push({ id: d.id, ...d.data() } as MustDo)));
        setAllMustDos(items);
      } catch (e) {
        console.error("Error fetching must-dos:", e);
      }
    })();
  }, [user, firestore, budgetIdsCacheKey]); // eslint-disable-line react-hooks/exhaustive-deps

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
      createdAt: serverTimestamp(),
      last_activity_at: serverTimestamp(),
      is_customized: false,
      customized_at: null,
      itemCount: countTemplateItems(template),
      addedItemCount: 0,
      removedItemCount: 0,
    };
    try {
      const batch = writeBatch(firestore);
      batch.set(budgetRef, newBudget);
      template.forEach((category, index) => {
        const catRef = doc(collection(budgetRef, "categories"));
        batch.set(catRef, { ...markTemplateItems(category), id: catRef.id, order: index, budgetId: newId });
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
      createdAt: serverTimestamp(),
      last_activity_at: serverTimestamp(),
      is_customized: false,
      customized_at: null,
      itemCount: countTemplateItems(template),
      addedItemCount: 0,
      removedItemCount: 0,
    };

    try {
      const batch = writeBatch(firestore);
      batch.set(budgetRef, newBudget);

      template.forEach((category, index) => {
        const catRef = doc(collection(budgetRef, "categories"));
        batch.set(catRef, { ...markTemplateItems(category), id: catRef.id, order: index, budgetId: newId });
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

  const firstName =
    user?.displayName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  // ── Computed values for has-plans dashboard (no new Firestore reads) ─────────
  const now = new Date();
  const daysFromNow = (dateStr: string) =>
    Math.ceil((new Date(dateStr).getTime() - now.getTime()) / 86_400_000);

  const nextEvent = useMemo(() =>
    [...(budgets ?? [])]
      .filter(b => b.eventDate && new Date(b.eventDate) > now)
      .sort((a, b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime())[0] ?? null,
    [budgets], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const daysUntilNext = nextEvent
    ? Math.max(1, Math.ceil((new Date(nextEvent.eventDate!).getTime() - now.getTime()) / 86_400_000))
    : null;

  const activePlansCount       = budgets?.filter(b => (b.grandTotal ?? 0) > 0).length ?? 0;
  const upcomingThisMonthCount = budgets?.filter(b => {
    if (!b.eventDate) return false;
    const d = new Date(b.eventDate);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d > now;
  }).length ?? 0;
  const sharedPlansCount = sharedPlans.length;

  const mustDosDueCount   = allMustDos.length;
  const mustDosRedCount   = allMustDos.filter(m => m.deadline && daysFromNow(m.deadline) <= 30).length;
  const mustDosAmberCount = allMustDos.filter(m => m.deadline && daysFromNow(m.deadline) > 30 && daysFromNow(m.deadline) <= 60).length;
  const mustDosGreenCount = allMustDos.filter(m => m.deadline && daysFromNow(m.deadline) > 60).length;
  const mustDosGrayCount  = allMustDos.filter(m => !m.deadline).length;

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <div className="bg-background shadow-2xl container mx-auto flex flex-col flex-grow">
        <PageHeader />
        <main className="container mx-auto px-4 flex-grow flex flex-col mb-16">

          {/* ── Dialog — always mounted so empty-state CTAs can open it ── */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (open) initPlaces(); if (!open) { reset(); clearSuggestions(); } }}>
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
            /* ══════════════════════════════════════════════════════════════
               HAS PLANS DASHBOARD
               ══════════════════════════════════════════════════════════════ */
            <div className="flex-1 pb-8">

              {/* ── Section 1: Welcome header + countdown ── */}
              <section className="pt-8 pb-6">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                  {/* Left: greeting + CTAs */}
                  <div className="space-y-3">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {firstName}! 👋</h1>
                      <p className="text-muted-foreground text-sm mt-1">Let&apos;s keep your celebrations unforgettable.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        size="lg"
                        className="font-bold text-white"
                        style={{ backgroundColor: "#1D9E75" }}
                        onClick={() => setIsDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add New Plan
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="font-bold border-pink-400 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950"
                        onClick={handleQuickStartBirthday}
                        disabled={isQuickStartLoading}
                      >
                        {isQuickStartLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Zap className="mr-2 h-4 w-4" />
                        )}
                        ⚡ Create Birthday Plan in 10 Seconds
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Perfect for surprise parties &amp; milestone birthdays.</p>
                  </div>

                  {/* Right: countdown card */}
                  {daysUntilNext !== null && nextEvent && (
                    <div
                      className="rounded-2xl p-5 min-w-[220px] text-white shrink-0 w-full lg:w-auto"
                      style={{ background: "linear-gradient(135deg, #1D9E75 0%, #0e6b4e 100%)" }}
                    >
                      <p className="text-xs font-medium opacity-80 uppercase tracking-wider">Your next event is in</p>
                      <p className="text-6xl font-bold tabular-nums leading-none mt-1">{daysUntilNext}</p>
                      <p className="text-sm font-semibold opacity-70">days</p>
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <p className="font-semibold text-sm truncate">{nextEvent.name}</p>
                        <p className="text-xs opacity-70">
                          {new Date(nextEvent.eventDate!).toLocaleDateString("en-ZA", {
                            year: "numeric", month: "long", day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* ── Section 2: Stats row ── */}
              <section className="-mx-4 px-4 py-6 bg-secondary/30">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Active Plans */}
                  <div className="bg-card rounded-xl p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: "rgba(29,158,117,0.1)" }}>
                        <CalendarDays className="h-5 w-5" style={{ color: "#1D9E75" }} />
                      </div>
                      <SparklineSVG color="#1D9E75" />
                    </div>
                    <p className="text-3xl font-bold tabular-nums">{activePlansCount}</p>
                    <p className="text-sm font-medium">Active Plans</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Keep planning</p>
                  </div>

                  {/* Upcoming This Month */}
                  <div className="bg-card rounded-xl p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)" }}>
                        <Clock className="h-5 w-5" style={{ color: "#f59e0b" }} />
                      </div>
                      <SparklineSVG color="#f59e0b" />
                    </div>
                    <p className="text-3xl font-bold tabular-nums">{upcomingThisMonthCount}</p>
                    <p className="text-sm font-medium">Upcoming This Month</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Stay prepared</p>
                  </div>

                  {/* Must-Dos Due */}
                  <div className="bg-card rounded-xl p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)" }}>
                        <CheckSquare className="h-5 w-5" style={{ color: "#7c3aed" }} />
                      </div>
                      <SparklineSVG color="#7c3aed" />
                    </div>
                    <p className="text-3xl font-bold tabular-nums">{mustDosDueCount}</p>
                    <p className="text-sm font-medium">Must-Dos Due</p>
                    {mustDosDueCount > 0 ? (
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                        {mustDosRedCount   > 0 && <span className="text-[10px] font-semibold text-red-600">🔴 {mustDosRedCount}</span>}
                        {mustDosAmberCount > 0 && <span className="text-[10px] font-semibold text-amber-600">🟡 {mustDosAmberCount}</span>}
                        {mustDosGreenCount > 0 && <span className="text-[10px] font-semibold text-green-600">🟢 {mustDosGreenCount}</span>}
                        {mustDosGrayCount  > 0 && <span className="text-[10px] font-semibold text-gray-500">⚪ {mustDosGrayCount}</span>}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-0.5">Across all your plans</p>
                    )}
                  </div>

                  {/* Shared Plans */}
                  <div className="bg-card rounded-xl p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)" }}>
                        <Users className="h-5 w-5" style={{ color: "#10b981" }} />
                      </div>
                      <SparklineSVG color="#10b981" />
                    </div>
                    <p className="text-3xl font-bold tabular-nums">{sharedPlansCount}</p>
                    <p className="text-sm font-medium">Shared Plans</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Collaborating</p>
                  </div>
                </div>
              </section>

              {/* ── Section 3: Continue Planning ── */}
              <section className="py-6">
                <div className="flex items-end justify-between mb-4 gap-4">
                  <div>
                    <h2 className="text-xl font-bold">Continue Planning</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Pick up where you left off.</p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-semibold hover:underline underline-offset-2 shrink-0 hidden sm:flex items-center gap-1"
                    style={{ color: "#1D9E75" }}
                  >
                    View all plans <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {budgets.map((budget) => (
                    <PlanCard key={budget.id} budget={budget} onDelete={handleDeletePlan} />
                  ))}
                </div>
              </section>

              {/* ── Section 5: Start Something New ── */}
              <section
                className="-mx-4 px-6 py-8"
                style={{ backgroundColor: "rgba(29,158,117,0.06)" }}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <PartyPopper className="h-5 w-5 shrink-0" style={{ color: "#1D9E75" }} />
                      <p className="font-bold text-foreground">Ready to plan something important?</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">Start a new celebration in minutes.</p>
                    <p className="text-xs italic mt-1" style={{ color: "#1D9E75" }}>We&apos;ve got you! ✓</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                    {NEW_PLAN_PILLS.map((pill) => (
                      <button
                        key={pill.type}
                        type="button"
                        onClick={() => handleOpenDialogWithType(pill.type)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm font-medium hover:border-[#1D9E75] hover:text-[#1D9E75] transition-colors"
                      >
                        <pill.icon className="h-3.5 w-3.5" />
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── Section 6: Planning Tip bar ── */}
              <section className="-mx-4 px-6 py-4 border-t bg-muted/20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 shrink-0" style={{ color: "#1D9E75" }} />
                    <p className="text-sm text-muted-foreground">
                      Tip: Add your budget, guest list and tasks to stay organised and stress-free.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => toast({ title: "Coming soon", description: "Planning tips are on their way." })}
                  >
                    View Planning Tips →
                  </Button>
                </div>
              </section>

            </div>
            /* ══ end has-plans dashboard ══════════════════════════════════════ */

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

          {/* ── Section 4: Shared With Me (always shown if present) ── */}
          {sharedPlans.length > 0 && (
            <div className="mt-10 mb-8">
              <div className="flex items-end justify-between mb-4 gap-4">
                <div>
                  <h2 className="text-xl font-bold">Shared With Me</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Plans others have invited you to collaborate on.</p>
                </div>
                <button
                  type="button"
                  className="text-sm font-semibold hover:underline underline-offset-2 shrink-0 hidden sm:flex items-center gap-1 text-indigo-600"
                >
                  View all shared <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedPlans.map((budget) => (
                  <PlanCard key={budget.id} budget={budget} onDelete={() => {}} isShared />
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
