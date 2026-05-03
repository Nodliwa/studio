import { budgetTemplates } from "./templates";
import type { BudgetCategory } from "./types";

function extractItemNames(categories: BudgetCategory[]): string[] {
  const names: string[] = [];
  for (const cat of categories) {
    for (const item of cat.items) {
      if (item.name) names.push(item.name);
    }
    if (cat.subCategories) {
      names.push(...extractItemNames(cat.subCategories));
    }
  }
  return names;
}

// Derived from all budget templates in data.ts — stays in sync automatically.
export function getServiceSuggestions(): string[] {
  const allNames: string[] = [];
  for (const template of Object.values(budgetTemplates)) {
    allNames.push(...extractItemNames(template));
  }
  return Array.from(new Set(allNames)).sort((a, b) => a.localeCompare(b));
}
