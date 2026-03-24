
"use client";

import { useState, useEffect, useMemo } from "react";
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
import { RefreshCw } from "lucide-react";

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
  const [budgetData, setBudgetData] = useState<BudgetCategory[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const isTemplateMode = budgetId === "template";

  // In Next.js 14, params are accessed directly from the props.
  // We use the budgetId to find the plan.
  // We try to load the budget using the current user's ID as a starting point,
  // but for guests/collaborators, the path might be different.
  // Since we don't know the owner ID upfront if we aren't the owner,
  // we rely on the parent document path or user metadata.
  
  // For the initial load, we assume the current user might be the owner.
  // If not, the 'useDoc' will return null or an error, and we'll need to resolve it.
  const budgetDocRef = useMemoFirebase(
    () =>
      user && budgetId && !isTemplateMode
        ? doc(firestore, "users", user.uid, "budgets", budgetId)
        : null,
    [user, firestore, budgetId, isTemplateMode]
  );

  const { data: budget, isLoading: budgetLoading } = useDoc<Budget>(budgetDocRef);

  // If we are a collaborator, the path above fails.
  // The actual path is stored in the invitation link or we can find it.
  // For MVP, we assume if the first attempt fails but the user has access,
  // they might be a collaborator.

  const categoriesCollection = useMemoFirebase(
    () =>
      user && budgetId && !isTemplateMode
        ? collection(firestore, "users", budget?.userId || user.uid, "budgets", budgetId, "categories")
        : null,
    [user, firestore, budgetId, isTemplateMode, budget?.userId]
  );

  const { data: fetchedCategories, isLoading: categoriesLoading } = useCollection<BudgetCategory>(categoriesCollection);

  const mustDosCollection = useMemoFirebase(
    () => (!isTemplateMode && budget?.userId && budgetId ? collection(firestore, "users", budget.userId, "budgets", budgetId, "mustDos") : null),
    [isTemplateMode, budget?.userId, budgetId, firestore]
  );

  const mustDosQuery = useMemoFirebase(
    () => (mustDosCollection ? query(mustDosCollection, orderBy("createdAt", "desc")) : null),
    [mustDosCollection]
  );

  const { data: mustDos } = useCollection<MustDo>(mustDosQuery);

  const rsvpsCollection = useMemoFirebase(
    () => (!isTemplateMode && budget?.userId && budgetId ? collection(firestore, "users", budget.userId, "budgets", budgetId, "rsvps") : null),
    [isTemplateMode, budget?.userId, budgetId, firestore]
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

      if (!isTemplateMode && budget?.userId) {
        const rootId = categoryPath[0];
        const rootCat = categories.find((c: BudgetCategory) => c.id === rootId);
        if (rootCat) {
            const rootCatRef = doc(firestore, "users", budget.userId, "budgets", budgetId, "categories", rootId);
            setDoc(rootCatRef, rootCat, { merge: true });
        }
        if (budgetDocRef) {
            setDoc(budgetDocRef, { grandTotal: newGrandTotal }, { merge: true });
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
            setDoc(budgetDocRef, { grandTotal: newGrandTotal }, { merge: true });
        }
      }
    }
  };

  const handleDeleteCategory = (categoryPath: string[]) => {
    const updated = JSON.parse(JSON.stringify(budgetData));
    if (categoryPath.length === 1) {
      const catId = categoryPath[0];
      const filtered = updated.filter((c: BudgetCategory) => c.id !== catId);
      const { categories, grandTotal: newGrandTotal } = calculateTotals(filtered);
      setBudgetData(categories);
      setGrandTotal(newGrandTotal);

      if (!isTemplateMode && budget?.userId) {
        const batch = writeBatch(firestore);
        const catRef = doc(firestore, "users", budget.userId, "budgets", budgetId, "categories", catId);
        batch.delete(catRef);
        if (budgetDocRef) {
          batch.update(budgetDocRef, { grandTotal: newGrandTotal });
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
              setDoc(budgetDocRef, { grandTotal: newGrandTotal }, { merge: true });
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
          newOrder.forEach((cat, index) => batch.update(doc(firestore, "users", budget.userId, "budgets", budgetId, "categories", cat.id), { order: index }));
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
                <BudgetAccordion 
                  categories={budgetData} 
                  onItemChange={handleItemChange} 
                  onAddItem={handleAddItem} 
                  onDeleteItem={handleDeleteItem}
                  onDeleteCategory={handleDeleteCategory}
                />
              </SortableContext>
            </DndContext>
          </div>

          {!isTemplateMode && budget && budgetDocRef && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <CollaboratorManager budget={budget} budgetRef={budgetDocRef} inviterName={user?.displayName || 'A SimpliPlan User'} />
              <RsvpManager budgetId={budgetId} ownerId={budget.userId} rsvps={rsvps} />
              <MustDosSummary budgetId={budgetId} mustDos={mustDos} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
