"use client";

import { useState, useEffect, useMemo, useCallback, lazy, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { BudgetItem, BudgetCategory, Budget, MustDo, RSVP } from "@/lib/types";
import type { SupplierLead } from "@/lib/supplier-types";
import { budgetTemplates } from "@/lib/templates";
import PageHeader from "@/components/page-header";
import { BudgetSummary } from "@/components/budget-summary";
import { EventDetails } from "@/components/event-details";
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
  useDoc,
} from "@/firebase";
import {
  collection,
  doc,
  writeBatch,
  query,
  orderBy,
  setDoc,
  getDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { planActivityFields } from "@/lib/plan-activity";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Greeter from "@/components/greeter";
import { RefreshCw, ChevronDown, Tag, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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

// Lazy load heavy components not needed on initial render
const BudgetAccordion = lazy(() =>
  import("@/components/budget-accordion").then((m) => ({ default: m.BudgetAccordion }))
);
const CollaboratorManager = lazy(() =>
  import("@/components/collaborator-manager").then((m) => ({ default: m.CollaboratorManager }))
);
const RsvpManager = lazy(() =>
  import("@/components/RsvpManager").then((m) => ({ default: m.RsvpManager }))
);
const MustDosSummary = lazy(() =>
  import("@/components/must-dos-summary").then((m) => ({ default: m.MustDosSummary }))
);
const FindSupplierModal = lazy(() =>
  import("@/components/find-supplier-modal").then((m) => ({ default: m.FindSupplierModal }))
);

// Fallback spinner for lazy loaded components
const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

function countAllItems(cats: BudgetCategory[]): number {
  return cats.reduce((sum, cat) => {
    const direct = (cat.items || []).length;
    const nested = countAllItems(cat.subCategories || []);
    return sum + direct + nested;
  }, 0);
}

function collectTouchedFlatIndices(cat: BudgetCategory): Set<number> {
  const touched = new Set<number>();
  let flatIdx = 0;
  const isTouched = (item: BudgetItem) =>
    item.name !== "" || item.metric !== "" || (item.quantity ?? 0) !== 0 || (item.unitPrice ?? 0) !== 0 || item.comment !== "";
  const traverse = (items: BudgetItem[], subCats: BudgetCategory[]) => {
    for (const item of items) {
      if (isTouched(item)) touched.add(flatIdx);
      flatIdx++;
    }
    for (const sub of subCats) traverse(sub.items || [], sub.subCategories || []);
  };
  traverse(cat.items || [], cat.subCategories || []);
  return touched;
}

function getFlatIndex(rootCat: BudgetCategory, categoryPath: string[], itemIndex: number): number {
  let flatIdx = 0;
  const traverse = (cat: BudgetCategory, remainingPath: string[]): boolean => {
    if (remainingPath.length === 0) { flatIdx += itemIndex; return true; }
    const targetId = remainingPath[0];
    flatIdx += (cat.items || []).length;
    for (const sub of (cat.subCategories || [])) {
      if (sub.id === targetId) return traverse(sub, remainingPath.slice(1));
      flatIdx += countAllItems([sub]);
    }
    return false;
  };
  traverse(rootCat, categoryPath.slice(1));
  return flatIdx;
}

function countTemplateOnlyItems(cats: BudgetCategory[]): number {
  return cats.reduce((sum, cat) => {
    const direct = (cat.items || []).filter(item => item.is_template === true).length;
    const nested = countTemplateOnlyItems(cat.subCategories || []);
    return sum + direct + nested;
  }, 0);
}

function calculateTotals(categories: BudgetCategory[]): {
  categories: BudgetCategory[];
  grandTotal: number;
} {
  let newGrandTotal = 0;
  const categoriesWithTotals = categories.map((category) => {
    let categoryTotal = 0;
    const items = category.items || [];
    const itemsWithTotals = items.map((item) => {
      const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
      categoryTotal += itemTotal;
      return { ...item, total: itemTotal };
    });

    category.items = itemsWithTotals;

    const subCategories = category.subCategories
      ? calculateTotals(category.subCategories).categories
      : [];
    const subCategoriesTotal = subCategories.reduce((acc, sub) => acc + (sub.total || 0), 0);

    category.total = categoryTotal + subCategoriesTotal;
    category.subCategories = subCategories;
    newGrandTotal += category.total;
    return { ...category };
  });
  return { categories: categoriesWithTotals, grandTotal: newGrandTotal };
}

export default function PlannerPage({
  params: { budgetId },
}: {
  params: { budgetId: string };
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [budgetData, setBudgetData] = useState<BudgetCategory[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [showQuickStartBanner, setShowQuickStartBanner] = useState(false);
  const isTemplateMode = budgetId === "template";

  const [findSupplierOpen, setFindSupplierOpen] = useState(false);
  const [findSupplierItem, setFindSupplierItem] = useState<{ item: BudgetItem; itemTotal: number } | null>(null);
  const [markAsFoundPending, setMarkAsFoundPending] = useState<{ itemId: string; leadId: string } | null>(null);
  const [markAsFoundLoading, setMarkAsFoundLoading] = useState(false);
  const [leadDetails, setLeadDetails] = useState<Record<string, SupplierLead>>({});
  const [leadDetailsLoading, setLeadDetailsLoading] = useState(false);
  const [requestsSectionOpen, setRequestsSectionOpen] = useState(true);
  const [cancelRequestPending, setCancelRequestPending] = useState<{ itemId: string; leadId: string } | null>(null);
  const [cancelRequestLoading, setCancelRequestLoading] = useState(false);
  const fetchedLeadIdsRef = useRef<Set<string>>(new Set());
  const plannerOpenedRef = useRef(false);

  // Category UX state
  const [categoryProgress, setCategoryProgress] = useState<Record<string, Set<number>>>({});
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [hintDismissed, setHintDismissed] = useState(false);
  const autoExpandFiredRef = useRef(false);
  const categoryProgressInitRef = useRef(false);

  const handleFindSupplier = useCallback((item: BudgetItem, itemTotal: number) => {
    setFindSupplierItem({ item, itemTotal });
    setFindSupplierOpen(true);
  }, []);

  const handleMarkAsFound = useCallback((itemId: string, leadId: string) => {
    setMarkAsFoundPending({ itemId, leadId });
  }, []);

  const handleMarkAsFoundConfirm = async () => {
    if (!markAsFoundPending || !user || !budgetDocRef) return;
    setMarkAsFoundLoading(true);
    const { itemId, leadId } = markAsFoundPending;
    try {
      const leadRef = doc(firestore, "supplier_opportunities", leadId);
      const leadSnap = await getDoc(leadRef);
      const lead = leadSnap.data() as SupplierLead | undefined;

      const batch = writeBatch(firestore);

      batch.update(leadRef, { status: "closed", closedAt: serverTimestamp() });

      batch.set(
        budgetDocRef,
        {
          supplierRequests: {
            ...(budget?.supplierRequests ?? {}),
            [itemId]: {
              ...(budget?.supplierRequests?.[itemId] ?? {}),
              status: "closed",
            },
          },
        },
        { merge: true }
      );

      for (const supplierUid of lead?.unlockedBy ?? []) {
        const notifRef = doc(collection(firestore, "supplier_notifications"));
        batch.set(notifRef, {
          supplierId: supplierUid,
          type: "opportunity_filled",
          title: "Opportunity Filled",
          message: "A planner has found a supplier for this request.",
          opportunityId: leadId,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      await batch.commit();
      toast({ title: "Marked as found.", description: "Suppliers have been notified." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Something went wrong.", description: "Please try again." });
    } finally {
      setMarkAsFoundLoading(false);
      setMarkAsFoundPending(null);
    }
  };

  const handleCancelRequest = useCallback((itemId: string, leadId: string) => {
    setCancelRequestPending({ itemId, leadId });
  }, []);

  const handleCancelRequestConfirm = async () => {
    if (!cancelRequestPending || !user || !budgetDocRef) return;
    setCancelRequestLoading(true);
    const { itemId, leadId } = cancelRequestPending;
    try {
      const leadRef = doc(firestore, "supplier_opportunities", leadId);
      const leadSnap = await getDoc(leadRef);
      const lead = leadSnap.data() as SupplierLead | undefined;

      const batch = writeBatch(firestore);

      batch.update(leadRef, { status: "closed", closedAt: serverTimestamp() });

      batch.set(
        budgetDocRef,
        {
          supplierRequests: {
            ...(budget?.supplierRequests ?? {}),
            [itemId]: {
              ...(budget?.supplierRequests?.[itemId] ?? {}),
              status: "closed",
            },
          },
        },
        { merge: true }
      );

      for (const supplierUid of lead?.unlockedBy ?? []) {
        const notifRef = doc(collection(firestore, "supplier_notifications"));
        batch.set(notifRef, {
          supplierId: supplierUid,
          type: "opportunity_cancelled",
          title: "Request Cancelled",
          message: "A planner has cancelled this supplier request.",
          opportunityId: leadId,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      await batch.commit();
      toast({ title: "Request cancelled.", description: "Suppliers have been notified." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Something went wrong.", description: "Please try again." });
    } finally {
      setCancelRequestLoading(false);
      setCancelRequestPending(null);
    }
  };

  const budgetDocRef = useMemoFirebase(
    () =>
      user && budgetId && !isTemplateMode
        ? doc(firestore, "users", user.uid, "budgets", budgetId)
        : null,
    [user, firestore, budgetId, isTemplateMode]
  );

  const { data: budget, isLoading: budgetLoading } = useDoc<Budget>(budgetDocRef);

  // Resolved once budget.userId arrives; falls back to user.uid so sub-collections
  // can start immediately without waiting for the budget doc.
  const planOwnerId = useMemo(
    () => budget?.userId || user?.uid || null,
    [budget?.userId, user?.uid]
  );

  const categoriesCollection = useMemoFirebase(
    () =>
      user && budgetId && !isTemplateMode && planOwnerId
        ? collection(firestore, "users", planOwnerId, "budgets", budgetId, "categories")
        : null,
    [user, firestore, budgetId, isTemplateMode, planOwnerId]
  );

  const { data: fetchedCategories, isLoading: categoriesLoading } = useCollection<BudgetCategory>(categoriesCollection);

  const mustDosCollection = useMemoFirebase(
    () => (!isTemplateMode && planOwnerId && budgetId ? collection(firestore, "users", planOwnerId, "budgets", budgetId, "mustDos") : null),
    [isTemplateMode, planOwnerId, budgetId, firestore]
  );

  const mustDosQuery = useMemoFirebase(
    () => (mustDosCollection ? query(mustDosCollection, orderBy("createdAt", "desc")) : null),
    [mustDosCollection]
  );

  const { data: mustDos } = useCollection<MustDo>(mustDosQuery);

  const rsvpsCollection = useMemoFirebase(
    () => (!isTemplateMode && planOwnerId && budgetId ? collection(firestore, "users", planOwnerId, "budgets", budgetId, "rsvps") : null),
    [isTemplateMode, planOwnerId, budgetId, firestore]
  );

  const rsvpsQuery = useMemoFirebase(
    () => (rsvpsCollection ? query(rsvpsCollection, orderBy("createdAt", "desc")) : null),
    [rsvpsCollection]
  );

  const { data: rsvps } = useCollection<RSVP>(rsvpsQuery);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const daysLeft = useMemo(() => {
    if (!budget?.eventDate) return null;
    const eventDate = new Date(budget.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    if (diffTime < 0) return "Event passed";
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "Today!" : `${diffDays} days`;
  }, [budget?.eventDate]);

  const supplierRequestLeadIds = useMemo(
    () =>
      Object.values(budget?.supplierRequests ?? {})
        .map((r) => r.leadId)
        .sort()
        .join(","),
    [budget?.supplierRequests]
  );

  const openRequestCount = useMemo(
    () =>
      Object.values(budget?.supplierRequests ?? {}).filter(
        (r) => r.status === "open"
      ).length,
    [budget?.supplierRequests]
  );

  const allRequestsSettled = useMemo(() => {
    const entries = Object.entries(budget?.supplierRequests ?? {});
    return (
      entries.length > 0 &&
      entries.every(
        ([, req]) =>
          req.status === "closed" ||
          leadDetails[req.leadId]?.status === "expired"
      )
    );
  }, [budget?.supplierRequests, leadDetails]);

  useEffect(() => {
    if (!isUserLoading && !user && !isTemplateMode) {
      router.push("/auth");
    }
  }, [user, isUserLoading, router, isTemplateMode]);

  useEffect(() => {
    if (!isTemplateMode && searchParams.get('quickStart') === 'true') {
      setShowQuickStartBanner(true);
    }
  }, [isTemplateMode, searchParams]);

  useEffect(() => {
    if (isTemplateMode) {
      const eventType = searchParams.get("eventType") || "other";
      const template = budgetTemplates[eventType as keyof typeof budgetTemplates] || budgetTemplates.other;
      const { categories, grandTotal } = calculateTotals(JSON.parse(JSON.stringify(template)));
      setBudgetData(categories);
      setGrandTotal(grandTotal);
      return;
    }

    if (fetchedCategories && fetchedCategories.length > 0) {
      const { categories, grandTotal } = calculateTotals([...fetchedCategories].sort((a, b) => (a.order || 0) - (b.order || 0)));
      setBudgetData(categories);
      setGrandTotal(grandTotal);
    }
  }, [isTemplateMode, searchParams, fetchedCategories]);

  useEffect(() => {
    if (isTemplateMode || !budget?.supplierRequests) return;
    const missing = Object.values(budget.supplierRequests).filter(
      (r) => !fetchedLeadIdsRef.current.has(r.leadId)
    );
    if (missing.length === 0) return;
    missing.forEach((r) => fetchedLeadIdsRef.current.add(r.leadId));
    setLeadDetailsLoading(true);
    Promise.all(
      missing.map((r) =>
        getDoc(doc(firestore, "supplier_opportunities", r.leadId))
      )
    )
      .then((snaps) => {
        setLeadDetails((prev) => {
          const next = { ...prev };
          snaps.forEach((snap) => {
            if (snap.exists()) {
              next[snap.id] = { id: snap.id, ...snap.data() } as SupplierLead;
            }
          });
          return next;
        });
      })
      .catch(console.error)
      .finally(() => setLeadDetailsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierRequestLeadIds, isTemplateMode, firestore]);

  useEffect(() => {
    if (isTemplateMode || !budgetDocRef || plannerOpenedRef.current) return;
    plannerOpenedRef.current = true;
    setDoc(budgetDocRef, { plannerLastOpenedAt: serverTimestamp() }, { merge: true }).catch(console.error);
  }, [budgetDocRef, isTemplateMode]);

  // Load hint dismissed state from localStorage
  useEffect(() => {
    if (isTemplateMode || !budgetId) return;
    const dismissed = localStorage.getItem(`hint_dismissed_${budgetId}`) === 'true';
    setHintDismissed(dismissed);
  }, [budgetId, isTemplateMode]);

  // Auto-expand first category on initial load (fires once)
  useEffect(() => {
    if (autoExpandFiredRef.current || budgetData.length === 0) return;
    autoExpandFiredRef.current = true;
    setOpenCategories([budgetData[0].id]);
  }, [budgetData]);

  // Dismiss hint when any category is first expanded
  useEffect(() => {
    if (hintDismissed || openCategories.length === 0 || isTemplateMode) return;
    setHintDismissed(true);
    localStorage.setItem(`hint_dismissed_${budgetId}`, 'true');
  }, [openCategories, hintDismissed, budgetId, isTemplateMode]);

  // Initialise categoryProgress (runs once after data loads — all start at 0)
  useEffect(() => {
    if (categoryProgressInitRef.current || budgetData.length === 0) return;
    categoryProgressInitRef.current = true;
    const initial: Record<string, Set<number>> = {};
    budgetData.forEach(cat => { initial[cat.id] = new Set<number>(); });
    setCategoryProgress(initial);
  }, [budgetData]);

  const handleItemChange = (categoryPath: string[], itemIndex: number, field: keyof BudgetItem, value: string | number) => {
    const updated = JSON.parse(JSON.stringify(budgetData));
    let current = updated;
    let target;
    for (const id of categoryPath) {
      target = current.find((c: BudgetCategory) => c.id === id);
      if (target) current = target.subCategories || [];
    }
    if (target) {
      const item = { ...target.items[itemIndex] };
      if (field === "quantity" || field === "unitPrice") item[field] = parseFloat(value as string) || 0;
      else (item[field] as any) = value;
      target.items[itemIndex] = item;

      const { categories, grandTotal: newGrandTotal } = calculateTotals(updated);
      setBudgetData(categories);
      setGrandTotal(newGrandTotal);

      const rootId = categoryPath[0];
      const rootCatForIdx = budgetData.find(c => c.id === rootId);
      if (rootCatForIdx) {
        setCategoryProgress(prev => {
          const next = { ...prev };
          // Update root category
          const rootFlatIdx = getFlatIndex(rootCatForIdx, categoryPath, itemIndex);
          const rootSet = new Set(next[rootId] ?? []);
          rootSet.add(rootFlatIdx);
          next[rootId] = rootSet;
          // Update every sub-category in the path with its own flat index
          let currentCat: BudgetCategory | undefined = rootCatForIdx;
          for (let depth = 1; depth < categoryPath.length; depth++) {
            const subId = categoryPath[depth];
            currentCat = currentCat?.subCategories?.find(s => s.id === subId);
            if (!currentCat) break;
            const subFlatIdx = getFlatIndex(currentCat, categoryPath.slice(depth), itemIndex);
            const subSet = new Set(next[subId] ?? []);
            subSet.add(subFlatIdx);
            next[subId] = subSet;
          }
          return next;
        });
      }

      if (!isTemplateMode && budget?.userId) {
        const rootId = categoryPath[0];
        const rootCat = categories.find((c: BudgetCategory) => c.id === rootId);
        if (rootCat) {
          const rootCatRef = doc(firestore, "users", budget.userId, "budgets", budgetId, "categories", rootId);
          setDoc(rootCatRef, rootCat, { merge: true });
        }
        if (budgetDocRef) {
          setDoc(budgetDocRef, { grandTotal: newGrandTotal, ...planActivityFields(budget?.is_customized) }, { merge: true });
        }
      }
    }
  };

  const handleAddItem = (categoryPath: string[]) => {
    const updated = JSON.parse(JSON.stringify(budgetData));
    let current = updated;
    let target;
    for (const id of categoryPath) {
      target = current.find((c: BudgetCategory) => c.id === id);
      if (target) current = target.subCategories || [];
    }
    if (target) {
      target.items = [...(target.items || []), { id: `${Date.now()}`, name: "", metric: "", quantity: 0, unitPrice: 0, total: 0, comment: "", is_template: false }];

      const { categories, grandTotal: newGrandTotal } = calculateTotals(updated);
      setBudgetData(categories);
      setGrandTotal(newGrandTotal);

      if (!isTemplateMode && budget?.userId) {
        const rootId = categoryPath[0];
        const rootCat = categories.find((c: BudgetCategory) => c.id === rootId);
        if (rootCat) {
          const rootCatRef = doc(firestore, "users", budget.userId, "budgets", budgetId, "categories", rootId);
          setDoc(rootCatRef, rootCat, { merge: true });
        }
        if (budgetDocRef) {
          setDoc(budgetDocRef, {
            itemCount: countAllItems(categories),
            addedItemCount: increment(1),
            ...planActivityFields(budget?.is_customized),
          }, { merge: true });
        }
      }
    }
  };

  const handleDeleteItem = (categoryPath: string[], itemIndex: number) => {
    const updated = JSON.parse(JSON.stringify(budgetData));
    let current = updated;
    let target;
    for (const id of categoryPath) {
      target = current.find((c: BudgetCategory) => c.id === id);
      if (target) current = target.subCategories || [];
    }
    if (target) {
      const deletedItem = target.items[itemIndex];
      const isTemplateItem = deletedItem?.is_template === true;
      target.items.splice(itemIndex, 1);
      const { categories, grandTotal: newGrandTotal } = calculateTotals(updated);
      setBudgetData(categories);
      setGrandTotal(newGrandTotal);

      if (!isTemplateMode && budget?.userId) {
        const rootId = categoryPath[0];
        const rootCat = categories.find((c: BudgetCategory) => c.id === rootId);
        if (rootCat) {
          const rootCatRef = doc(firestore, "users", budget.userId, "budgets", budgetId, "categories", rootId);
          setDoc(rootCatRef, rootCat, { merge: true });
        }
        if (budgetDocRef) {
          setDoc(budgetDocRef, {
            grandTotal: newGrandTotal,
            itemCount: countAllItems(categories),
            ...(isTemplateItem && { removedItemCount: increment(1) }),
            ...planActivityFields(budget?.is_customized),
          }, { merge: true });
        }
      }
    }
  };

  const handleDeleteCategory = (categoryPath: string[]) => {
    const updated = JSON.parse(JSON.stringify(budgetData));
    if (categoryPath.length === 1) {
      const catId = categoryPath[0];
      const deletedCat = updated.find((c: BudgetCategory) => c.id === catId);
      const deletedItemCount = deletedCat ? countTemplateOnlyItems([deletedCat]) : 0;
      const filtered = updated.filter((c: BudgetCategory) => c.id !== catId);
      const { categories, grandTotal: newGrandTotal } = calculateTotals(filtered);
      setBudgetData(categories);
      setGrandTotal(newGrandTotal);

      if (!isTemplateMode && budget?.userId) {
        const batch = writeBatch(firestore);
        const catRef = doc(firestore, "users", budget.userId, "budgets", budgetId, "categories", catId);
        batch.delete(catRef);
        if (budgetDocRef) {
          batch.update(budgetDocRef, {
            grandTotal: newGrandTotal,
            itemCount: countAllItems(categories),
            ...(deletedItemCount > 0 && { removedItemCount: increment(deletedItemCount) }),
            ...planActivityFields(budget?.is_customized),
          });
        }
        batch.commit().catch(console.error);
      }
    } else {
      let current = updated;
      let parent;
      const targetId = categoryPath[categoryPath.length - 1];
      const parentPath = categoryPath.slice(0, -1);

      for (const id of parentPath) {
        parent = current.find((c: BudgetCategory) => c.id === id);
        if (parent) current = parent.subCategories || [];
      }

      if (parent && parent.subCategories) {
        const deletedSub = parent.subCategories.find((c: BudgetCategory) => c.id === targetId);
        const deletedItemCount = deletedSub ? countTemplateOnlyItems([deletedSub]) : 0;
        parent.subCategories = parent.subCategories.filter((c: BudgetCategory) => c.id !== targetId);
        const { categories, grandTotal: newGrandTotal } = calculateTotals(updated);
        setBudgetData(categories);
        setGrandTotal(newGrandTotal);

        if (!isTemplateMode && budget?.userId) {
          const rootId = categoryPath[0];
          const rootCat = categories.find((c: BudgetCategory) => c.id === rootId);
          if (rootCat) {
            const rootCatRef = doc(firestore, "users", budget.userId, "budgets", budgetId, "categories", rootId);
            setDoc(rootCatRef, rootCat, { merge: true });
          }
          if (budgetDocRef) {
            setDoc(budgetDocRef, {
              grandTotal: newGrandTotal,
              itemCount: countAllItems(categories),
              ...(deletedItemCount > 0 && { removedItemCount: increment(deletedItemCount) }),
              ...planActivityFields(budget?.is_customized),
            }, { merge: true });
          }
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setBudgetData((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over!.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        if (!isTemplateMode && budget?.userId) {
          const batch = writeBatch(firestore);
          newOrder.forEach((cat, index) =>
            batch.update(doc(firestore, "users", budget.userId, "budgets", budgetId, "categories", cat.id), { order: index })
          );
          batch.commit().catch(console.error);
        }
        return newOrder;
      });
    }
  };

  if (isUserLoading || (!isTemplateMode && (categoriesLoading || budgetLoading)) || (budgetData.length === 0 && !isTemplateMode)) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col">
        <PageHeader />
        <main className="flex-grow flex items-center justify-center">
          <RefreshCw className="h-10 w-10 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-secondary">
      <div className="bg-background shadow-2xl min-h-full container mx-auto flex flex-col">
        <PageHeader />
        <main className="flex-grow flex flex-col mb-16">
          <div className="px-4"><Greeter /></div>

          {showQuickStartBanner && (
            <div className="mt-4 mx-4 flex items-center gap-3 rounded-lg border border-pink-200 bg-pink-50 px-4 py-3 text-sm text-pink-800 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-200">
              <span className="flex-1">This is a default plan — tap any section to personalise it.</span>
              <button
                onClick={() => setShowQuickStartBanner(false)}
                className="shrink-0 font-semibold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {!isTemplateMode && budget?.birthdayMeta?.isMilestone && (
            <div className="mt-4 mx-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800 dark:bg-amber-900 dark:text-amber-100">
              🎉 Milestone Birthday!
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <EventDetails
              budget={budget}
              budgetRef={budgetDocRef}
              isBudgetLoading={budgetLoading}
              isTemplateMode={isTemplateMode}
              eventType={isTemplateMode ? (searchParams.get("eventType") || "other") : budget?.eventType}
            />
            <BudgetSummary
              grandTotal={grandTotal}
              daysLeft={daysLeft}
              mustDosTotal={mustDos?.length || 0}
              mustDosCompleted={mustDos?.filter(m => m.status === 'done').length || 0}
              budgetId={isTemplateMode ? undefined : budgetId}
              isTemplateMode={isTemplateMode}
            />
          </div>



          {!isTemplateMode &&
            budget?.supplierRequests &&
            Object.keys(budget.supplierRequests).length > 0 && (
            <Collapsible
              open={requestsSectionOpen}
              onOpenChange={setRequestsSectionOpen}
              className="mt-6 px-4"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">My Supplier Requests</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {Object.keys(budget.supplierRequests).length}
                  </span>
                  {openRequestCount > 0 && (
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                      {openRequestCount} active
                    </span>
                  )}
                  {allRequestsSettled && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    requestsSectionOpen && "rotate-180"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                {leadDetailsLoading && (
                  <p className="text-xs text-muted-foreground">Loading details…</p>
                )}
                {Object.entries(budget.supplierRequests).map(([itemId, req]) => {
                  const lead = leadDetails[req.leadId];
                  const isOpenReq = req.status === "open";
                  const isClosed = req.status === "closed";
                  const isUnmatched = !isClosed && lead?.status === "unmatched";
                  const isExpired = !isClosed && lead?.status === "expired";

                  let statusBadge;
                  if (isClosed) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3" /> Found
                      </span>
                    );
                  } else if (isUnmatched) {
                    statusBadge = (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                        No matches yet
                      </span>
                    );
                  } else if (isExpired) {
                    statusBadge = (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Expired
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                        Active
                      </span>
                    );
                  }

                  const matchedCount = req.matchedCount ?? lead?.matchedSupplierCount ?? 0;
                  const interestedCount = lead?.unlockedBy?.length ?? 0;
                  const submittedAt = lead?.createdAt;
                  const contactLabel =
                    lead?.contactPreference === "share_details"
                      ? "Sharing my details"
                      : lead?.contactPreference === "profile_first"
                      ? "Reviewing profiles first"
                      : "Open to either";

                  return (
                    <div key={itemId} className="rounded-lg border bg-background p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 min-w-0">
                          <Tag className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight truncate">
                              {lead?.itemName ?? itemId}
                            </p>
                            {lead?.mappedCategory && lead.mappedCategory !== lead.itemName && (
                              <p className="text-xs text-muted-foreground">{lead.mappedCategory}</p>
                            )}
                          </div>
                        </div>
                        {statusBadge}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {submittedAt && (
                          <span>
                            Submitted{" "}
                            {formatDistanceToNow(
                              submittedAt.toDate ? submittedAt.toDate() : new Date(submittedAt),
                              { addSuffix: true }
                            )}
                          </span>
                        )}
                        <span>{matchedCount} matched</span>
                        {interestedCount > 0 && <span>{interestedCount} interested</span>}
                        {lead?.contactPreference && <span>{contactLabel}</span>}
                      </div>

                      {isOpenReq && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleMarkAsFound(itemId, req.leadId)}
                            className="rounded-md border border-green-600 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-950"
                          >
                            Mark as Found
                          </button>
                          <button
                            onClick={() => handleCancelRequest(itemId, req.leadId)}
                            className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                          >
                            Cancel Request
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          )}

          <div className="mt-4">
            {!hintDismissed && (
              <p className="px-4 text-xs text-muted-foreground text-center mb-3">
                Tap each section 👇🏾 to update your items and prices
              </p>
            )}
            <Suspense fallback={<ComponentLoader />}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={budgetData} strategy={verticalListSortingStrategy}>
                  <BudgetAccordion
                    categories={budgetData}
                    onItemChange={handleItemChange}
                    onAddItem={handleAddItem}
                    onDeleteItem={handleDeleteItem}
                    onDeleteCategory={handleDeleteCategory}
                    supplierRequests={!isTemplateMode ? budget?.supplierRequests : undefined}
                    onFindSupplier={!isTemplateMode ? handleFindSupplier : undefined}
                    onMarkAsFound={!isTemplateMode ? handleMarkAsFound : undefined}
                    categoryProgress={categoryProgress}
                    openCategories={openCategories}
                    onOpenChange={setOpenCategories}
                  />
                </SortableContext>
              </DndContext>
            </Suspense>
          </div>

          {!isTemplateMode && budget && budgetDocRef && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Suspense fallback={<ComponentLoader />}>
                <MustDosSummary budgetId={budgetId} mustDos={mustDos} />
              </Suspense>
              <Suspense fallback={<ComponentLoader />}>
                <CollaboratorManager
                  budget={budget}
                  budgetRef={budgetDocRef}
                  inviterName={user?.displayName || 'A SimpliPlan User'}
                />
              </Suspense>
              <div className="md:col-span-2">
                <Suspense fallback={<ComponentLoader />}>
                  <RsvpManager budget={budget} rsvps={rsvps} />
                </Suspense>
              </div>
            </div>
          )}
        </main>
      </div>

      {!isTemplateMode && findSupplierItem && budget && user && (
        <Suspense fallback={null}>
          <FindSupplierModal
            open={findSupplierOpen}
            onOpenChange={setFindSupplierOpen}
            item={findSupplierItem.item}
            itemTotal={findSupplierItem.itemTotal}
            budget={budget}
            budgetId={budgetId}
            userId={user.uid}
          />
        </Suspense>
      )}

      <AlertDialog
        open={!!markAsFoundPending}
        onOpenChange={(open) => { if (!open) setMarkAsFoundPending(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark this request as filled?</AlertDialogTitle>
            <AlertDialogDescription>
              Suppliers who unlocked this lead will be notified that the opportunity has been filled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={markAsFoundLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsFoundConfirm} disabled={markAsFoundLoading}>
              {markAsFoundLoading ? "Saving…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!cancelRequestPending}
        onOpenChange={(open) => { if (!open) setCancelRequestPending(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this request?</AlertDialogTitle>
            <AlertDialogDescription>
              Any suppliers who unlocked this lead will be notified that the request has been cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelRequestLoading}>Keep Request</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelRequestConfirm} disabled={cancelRequestLoading}>
              {cancelRequestLoading ? "Cancelling…" : "Cancel Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}