import type { Timestamp } from "firebase/firestore";

export type PricingType = "starting" | "actual" | "average" | "custom_quote";
export type OpportunityStrength = "high" | "medium" | "low";
export type OpportunityStatus = "active" | "expired";
export type SupplierStatus = "active" | "suspended";
export type CreditReason = "signup_bonus" | "opportunity_unlock" | "top_up" | "admin_adjustment";
export type SupplierNotificationType = "opportunity_viewed" | "new_opportunity" | "system" | "opportunity_cancelled";

export interface ServiceOffering {
  serviceId: string;
  name: string;
  pricingType: PricingType;
  price: number | null;
  customQuoteAvailable: boolean;
  status?: "active" | "paused";
  startingPrice?: number;
  averagePrice?: number;
}

export interface Supplier {
  uid: string;
  tradingAs: string;
  contactPerson: string;
  mobileNumber: string;
  email?: string;
  services: ServiceOffering[];
  cityRegion: string;
  cityPlaceId: string;
  areasServed: string;
  shortDescription: string;
  instagram: string;
  facebook: string;
  website: string;
  yearsInBusiness: number | null;
  photoUrls: string[];
  credits: number;
  profileCompletionPct: number;
  status: SupplierStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UnlockFeedback {
  type: "legit" | "junk" | null;
  rating: number | null;
  comment: string | null;
  submittedAt: Timestamp | null;
}

export interface UnlockRecord {
  unlockedAt: Timestamp;
  creditsUsed: number;
  notified: boolean;
  feedback: UnlockFeedback | null;
}

export interface SupplierOpportunity {
  id: string;
  serviceType: string;
  city: string;
  location: string;
  eventDate: Timestamp;
  budgetMin: number;
  budgetMax: number;
  opportunityStrength: OpportunityStrength;
  creditCost: number;
  status: OpportunityStatus;
  targetedSupplierIds: string[];
  unlockedBy: Record<string, UnlockRecord>;
  plannerId: string | null;
  plannerName: string | null;
  plannerPhone: string | null;
  createdAt: Timestamp;
}

export interface SupplierCredit {
  supplierId: string;
  type: "credit" | "debit";
  amount: number;
  reason: CreditReason;
  opportunityId: string | null;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Timestamp;
}

export interface SupplierNotification {
  supplierId: string;
  type: SupplierNotificationType;
  title: string;
  message: string;
  opportunityId: string | null;
  read: boolean;
  createdAt: Timestamp;
}

export interface SupplierLead {
  id: string;
  planId: string;
  plannerId: string;
  itemId: string;
  itemName: string;
  mappedCategory: string;
  eventType: string;
  eventDate?: string;
  location: string;
  locationPlaceId?: string;
  budgetMin: number;
  budgetMax: number;
  notes: string;
  contactPreference: 'share_details' | 'profile_first' | 'both';
  status: 'open' | 'closed' | 'expired' | 'unmatched';
  matchedSupplierCount: number;
  unlockedBy: string[];
  createdAt: any;
  expiresAt: any;
  closedAt?: any;
  requestCount: number;
}
