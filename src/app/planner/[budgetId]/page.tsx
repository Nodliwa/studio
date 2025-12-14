

"use client";

import { useState, useEffect, useId, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { BudgetItem, BudgetCategory } from "@/lib/types";
import { budgetTemplates } from "@/lib/data";
import PageHeader from "@/components/page-header";
import { BudgetAccordion } from "@/components/budget-accordion";
import { BudgetSummary } from "@/components/budget-summary";
import { EventDetails } from "@/components/event-details";
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase, initiateAnonymousSignIn, setDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
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
  const [isNewPlan, setIsNewPlan] = useState(false);

  const budgetDocRef = useMemoFirebase(() => (
    user && budgetId && !isTemplateMode ? doc(firestore, 'users', user.uid, 'budgets', budgetId) : null
  ), [user, firestore, budgetId, isTemplateMode]);

  const { data: budget, isLoading: budgetLoading } = useDoc(budgetDocRef);

  const categoriesCollection = useMemoFirebase(() => (
    user && budgetId && !isTemplateMode ? collection(firestore, 'users', user.uid, 'budgets', budgetId, 'categories') : null
  ), [user, firestore, budgetId, isTemplateMode]);

  const { data: fetchedCategories, isLoading: categoriesLoading } = useCollection<BudgetCategory>(categoriesCollection);

  const eventType = isTemplateMode ? searchParams.get('eventType') : budget?.eventType;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  useEffect(() => {
    // Check if it's a new plan when the budget data loads
    if (!budgetLoading && budget && !budget.eventDate) {
        setIsNewPlan(true);
    } else if (!budgetLoading && budget) {
        setIsNewPlan(false);
    }
  }, [budget, budgetLoading]);


  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  useEffect(() => {
      if (isTemplateMode) {
          const eventType = searchParams.get('eventType') || 'other';
          const template = budgetTemplates[eventType as keyof typeof budgetTemplates] || budgetTemplates.other;
          const { categories, grandTotal } = calculateTotals(JSON.parse(JSON.stringify(template)));
          setBudgetData(categories);
          setGrandTotal(grandTotal);
      } else if (user && !user.isAnonymous && budgetId && !budgetLoading) {
          // If it's a new plan, load from template first
          if (isNewPlan && (!fetchedCategories || fetchedCategories.length === 0)) {
              const eventType = budget?.eventType || searchParams.get('eventType') || 'other';
              const initialData = budgetTemplates[eventType as keyof typeof budgetTemplates] || budgetTemplates.other;
              const { categories: calculatedCategories, grandTotal: calculatedTotal } = calculateTotals(JSON.parse(JSON.stringify(initialData)));
              setBudgetData(calculatedCategories);
              setGrandTotal(calculatedTotal);
              
              // Then, save this to Firestore
              const batch = writeBatch(firestore);
              initialData.forEach((category, index) => {
                  const seededCategoryRef = doc(firestore, 'users', user.uid, 'budgets', budgetId, 'categories', category.id);
                  batch.set(seededCategoryRef, { ...category, order: index });
              });
              batch.commit();
          }
          // If categories are fetched from Firestore, use them
          else if (fetchedCategories && fetchedCategories.length > 0 && !categoriesLoading) {
              const sortedCategories = [...fetchedCategories].sort((a, b) => a.order - b.order);
              const { categories, grandTotal } = calculateTotals(sortedCategories);
              setBudgetData(categories);
              setGrandTotal(grandTotal);
          }
      }
  }, [isTemplateMode, searchParams, fetchedCategories, categoriesLoading, budgetLoading, user, firestore, budgetId, budget, isNewPlan]);

  useEffect(() => {
    if (eventType === 'funeral') {
      const randomIndex = Math.floor(Math.random() * funeralQuotes.length);
      setEventQuote(funeralQuotes[randomIndex]);
    } else if (eventType === 'wedding') {
      const randomIndex = Math.floor(Math.random() * weddingQuotes.length);
      setEventQuote(weddingQuotes[randomIndex]);
    }
  }, [eventType]);

  useEffect(() => {
    // If in template mode and a registered user logs in, redirect them.
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
    let parentCategory: BudgetCategory | undefined;

    for (const id of categoryPath) {
        const foundCategory = currentLevel.find(c => c.id === id);
        if (foundCategory) {
            parentCategory = categoryToUpdate;
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
  
  if (isUserLoading || (!isTemplateMode && (categoriesLoading || budgetLoading) && !isNewPlan) || budgetData.length === 0) {
    return (
        <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  // A registered user landed on a template page, they should be on their own plans.
  // Wait until loading is done to make this check.
  if (!isUserLoading && isTemplateMode && user && !user.isAnonymous) {
    return <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center"><p>Redirecting...</p></div>;
  }
  
  return (
    <div className="min-h-screen w-full bg-secondary p-4 md:p-8">
      <div className="bg-background shadow-2xl min-h-full rounded-lg container mx-auto">
        <PageHeader />
        <main className="mx-auto px-4">
          <Greeter />
          {eventQuote && (
              <p className="mt-4 text-lg italic text-muted-foreground">{eventQuote}</p>
          )}

          {isTemplateMode && (
            <Card className="mt-4 mb-8 bg-yellow-100 border-yellow-300">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 mt-8">
            <div className="lg:col-span-3 mb-8">
              <EventDetails budget={budget} budgetRef={budgetDocRef} isTemplateMode={isTemplateMode} />
            </div>

            <div className="lg:col-span-3 mb-8">
              <BudgetSummary 
                categories={budgetData}
                grandTotal={grandTotal}
              />
            </div>
            <div className="lg:col-span-3">
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
          </div>
        </main>
      </div>
    </div>
  );
}
