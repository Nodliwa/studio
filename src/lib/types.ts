
import type { LucideProps } from "lucide-react";
import type { ComponentType, ForwardRefExoticComponent } from "react";

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
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref">>;
  items: BudgetItem[];
  subCategories?: BudgetCategory[];
  total: number;
  order: number;
}

export interface Budget {
  id: string;
  name: string;
  eventDate?: string;
  eventLocation?: string;
  expectedGuests?: number;
  eventType?: string;
  grandTotal: number;
  userId: string;
}
