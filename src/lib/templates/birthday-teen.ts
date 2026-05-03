import type { BudgetCategory } from "../types";

export const birthdayTeenBudgetData: BudgetCategory[] = [
  {
    id: "bt-venue",
    name: "Venue",
    total: 0,
    order: 1,
    items: [
      { id: "birthday_teen-venue-1", name: "Backyard / Outdoor Setup", metric: "flat fee", quantity: 1, unitPrice: 1500, total: 0, comment: "", is_template: true },
      { id: "birthday_teen-venue-2", name: "Tables & Chairs Hire", metric: "flat fee", quantity: 1, unitPrice: 1200, total: 0, comment: "", is_template: true },
      { id: "birthday_teen-venue-3", name: "Tent / Gazebo", metric: "flat fee", quantity: 1, unitPrice: 1500, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "bt-catering",
    name: "Catering",
    total: 0,
    order: 2,
    items: [],
    subCategories: [
      {
        id: "bt-cat-food",
        name: "Food",
        total: 0,
        order: 1,
        items: [
          { id: "birthday_teen-food-1", name: "Pizza (large)", metric: "per pizza", quantity: 5, unitPrice: 150, total: 0, comment: "", is_template: true },
          { id: "birthday_teen-food-2", name: "Burgers / Hot Dogs", metric: "per dozen", quantity: 3, unitPrice: 120, total: 0, comment: "", is_template: true },
          { id: "birthday_teen-food-3", name: "Snacks & Chips", metric: "flat fee", quantity: 1, unitPrice: 400, total: 0, comment: "", is_template: true },
          { id: "birthday_teen-food-4", name: "Salads", metric: "per kg", quantity: 2, unitPrice: 45, total: 0, comment: "", is_template: true },
        ],
      },
      {
        id: "bt-cat-drinks",
        name: "Drinks (Non-Alcoholic)",
        total: 0,
        order: 2,
        items: [
          { id: "birthday_teen-drinks-1", name: "Soft Drinks (2L)", metric: "per bottle", quantity: 10, unitPrice: 25, total: 0, comment: "", is_template: true },
          { id: "birthday_teen-drinks-2", name: "Juice (2L)", metric: "per bottle", quantity: 6, unitPrice: 30, total: 0, comment: "", is_template: true },
          { id: "birthday_teen-drinks-3", name: "Energy Drinks", metric: "per can", quantity: 12, unitPrice: 20, total: 0, comment: "", is_template: true },
          { id: "birthday_teen-drinks-4", name: "Water (750ml)", metric: "per bottle", quantity: 24, unitPrice: 10, total: 0, comment: "", is_template: true },
        ],
      },
      {
        id: "bt-cat-desserts",
        name: "Desserts",
        total: 0,
        order: 3,
        items: [
          { id: "birthday_teen-desserts-1", name: "Birthday Cake", metric: "item", quantity: 1, unitPrice: 700, total: 0, comment: "", is_template: true },
          { id: "birthday_teen-desserts-2", name: "Cupcakes", metric: "per dozen", quantity: 2, unitPrice: 200, total: 0, comment: "", is_template: true },
          { id: "birthday_teen-desserts-3", name: "Sweets & Treats", metric: "flat fee", quantity: 1, unitPrice: 300, total: 0, comment: "", is_template: true },
        ],
      },
    ],
  },
  {
    id: "bt-decor",
    name: "Décor & Setup",
    total: 0,
    order: 3,
    items: [
      { id: "birthday_teen-decor-1", name: "Themed Balloons & Decorations", metric: "flat fee", quantity: 1, unitPrice: 500, total: 0, comment: "", is_template: true },
      { id: "birthday_teen-decor-2", name: "Table Centrepieces", metric: "per table", quantity: 4, unitPrice: 100, total: 0, comment: "", is_template: true },
      { id: "birthday_teen-decor-3", name: "Backdrop / Banner", metric: "flat fee", quantity: 1, unitPrice: 600, total: 0, comment: "", is_template: true },
      { id: "birthday_teen-decor-4", name: "Fairy Lights / LED Decor", metric: "flat fee", quantity: 1, unitPrice: 400, total: 0, comment: "", is_template: true },
      { id: "birthday_teen-decor-5", name: "Party Tableware (plates, cups)", metric: "per set", quantity: 30, unitPrice: 12, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "bt-entertainment",
    name: "Entertainment",
    total: 0,
    order: 4,
    items: [
      { id: "birthday_teen-entertainment-1", name: "DJ / Music Playlist Setup", metric: "per event", quantity: 1, unitPrice: 1500, total: 0, comment: "", is_template: true },
      { id: "birthday_teen-entertainment-2", name: "Portable Speaker / Sound System", metric: "per event", quantity: 1, unitPrice: 800, total: 0, comment: "", is_template: true },
      { id: "birthday_teen-entertainment-3", name: "Photo Booth", metric: "per event", quantity: 1, unitPrice: 1500, total: 0, comment: "", is_template: true },
      { id: "birthday_teen-entertainment-4", name: "Party Games / Activities", metric: "flat fee", quantity: 1, unitPrice: 400, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "bt-service",
    name: "Service",
    total: 0,
    order: 5,
    items: [
      { id: "birthday_teen-service-1", name: "Photographer", metric: "per event", quantity: 1, unitPrice: 1800, total: 0, comment: "", is_template: true },
      { id: "birthday_teen-service-2", name: "Adult Supervisor / Helper", metric: "per person", quantity: 2, unitPrice: 200, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "bt-logistics",
    name: "Logistics",
    total: 0,
    order: 6,
    items: [
      { id: "birthday_teen-logistics-1", name: "Party Favours", metric: "per person", quantity: 20, unitPrice: 40, total: 0, comment: "", is_template: true },
      { id: "birthday_teen-logistics-2", name: "Invitations / Digital Design", metric: "flat fee", quantity: 1, unitPrice: 150, total: 0, comment: "", is_template: true },
      { id: "birthday_teen-logistics-3", name: "Cleanup", metric: "flat fee", quantity: 1, unitPrice: 300, total: 0, comment: "", is_template: true },
    ],
  },
];
