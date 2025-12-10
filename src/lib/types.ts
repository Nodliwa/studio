import type { LucideIcon } from "lucide-react";

export interface BudgetItem {
  id: string;
  name: string;
  metric: string;
  quantity: number;
  unitPrice: number;
  total: number;
  comment: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  items: BudgetItem[];
  subCategories?: BudgetCategory[];
  total: number;
}
