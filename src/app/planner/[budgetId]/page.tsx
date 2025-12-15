
"use client";

import { useState, useEffect, useId, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { BudgetItem, BudgetCategory, Budget, MustDo } from "@/lib/types";
import { budgetTemplates } from "@/lib/data";
import PageHeader from "@/components/page-header";
import { BudgetAccordion } from "@/components/budget-accordion";
import { BudgetSummary } from "@/components/budget-summary";
import { EventDetails } from "@/components/event-details";
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase, initiateAnonymousSignIn, setDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, doc, writeBatch, setDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import Greeter from '@/components/greeter';
import { Card, CardContent } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid';

const funeralQuotes = [
    '"Blessed are those who mourn, for they will be comforted." - Matthew 5:4',
    '"The Lord is close to the brokenhearted and saves those who are crushed in spirit." - Psalm 34:18',
    '"Grief is the price we pay for love." - Queen Elizabeth II',
    '"What is lovely never dies, but passes into other loveliness." - Thomas Bailey Aldrich',
    '"To live in hearts we leave behind is not to die." - Thomas Campbell',
];

const weddingQuotes = [
    '"A successful marriage requires falling in love many times, always with the same person." - Mignon McLaughlin',
    '"The best thing to hold onto in life is each other." - Audrey Hepburn',
    '"Love doesnt make the world go round. Love is what makes the ride worthwhile." - Franklin P. Jones',
    '"To love and be loved is to feel the sun from both sides." - David Viscott',
    '"A great marriage is not when the perfect couple comes together. It is when an imperfect couple learns to enjoy their differences." - Dave Meurer',
];


function calculateTotals(categories: BudgetCategory[]): { categories: BudgetCategory[], grandTotal: number } {
  let newGrandTotal = 0;
  const categoriesWithTotals = categories.map(category => {
    let categoryTotal = 0;
    const items = category.items || [];
    const itemsWithTotals = items.map(item => {
      const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
      categoryTotal += itemTotal;
      return { ...item, total: itemTotal };
    });
    const subCategories = category.subCategories ? calculateTotals(category.subCategories).categories : [];
    const subCategoriesTotal = subCategories.reduce((acc, sub) => acc + sub.total, 0);

    category.items = itemsWithTotals;
    category.total = categoryTotal + subCategoriesTotal;
    newGrandTotal += category.total;
    return { ...category, subCategories };
  });
  return { categories: categoriesWithTotals, grandTotal: newGrandTotal };
}

export default function PlannerPage({ params: { budgetId } }: { params: { budgetId: string } }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [budgetData, setBudgetData] = useState<BudgetCategory[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [eventQuote, setEventQuote] = useState('');
  const uniqueId = useId();
  const isTemplateMode = budgetId === 'template';
  
  const budgetDocRef = useMemoFirebase(() => (
    user && budgetId && !isTemplateMode ? doc(firestore, 'users', user.uid, 'budgets', budgetId) : null
  ), [user, firestore, budgetId, isTemplateMode]);

  const { data: budget, isLoading: budgetLoading } = useDoc<Budget>(budgetDocRef);

  const categoriesCollection = useMemoFirebase(() => (
    user && budgetId && !isTemplateMode ? collection(firestore, 'users', user.uid, 'budgets', budgetId, 'categories') : null
  ), [user, firestore, budgetId, isTemplateMode]);

  const { data: fetchedCategories, isLoading: categoriesLoading } = useCollection<BudgetCategory>(categoriesCollection);

  const mustDosCollection = useMemoFirebase(() => (
    !isTemplateMode && user && budgetDocRef ? collection(budgetDocRef, 'mustDos') : null
  ), [isTemplateMode, user, budgetDocRef]);

  const mustDosQuery = useMemoFirebase(() => (
    mustDosCollection ? query(mustDosCollection, orderBy('createdAt', 'desc')) : null
  ), [mustDosCollection]);

  const { data: mustDos } = useCollection<MustDo>(mustDosQuery);

  const eventType = isTemplateMode ? searchParams.get('eventType') : budget?.eventType;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const daysLeft = useMemo(() => {
    if (!budget?.eventDate) return null;
    const eventDate = new Date(budget.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date
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
      completed: mustDos.filter(item => item.status === 'done').length,
      total: mustDos.length,
    };
  }, [mustDos]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  useEffect(() => {
    const initializePlan = async () => {
      // Case 1: Template mode for anonymous users
      if (isTemplateMode) {
        const eventType = searchParams.get('eventType') || 'other';
        const template = budgetTemplates[eventType as keyof typeof budgetTemplates] || budgetTemplates.other;
        const { categories, grandTotal } = calculateTotals(JSON.parse(JSON.stringify(template)));
        setBudgetData(categories);
        setGrandTotal(grandTotal);
        return;
      }
  
      // Case 2: Logged-in user, loading an existing plan from Firestore
      if (user && !user.isAnonymous && fetchedCategories && fetchedCategories.length > 0) {
        const sortedCategories = [...fetchedCategories].sort((a, b) => a.order - b.order);
        const { categories, grandTotal } = calculateTotals(sortedCategories);
        setBudgetData(categories);
        setGrandTotal(grandTotal);
        return;
      }

      // Case 3: Logged-in user, creating a NEW plan from a template
      // This runs when budget is loaded, but categories are not.
      if (user && !user.isAnonymous && budget && !categoriesLoading && (!fetchedCategories || fetchedCategories.length === 0)) {
        const eventType = searchParams.get('eventType') || budget?.eventType || 'other';
        const template = budgetTemplates[eventType as keyof typeof budgetTemplates] || budgetTemplates.other;
        
        const newBudgetId = budgetId;
        const { categories: templateCategories, grandTotal: initialTotal } = calculateTotals(JSON.parse(JSON.stringify(template)));
        
        const newBudget: Partial<Budget> = {
          name: "My Celebration Plan",
          grandTotal: initialTotal,
          userId: user.uid,
          eventType: eventType,
        };

        // Update the budget document with template-derived info
        const budgetDocRef = doc(firestore, 'users', user.uid, 'budgets', newBudgetId);
        await setDoc(budgetDocRef, newBudget, { merge: true });

        // Batch write all categories and their items from the template
        const batch = writeBatch(firestore);
        templateCategories.forEach((category, index) => {
          const categoryRef = doc(collection(budgetDocRef, 'categories'));
          const categoryData: BudgetCategory = {
            ...category,
            id: categoryRef.id, // Use the new generated ID
            order: index,
            budgetId: newBudgetId,
          };
          batch.set(categoryRef, categoryData);
          
           if (!mustDos || mustDos.length === 0) {
                const mustDoTemplate = [
                    { title: 'Confirm venue access time', note: 'Key collection is with security', importance: 'important', timing: 'before-event' },
                    { title: 'Pick up decorations', note: '', importance: 'none', timing: 'on-the-day' }
                ];
                mustDoTemplate.forEach(item => {
                    const mustDoRef = doc(collection(budgetDocRef, 'mustDos'));
                    batch.set(mustDoRef, {
                        ...item,
                        budgetId: newBudgetId,
                        userId: user.uid,
                        status: 'todo',
                        createdAt: serverTimestamp()
                    });
                });
            }
        });
        await batch.commit();
        
        // The useCollection hook will now fetch the newly created categories,
        // triggering the "Existing Plan" block on the next render.
        // For immediate UI update, we can set it here as well.
        setBudgetData(templateCategories);
        setGrandTotal(initialTotal);
      }
    };
  
    initializePlan();
  }, [isTemplateMode, searchParams, user, isUserLoading, budget, budgetLoading, fetchedCategories, categoriesLoading, firestore, budgetId, auth, router, mustDos]);

  useEffect(() => {
    if (eventType === 'funeral') {
        setEventQuote(funeralQuotes[Math.floor(Math.random() * funeralQuotes.length)]);
    } else if (eventType === 'wedding') {
        setEventQuote(weddingQuotes[Math.floor(Math.random() * weddingQuotes.length)]);
    }
  }, [eventType]);

  useEffect(() => {
    if (!isUserLoading && isTemplateMode && user && !user.isAnonymous) {
      router.push('/my-plans');
    }
  }, [isUserLoading, isTemplateMode, user, router]);

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
    value: string | number
  ) => {
    const updatedBudgetData = JSON.parse(JSON.stringify(budgetData));
    let currentLevel = updatedBudgetData;
    let categoryToUpdate: BudgetCategory | undefined;

    for (const id of categoryPath) {
        const foundCategory = currentLevel.find(c => c.id === id);
        if (foundCategory) {
            categoryToUpdate = foundCategory;
            currentLevel = foundCategory.subCategories || [];
        }
    }

    if (categoryToUpdate) {
        const updatedItem = { ...categoryToUpdate.items[itemIndex] };
        if (field === 'quantity' || field === 'unitPrice') {
            updatedItem[field] = parseFloat(value as string) || 0;
        } else {
            (updatedItem[field] as any) = value;
        }
        categoryToUpdate.items[itemIndex] = updatedItem;

        if (!isTemplateMode && user && !user.isAnonymous && budgetId) {
             const rootCategoryId = categoryPath[0];
             const rootCategoryToUpdate = updatedBudgetData.find(c => c.id === rootCategoryId);
             const categoryDocRef = doc(firestore, 'users', user.uid, 'budgets', budgetId, 'categories', rootCategoryId);
             if (rootCategoryToUpdate) {
                setDocumentNonBlocking(categoryDocRef, rootCategoryToUpdate, { merge: true });
             }
        }
        updateStateAndTotals(updatedBudgetData);
    }
  };
  
  const handleAddItem = (categoryPath: string[]) => {
    const updatedBudgetData = JSON.parse(JSON.stringify(budgetData));
    let currentLevel = updatedBudgetData;
    let categoryToUpdate: BudgetCategory | undefined;

    for (const id of categoryPath) {
        const foundCategory = currentLevel.find(c => c.id === id);
        if (foundCategory) {
            categoryToUpdate = foundCategory;
            currentLevel = foundCategory.subCategories || [];
        }
    }

    if (categoryToUpdate) {
        const newItem: BudgetItem = {
            id: `${categoryPath.join('-')}-item-${Date.now()}`,
            name: "", metric: "", quantity: 0, unitPrice: 0, total: 0, comment: "",
        };
        categoryToUpdate.items = [...(categoryToUpdate.items || []), newItem];

        if (!isTemplateMode && user && !user.isAnonymous && budgetId) {
            const rootCategoryId = categoryPath[0];
            const rootCategoryToUpdate = updatedBudgetData.find(c => c.id === rootCategoryId);
            const categoryDocRef = doc(firestore, 'users', user.uid, 'budgets', budgetId, 'categories', rootCategoryId);
            if(rootCategoryToUpdate) {
                setDocumentNonBlocking(categoryDocRef, rootCategoryToUpdate, { merge: true });
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
            const docRef = doc(firestore, 'users', user.uid, 'budgets', budgetId, 'categories', category.id);
            batch.update(docRef, { order: index });
          });
          batch.commit();
        }
        
        return newOrder;
      });
    }
  };

  if (isUserLoading || (!isTemplateMode && (categoriesLoading || budgetLoading)) || budgetData.length === 0) {
    return (
        <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  if (!isUserLoading && isTemplateMode && user && !user.isAnonymous) {
    return <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center"><p>Redirecting...</p></div>;
  }
  
  return (
    <div className="min-h-screen w-full bg-secondary">
       <div className="bg-background shadow-2xl min-h-full container mx-auto flex flex-col">
        <PageHeader />
        <main className="container mx-auto px-4 flex-grow flex flex-col mb-16">
          <div className="w-full">
            <Greeter quote={eventQuote} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 mt-8">
            <div className="space-y-8">
              <EventDetails budget={budget} budgetRef={budgetDocRef} isTemplateMode={isTemplateMode} />
            </div>

            <div className="space-y-8">
               <BudgetSummary 
                grandTotal={grandTotal}
                daysLeft={daysLeft}
                mustDosTotal={mustDosCount.total}
                mustDosCompleted={mustDosCount.completed}
              />
            </div>
          </div>
           <p className="text-center text-sm text-muted-foreground mt-8">
            Click on each category below to open shopping items and start creating your plan.
          </p>

           <div className="mt-8">
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
          
          {isTemplateMode && (
            <Card className="mt-8 mb-8 bg-yellow-100 border-yellow-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">You are in Preview Mode</h3>
                    <p className="text-sm text-yellow-800">Your changes won't be saved. <a href="/register" className="underline font-semibold">Register now</a> to save your plan!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </main>
      </div>
    </div>
  );
}
