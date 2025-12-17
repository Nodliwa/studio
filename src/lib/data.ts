
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
            { id: "item-7-7", name: "Imbiza / Pots", metric: "per item", quantity: 6, unitPrice: 100, total: 0, comment: "" },
            { id: "item-7-8", name: "Plates", metric: "per item", quantity: 40, unitPrice: 10, total: 0, comment: "" },
            { id: "item-7-9", name: "Takeaway plate", metric: "75 pcs", quantity: 1, unitPrice: 100, total: 0, comment: "" },
            { id: "item-7-10", name: "Spoons", metric: "10 pkt", quantity: 10, unitPrice: 20, total: 0, comment: "" },
            { id: "item-7-11", name: "Coffee Mugs", metric: "12 pack", quantity: 5, unitPrice: 200, total: 0, comment: "" },
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
            { id: "item-8-1", name: "Slaughters", metric: "per day", quantity: 5, unitPrice: 100, total: 0, comment: "" },
            { id: "item-8-2", name: "Cookers", metric: "per day", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
            { id: "item-8-3", name: "Bakers", metric: "per day", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
            { id: "item-8-4", name: "Bakkie Hire", metric: "per day", quantity: 1, unitPrice: 650, total: 0, comment: "" },
            { id: "item-8-5", name: "Bus / Taxi", metric: "per day", quantity: 0, unitPrice: 1500, total: 0, comment: "" },
            { id: "item-7-1", name: "Tent", metric: "per item", quantity: 1, unitPrice: 1000, total: 0, comment: "" },
            { id: "item-7-2", name: "Tables", metric: "per item", quantity: 4, unitPrice: 150, total: 0, comment: "" },
            { id: "item-7-3", name: "Chairs", metric: "per item", quantity: 50, unitPrice: 15, total: 0, comment: "" },
            { id: "item-7-4", name: "Mobile Fridge", metric: "per item", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
            { id: "item-7-5", name: "Mobile Toilet", metric: "per item", quantity: 3, unitPrice: 1000, total: 0, comment: "" },
        ],
    },
];

