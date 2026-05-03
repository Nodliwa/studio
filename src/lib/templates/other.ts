import type { BudgetCategory } from "../types";

export const otherBudgetData: BudgetCategory[] = [
  {
    id: "other-venue",
    name: "Venue",
    total: 0,
    order: 1,
    items: [
      { id: "other-venue-1", name: "Venue / Hall Hire", metric: "flat fee", quantity: 1, unitPrice: 5000, total: 0, comment: "", is_template: true },
      { id: "other-venue-2", name: "Tables & Chairs Hire", metric: "flat fee", quantity: 1, unitPrice: 1500, total: 0, comment: "", is_template: true },
      { id: "other-venue-3", name: "Tent / Marquee", metric: "flat fee", quantity: 1, unitPrice: 2500, total: 0, comment: "", is_template: true },
      { id: "other-venue-4", name: "Mobile Toilets", metric: "per unit", quantity: 2, unitPrice: 500, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "other-catering",
    name: "Catering",
    total: 0,
    order: 2,
    items: [
      { id: "other-catering-1", name: "Catering (braai / buffet)", metric: "flat fee", quantity: 1, unitPrice: 5000, total: 0, comment: "", is_template: true },
      { id: "other-catering-2", name: "Drinks & Refreshments", metric: "flat fee", quantity: 1, unitPrice: 2000, total: 0, comment: "", is_template: true },
      { id: "other-catering-3", name: "Desserts / Cake", metric: "flat fee", quantity: 1, unitPrice: 800, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "other-photography",
    name: "Photography",
    total: 0,
    order: 3,
    items: [
      { id: "other-photography-1", name: "Photographer", metric: "per event", quantity: 1, unitPrice: 3000, total: 0, comment: "", is_template: true },
      { id: "other-photography-2", name: "Videographer", metric: "per event", quantity: 1, unitPrice: 2500, total: 0, comment: "", is_template: true },
      { id: "other-photography-3", name: "Photo Booth", metric: "per event", quantity: 1, unitPrice: 1500, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "other-decor",
    name: "Décor & Setup",
    total: 0,
    order: 4,
    items: [
      { id: "other-decor-1", name: "Balloons & Decorations", metric: "flat fee", quantity: 1, unitPrice: 600, total: 0, comment: "", is_template: true },
      { id: "other-decor-2", name: "Table Centrepieces", metric: "per table", quantity: 5, unitPrice: 150, total: 0, comment: "", is_template: true },
      { id: "other-decor-3", name: "Backdrop / Draping", metric: "flat fee", quantity: 1, unitPrice: 900, total: 0, comment: "", is_template: true },
      { id: "other-decor-4", name: "Lighting", metric: "flat fee", quantity: 1, unitPrice: 700, total: 0, comment: "", is_template: true },
    ],
  },
];
