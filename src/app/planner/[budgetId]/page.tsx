
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
  setDocumentNonBlocking,
  useDoc,
} from "@/firebase";
import {
  collection,
  doc,
  writeBatch,
  query,
  orderBy,
  serverTimestamp,
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
import { Card, CardContent } from "@/components/ui/card";
import type { RSVP } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
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
    const subCategories = category.subCategories
      ? calculateTotals(category.subCategories).categories
      : [];
    const subCategoriesTotal = subCategories.reduce(
      (acc, sub) => acc + sub.total,
      0,
    );

    category.items = itemsWithTotals;
    category.total = categoryTotal + subCategoriesTotal;
    newGrandTotal += category.total;
    return { ...category, subCategories };
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

  // Redirect logged-in users from 'template' mode to a persistent new plan
  useEffect(() => {
    if (isTemplateMode && !isUserLoading && user && !user.isAnonymous) {
      const newId = uuidv4();
      const eventTypeParam = searchParams.get("eventType") || "other";
      router.replace(`/planner/${newId}?eventType=${eventTypeParam}`);
    }
  }, [isTemplateMode, isUserLoading, user, router, searchParams]);

  const budgetDocRef = useMemoFirebase(
    () =>
      user && budgetId && !isTemplateMode
        ? doc(firestore, "users", user.uid, "budgets", budgetId)
        : null,
    [user, firestore, budgetId, isTemplateMode],
  );

  const { data: budget, isLoading: budgetLoading } =
    useDoc<Budget>(budgetDocRef);

  const categoriesCollection = useMemoFirebase(
    () =>
      user && budgetId && !isTemplateMode
        ? collection(
            firestore,
            "users",
            user.uid,
            "budgets",
            budgetId,
            "categories",
          )
        : null,
    [user, firestore, budgetId, isTemplateMode],
  );

  const { data: fetchedCategories, isLoading: categoriesLoading } =
    useCollection<BudgetCategory>(categoriesCollection);

  const mustDosCollection = useMemoFirebase(
    () =>
      !isTemplateMode && user && budgetDocRef
        ? collection(budgetDocRef, "mustDos")
        : null,
    [isTemplateMode, user, budgetDocRef],
  );

  const mustDosQuery = useMemoFirebase(
    () =>
      mustDosCollection
        ? query(mustDosCollection, orderBy("createdAt", "desc"))
        : null,
    [mustDosCollection],
  );

  const { data: mustDos } = useCollection<MustDo>(mustDosQuery);

  const rsvpsCollection = useMemoFirebase(
    () =>
      !isTemplateMode && user && budgetDocRef
        ? collection(budgetDocRef, "rsvps")
        : null,
    [isTemplateMode, user, budgetDocRef],
  );

  const rsvpsQuery = useMemoFirebase(
    () =>
      rsvpsCollection
        ? query(rsvpsCollection, orderBy("respondedAt", "desc"))
        : null,
    [rsvpsCollection],
  );

  const { data: rsvps, isLoading: rsvpsLoading } =
    useCollection<RSVP>(rsvpsQuery);

  const eventType = isTemplateMode
    ? (searchParams.get("eventType") ?? undefined)
    : budget?.eventType;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const daysLeft = useMemo(() => {
    if (!budget?.eventDate) return null;
    const eventDate = new Date(budget.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const diffTime = eventDate.getTime() - today.getTime();
    if (diffTime < 0) return "Event has passed";
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today!";
    if (diffDays === 1) return "1 day";
    return `${diffDays} days`;
  }, [budget?.eventDate]);

  const mustDosCount = useMemo(() => {
    if (!mustDos) return { completed: 0, total: 0 };
    return {
      completed: mustDos.filter((item) => item.status === "done").length,
      total: mustDos.length,
    };
  }, [mustDos]);

  useEffect(() => {
    if (!isUserLoading && !user && !isTemplateMode) {
      router.push("/login");
    }
  }, [user, isUserLoading, router, isTemplateMode]);

  useEffect(() => {
    const initializePlan = async () => {
      if (isTemplateMode) {
        const eventType = searchParams.get("eventType") || "other";
        const template =
          budgetTemplates[eventType as keyof typeof budgetTemplates] ||
          budgetTemplates.other;
        const { categories, grandTotal } = calculateTotals(
          JSON.parse(JSON.stringify(template)),
        );
        setBudgetData(categories);
        setGrandTotal(grandTotal);
        return;
      }

      // If categories already exist in Firestore, use them
      if (
        user &&
        !user.isAnonymous &&
        fetchedCategories &&
        fetchedCategories.length > 0
      ) {
        const sortedCategories = [...fetchedCategories].sort(
          (a, b) => a.order - b.order,
        );
        const { categories, grandTotal } = calculateTotals(sortedCategories);
        setBudgetData(categories);
        setGrandTotal(grandTotal);
        return;
      }

      // Initialize from template if we have a real ID but no data yet in Firestore
      if (
        user &&
        !user.isAnonymous &&
        !budgetLoading &&
        !categoriesLoading &&
        (!fetchedCategories || fetchedCategories.length === 0)
      ) {
        const eventTypeFromParams = searchParams.get("eventType") || budget?.eventType || "other";
        const template =
          budgetTemplates[eventTypeFromParams as keyof typeof budgetTemplates] ||
          budgetTemplates.other;

        const { categories: templateCategories, grandTotal: initialTotal } =
          calculateTotals(JSON.parse(JSON.stringify(template)));

        const newBudget: Partial<Budget> = {
          id: budgetId,
          name: "",
          grandTotal: initialTotal,
          userId: user.uid,
          eventType: eventTypeFromParams,
          collaboratorIds: [],
          eventDate: "",
          eventLocation: "",
          expectedGuests: 0,
        };

        const budgetDocRef = doc(
          firestore,
          "users",
          user.uid,
          "budgets",
          budgetId,
        );
        
        // Initialize the budget document
        setDocumentNonBlocking(budgetDocRef, newBudget, { merge: true });

        // Batch set categories and sample must-dos
        const batch = writeBatch(firestore);
        templateCategories.forEach((category, index) => {
          const categoryRef = doc(collection(budgetDocRef, "categories"));
          const categoryData: BudgetCategory = {
            ...category,
            id: categoryRef.id,
            order: index,
            budgetId: budgetId,
          };
          batch.set(categoryRef, categoryData);
        });

        // Add some default Must-Do items
        const mustDoTemplate = [
          { title: "Confirm venue access time", note: "Key collection is with security", deadline: "" },
          { title: "Finalize guest list", note: "", deadline: "" },
        ];
        mustDoTemplate.forEach((item) => {
          const mustDoRef = doc(collection(budgetDocRef, "mustDos"));
          batch.set(mustDoRef, {
            ...item,
            budgetId: budgetId,
            userId: user.uid,
            status: "todo",
            priority: "medium",
            createdAt: serverTimestamp(),
            reminderType: "none",
            reminderDaysBefore: 1,
          });
        });

        batch.commit().catch(console.error);
        
        setBudgetData(templateCategories);
        setGrandTotal(initialTotal);
      }
    };

    initializePlan();
  }, [
    isTemplateMode,
    searchParams,
    user,
    isUserLoading,
    budget,
    budgetLoading,
    fetchedCategories,
    categoriesLoading,
    firestore,
    budgetId,
  ]);

  const updateStateAndTotals = (newBudgetData: BudgetCategory[]) => {
    const { categories, grandTotal } = calculateTotals(newBudgetData);
    setBudgetData(categories);
    setGrandTotal(grandTotal);
    if (budgetDocRef) {
      setDocumentNonBlocking(budgetDocRef, { grandTotal }, { merge: true });
    }
  };

  const handleItemChange = (
    categoryPath: string[],
    itemIndex: number,
    field: keyof BudgetItem,
    value: string | number,
  ) => {
    const updatedBudgetData = JSON.parse(JSON.stringify(budgetData));
    let currentLevel: BudgetCategory[] = updatedBudgetData;
    let categoryToUpdate: BudgetCategory | undefined;

    for (const id of categoryPath) {
      const foundCategory = currentLevel.find(
        (c: BudgetCategory) => c.id === id,
      );
      if (foundCategory) {
        categoryToUpdate = foundCategory;
        currentLevel = foundCategory.subCategories || [];
      }
    }

    if (categoryToUpdate) {
      const updatedItem = { ...categoryToUpdate.items[itemIndex] };
      if (field === "quantity" || field === "unitPrice") {
        updatedItem[field] = parseFloat(value as string) || 0;
      } else {
        (updatedItem[field] as any) = value;
      }
      categoryToUpdate.items[itemIndex] = updatedItem;

      if (!isTemplateMode && user && !user.isAnonymous && budgetId) {
        const rootCategoryId = categoryPath[0];
        const rootCategoryToUpdate = updatedBudgetData.find(
          (c) => c.id === rootCategoryId,
        );
        const categoryDocRef = doc(
          firestore,
          "users",
          user.uid,
          "budgets",
          budgetId,
          "categories",
          rootCategoryId,
        );
        if (rootCategoryToUpdate) {
          setDocumentNonBlocking(categoryDocRef, rootCategoryToUpdate, {
            merge: true,
          });
        }
      }
      updateStateAndTotals(updatedBudgetData);
    }
  };

  const handleAddItem = (categoryPath: string[]) => {
    const updatedBudgetData = JSON.parse(JSON.stringify(budgetData));
    let currentLevel: BudgetCategory[] = updatedBudgetData;
    let categoryToUpdate: BudgetCategory | undefined;

    for (const id of categoryPath) {
      const foundCategory = currentLevel.find(
        (c: BudgetCategory) => c.id === id,
      );
      if (foundCategory) {
        categoryToUpdate = foundCategory;
        currentLevel = foundCategory.subCategories || [];
      }
    }

    if (categoryToUpdate) {
      const newItem: BudgetItem = {
        id: `${categoryPath.join("-")}-item-${Date.now()}`,
        name: "",
        metric: "",
        quantity: 0,
        unitPrice: 0,
        total: 0,
        comment: "",
      };
      categoryToUpdate.items = [...(categoryToUpdate.items || []), newItem];

      if (!isTemplateMode && user && !user.isAnonymous && budgetId) {
        const rootCategoryId = categoryPath[0];
        const rootCategoryToUpdate = updatedBudgetData.find(
          (c) => c.id === rootCategoryId,
        );
        const categoryDocRef = doc(
          firestore,
          "users",
          user.uid,
          "budgets",
          budgetId,
          "categories",
          rootCategoryId,
        );
        if (rootCategoryToUpdate) {
          setDocumentNonBlocking(categoryDocRef, rootCategoryToUpdate, {
            merge: true,
          });
        }
      }
      updateStateAndTotals(updatedBudgetData);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setBudgetData((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over!.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        if (!isTemplateMode && user && !user.isAnonymous && budgetId) {
          const batch = writeBatch(firestore);
          newOrder.forEach((category, index) => {
            const docRef = doc(
              firestore,
              "users",
              user.uid,
              "budgets",
              budgetId,
              "categories",
              category.id,
            );
            batch.update(docRef, { order: index });
          });
          batch.commit().catch(console.error);
        }

        return newOrder;
      });
    }
  };

  if (
    isUserLoading ||
    (!isTemplateMode && (categoriesLoading || budgetLoading || rsvpsLoading)) ||
    budgetData.length === 0
  ) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col">
        <div className="bg-background shadow-2xl container mx-auto flex flex-col flex-grow">
          <PageHeader />
          <main className="container mx-auto px-4 flex-grow flex items-center justify-center">
             <RefreshCw className="h-10 w-10 animate-spin text-primary" />
          </main>
        </div>
      </div>
    );
  }

  // Show "Preview Mode" only for truly anonymous/guest users on the template path
  const showPreviewWarning = isTemplateMode && (!user || user.isAnonymous);

  return (
    <div className="min-h-screen w-full bg-secondary">
      <div className="bg-background shadow-2xl min-h-full container mx-auto flex flex-col">
        <PageHeader />
        <main className="container mx-auto px-4 flex-grow flex flex-col mb-16">
          <div className="w-full">
            <Greeter />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="flex flex-col">
              <EventDetails
                budget={budget}
                budgetRef={budgetDocRef}
                isBudgetLoading={budgetLoading}
                isTemplateMode={isTemplateMode}
                eventType={eventType}
              />
            </div>

            <div className="flex flex-col">
              <BudgetSummary
                grandTotal={grandTotal}
                daysLeft={daysLeft}
                mustDosTotal={mustDosCount.total}
                mustDosCompleted={mustDosCount.completed}
                budgetId={isTemplateMode ? undefined : budgetId}
                isTemplateMode={isTemplateMode}
              />
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Click on each category below to open shopping items and start
            creating your plan.
          </p>

          {showPreviewWarning && (
            <Card className="mt-4 bg-yellow-100 border-yellow-300">
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">
                      You are in Preview Mode
                    </h3>
                    <p className="text-xs text-yellow-800">
                      Your changes won't be saved.{" "}
                      <a href="/register" className="underline font-semibold">
                        Register now
                      </a>{" "}
                      to save your plan!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={budgetData}
                strategy={verticalListSortingStrategy}
              >
                <BudgetAccordion
                  categories={budgetData}
                  onItemChange={handleItemChange}
                  onAddItem={handleAddItem}
                />
              </SortableContext>
            </DndContext>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8 px-4 font-bold">
            All prices shown are estimates only. Actual costs may vary depending
            on location, supplier, availability, and personal preferences.
          </p>

          {!isTemplateMode && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <RsvpManager budgetId={budgetId} rsvps={rsvps} />
              <MustDosSummary budgetId={budgetId} mustDos={mustDos} />
              {budget && budgetDocRef && (
                <CollaboratorManager budget={budget} budgetRef={budgetDocRef} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