const weddingBudgetData: BudgetCategory[] = [
    {
        id: "bride", name: "Bride", total: 0, order: 1, items: [
            { id: "bride-1", name: "Ring", metric: "each", quantity: 1, unitPrice: 45000, total: 0, comment: "" },
            { id: "bride-2", name: "Necklace", metric: "each", quantity: 1, unitPrice: 6500, total: 0, comment: "" },
            { id: "bride-3", name: "Bracelet", metric: "each", quantity: 1, unitPrice: 5000, total: 0, comment: "" },
            { id: "bride-4", name: "Hair Stylist", metric: "each", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
            { id: "bride-5", name: "Bridesmaid Wear", metric: "each", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
            { id: "bride-6", name: "Bridal Dress", metric: "each", quantity: 1, unitPrice: 25000, total: 0, comment: "" },
            { id: "bride-7", name: "Make up Artist", metric: "each", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
            { id: "bride-8", name: "Robe", metric: "each", quantity: 2, unitPrice: 1500, total: 0, comment: "" },
            { id: "bride-9", name: "Underwear", metric: "each", quantity: 3, unitPrice: 1050, total: 0, comment: "" },
            { id: "bride-10", name: "Shoes", metric: "each", quantity: 2, unitPrice: 1050, total: 0, comment: "" },
            { id: "bride-11", name: "Traditional Dress", metric: "each", quantity: 1, unitPrice: 5500, total: 0, comment: "" },
            { id: "bride-12", name: "Doek", metric: "each", quantity: 2, unitPrice: 750, total: 0, comment: "" },
            { id: "bride-13", name: "Bead art work", metric: "each", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
            { id: "bride-14", name: "Faskot", metric: "each", quantity: 2, unitPrice: 1050, total: 0, comment: "" },
            { id: "bride-15", name: "Handkerchief", metric: "each", quantity: 3, unitPrice: 300, total: 0, comment: "" },
            { id: "bride-16", name: "Casual Shoes", metric: "each", quantity: 2, unitPrice: 750, total: 0, comment: "" },
        ]
    },
    {
        id: "groom", name: "Groom", total: 0, order: 2, items: [
            { id: "groom-1", name: "Ring", metric: "each", quantity: 1, unitPrice: 5000, total: 0, comment: "" },
            { id: "groom-2", name: "Suite", metric: "each", quantity: 1, unitPrice: 20000, total: 0, comment: "" },
            { id: "groom-3", name: "Shirt", metric: "each", quantity: 1, unitPrice: 1500, total: 0, comment: "" },
            { id: "groom-4", name: "Shoes", metric: "each", quantity: 1, unitPrice: 4500, total: 0, comment: "" },
            { id: "groom-5", name: "Watch", metric: "each", quantity: 1, unitPrice: 25000, total: 0, comment: "" },
            { id: "groom-6", name: "Haircut", metric: "each", quantity: 1, unitPrice: 500, total: 0, comment: "" },
            { id: "groom-7", name: "Socks/Vest/Boxers", metric: "each", quantity: 1, unitPrice: 1000, total: 0, comment: "" },
            { id: "groom-8", name: "Casual Pants", metric: "each", quantity: 1, unitPrice: 1500, total: 0, comment: "" },
            { id: "groom-9", name: "Traditional Coat", metric: "each", quantity: 1, unitPrice: 7500, total: 0, comment: "" },
            { id: "groom-10", name: "Coat of Arms", metric: "each", quantity: 1, unitPrice: 3000, total: 0, comment: "" },
            { id: "groom-11", name: "Stick", metric: "each", quantity: 1, unitPrice: 500, total: 0, comment: "" },
            { id: "groom-12", name: "Casual shoes", metric: "each", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
        ]
    },
    {
        id: "bridesmaids", name: "Bridesmaids", total: 0, order: 3, items: [
            { id: "bridesmaids-1", name: "Dresses", metric: "each", quantity: 4, unitPrice: 4000, total: 0, comment: "" },
            { id: "bridesmaids-2", name: "Shoes", metric: "each", quantity: 4, unitPrice: 1500, total: 0, comment: "" },
            { id: "bridesmaids-3", name: "Hairstyles", metric: "each", quantity: 4, unitPrice: 1200, total: 0, comment: "" },
            { id: "bridesmaids-4", name: "Makeup", metric: "each", quantity: 4, unitPrice: 1000, total: 0, comment: "" },
        ]
    },
    {
        id: "refreshments", name: "Refreshments", total: 0, order: 4, items: [
            { id: "refreshments-1", name: "Brandy", metric: "per bottle", quantity: 10, unitPrice: 180, total: 0, comment: "" },
            { id: "refreshments-2", name: "Whisky / Gin", metric: "per bottle", quantity: 5, unitPrice: 200, total: 0, comment: "" },
            { id: "refreshments-3", name: "Umqombothi", metric: "100Ls", quantity: 3, unitPrice: 350, total: 0, comment: "" },
            { id: "refreshments-4", name: "Beer", metric: "Cases", quantity: 10, unitPrice: 250, total: 0, comment: "" },
            { id: "refreshments-5", name: "Wine", metric: "per bottle", quantity: 10, unitPrice: 75, total: 0, comment: "" },
            { id: "refreshments-6", name: "Ice", metric: "2kg", quantity: 5, unitPrice: 75, total: 0, comment: "" },
            { id: "refreshments-7", name: "Coffee", metric: "750g", quantity: 3, unitPrice: 120, total: 0, comment: "" },
            { id: "refreshments-8", name: "Teabag", metric: "100s", quantity: 3, unitPrice: 50, total: 0, comment: "" },
            { id: "refreshments-9", name: "Milk", metric: "6x1L", quantity: 10, unitPrice: 125, total: 0, comment: "" },
            { id: "refreshments-10", name: "Sugar", metric: "10kg", quantity: 4, unitPrice: 260, total: 0, comment: "" },
            { id: "refreshments-11", name: "Bottled Water", metric: "24 of 300ml", quantity: 5, unitPrice: 125, total: 0, comment: "" },
            { id: "refreshments-12", name: "Juice", metric: "25 of 300ml", quantity: 4, unitPrice: 200, total: 0, comment: "" },
            { id: "refreshments-13", name: "Fizz Drinks", metric: "2Ls", quantity: 10, unitPrice: 140, total: 0, comment: "" },
        ]
    },
    {
        id: "meat", name: "Meat", total: 0, order: 5, items: [
            { id: "meat-1", name: "Sheep", metric: "per sheep", quantity: 5, unitPrice: 3000, total: 0, comment: "" },
            { id: "meat-2", name: "Goat", metric: "per goat", quantity: 1, unitPrice: 4000, total: 0, comment: "" },
            { id: "meat-3", name: "Cow", metric: "per cow", quantity: 1, unitPrice: 8500, total: 0, comment: "" },
            { id: "meat-4", name: "Chicken", metric: "5kg", quantity: 10, unitPrice: 250, total: 0, comment: "" },
        ]
    },
    {
        id: "starch", name: "Starch", total: 0, order: 6, items: [
            { id: "starch-1", name: "Bread", metric: "per loaf", quantity: 40, unitPrice: 20, total: 0, comment: "" },
            { id: "starch-2", name: "Samp", metric: "10kg", quantity: 5, unitPrice: 150, total: 0, comment: "" },
            { id: "starch-3", name: "Rice", metric: "10 kg", quantity: 5, unitPrice: 175, total: 0, comment: "" },
            { id: "starch-4", name: "Mealie Meal", metric: "10 kg", quantity: 4, unitPrice: 140, total: 0, comment: "" },
        ]
    },
    {
        id: "vegetables", name: "Vegetables", total: 0, order: 7, items: [
            { id: "vegetables-1", name: "Cabbage", metric: "8 heads", quantity: 4, unitPrice: 200, total: 0, comment: "" },
            { id: "vegetables-2", name: "Potatoes", metric: "10kg", quantity: 5, unitPrice: 45, total: 0, comment: "" },
            { id: "vegetables-3", name: "Carrot", metric: "10kg", quantity: 4, unitPrice: 85, total: 0, comment: "" },
            { id: "vegetables-4", name: "Onion", metric: "10kg", quantity: 4, unitPrice: 175, total: 0, comment: "" },
            { id: "vegetables-5", name: "Potatoes", metric: "10kg", quantity: 4, unitPrice: 200, total: 0, comment: "" },
        ]
    },
    {
        id: "fruit", name: "Fruit", total: 0, order: 8, items: [
            { id: "fruit-1", name: "Apples", metric: "per box", quantity: 3, unitPrice: 225, total: 0, comment: "" },
            { id: "fruit-2", name: "Banana", metric: "per box", quantity: 3, unitPrice: 150, total: 0, comment: "" },
            { id: "fruit-3", name: "Pears", metric: "per box", quantity: 3, unitPrice: 145, total: 0, comment: "" },
            { id: "fruit-4", name: "Watermelon", metric: "each", quantity: 10, unitPrice: 75, total: 0, comment: "" },
            { id: "fruit-5", name: "Oranges", metric: "per box", quantity: 5, unitPrice: 35, total: 0, comment: "" },
            { id: "fruit-6", name: "Grapes", metric: "per box", quantity: 5, unitPrice: 110, total: 0, comment: "" },
        ]
    },
    {
        id: "desserts", name: "Desserts", total: 0, order: 9, items: [
            { id: "desserts-1", name: "Cake", metric: "per item", quantity: 1, unitPrice: 10000, total: 0, comment: "" }
        ]
    },
    {
        id: "service", name: "Service", total: 0, order: 10, items: [
            { id: "service-1", name: "Pre-nup", metric: "per item", quantity: 1, unitPrice: 5000, total: 0, comment: "" },
            { id: "service-2", name: "Church", metric: "per event", quantity: 1, unitPrice: 5000, total: 0, comment: "" },
            { id: "service-3", name: "Pastor", metric: "per day", quantity: 1, unitPrice: 3000, total: 0, comment: "" },
            { id: "service-4", name: "Video Camera", metric: "per day", quantity: 1, unitPrice: 2500, total: 0, comment: "" },
            { id: "service-5", name: "Reception / Venue", metric: "per event", quantity: 1, unitPrice: 10000, total: 0, comment: "" },
            { id: "service-6", name: "Performers (live band)", metric: "per day", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
            { id: "service-7", name: "Tent", metric: "per item", quantity: 1, unitPrice: 1000, total: 0, comment: "" },
            { id: "service-8", name: "Tables", metric: "per item", quantity: 4, unitPrice: 150, total: 0, comment: "" },
            { id: "service-9", name: "Chairs", metric: "per item", quantity: 50, unitPrice: 15, total: 0, comment: "" },
            { id: "service-10", name: "Decorations", metric: "per day", quantity: 1, unitPrice: 10000, total: 0, comment: "" },
            { id: "service-11", name: "Invites", metric: "per item", quantity: 25, unitPrice: 250, total: 0, comment: "" },
            { id: "service-12", name: "Music / DJ", metric: "per day", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
            { id: "service-13", name: "Imbongi", metric: "per day", quantity: 1, unitPrice: 1000, total: 0, comment: "" },
        ]
    },
    {
        id: "logistics", name: "Logistics", total: 0, order: 11, items: [
            { id: "logistics-1", name: "Braai Master", metric: "per day", quantity: 5, unitPrice: 100, total: 0, comment: "" },
            { id: "logistics-2", name: "Cookers", metric: "per day", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
            { id: "logistics-3", name: "Bakkie Hire", metric: "per day", quantity: 1, unitPrice: 650, total: 0, comment: "" },
            { id: "logistics-4", name: "Cooler Boxer", metric: "per day", quantity: 4, unitPrice: 50, total: 0, comment: "" },
            { id: "logistics-5", name: "Spit Braai", metric: "per day", quantity: 2, unitPrice: 650, total: 0, comment: "" },
            { id: "logistics-6", name: "Mobile Fridge", metric: "per day", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
            { id: "logistics-7", name: "Mobile Toilet", metric: "per day", quantity: 3, unitPrice: 1000, total: 0, comment: "" },
            { id: "logistics-8", name: "Gas Stove / Burner", metric: "per day", quantity: 1, unitPrice: 500, total: 0, comment: "" },
            { id: "logistics-9", name: "Imbiza / Pots", metric: "per day", quantity: 10, unitPrice: 100, total: 0, comment: "" },
            { id: "logistics-10", name: "Spoons", metric: "10 pkt", quantity: 10, unitPrice: 20, total: 0, comment: "" },
            { id: "logistics-11", name: "Coffee Mugs", metric: "12 pack", quantity: 5, unitPrice: 200, total: 0, comment: "" },
        ]
    }
];

const birthdayBudgetData: BudgetCategory[] = [
    {
        id: "refreshments", name: "Refreshments", total: 0, order: 1, items: [
            { id: "refreshments-1", name: "Juice", metric: "2L", quantity: 10, unitPrice: 30, total: 0, comment: "" },
            { id: "refreshments-2", name: "Carbonated Drinks", metric: "2L", quantity: 10, unitPrice: 25, total: 0, comment: "" },
        ]
    },
    {
        id: "desserts", name: "Desserts", total: 0, order: 2, items: [
             { id: "desserts-1", name: "Birthday Cake", metric: "per item", quantity: 1, unitPrice: 800, total: 0, comment: "" }
        ]
    }
];

export const budgetTemplates = {
    funeral: funeralBudgetData,
    wedding: weddingBudgetData,
    birthday: birthdayBudgetData,
    other: funeralBudgetData, // Default to funeral for now
};

/**
 * @deprecated Use budgetTemplates instead
 */
export const initialBudgetData = funeralBudgetData;

    
    