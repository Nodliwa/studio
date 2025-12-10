
"use client";

import { useState, useMemo, useId } from "react";
import type { BudgetItem, BudgetCategory } from "@/lib/types";
import { initialBudgetData } from "@/lib/data";
import PageHeader from "@/components/page-header";
import { BudgetAccordion } from "@/components/budget-accordion";
import { BudgetSummary } from "@/components/budget-summary";
import { UtensilsCrossed } from "lucide-react";

export default function Home() {
  const [budgetData, setBudgetData] = useState<BudgetCategory[]>(initialBudgetData);
  const uniqueId = useId();

  const handleItemChange = (
    categoryPath: number[],
    itemIndex: number,
    field: keyof BudgetItem,
    value: string | number
  ) => {
    setBudgetData((prevData) => {
      const newData = JSON.parse(JSON.stringify(prevData));
      
      let currentCategoryLevel = newData;
      let categoryToUpdate: BudgetCategory | undefined;

      for (let i = 0; i < categoryPath.length; i++) {
        const index = categoryPath[i];
        if (i === categoryPath.length - 1) {
          categoryToUpdate = currentCategoryLevel[index];
        } else {
          currentCategoryLevel = currentCategoryLevel[index].subCategories!;
        }
      }

      if (categoryToUpdate && categoryToUpdate.items[itemIndex]) {
        const item = categoryToUpdate.items[itemIndex];
        (item[field] as any) =
          typeof item[field] === "number" ? parseFloat(value as string) || 0 : value;
      }
      return newData;
    });
  };

  const handleAddItem = (categoryPath: number[]) => {
    setBudgetData((prevData) => {
      const newData = [...prevData];
  
      let currentCategoryLevel = newData;
      let categoryToUpdate: BudgetCategory | undefined;
  
      let parentCategory: BudgetCategory | undefined;
      for (const index of categoryPath) {
        parentCategory = currentCategoryLevel[index];
        if (parentCategory.subCategories) {
          currentCategoryLevel = parentCategory.subCategories;
        } else {
          currentCategoryLevel = [];
        }
      }
      categoryToUpdate = parentCategory;
  
      if (categoryToUpdate) {
        const newItem: BudgetItem = {
          id: `item-${uniqueId}-${categoryPath.join('-')}-${Date.now()}`,
          name: "",
          metric: "",
          quantity: 0,
          unitPrice: 0,
          total: 0,
          comment: "",
        };
        if (!categoryToUpdate.items) {
          categoryToUpdate.items = [];
        }
        categoryToUpdate.items.push(newItem);
      }
      
      return newData.map(cat => ({
        ...cat,
        icon: cat.icon || UtensilsCrossed
      }));
    });
  };

  const processedData = useMemo(() => {
    let grandTotal = 0;

    const processCategory = (category: BudgetCategory): BudgetCategory => {
      let categoryTotal = 0;

      const itemsWithTotals = category.items.map((item) => {
        const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
        categoryTotal += itemTotal;
        return { ...item, total: itemTotal };
      });

      if (category.subCategories && category.subCategories.length > 0) {
        const processedSubCategories = category.subCategories.map(processCategory);
        categoryTotal += processedSubCategories.reduce((acc, sub) => acc + sub.total, 0);
        return {
          ...category,
          items: itemsWithTotals,
          subCategories: processedSubCategories,
          total: categoryTotal,
        };
      }
      
      return { ...category, items: itemsWithTotals, total: categoryTotal };
    };

    const categoriesWithTotals = budgetData.map(category => {
      const processed = processCategory(category);
      grandTotal += processed.total;
      return processed;
    });

    return { categories: categoriesWithTotals, grandTotal };
  }, [budgetData]);

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <PageHeader />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-3 mb-8">
            <BudgetSummary 
              categories={processedData.categories}
              grandTotal={processedData.grandTotal}
            />
          </div>
          <div className="lg:col-span-3">
            <BudgetAccordion 
              categories={processedData.categories}
              onItemChange={handleItemChange}
              onAddItem={handleAddItem}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
