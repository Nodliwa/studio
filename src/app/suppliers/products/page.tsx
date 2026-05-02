"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useFirebase, useUser } from "@/firebase";
import {
  useSupplierProfile,
  useAllSupplierOpportunities,
} from "@/firebase/supplier-hooks";
import { SupplierSidebar } from "@/components/suppliers/supplier-sidebar";
import { ServiceSelector } from "@/components/suppliers/service-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Loader2,
  Menu,
  Plus,
  Package,
  Pencil,
  Pause,
  Play,
  X,
  ShoppingCart,
  Lightbulb,
  CheckCircle2,
  Lock,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { ServiceOffering, Supplier } from "@/lib/supplier-types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcCompletion(supplier: Supplier, services: ServiceOffering[]): number {
  const checks = [
    !!supplier.tradingAs,
    !!supplier.contactPerson,
    !!supplier.mobileNumber,
    services.length > 0,
    !!supplier.cityRegion,
    !!supplier.areasServed,
    !!supplier.shortDescription,
    !!(supplier.instagram || supplier.facebook),
    !!supplier.website,
    supplier.yearsInBusiness != null,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function makeServiceId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

// ── Constants ─────────────────────────────────────────────────────────────────

// PHASE 2 PLACEHOLDER — real data comes from aggregated planner activity
const POPULAR_SERVICES = [
  "Chairs & Tent Hire",
  "Funeral Tents",
  "Cows / Livestock",
  "Décor",
];

// ── ServiceListingCard ────────────────────────────────────────────────────────

function ServiceListingCard({
  service,
  onEdit,
  onTogglePause,
  onRemove,
}: {
  service: ServiceOffering;
  onEdit: () => void;
  onTogglePause: () => void;
  onRemove: () => void;
}) {
  const isActive = service.status !== "paused";
  const hasStartingPrice = service.startingPrice != null;

  return (
    <div className="bg-card border rounded-xl p-4 flex items-start gap-4">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
        <Package className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm leading-tight">{service.name}</p>
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-muted text-muted-foreground",
            )}
          >
            {isActive ? "Active" : "Paused"}
          </span>
        </div>

        {hasStartingPrice ? (
          <p className="text-xs text-muted-foreground">
            Starting Price:{" "}
            <span className="font-medium text-foreground">
              R{service.startingPrice!.toLocaleString()}
            </span>
          </p>
        ) : (
          <div>
            <p className="text-xs font-medium text-orange-600">
              Starting Price: Not added
            </p>
            <p className="text-[11px] text-orange-500/80">
              Add price to improve visibility
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label={`Edit ${service.name}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onTogglePause}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label={isActive ? `Pause ${service.name}` : `Resume ${service.name}`}
        >
          {isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          aria-label={`Remove ${service.name}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── EditServiceDialog ─────────────────────────────────────────────────────────

function EditServiceDialog({
  service,
  open,
  onOpenChange,
  onSave,
  isSaving,
}: {
  service: ServiceOffering | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (updated: ServiceOffering) => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [averagePrice, setAveragePrice] = useState("");
  const [customQuote, setCustomQuote] = useState(true);

  useEffect(() => {
    if (!service) return;
    setName(service.name);
    setStartingPrice(service.startingPrice != null ? String(service.startingPrice) : "");
    setAveragePrice(service.averagePrice != null ? String(service.averagePrice) : "");
    setCustomQuote(service.customQuoteAvailable ?? true);
  }, [service]);

  const handleSave = () => {
    if (!service) return;
    onSave({
      ...service,
      name: name.trim() || service.name,
      startingPrice: startingPrice !== "" ? Number(startingPrice) : undefined,
      averagePrice: averagePrice !== "" ? Number(averagePrice) : undefined,
      customQuoteAvailable: customQuote,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Service Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-starting-price">Starting Price (R)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                R
              </span>
              <Input
                id="edit-starting-price"
                type="number"
                min="0"
                placeholder="0"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-average-price">Average Price (R)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                R
              </span>
              <Input
                id="edit-average-price"
                type="number"
                min="0"
                placeholder="0"
                value={averagePrice}
                onChange={(e) => setAveragePrice(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="edit-custom-quote"
              checked={customQuote}
              onCheckedChange={setCustomQuote}
            />
            <Label htmlFor="edit-custom-quote" className="cursor-pointer">
              Custom quote available on request
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── AddServiceDialog ──────────────────────────────────────────────────────────

function AddServiceDialog({
  open,
  onOpenChange,
  currentServices,
  onAdd,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentServices: ServiceOffering[];
  onAdd: (services: ServiceOffering[]) => void;
  isSaving: boolean;
}) {
  const [draft, setDraft] = useState<ServiceOffering[]>(currentServices);

  useEffect(() => {
    if (open) setDraft(currentServices);
  }, [open, currentServices]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Product / Service</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <ServiceSelector value={draft} onChange={setDraft} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onAdd(draft)} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── PopularServicesCard ───────────────────────────────────────────────────────

function PopularServicesCard({
  title,
  subtitle,
  currentServiceNames,
  onAddService,
  isSaving,
}: {
  title: string;
  subtitle: string;
  currentServiceNames: Set<string>;
  onAddService: (name: string) => void;
  isSaving: boolean;
}) {
  return (
    <div
      className="rounded-xl p-5 space-y-4 text-white"
      style={{ background: "linear-gradient(135deg, #1D9E75 0%, #0e6b4e 100%)" }}
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">
          {title}
        </p>
        <p className="text-sm font-semibold leading-snug">{subtitle}</p>
      </div>

      <ul className="space-y-2.5">
        {POPULAR_SERVICES.map((name) => {
          const alreadyAdded = currentServiceNames.has(name);
          return (
            <li key={name} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm">
                <ShoppingCart className="h-3.5 w-3.5 text-white/70 shrink-0" />
                {name}
              </span>
              {alreadyAdded ? (
                <span className="text-[10px] font-bold text-white/60 bg-white/10 px-2 py-0.5 rounded-full shrink-0">
                  Added
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onAddService(name)}
                  disabled={isSaving}
                  className="text-[10px] font-bold bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded-full transition-colors disabled:opacity-50 shrink-0"
                >
                  Add in 1 Click
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── GrowthInsightsCard ────────────────────────────────────────────────────────

function GrowthInsightsCard() {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <p className="text-sm font-semibold">Growth Insights</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Powerful insights to help you grow.
          </p>
        </div>
        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full shrink-0">
          Coming Soon
        </span>
      </div>

      {/* Blurred chart placeholder */}
      <div className="relative rounded-lg overflow-hidden bg-purple-50 h-24">
        <svg
          viewBox="0 0 200 80"
          className="w-full h-full blur-sm opacity-60"
          aria-hidden="true"
        >
          <rect x="10"  y="45" width="22" height="30" rx="3" fill="#7c3aed" fillOpacity="0.35" />
          <rect x="42"  y="28" width="22" height="47" rx="3" fill="#7c3aed" fillOpacity="0.45" />
          <rect x="74"  y="35" width="22" height="40" rx="3" fill="#7c3aed" fillOpacity="0.5"  />
          <rect x="106" y="15" width="22" height="60" rx="3" fill="#7c3aed" fillOpacity="0.6"  />
          <rect x="138" y="22" width="22" height="53" rx="3" fill="#7c3aed" fillOpacity="0.5"  />
          <rect x="170" y="10" width="22" height="65" rx="3" fill="#7c3aed" fillOpacity="0.65" />
          <polyline
            points="21,47 53,30 85,37 117,17 149,24 181,12"
            fill="none"
            stroke="#7c3aed"
            strokeWidth="2.5"
            strokeOpacity="0.7"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-2.5 shadow-sm">
            <Lock className="h-5 w-5 text-purple-500" />
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        See trends, popular searches and demand opportunities in your area.
      </p>
    </div>
  );
}

// ── VisibilityTips ────────────────────────────────────────────────────────────

function VisibilityTips() {
  const tips = [
    "Add prices to all listings",
    "Add 5+ products or services",
    "Keep your profile 100% complete",
    "Add areas you serve",
  ];
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb className="h-4 w-4 text-[#1D9E75]" />
          <h3 className="text-sm font-semibold">Visibility Tips</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Follow these tips to improve your ranking and get more leads.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tips.map((tip) => (
          <span
            key={tip}
            className="flex items-center gap-1.5 bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-medium px-3 py-1.5 rounded-full"
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            {tip}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isUserLoading) return;
    if (!user || user.isAnonymous) {
      const timer = setTimeout(() => router.push("/suppliers/login"), 200);
      return () => clearTimeout(timer);
    }
  }, [user, isUserLoading, router]);

  const uid = user && !user.isAnonymous ? user.uid : undefined;
  const { data: supplier, isLoading: supplierLoading } = useSupplierProfile(uid);
  const { data: allOpportunities } = useAllSupplierOpportunities(uid);

  const [services, setServices] = useState<ServiceOffering[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceOffering | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmRemoveName, setConfirmRemoveName] = useState<string | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!supplier || initialized) return;
    setServices(supplier.services ?? []);
    setInitialized(true);
  }, [supplier, initialized]);

  const saveServices = async (updated: ServiceOffering[]) => {
    if (!uid || !supplier) return;
    setIsSaving(true);
    try {
      const profileCompletionPct = calcCompletion(supplier, updated);
      await updateDoc(doc(firestore, "suppliers", uid), {
        services: updated,
        profileCompletionPct,
        updatedAt: serverTimestamp(),
      });
      setServices(updated);
      toast({ title: "Saved", description: "Your services have been updated." });
    } catch (e) {
      console.error("Products save error:", e);
      toast({ variant: "destructive", title: "Save failed", description: "Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = async (newServices: ServiceOffering[]) => {
    await saveServices(newServices);
    setAddDialogOpen(false);
  };

  const handleEditSave = async (updated: ServiceOffering) => {
    const newList = services.map((s) => (s.serviceId === updated.serviceId ? updated : s));
    await saveServices(newList);
    setEditDialogOpen(false);
    setEditingService(null);
  };

  const handleTogglePause = async (name: string) => {
    const newList = services.map((s) =>
      s.name === name
        ? { ...s, status: s.status === "paused" ? ("active" as const) : ("paused" as const) }
        : s,
    );
    await saveServices(newList);
  };

  const handleRemoveConfirmed = async () => {
    if (!confirmRemoveName) return;
    const newList = services.filter((s) => s.name !== confirmRemoveName);
    await saveServices(newList);
    setConfirmRemoveName(null);
  };

  const handleAddPopular = async (name: string) => {
    if (services.some((s) => s.name === name)) return;
    const newService: ServiceOffering = {
      serviceId: makeServiceId(name),
      name,
      pricingType: "starting",
      price: null,
      customQuoteAvailable: true,
      status: "active",
    };
    await saveServices([...services, newService]);
  };

  const newOppsCount = (allOpportunities ?? []).filter(
    (o) => o.status === "active" && !o.unlockedBy?.[uid ?? ""],
  ).length;

  const currentServiceNames = new Set(services.map((s) => s.name));

  const isLoading = isUserLoading || supplierLoading;

  if (isLoading || !uid) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!supplier) return null;

  const sidebarProps = {
    activeView: "",
    onNavigate: (_view: string, _label?: string) => { router.push("/suppliers/dashboard"); },
    supplier: { ...supplier, id: uid },
    newOppsCount,
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-secondary">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r bg-card sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto">
        <SupplierSidebar {...sidebarProps} />
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile sub-header */}
        <div className="lg:hidden sticky top-16 z-30 bg-card border-b px-4 py-2.5 flex items-center gap-3 shadow-sm">
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SupplierSidebar {...sidebarProps} />
            </SheetContent>
          </Sheet>
          <span className="text-sm font-semibold">Products &amp; Services</span>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Products &amp; Services</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage what you offer so planners can find you more easily.
              </p>
            </div>
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="shrink-0 h-10 font-semibold gap-1.5 text-white"
              style={{ backgroundColor: "#1D9E75" }}
            >
              <Plus className="h-4 w-4" />
              Add Product / Service
            </Button>
          </div>

          {/* Active Listings */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Your Active Listings ({services.length})
            </h2>

            {services.length === 0 ? (
              <div className="bg-card border border-dashed rounded-xl py-12 flex flex-col items-center gap-3 text-center px-4">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                  <Package className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">No services listed yet</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Add the services you offer so planners can discover and contact you.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5 font-semibold text-white"
                  style={{ backgroundColor: "#1D9E75" }}
                  onClick={() => setAddDialogOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Your First Service
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {services.map((service) => (
                  <ServiceListingCard
                    key={service.serviceId}
                    service={service}
                    onEdit={() => {
                      setEditingService(service);
                      setEditDialogOpen(true);
                    }}
                    onTogglePause={() => handleTogglePause(service.name)}
                    onRemove={() => setConfirmRemoveName(service.name)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PHASE 2 PLACEHOLDER — real data comes from aggregated planner activity */}
            <PopularServicesCard
              title="Grow Your Visibility"
              subtitle="Popular categories in your area"
              currentServiceNames={currentServiceNames}
              onAddService={handleAddPopular}
              isSaving={isSaving}
            />
            {/* PHASE 2 PLACEHOLDER — real data comes from aggregated planner activity */}
            <PopularServicesCard
              title="Opportunities to Expand"
              subtitle="Suppliers offering these services often receive more interest"
              currentServiceNames={currentServiceNames}
              onAddService={handleAddPopular}
              isSaving={isSaving}
            />
            <GrowthInsightsCard />
          </div>

          {/* Visibility Tips */}
          <VisibilityTips />
        </main>
      </div>

      {/* Add dialog */}
      <AddServiceDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        currentServices={services}
        onAdd={handleAdd}
        isSaving={isSaving}
      />

      {/* Edit dialog */}
      <EditServiceDialog
        service={editingService}
        open={editDialogOpen}
        onOpenChange={(v) => {
          setEditDialogOpen(v);
          if (!v) setEditingService(null);
        }}
        onSave={handleEditSave}
        isSaving={isSaving}
      />

      {/* Remove confirmation */}
      <AlertDialog
        open={!!confirmRemoveName}
        onOpenChange={(v) => { if (!v) setConfirmRemoveName(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove service?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{confirmRemoveName}&rdquo; will be removed from your listings. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirmed}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
