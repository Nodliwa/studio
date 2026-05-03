import type { BudgetCategory } from "../types";

export const birthdayAdultBudgetData: BudgetCategory[] = [
  {
    id: "b-venue",
    name: "Venue",
    total: 0,
    order: 1,
    items: [
      { id: "birthday_adult-venue-1", name: "Venue / Hall Hire", metric: "flat fee", quantity: 1, unitPrice: 3000, total: 0, comment: "", is_template: true },
      { id: "birthday_adult-venue-2", name: "Tables & Chairs Hire", metric: "flat fee", quantity: 1, unitPrice: 1500, total: 0, comment: "", is_template: true },
      { id: "birthday_adult-venue-3", name: "Tent / Marquee", metric: "flat fee", quantity: 1, unitPrice: 2500, total: 0, comment: "", is_template: true },
      { id: "birthday_adult-venue-4", name: "Mobile Toilets", metric: "per unit", quantity: 2, unitPrice: 500, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "b-catering",
    name: "Catering",
    total: 0,
    order: 2,
    items: [],
    subCategories: [
      {
        id: "b-cat-meat",
        name: "Meat",
        total: 0,
        order: 1,
        items: [
          { id: "birthday_adult-meat-1", name: "Chicken", metric: "per kg", quantity: 10, unitPrice: 65, total: 0, comment: "", is_template: true },
          { id: "birthday_adult-meat-2", name: "Boerewors", metric: "per kg", quantity: 5, unitPrice: 90, total: 0, comment: "", is_template: true },
          { id: "birthday_adult-meat-3", name: "Beef / Steak", metric: "per kg", quantity: 5, unitPrice: 160, total: 0, comment: "", is_template: true },
        ],
      },
      {
        id: "b-cat-starch",
        name: "Starch & Sides",
        total: 0,
        order: 2,
        items: [
          { id: "birthday_adult-starch-1", name: "Rolls / Bread", metric: "per pack", quantity: 5, unitPrice: 30, total: 0, comment: "", is_template: true },
          { id: "birthday_adult-starch-2", name: "Rice", metric: "per kg", quantity: 5, unitPrice: 30, total: 0, comment: "", is_template: true },
          { id: "birthday_adult-starch-3", name: "Potato Salad", metric: "per kg", quantity: 3, unitPrice: 55, total: 0, comment: "", is_template: true },
          { id: "birthday_adult-starch-4", name: "Green Salad", metric: "per kg", quantity: 2, unitPrice: 40, total: 0, comment: "", is_template: true },
        ],
      },
      {
        id: "b-cat-desserts",
        name: "Desserts",
        total: 0,
        order: 3,
        items: [
          { id: "birthday_adult-desserts-1", name: "Birthday Cake", metric: "item", quantity: 1, unitPrice: 800, total: 0, comment: "", is_template: true },
          { id: "birthday_adult-desserts-2", name: "Cupcakes", metric: "per dozen", quantity: 3, unitPrice: 200, total: 0, comment: "", is_template: true },
        ],
      },
      {
        id: "b-cat-drinks",
        name: "Drinks & Refreshments",
        total: 0,
        order: 4,
        items: [
          { id: "birthday_adult-drinks-1", name: "Soft Drinks (2L)", metric: "per bottle", quantity: 10, unitPrice: 25, total: 0, comment: "", is_template: true },
          { id: "birthday_adult-drinks-2", name: "Juice (2L)", metric: "per bottle", quantity: 6, unitPrice: 30, total: 0, comment: "", is_template: true },
          { id: "birthday_adult-drinks-3", name: "Water (750ml)", metric: "per bottle", quantity: 24, unitPrice: 10, total: 0, comment: "", is_template: true },
          { id: "birthday_adult-drinks-4", name: "Beer / Cider (6-pack)", metric: "per pack", quantity: 5, unitPrice: 100, total: 0, comment: "", is_template: true },
          { id: "birthday_adult-drinks-5", name: "Wine (750ml)", metric: "per bottle", quantity: 4, unitPrice: 120, total: 0, comment: "", is_template: true },
        ],
      },
    ],
  },
  {
    id: "b-decor",
    name: "Décor & Setup",
    total: 0,
    order: 3,
    items: [
      { id: "birthday_adult-decor-1", name: "Balloons & Decorations", metric: "flat fee", quantity: 1, unitPrice: 600, total: 0, comment: "", is_template: true },
      { id: "birthday_adult-decor-2", name: "Table Centrepieces", metric: "per table", quantity: 5, unitPrice: 150, total: 0, comment: "", is_template: true },
      { id: "birthday_adult-decor-3", name: "Backdrop / Draping", metric: "flat fee", quantity: 1, unitPrice: 900, total: 0, comment: "", is_template: true },
      { id: "birthday_adult-decor-4", name: "Lighting", metric: "flat fee", quantity: 1, unitPrice: 700, total: 0, comment: "", is_template: true },
      { id: "birthday_adult-decor-5", name: "Serviettes & Cutlery", metric: "per set", quantity: 50, unitPrice: 15, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "b-entertainment",
    name: "Entertainment",
    total: 0,
    order: 4,
    items: [
      { id: "birthday_adult-entertainment-1", name: "DJ / Music", metric: "per event", quantity: 1, unitPrice: 2500, total: 0, comment: "", is_template: true },
      { id: "birthday_adult-entertainment-2", name: "MC", metric: "per event", quantity: 1, unitPrice: 1500, total: 0, comment: "", is_template: true },
      { id: "birthday_adult-entertainment-3", name: "Photo Booth", metric: "per event", quantity: 1, unitPrice: 1800, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "b-service",
    name: "Service",
    total: 0,
    order: 5,
    items: [
      { id: "birthday_adult-service-1", name: "Photographer", metric: "per event", quantity: 1, unitPrice: 3000, total: 0, comment: "", is_template: true },
      { id: "birthday_adult-service-2", name: "Catering Staff / Waiters", metric: "per person", quantity: 3, unitPrice: 500, total: 0, comment: "", is_template: true },
      { id: "birthday_adult-service-3", name: "Security", metric: "per person", quantity: 2, unitPrice: 600, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "b-logistics",
    name: "Logistics",
    total: 0,
    order: 6,
    items: [
      { id: "birthday_adult-logistics-1", name: "Transport / Shuttle", metric: "flat fee", quantity: 1, unitPrice: 1500, total: 0, comment: "", is_template: true },
      { id: "birthday_adult-logistics-2", name: "Invitations / Printing", metric: "flat fee", quantity: 1, unitPrice: 300, total: 0, comment: "", is_template: true },
      { id: "birthday_adult-logistics-3", name: "Party Favours", metric: "per person", quantity: 20, unitPrice: 50, total: 0, comment: "", is_template: true },
      { id: "birthday_adult-logistics-4", name: "Cleanup", metric: "flat fee", quantity: 1, unitPrice: 500, total: 0, comment: "", is_template: true },
    ],
  },
];
