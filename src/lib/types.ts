
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
  id:string;
  name: string;
  icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref">>;
  items: BudgetItem[];
  subCategories?: BudgetCategory[];
  total: number;
  order: number;
}

export interface Budget {
  id:string;
  name: string;
  eventLocation?: string;
  expectedGuests?: number;
  eventType?: string;
  eventDate?: string;
  grandTotal: number;
  userId: string;
}

export interface User {
    id: string;
    email: string;
    displayName: string;
    cellphone?: string;
}

export const ImportanceLevels = {
  none: { label: 'None', color: '' },
  important: { label: 'Important', color: 'text-blue-500' },
  critical: { label: 'Critical', color: 'text-red-500' },
};

export type Importance = keyof typeof ImportanceLevels;

export interface MustDo {
  id: string;
  budgetId: string;
  userId: string;
  title: string;
  note?: string;
  status: 'todo' | 'done';
  importance: Importance;
  deadline?: string; // Replaces timing
  createdAt: any; // Firestore Timestamp
  reminderEnabled: boolean;
  reminderDaysBefore: number;
}
    