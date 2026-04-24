
import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent } from "react";

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
  budgetId?: string;
}

export interface Collaborator {
  email: string;
  name: string;
  rights: 'read' | 'read/write';
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
  backgroundImageUrl?: string;
  collaborators?: Collaborator[];
  collaboratorEmails?: string[];
}

export interface User {
    id: string;
    email: string;
    displayName: string;
    knownAs?: string;
    photoURL?: string;
}

export interface MustDo {
  id: string;
  budgetId: string;
  userId: string;
  title: string;
  note?: string;
  status: 'todo' | 'done';
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  createdAt: any; // Firestore Timestamp
  reminderType: 'none' | 'email' | 'sms' | 'whatsapp';
  reminderDaysBefore: number;
}

export interface RSVP {
  id: string;
  budgetId: string;
  name: string;
  email: string;
  attending: 'yes' | 'no' | 'maybe';
  guests: number;
  dietaryRequirements?: string;
  createdAt: any; // Firestore Timestamp
}

export interface InviteToken {
  id: string;
  budgetId: string;
  budgetName: string;
  ownerId: string;
  createdAt: any;
  expiresAt: any;
  used: boolean;
  usedAt?: any;
  usedBy?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'collaborator_request' | 'collaborator_approved' | 'collaborator_rejected';
  budgetId: string;
  budgetName: string;
  inviteeName: string;
  inviteeContact: string;
  inviteeUid: string;
  token: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  read: boolean;
}
