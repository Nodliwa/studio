"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { BudgetItem, BudgetCategory, Budget, MustDo } from "@/lib/types";
import { budgetTemplates } from "@/lib/data";
import PageHeader from "@/components/page-header";
import { BudgetAccordion } from "@/components/budget-accordion";
import { BudgetSummary } from "@/components/budget-summary";
import { EventDetails } from "@/components/event-details";
import { RsvpManager } from "@/components/RsvpManager";
import { MustDosSummary } from "@/components/must-dos-summary";
import { CollaboratorManager } from "@/components/collaborator-manager";
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
} from "firebase/firestore";
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
import type { RSVP } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { RefreshCw } from "lucide-react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

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
    const subCategoriesTotal = subCategories.reduce((acc, sub) => acc + sub.total, 0);

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
  const [budgetData, setBudgetData] = useState<BudgetCategory[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const isTemplateMode = budgetId === "template";

  const budgetDocRef = useMemoFirebase(
    () =>
      user && budgetId && !isTemplateMode
        ? doc(firestore, "users", user.uid, "budgets", budgetId)
        : null,
    [user, firestore, budgetId, isTemplateMode]
  );

  const { data: budget, isLoading: budgetLoading } = useDoc<Budget>(budgetDocRef);

  const categoriesCollection = useMemoFirebase(
    () =>
      user && budgetId && !isTemplateMode
        ? collection(firestore, "users", user.uid, "budgets", budgetId, "categories")
        : null,
    [user, firestore, budgetId, isTemplateMode]
  );

  const { data: fetchedCategories, isLoading: categoriesLoading } = useCollection<BudgetCategory>(categoriesCollection);

  const mustDosCollection = useMemoFirebase(
    () => (!isTemplateMode && user && budgetDocRef ? collection(budgetDocRef, "mustDos") : null),
    [isTemplateMode, user, budgetDocRef]
  );

  const mustDosQuery = useMemoFirebase(
    () => (mustDosCollection ? query(mustDosCollection, orderBy("createdAt", "desc")) : null),
    [mustDosCollection]
  );

  const { data: mustDos } = useCollection<MustDo>(mustDosQuery);

  const rsvpsCollection = useMemoFirebase(
    () => (!isTemplateMode && user && budgetDocRef ? collection(budgetDocRef, "rsvps") : null),
    [isTemplateMode, user, budgetDocRef]
  );

  const rsvpsQuery = useMemoFirebase(
    () => (rsvpsCollection ? query(rsvpsCollection, orderBy("respondedAt", "desc")) : null),
    [rsvpsCollection]
  );

  const { data: rsvps, isLoading: rsvpsLoading } = useCollection<RSVP>(rsvpsQuery);

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

  useEffect(() => {
    if (!isUserLoading && !user && !isTemplateMode) {
      router.push("/login");
    }
  }, [user, isUserLoading, router, isTemplateMode]);

  useEffect(() => {
    const initializePlan = async () => {
      // 1. Template Mode (Guests only)
      if (isTemplateMode) {
        const eventType = searchParams.get("eventType") || "other";
        const template = budgetTemplates[eventType as keyof typeof budgetTemplates] || budgetTemplates.other;
        const { categories, grandTotal } = calculateTotals(JSON.parse(JSON.stringify(template)));
        setBudgetData(categories);
        setGrandTotal(grandTotal);
        return;
      }

      // 2. Load Existing Member Plan
      if (user && !user.isAnonymous && fetchedCategories && fetchedCategories.length > 0) {
        const { categories, grandTotal } = calculateTotals([...fetchedCategories].sort((a, b) => a.order - b.order));
        setBudgetData(categories);
        setGrandTotal(grandTotal);
        return;
      }

      // 3. Initialize New Member Plan from Template
      if (user && !user.isAnonymous && !budgetLoading && !categoriesLoading && !isInitializing && (!fetchedCategories || fetchedCategories.length === 0)) {
        setIsInitializing(true);
        const eventTypeFromParams = searchParams.get("eventType") || budget?.eventType || "other";
        const template = budgetTemplates[eventTypeFromParams as keyof typeof budgetTemplates] || budgetTemplates.other;
        const { categories: templateCategories, grandTotal: initialTotal } = calculateTotals(JSON.parse(JSON.stringify(template)));

        const newBudget: Budget = {
          id: budgetId,
          name: "",
          grandTotal: initialTotal,
          userId: user.uid,
          eventType: eventTypeFromParams,
          eventDate: "",
          eventLocation: "",
          expectedGuests: 0,
          collaboratorIds: [],
        };

        const budgetRef = doc(firestore, "users", user.uid, "budgets", budgetId);
        
        try {
          // Save initial budget doc
          await setDoc(budgetRef, newBudget, { merge: true });

          // Save categories
          const batch = writeBatch(firestore);
          templateCategories.forEach((category, index) => {
            const catRef = doc(collection(budgetRef, "categories"));
            batch.set(catRef, { ...category, id: catRef.id, order: index, budgetId });
          });
          await batch.commit();
          
          setBudgetData(templateCategories);
          setGrandTotal(initialTotal);
        } catch (error) {
          console.error("Initialization failed:", error);
          setIsInitializing(false);
        }
      }
    };
    initializePlan();
  }, [isTemplateMode, searchParams, user, isUserLoading, budget, budgetLoading, fetchedCategories, categoriesLoading, firestore, budgetId, isInitializing]);

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

      const { categories, grandTotal } = calculateTotals(updated);
      setBudgetData(categories);
      setGrandTotal(grandTotal);

      if (!isTemplateMode && user && !user.isAnonymous) {
        const rootId = categoryPath[0];
        const rootCat = categories.find((c: BudgetCategory) => c.id === rootId);
        if (rootCat) {
            const rootCatRef = doc(firestore, "users", user.uid, "budgets", budgetId, "categories", rootId);
            setDoc(rootCatRef, rootCat, { merge: true });
        }
        if (budgetDocRef) {
            setDoc(budgetDocRef, { grandTotal }, { merge: true });
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
      target.items = [...(target.items || []), { id: `${Date.now()}`, name: "", metric: "", quantity: 0, unitPrice: 0, total: 0, comment: "" }];
      
      const { categories, grandTotal } = calculateTotals(updated);
      setBudgetData(categories);
      setGrandTotal(grandTotal);

      if (!isTemplateMode && user && !user.isAnonymous) {
        const rootId = categoryPath[0];
        const rootCat = categories.find((c: BudgetCategory) => c.id === rootId);
        if (rootCat) {
            const rootCatRef = doc(firestore, "users", user.uid, "budgets", budgetId, "categories", rootId);
            setDoc(rootCatRef, rootCat, { merge: true });
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
        if (!isTemplateMode && user && !user.isAnonymous) {
          const batch = writeBatch(firestore);
          newOrder.forEach((cat, index) => batch.update(doc(firestore, "users", user.uid, "budgets", budgetId, "categories", cat.id), { order: index }));
          batch.commit().catch(console.error);
        }
        return newOrder;
      });
    }
  };

  if (isUserLoading || (!isTemplateMode && (categoriesLoading || budgetLoading || rsvpsLoading)) || (budgetData.length === 0 && !isTemplateMode)) {
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
        <main className="container mx-auto px-4 flex-grow flex flex-col mb-16">
          <Greeter />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
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

          <div className="mt-8">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={budgetData} strategy={verticalListSortingStrategy}>
                <BudgetAccordion categories={budgetData} onItemChange={handleItemChange} onAddItem={handleAddItem} />
              </SortableContext>
            </DndContext>
          </div>

          {!isTemplateMode && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <RsvpManager budgetId={budgetId} rsvps={rsvps} />
              <MustDosSummary budgetId={budgetId} mustDos={mustDos} />
              {budget && budgetDocRef && <CollaboratorManager budget={budget} budgetRef={budgetDocRef} />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}