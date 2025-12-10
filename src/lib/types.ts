
import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

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
  icon: LucideIcon | ComponentType<any>;
  items: BudgetItem[];
  subCategories?: BudgetCategory[];
  total: number;
}
