
"use client";

import { useState, useMemo, useEffect, useId } from 'react';
import type { BudgetItem, BudgetCategory } from "@/lib/types";
import { initialBudgetData } from "@/lib/data";
import PageHeader from "@/components/page-header";
import { BudgetAccordion } from "@/components/budget-accordion";
import { BudgetSummary } from "@/components/budget-summary";
import { UtensilsCrossed } from "lucide-react";
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase, initiateAnonymousSignIn, setDocumentNonBlocking } from '@/firebase';
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

export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [budgetData, setBudgetData] = useState<BudgetCategory[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const uniqueId = useId();

  const categoriesCollection = useMemoFirebase(() => (
    user ? collection(firestore, 'users', user.uid, 'categories') : null
  ), [user, firestore]);

  const { data: fetchedCategories, isLoading: categoriesLoading } = useCollection<BudgetCategory>(categoriesCollection);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, auth]);
  
  useEffect(() => {
    if (fetchedCategories) {
        const sortedCategories = [...fetchedCategories].sort((a, b) => a.order - b.order);
        let newGrandTotal = 0;

        const categoriesWithTotals = sortedCategories.map(category => {
            let categoryTotal = 0;
            const items = category.items || [];
            const itemsWithTotals = items.map(item => {
                const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
                categoryTotal += itemTotal;
                return { ...item, total: itemTotal };
            });
            category.items = itemsWithTotals;
            category.total = categoryTotal;
            newGrandTotal += categoryTotal;
            return category;
        });

        setBudgetData(categoriesWithTotals);
        setGrandTotal(newGrandTotal);
    } else if (!categoriesLoading && user && fetchedCategories === null) {
      const batch = writeBatch(firestore);
      initialBudgetData.forEach((category, index) => {
        const categoryDocRef = doc(firestore, 'users', user.uid, 'categories', category.id);
        batch.set(categoryDocRef, { ...category, icon: null, order: index });
      });
      batch.commit();
    }
}, [fetchedCategories, categoriesLoading, user, firestore]);


  const handleItemChange = (
    categoryPath: string[],
    itemIndex: number,
    field: keyof BudgetItem,
    value: string | number
  ) => {
    if (!user) return;
  
    const categoryId = categoryPath[0];
    const categoryDocRef = doc(firestore, 'users', user.uid, 'categories', categoryId);
  
    const updatedBudgetData = budgetData.map(cat => {
      if (cat.id === categoryId) {
        const newItems = [...cat.items];
        const updatedItem = { ...newItems[itemIndex] };
  
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem[field] = parseFloat(value as string) || 0;
        } else {
          (updatedItem[field] as any) = value;
        }
  
        newItems[itemIndex] = updatedItem;
        setDocumentNonBlocking(categoryDocRef, { ...cat, items: newItems }, { merge: true });
        return { ...cat, items: newItems };
      }
      return cat;
    });
    setBudgetData(updatedBudgetData);
  };
  
  const handleAddItem = (categoryPath: string[]) => {
    if (!user) return;
    
    const categoryId = categoryPath[0];
    const categoryDocRef = doc(firestore, 'users', user.uid, 'categories', categoryId);
    
    const category = budgetData.find(cat => cat.id === categoryId);
  
    if (category) {
      const newItem: BudgetItem = {
        id: `${categoryPath.join('-')}-item-${uniqueId}`,
        name: "",
        metric: "",
        quantity: 0,
        unitPrice: 0,
        total: 0,
        comment: "",
      };
  
      const newItems = [...(category.items || []), newItem];
      setDocumentNonBlocking(categoryDocRef, { ...category, items: newItems }, { merge: true });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setBudgetData((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over!.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Update order in Firestore
        if (user) {
          const batch = writeBatch(firestore);
          newOrder.forEach((category, index) => {
            const docRef = doc(firestore, 'users', user.uid, 'categories', category.id);
            batch.update(docRef, { order: index });
          });
          batch.commit();
        }
        
        return newOrder;
      });
    }
  };
  
  if (isUserLoading || categoriesLoading) {
    return (
        <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background font-sans text-foreground">
      <PageHeader />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
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
  );
}
