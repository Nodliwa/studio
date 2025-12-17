
import type { BudgetCategory } from "./types";

const funeralBudgetData: BudgetCategory[] = [
    {
      id: "cat-1",
      name: "Meat",
      total: 0,
      order: 1,
      items: [
        { id: "item-1-1", name: "Lamb", metric: "per kg", quantity: 100, unitPrice: 185, total: 0, comment: "" },
        { id: "item-1-2", name: "Beef", metric: "per kg", quantity: 50, unitPrice: 175, total: 0, comment: "" },
        { id: "item-1-3", name: "Chicken", metric: "per kg", quantity: 35, unitPrice: 85, total: 0, comment: "" },
        { id: "item-1-4", name: "Pork", metric: "per kg", quantity: 50, unitPrice: 120, total: 0, comment: "" },
      ],
    },
    {
      id: "cat-2",
      name: "Starch",
      total: 0,
      order: 2,
      items: [
        { id: "item-2-1", name: "Bread", metric: "per loaf", quantity: 40, unitPrice: 20, total: 0, comment: "" },
        { id: "item-2-2", name: "Samp", metric: "10kg", quantity: 5, unitPrice: 150, total: 0, comment: "" },
        { id: "item-2-3", name: "Beans", metric: "10kg", quantity: 3, unitPrice: 350, total: 0, comment: "" },
        { id: "item-2-4", name: "Rice", metric: "10 kg", quantity: 5, unitPrice: 175, total: 0, comment: "" },
        { id: "item-2-5", name: "Mealie Meal", metric: "10 kg", quantity: 4, unitPrice: 140, total: 0, comment: "" },
      ],
    },
    {
      id: "cat-3",
      name: "Vegetables",
      total: 0,
      order: 3,
      items: [
        { id: "item-3-1", name: "Cabbage", metric: "8 heads", quantity: 4, unitPrice: 200, total: 0, comment: "" },
        { id: "item-3-2", name: "Potatoes", metric: "10kg", quantity: 5, unitPrice: 45, total: 0, comment: "" },
        { id: "item-3-3", name: "Carrot", metric: "10kg", quantity: 4, unitPrice: 85, total: 0, comment: "" },
        { id: "item-3-4", name: "Onion", metric: "10kg", quantity: 4, unitPrice: 175, total: 0, comment: "" },
        { id: "item-3-5", name: "Potatoes", metric: "10kg", quantity: 4, unitPrice: 200, total: 0, comment: "" },
      ],
    },
    {
      id: "cat-4",
      name: "Fruit",
      total: 0,
      order: 4,
      items: [
        { id: "item-4-1", name: "Apples", metric: "per box", quantity: 3, unitPrice: 225, total: 0, comment: "" },
        { id: "item-4-2", name: "Banana", metric: "per box", quantity: 3, unitPrice: 150, total: 0, comment: "" },
        { id: "item-4-3", name: "Pears", metric: "per box", quantity: 3, unitPrice: 145, total: 0, comment: "" },
        { id: "item-4-4", name: "Watermelon", metric: "each", quantity: 10, unitPrice: 75, total: 0, comment: "" },
        { id: "item-4-5", name: "Oranges", metric: "per box", quantity: 5, unitPrice: 35, total: 0, comment: "" },
      ],
    },
    {
      id: "cat-5",
      name: "Refreshments",
      total: 0,
      order: 5,
      items: [
        { id: "item-5-1", name: "Coffee", metric: "750g", quantity: 3, unitPrice: 120, total: 0, comment: "" },
        { id: "item-5-2", name: "Teabag", metric: "100's", quantity: 3, unitPrice: 50, total: 0, comment: "" },
        { id: "item-5-3", name: "Milk", metric: "6x1L", quantity: 10, unitPrice: 125, total: 0, comment: "" },
        { id: "item-5-4", name: "Sugar", metric: "10kg", quantity: 4, unitPrice: 260, total: 0, comment: "" },
        { id: "item-5-5", name: "Bottled Water", metric: "24 of 300ml", quantity: 5, unitPrice: 125, total: 0, comment: "" },
        { id: "item-5-6", name: "Juice", metric: "25 of 300ml", quantity: 4, unitPrice: 200, total: 0, comment: "" },
        { id: "item-5-7", name: "Carbonated Drink", metric: "6 of 2L", quantity: 10, unitPrice: 140, total: 0, comment: "" },
      ],
    },
    {
        id: "cat-6",
        name: "Deceased",
        total: 0,
        order: 6,
        items: [
            { id: "item-6-1", name: "Municipal Grave fees", metric: "per item", quantity: 1, unitPrice: 1500, total: 0, comment: "" },
            { id: "item-6-2", name: "Coffin", metric: "per item", quantity: 1, unitPrice: 10000, total: 0, comment: "" },
            { id: "item-6-3", name: "Coffin Stand", metric: "per day", quantity: 1, unitPrice: 650, total: 0, comment: "" },
            { id: "item-6-4", name: "Grave digging", metric: "per item", quantity: 1, unitPrice: 1200, total: 0, comment: "" },
            { id: "item-6-5", name: "Grave filling / building", metric: "per item", quantity: 1, unitPrice: 500, total: 0, comment: "" },
            { id: "item-6-6", name: "Tombstone", metric: "per item", quantity: 1, unitPrice: 3500, total: 0, comment: "" },
            { id: "item-6-7", name: "Hearse", metric: "per day", quantity: 1, unitPrice: 2500, total: 0, comment: "" },
            { id: "item-6-8", name: "Wreath / Flowers", metric: "per item", quantity: 3, unitPrice: 150, total: 0, comment: "" },
            { id: "item-6-9", name: "Suits / Dress", metric: "per item", quantity: 1, unitPrice: 1000, total: 0, comment: "" },
            { id: "item-6-10", name: "Blanket", metric: "per item", quantity: 1, unitPrice: 250, total: 0, comment: "" },
            { id: "item-6-11", name: "Body Travel", metric: "per item", quantity: 0, unitPrice: 6500, total: 0, comment: "" },
        ],
    },
    {
        id: "cat-7",
        name: "Service",
        total: 0,
        order: 7,
        items: [
            { id: "item-7-6", name: "Gas Stove / Burner", metric: "per item", quantity: 1, unitPrice: 500, total: 0, comment: "" },
            { id: "item-7-7", name: "Cookware hire", metric: "per item", quantity: 6, unitPrice: 100, total: 0, comment: "" },
            { id: "item-7-8", name: "Tableware hire", metric: "per item", quantity: 40, unitPrice: 10, total: 0, comment: "" },
            { id: "item-7-9", name: "Takeaway plate", metric: "75 pcs", quantity: 1, unitPrice: 100, total: 0, comment: "" },
            { id: "item-7-10", name: "Cutlery hire", metric: "10 pkt", quantity: 10, unitPrice: 20, total: 0, comment: "" },
            { id: "item-7-11", name: "Table-Deco", metric: "12 pack", quantity: 5, unitPrice: 200, total: 0, comment: "" },
            { id: "item-7-12", name: "Funeral Program", metric: "per item", quantity: 50, unitPrice: 15, total: 0, comment: "" },
            { id: "item-7-18", name: "Videographer", metric: "per day", quantity: 1, unitPrice: 2500, total: 0, comment: "" },
            { id: "item-7-19", name: "Pastor", metric: "per day", quantity: 1, unitPrice: 3000, total: 0, comment: "" },
            { id: "item-7-20", name: "Church Quire", metric: "per day", quantity: 1, unitPrice: 3000, total: 0, comment: "" },
        ],
    },
    {
        id: "cat-8",
        name: "Logistics",
        total: 0,
        order: 8,
        items: [
            { id: "item-8-1", name: "BraaiMaster", metric: "per day", quantity: 5, unitPrice: 100, total: 0, comment: "" },
            { id: "item-8-2", name: "Cookers", metric: "per day", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
            { id: "item-8-3", name: "Bakers", metric: "per day", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
            { id: "item-8-4", name: "Bakkie Hire", metric: "per day", quantity: 1, unitPrice: 650, total: 0, comment: "" },
            { id: "item-8-5", name: "Bus / Taxi", metric: "per day", quantity: 0, unitPrice: 1500, total: 0, comment: "" },
            { id: "item-8-13", name: "Tent", metric: "per day", quantity: 1, unitPrice: 1000, total: 0, comment: "" },
            { id: "item-8-14", name: "Chairs", metric: "per day", quantity: 10, unitPrice: 50, total: 0, comment: "" },
            { id: "item-8-15", name: "Tables", metric: "per day", quantity: 2, unitPrice: 80, total: 0, comment: "" },
            { id: "item-8-16", name: "Mobile Toilets", metric: "per day", quantity: 1, unitPrice: 500, total: 0, comment: "" },
            { id: "item-8-17", name: "Photographer", metric: "per day", quantity: 1, unitPrice: 2500, total: 0, comment: "" },
        ],
    },
];

const weddingBudgetData: BudgetCategory[] = [
    {
        id: 'venue',
        name: 'Venue',
        total: 0,
        order: 1,
        items: [
            { id: 'venue-1', name: 'Ceremony Venue', metric: 'flat fee', quantity: 1, unitPrice: 15000, total: 0, comment: 'Includes seating for 100 guests' },
            { id: 'venue-2', name: 'Reception Hall', metric: 'flat fee', quantity: 1, unitPrice: 25000, total: 0, comment: 'Includes tables, chairs, and basic linens' },
        ],
    },
    {
        id: 'attire',
        name: 'Attire',
        total: 0,
        order: 2,
        subCategories: [
            {
                id: 'bride',
                name: 'Bride',
                total: 0,
                order: 1,
                items: [
                    { id: 'bride-1', name: 'Wedding Dress', metric: 'item', quantity: 1, unitPrice: 12000, total: 0, comment: '' },
                    { id: 'bride-2', name: 'Veil/Headpiece', metric: 'item', quantity: 1, unitPrice: 1500, total: 0, comment: '' },
                    { id: 'bride-3', name: 'Shoes', metric: 'pair', quantity: 1, unitPrice: 800, total: 0, comment: '' },
                ],
            },
            {
                id: 'groom',
                name: 'Groom',
                total: 0,
                order: 2,
                items: [
                    { id: 'groom-1', name: 'Suit/Tuxedo', metric: 'item', quantity: 1, unitPrice: 5000, total: 0, comment: '' },
                    { id: 'groom-2', name: 'Shoes', metric: 'pair', quantity: 1, unitPrice: 1200, total: 0, comment: '' },
                ],
            },
            {
                id: 'bridesmaids',
                name: 'Bridesmaids & Groomsmen',
                total: 0,
                order: 3,
                items: [
                    { id: 'bridesmaids-1', name: 'Bridesmaid Dresses', metric: 'item', quantity: 4, unitPrice: 2000, total: 0, comment: '' },
                    { id: 'groomsmen-1', name: 'Groomsmen Suits', metric: 'item', quantity: 4, unitPrice: 1500, total: 0, comment: '' },
                ],
            },
        ]
    },
    {
        id: 'catering',
        name: 'Catering',
        total: 0,
        order: 3,
        subCategories: [
            {
                id: 'refreshments',
                name: 'Refreshments',
                total: 0,
                order: 1,
                items: [
                  { id: "refresh-1", name: "Coffee", metric: "750g", quantity: 3, unitPrice: 120, total: 0, comment: "" },
                  { id: "refresh-2", name: "Teabag", metric: "100's", quantity: 3, unitPrice: 50, total: 0, comment: "" },
                  { id: "refresh-3", name: "Milk", metric: "6x1L", quantity: 10, unitPrice: 125, total: 0, comment: "" },
                  { id: "refresh-4", name: "Sugar", metric: "10kg", quantity: 4, unitPrice: 260, total: 0, comment: "" },
                  { id: "refresh-5", name: "Bottled Water", metric: "24 of 300ml", quantity: 5, unitPrice: 125, total: 0, comment: "" },
                  { id: "refresh-6", name: "Juice", metric: "25 of 300ml", quantity: 4, unitPrice: 200, total: 0, comment: "" },
                  { id: "refresh-7", name: "Carbonated Drink", metric: "6 of 2L", quantity: 10, unitPrice: 140, total: 0, comment: "" },
                ],
            },
            {
                id: 'meat',
                name: 'Meat',
                total: 0,
                order: 2,
                items: [
                    { id: 'meat-1', name: 'Lamb', metric: 'per kg', quantity: 100, unitPrice: 185, total: 0, comment: '' },
                    { id: 'meat-2', name: 'Beef', metric: 'per kg', quantity: 50, unitPrice: 175, total: 0, comment: '' },
                    { id: 'meat-3', name: 'Pork', metric: 'per kg', quantity: 50, unitPrice: 120, total: 0, comment: '' },
                    { id: 'meat-4', name: 'Chicken', metric: 'per kg', quantity: 35, unitPrice: 85, total: 0, comment: '' },
                ],
            },
            {
                id: 'starch',
                name: 'Starch',
                total: 0,
                order: 3,
                items: [
                  { id: "starch-1", name: "Bread", metric: "per loaf", quantity: 40, unitPrice: 20, total: 0, comment: "" },
                  { id: "starch-2", name: "Samp", metric: "10kg", quantity: 5, unitPrice: 150, total: 0, comment: "" },
                  { id: "starch-3", name: "Beans", metric: "10kg", quantity: 3, unitPrice: 350, total: 0, comment: "" },
                  { id: "starch-4", name: "Rice", metric: "10 kg", quantity: 5, unitPrice: 175, total: 0, comment: "" },
                  { id: "starch-5", name: "Mealie Meal", metric: "10 kg", quantity: 4, unitPrice: 140, total: 0, comment: "" },
                ],
            },
            {
                id: 'vegetables',
                name: 'Vegetables',
                total: 0,
                order: 4,
                items: [
                    { id: "veg-1", name: "Cabbage", metric: "8 heads", quantity: 4, unitPrice: 200, total: 0, comment: "" },
                    { id: "veg-2", name: "Potatoes", metric: "10kg", quantity: 5, unitPrice: 45, total: 0, comment: "" },
                    { id: "veg-3", name: "Carrot", metric: "10kg", quantity: 4, unitPrice: 85, total: 0, comment: "" },
                    { id: "veg-4", name: "Onion", metric: "10kg", quantity: 4, unitPrice: 175, total: 0, comment: "" },
                ],
            },
            {
                id: 'fruit',
                name: 'Fruit',
                total: 0,
                order: 5,
                items: [
                    { id: "fruit-1", name: "Apples", metric: "per box", quantity: 3, unitPrice: 225, total: 0, comment: "" },
                    { id: "fruit-2", name: "Banana", metric: "per box", quantity: 3, unitPrice: 150, total: 0, comment: "" },
                    { id: "fruit-3", name: "Pears", metric: "per box", quantity: 3, unitPrice: 145, total: 0, comment: "" },
                ],
            },
             {
                id: 'desserts',
                name: 'Desserts',
                total: 0,
                order: 6,
                items: [
                    { id: 'desserts-1', name: 'Wedding Cake', metric: 'item', quantity: 1, unitPrice: 3000, total: 0, comment: '3-tier cake for 100 guests' },
                    { id: 'desserts-2', name: 'Assorted Desserts', metric: 'per person', quantity: 100, unitPrice: 50, total: 0, comment: '' },
                ],
            },
        ],
    },
    {
        id: 'service',
        name: 'Service Providers',
        total: 0,
        order: 4,
        items: [
            { id: "service-1", name: "Gas Stove / Burner", metric: "per item", quantity: 1, unitPrice: 500, total: 0, comment: "" },
            { id: "service-2", name: "Cookware hire", metric: "per item", quantity: 6, unitPrice: 100, total: 0, comment: "" },
            { id: "service-3", name: "Tableware hire", metric: "per item", quantity: 40, unitPrice: 10, total: 0, comment: "" },
            { id: "service-4", name: "Cutlery hire", metric: "10 pkt", quantity: 10, unitPrice: 20, total: 0, comment: "" },
            { id: "service-5", name: "Table-Deco", metric: "12 pack", quantity: 5, unitPrice: 200, total: 0, comment: "" },
            { id: "service-6", name: "Praise Singer", metric: "per day", quantity: 1, unitPrice: 1500, total: 0, comment: "" },
            { id: "service-7", name: "Pastor", metric: "per day", quantity: 1, unitPrice: 3000, total: 0, comment: "" },
        ],
    },
    {
        id: 'logistics',
        name: 'Logistics',
        total: 0,
        order: 5,
        items: [
            { id: "logistics-1", name: "BraaiMaster", metric: "per day", quantity: 5, unitPrice: 100, total: 0, comment: "" },
            { id: "logistics-2", name: "Cookers", metric: "per day", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
            { id: "logistics-3", name: "Bakers", metric: "per day", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
            { id: "logistics-4", name: "Bakkie Hire", metric: "per day", quantity: 1, unitPrice: 650, total: 0, comment: "" },
            { id: "logistics-5", name: "Bus / Taxi", metric: "per day", quantity: 0, unitPrice: 1500, total: 0, comment: "" },
            { id: "logistics-6", name: "Tent", metric: "per day", quantity: 1, unitPrice: 1000, total: 0, comment: "" },
            { id: "logistics-7", name: "Chairs", metric: "per day", quantity: 10, unitPrice: 50, total: 0, comment: "" },
            { id: "logistics-8", name: "Tables", metric: "per day", quantity: 2, unitPrice: 80, total: 0, comment: "" },
            { id: "logistics-9", name: "Mobile Toilets", metric: "per day", quantity: 1, unitPrice: 500, total: 0, comment: "" },
            { id: "logistics-10", name: "Photographer", metric: "per day", quantity: 1, unitPrice: 2500, total: 0, comment: "" },
            { id: "logistics-11", name: "Videographer", metric: "per day", quantity: 1, unitPrice: 2500, total: 0, comment: "" },
        ],
    },
];

const otherBudgetData: BudgetCategory[] = [
    // A simplified, generic version
    {
        id: 'venue',
        name: 'Venue & Setup',
        total: 0,
        order: 1,
        items: [
            { id: 'venue-1', name: 'Venue Rental', metric: 'flat fee', quantity: 1, unitPrice: 5000, total: 0, comment: '' },
            { id: 'venue-2', name: 'Tables & Chairs', metric: 'per person', quantity: 50, unitPrice: 50, total: 0, comment: '' },
            { id: 'venue-3', name: 'Decorations', metric: 'lump sum', quantity: 1, unitPrice: 2000, total: 0, comment: '' },
        ]
    },
    {
        id: 'food',
        name: 'Food & Drinks',
        total: 0,
        order: 2,
        items: [
            { id: 'food-1', name: 'Catering', metric: 'per person', quantity: 50, unitPrice: 250, total: 0, comment: '' },
            { id: 'food-2', name: 'Cake', metric: 'item', quantity: 1, unitPrice: 1000, total: 0, comment: '' },
            { id: 'food-3', name: 'Beverages', metric: 'lump sum', quantity: 1, unitPrice: 1500, total: 0, comment: '' },
        ]
    },
    {
        id: 'entertainment',
        name: 'Entertainment',
        total: 0,
        order: 3,
        items: [
            { id: 'ent-1', name: 'DJ / Music', metric: 'flat fee', quantity: 1, unitPrice: 3000, total: 0, comment: '' },
        ]
    }
];


export const budgetTemplates = {
    funeral: funeralBudgetData,
    wedding: weddingBudgetData,
    other: otherBudgetData
};
