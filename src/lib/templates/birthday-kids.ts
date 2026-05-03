import type { BudgetCategory } from "../types";

export const birthdayKidsBudgetData: BudgetCategory[] = [
  {
    id: "bk-venue",
    name: "Venue",
    total: 0,
    order: 1,
    items: [
      { id: "birthday_kids-venue-1", name: "Backyard / Garden Setup", metric: "flat fee", quantity: 1, unitPrice: 500, total: 0, comment: "", is_template: true },
      { id: "birthday_kids-venue-2", name: "Tables & Chairs Hire (kids)", metric: "flat fee", quantity: 1, unitPrice: 800, total: 0, comment: "", is_template: true },
      { id: "birthday_kids-venue-3", name: "Tent / Shade Sail", metric: "flat fee", quantity: 1, unitPrice: 1200, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "bk-catering",
    name: "Catering",
    total: 0,
    order: 2,
    items: [],
    subCategories: [
      {
        id: "bk-cat-food",
        name: "Finger Foods & Snacks",
        total: 0,
        order: 1,
        items: [
          { id: "birthday_kids-finger-food-1", name: "Mini Sandwiches", metric: "per dozen", quantity: 5, unitPrice: 80, total: 0, comment: "", is_template: true },
          { id: "birthday_kids-finger-food-2", name: "Pizza (small)", metric: "per pizza", quantity: 5, unitPrice: 120, total: 0, comment: "", is_template: true },
          { id: "birthday_kids-finger-food-3", name: "Hot Dogs / Sausage Rolls", metric: "per dozen", quantity: 3, unitPrice: 80, total: 0, comment: "", is_template: true },
          { id: "birthday_kids-finger-food-4", name: "Chips & Crisps", metric: "per bag", quantity: 10, unitPrice: 25, total: 0, comment: "", is_template: true },
        ],
      },
      {
        id: "bk-cat-desserts",
        name: "Desserts",
        total: 0,
        order: 2,
        items: [
          { id: "birthday_kids-desserts-1", name: "Birthday Cake (themed)", metric: "item", quantity: 1, unitPrice: 600, total: 0, comment: "", is_template: true },
          { id: "birthday_kids-desserts-2", name: "Cupcakes", metric: "per dozen", quantity: 2, unitPrice: 180, total: 0, comment: "", is_template: true },
          { id: "birthday_kids-desserts-3", name: "Sweets / Candy Bar", metric: "flat fee", quantity: 1, unitPrice: 400, total: 0, comment: "", is_template: true },
        ],
      },
      {
        id: "bk-cat-drinks",
        name: "Juice Bar",
        total: 0,
        order: 3,
        items: [
          { id: "birthday_kids-drinks-1", name: "Juice Boxes", metric: "per box", quantity: 30, unitPrice: 8, total: 0, comment: "", is_template: true },
          { id: "birthday_kids-drinks-2", name: "Soft Drinks (1L)", metric: "per bottle", quantity: 8, unitPrice: 18, total: 0, comment: "", is_template: true },
          { id: "birthday_kids-drinks-3", name: "Water (500ml)", metric: "per bottle", quantity: 20, unitPrice: 8, total: 0, comment: "", is_template: true },
        ],
      },
    ],
  },
  {
    id: "bk-decor",
    name: "Décor & Setup",
    total: 0,
    order: 3,
    items: [
      { id: "birthday_kids-decor-1", name: "Themed Balloons & Decorations", metric: "flat fee", quantity: 1, unitPrice: 700, total: 0, comment: "", is_template: true },
      { id: "birthday_kids-decor-2", name: "Table Centrepieces (kids)", metric: "per table", quantity: 4, unitPrice: 80, total: 0, comment: "", is_template: true },
      { id: "birthday_kids-decor-3", name: "Themed Backdrop / Banner", metric: "flat fee", quantity: 1, unitPrice: 500, total: 0, comment: "", is_template: true },
      { id: "birthday_kids-decor-4", name: "Party Tableware (plates, cups)", metric: "per set", quantity: 30, unitPrice: 12, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "bk-entertainment",
    name: "Entertainment",
    total: 0,
    order: 4,
    items: [
      { id: "birthday_kids-entertainment-1", name: "Jumping Castle", metric: "per day", quantity: 1, unitPrice: 900, total: 0, comment: "", is_template: true },
      { id: "birthday_kids-entertainment-2", name: "Face Painter", metric: "per event", quantity: 1, unitPrice: 800, total: 0, comment: "", is_template: true },
      { id: "birthday_kids-entertainment-3", name: "Magician / Entertainer", metric: "per event", quantity: 1, unitPrice: 1200, total: 0, comment: "", is_template: true },
      { id: "birthday_kids-entertainment-4", name: "Party Games Prize Pack", metric: "flat fee", quantity: 1, unitPrice: 300, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "bk-service",
    name: "Service",
    total: 0,
    order: 5,
    items: [
      { id: "birthday_kids-service-1", name: "Photographer", metric: "per event", quantity: 1, unitPrice: 1500, total: 0, comment: "", is_template: true },
      { id: "birthday_kids-service-2", name: "Adult Helpers", metric: "per person", quantity: 2, unitPrice: 200, total: 0, comment: "", is_template: true },
    ],
  },
  {
    id: "bk-logistics",
    name: "Logistics",
    total: 0,
    order: 6,
    items: [
      { id: "birthday_kids-logistics-1", name: "Party Packs (per child)", metric: "per child", quantity: 20, unitPrice: 50, total: 0, comment: "", is_template: true },
      { id: "birthday_kids-logistics-2", name: "Invitations / Printing", metric: "flat fee", quantity: 1, unitPrice: 200, total: 0, comment: "", is_template: true },
      { id: "birthday_kids-logistics-3", name: "Cleanup", metric: "flat fee", quantity: 1, unitPrice: 300, total: 0, comment: "", is_template: true },
    ],
  },
];
