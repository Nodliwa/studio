import type { BudgetCategory } from "../types";

export const birthdaySeniorBudgetData: BudgetCategory[] = [
  {
    id: "bs-venue",
    name: "Venue",
    total: 0,
    order: 1,
    items: [
      { id: "birthday_senior-venue-1", name: "Venue / Restaurant Hire", metric: "flat fee", quantity: 1, unitPrice: 5000, total: 0, comment: "", is_template: true },
      { id: "birthday_senior-venue-2", name: "Tables & Chairs Hire", metric: "flat fee", quantity: 1, unitPrice: 2000, total: 0, comment: "", is_template: true },
      { id: "birthday_senior-venue-3", name: "Linens & Draping", metric: "flat fee", quantity: 1, unitPrice: 1500, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "bs-catering",
    name: "Catering",
    total: 0,
    order: 2,
    items: [],
    subCategories: [
      {
        id: "bs-cat-starters",
        name: "Starters",
        total: 0,
        order: 1,
        items: [
          { id: "birthday_senior-starters-1", name: "Soup", metric: "per serving", quantity: 40, unitPrice: 45, total: 0, comment: "", is_template: true },
          { id: "birthday_senior-starters-2", name: "Salad", metric: "per kg", quantity: 5, unitPrice: 60, total: 0, comment: "", is_template: true },
        ],
      },
      {
        id: "bs-cat-mains",
        name: "Main Course",
        total: 0,
        order: 2,
        items: [
          { id: "birthday_senior-mains-1", name: "Chicken (plated)", metric: "per serving", quantity: 40, unitPrice: 90, total: 0, comment: "", is_template: true },
          { id: "birthday_senior-mains-2", name: "Beef / Lamb", metric: "per serving", quantity: 40, unitPrice: 140, total: 0, comment: "", is_template: true },
          { id: "birthday_senior-mains-3", name: "Vegetarian Option", metric: "per serving", quantity: 10, unitPrice: 70, total: 0, comment: "", is_template: true },
          { id: "birthday_senior-mains-4", name: "Side Dishes", metric: "flat fee", quantity: 1, unitPrice: 1200, total: 0, comment: "", is_template: true },
        ],
      },
      {
        id: "bs-cat-desserts",
        name: "Desserts",
        total: 0,
        order: 3,
        items: [
          { id: "birthday_senior-desserts-1", name: "Birthday Cake (elegant)", metric: "item", quantity: 1, unitPrice: 1200, total: 0, comment: "", is_template: true },
          { id: "birthday_senior-desserts-2", name: "Dessert Platter", metric: "per person", quantity: 40, unitPrice: 45, total: 0, comment: "", is_template: true },
        ],
      },
      {
        id: "bs-cat-drinks",
        name: "Drinks",
        total: 0,
        order: 4,
        items: [
          { id: "birthday_senior-drinks-1", name: "Wine (750ml)", metric: "per bottle", quantity: 6, unitPrice: 150, total: 0, comment: "", is_template: true },
          { id: "birthday_senior-drinks-2", name: "Sparkling Water (750ml)", metric: "per bottle", quantity: 20, unitPrice: 18, total: 0, comment: "", is_template: true },
          { id: "birthday_senior-drinks-3", name: "Juice (2L)", metric: "per bottle", quantity: 6, unitPrice: 30, total: 0, comment: "", is_template: true },
          { id: "birthday_senior-drinks-4", name: "Soft Drinks (2L)", metric: "per bottle", quantity: 6, unitPrice: 25, total: 0, comment: "", is_template: true },
          { id: "birthday_senior-drinks-5", name: "Coffee & Tea Service", metric: "flat fee", quantity: 1, unitPrice: 500, total: 0, comment: "", is_template: true },
        ],
      },
    ],
  },
  {
    id: "bs-decor",
    name: "Décor & Setup",
    total: 0,
    order: 3,
    items: [
      { id: "birthday_senior-decor-1", name: "Floral Centrepieces", metric: "per table", quantity: 8, unitPrice: 350, total: 0, comment: "", is_template: true },
      { id: "birthday_senior-decor-2", name: "Candles & Holders", metric: "per table", quantity: 8, unitPrice: 120, total: 0, comment: "", is_template: true },
      { id: "birthday_senior-decor-3", name: "Backdrop / Draping", metric: "flat fee", quantity: 1, unitPrice: 1500, total: 0, comment: "", is_template: true },
      { id: "birthday_senior-decor-4", name: "Elegant Lighting", metric: "flat fee", quantity: 1, unitPrice: 1200, total: 0, comment: "", is_template: true },
      { id: "birthday_senior-decor-5", name: "Name / Welcome Sign", metric: "item", quantity: 1, unitPrice: 400, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "bs-entertainment",
    name: "Entertainment",
    total: 0,
    order: 4,
    items: [
      { id: "birthday_senior-entertainment-1", name: "Live Music / Band", metric: "per event", quantity: 1, unitPrice: 5000, total: 0, comment: "", is_template: true },
      { id: "birthday_senior-entertainment-2", name: "MC", metric: "per event", quantity: 1, unitPrice: 2000, total: 0, comment: "", is_template: true },
      { id: "birthday_senior-entertainment-3", name: "Slideshow / AV Setup", metric: "flat fee", quantity: 1, unitPrice: 1500, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "bs-service",
    name: "Service",
    total: 0,
    order: 5,
    items: [
      { id: "birthday_senior-service-1", name: "Photographer", metric: "per event", quantity: 1, unitPrice: 4000, total: 0, comment: "", is_template: true },
      { id: "birthday_senior-service-2", name: "Waiters", metric: "per person", quantity: 4, unitPrice: 700, total: 0, comment: "", is_template: true },
      { id: "birthday_senior-service-3", name: "Event Coordinator", metric: "flat fee", quantity: 1, unitPrice: 2500, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "bs-logistics",
    name: "Logistics",
    total: 0,
    order: 6,
    items: [
      { id: "birthday_senior-logistics-1", name: "Transport / Shuttle", metric: "flat fee", quantity: 1, unitPrice: 2500, total: 0, comment: "", is_template: true },
      { id: "birthday_senior-logistics-2", name: "Printed Invitations", metric: "flat fee", quantity: 1, unitPrice: 600, total: 0, comment: "", is_template: true },
      { id: "birthday_senior-logistics-3", name: "Welcome Floral Arrangement", metric: "flat fee", quantity: 1, unitPrice: 800, total: 0, comment: "", is_template: true },
      { id: "birthday_senior-logistics-4", name: "Cleanup", metric: "flat fee", quantity: 1, unitPrice: 800, total: 0, comment: "", is_template: true },
    ],
  },
];
