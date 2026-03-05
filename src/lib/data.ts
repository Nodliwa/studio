import type { BudgetCategory } from "./types";

const funeralBudgetData: BudgetCategory[] = [
    {
        id: 'catering',
        name: 'Catering',
        total: 0,
        order: 1,
        subCategories: [
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
                { id: "item-2-1", name: "Bread", metric: "per loaf", quantity: 50, unitPrice: 20, total: 0, comment: "" },
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
                { id: "item-3-5", name: "Tomatoes", metric: "10kg", quantity: 6, unitPrice: 195, total: 0, comment: "" },
                { id: "item-3-6", name: "Potatoes", metric: "10kg", quantity: 4, unitPrice: 200, total: 0, comment: "" },
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
            }
        ],
        items: []
    },
    {
        id: "cat-6",
        name: "Deceased",
        total: 0,
        order: 2,
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
        order: 3,
        items: [
            { id: "item-7-6", name: "Gas Stove / Burner", metric: "per item", quantity: 2, unitPrice: 500, total: 0, comment: "" },
            { id: "item-7-7", name: "Cookware hire", metric: "per item", quantity: 8, unitPrice: 100, total: 0, comment: "" },
            { id: "item-7-8", name: "Tableware hire", metric: "4 set", quantity: 40, unitPrice: 50, total: 0, comment: "" },
            { id: "item-7-9", name: "Takeaway plate", metric: "75 pcs", quantity: 2, unitPrice: 100, total: 0, comment: "" },
            { id: "item-7-10", name: "Cutlery hire", metric: "4 set", quantity: 40, unitPrice: 30, total: 0, comment: "" },
            { id: "item-7-11", name: "Table-Deco", metric: "per table", quantity: 10, unitPrice: 200, total: 0, comment: "" },
            { id: "item-7-12", name: "Funeral Program", metric: "per copy", quantity: 50, unitPrice: 15, total: 0, comment: "" },
            { id: "item-7-18", name: "Videographer", metric: "per day", quantity: 1, unitPrice: 2500, total: 0, comment: "" },
            { id: "item-7-19", name: "Pastor", metric: "per day", quantity: 1, unitPrice: 3000, total: 0, comment: "" },
            { id: "item-7-20", name: "Church Choir", metric: "per day", quantity: 1, unitPrice: 3000, total: 0, comment: "" },
        ],
    },
    {
        id: "cat-8",
        name: "Logistics",
        total: 0,
        order: 4,
        items: [
            { id: "item-8-1", name: "BraaiMaster", metric: "per day", quantity: 5, unitPrice: 100, total: 0, comment: "" },
            { id: "item-8-2", name: "Cookers", metric: "per day", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
            { id: "item-8-3", name: "Bakers", metric: "per day", quantity: 1, unitPrice: 2000, total: 0, comment: "" },
            { id: "item-8-4", name: "Bakkie Hire", metric: "per day", quantity: 1, unitPrice: 650, total: 0, comment: "" },
            { id: "item-8-5", name: "Bus/Taxi", metric: "per day", quantity: 0, unitPrice: 1500, total: 0, comment: "" },
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
                    { id: 'bride-1', name: 'Wedding Dress', metric: 'item', quantity: 1, unitPrice: 12500, total: 0, comment: '' },
                    { id: 'bride-2', name: 'Traditional Dress', metric: 'item', quantity: 1, unitPrice: 7500, total: 0, comment: '' },
                    { id: 'bride-3', name: 'Veil/Headpiece', metric: 'item', quantity: 1, unitPrice: 1500, total: 0, comment: '' },
                    { id: 'bride-4', name: 'Ring', metric: 'item', quantity: 1, unitPrice: 15000, total: 0, comment: '' },
                    { id: 'bride-5', name: 'Necklace & Bracelet', metric: 'per set', quantity: 1, unitPrice: 4500, total: 0, comment: '' },
                    { id: 'bride-6', name: 'Makeup', metric: 'item', quantity: 1, unitPrice: 2000, total: 0, comment: '' },
                    { id: 'bride-7', name: 'Hairstylist', metric: 'item', quantity: 1, unitPrice: 1500, total: 0, comment: '' },
                    { id: 'bride-8', name: 'Footware', metric: 'item', quantity: 1, unitPrice: 4500, total: 0, comment: '' },
                    { id: 'bride-9', name: 'Traditional Accessories', metric: 'per set', quantity: 1, unitPrice: 4500, total: 0, comment: '' },
                ],
            },
            {
                id: 'groom',
                name: 'Groom',
                total: 0,
                order: 2,
                items: [
                    { id: 'groom-1', name: 'Suit/Tuxedo', metric: 'item', quantity: 1, unitPrice: 5000, total: 0, comment: '' },
                    { id: 'groom-2', name: 'Ring', metric: 'item', quantity: 1, unitPrice: 7500, total: 0, comment: '' },
                    { id: 'groom-3', name: 'Casual Wear', metric: 'item', quantity: 1, unitPrice: 4500, total: 0, comment: '' },
                    { id: 'groom-4', name: 'Traditional Wear', metric: 'item', quantity: 1, unitPrice: 7500, total: 0, comment: '' },
                    { id: 'groom-5', name: 'Traditional Accessories', metric: 'per set', quantity: 1, unitPrice: 1500, total: 0, comment: '' },
                    { id: 'groom-6', name: 'Footware', metric: 'pair', quantity: 1, unitPrice: 5500, total: 0, comment: '' },
                    { id: 'groom-7', name: 'Grooming', metric: 'item', quantity: 1, unitPrice: 350, total: 0, comment: '' },
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
                    { id: 'veg-5', name: 'Tomatoes', metric: '10kg', quantity: 5, unitPrice: 180, total: 0, comment: '' },
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
                    { id: 'fruit-3', name: 'Oranges', metric: 'per sack', quantity: 3, unitPrice: 70, total: 0, comment: '' },
                    { id: 'fruit-4', name: 'Water Melon', metric: 'item', quantity: 8, unitPrice: 75, total: 0, comment: '' },
                    { id: 'fruit-5', name: 'Grapes', metric: 'per box', quantity: 4, unitPrice: 120, total: 0, comment: '' },
                    { id: "fruit-6", name: "Pears", metric: "per box", quantity: 3, unitPrice: 145, total: 0, comment: "" },
                ],
            },
             {
                id: 'desserts',
                name: 'Desserts & Beverages',
                total: 0,
                order: 6,
                items: [
                    { id: 'desserts-1', name: 'Wedding Cake', metric: 'item', quantity: 1, unitPrice: 3000, total: 0, comment: '3-tier cake for 100 guests' },
                    { id: 'desserts-2', name: 'Assorted Desserts', metric: 'per serving', quantity: 50, unitPrice: 50, total: 0, comment: '' },
                    { id: 'desserts-3', name: 'Spirits', metric: 'item', quantity: 10, unitPrice: 350, total: 0, comment: '' },
                    { id: 'desserts-4', name: 'Wine', metric: 'item', quantity: 10, unitPrice: 120, total: 0, comment: '' },
                    { id: 'desserts-5', name: 'Beer & Ciders', metric: '24 pck', quantity: 20, unitPrice: 350, total: 0, comment: '' },
                ],
            },
        ],
    },
    {
        id: 'service',
        name: 'Service',
        total: 0,
        order: 4,
        items: [
            { id: "service-1", name: "Pre-Nup", metric: "per contract", quantity: 1, unitPrice: 5000, total: 0, comment: "" },
            { id: "service-2", name: "Pastor", metric: "per day", quantity: 1, unitPrice: 3000, total: 0, comment: "" },
            { id: "service-3", name: "Live-band/DJ", metric: "per day", quantity: 1, unitPrice: 3000, total: 0, comment: "" },
            { id: "service-4", name: "Cookware hire", metric: "per item", quantity: 6, unitPrice: 100, total: 0, comment: "" },
            { id: "service-5", name: "Tableware hire", metric: "per item", quantity: 40, unitPrice: 10, total: 0, comment: "" },
            { id: "service-6", name: "Cutlery hire", metric: "10 pkt", quantity: 10, unitPrice: 20, total: 0, comment: "" },
            { id: "service-7", name: "Table-Deco", metric: "12 pack", quantity: 5, unitPrice: 200, total: 0, comment: "" },
            { id: "service-8", name: "Praise Singer", metric: "per day", quantity: 1, unitPrice: 1500, total: 0, comment: "" },
        ],
    },
    {
        id: 'logistics',
        name: 'Logistics',
        total: 0,
        order: 5,
        items: [
            { id: "logistics-1", name: "BraaiMaster", metric: "per day", quantity: 5, unitPrice: 100, total: 0, comment: "" },
            { id: 'logistics-2', name: 'Gas-Stoves/Burner', metric: 'item', quantity: 2, unitPrice: 500, total: 0, comment: '' },
            { id: "logistics-3", name: "Cookers", metric: "per day", quantity: 1, unitPrice: 2500, total: 0, comment: "" },
            { id: "logistics-4", name: "Bakers", metric: "per day", quantity: 1, unitPrice: 2500, total: 0, comment: "" },
            { id: "logistics-5", name: "Bakkie Hire", metric: "per day", quantity: 1, unitPrice: 950, total: 0, comment: "" },
            { id: "logistics-6", name: "MiniBus / Taxi", metric: "per day", quantity: 1, unitPrice: 750, total: 0, comment: "" },
            { id: "logistics-7", name: "Tent", metric: "per day", quantity: 1, unitPrice: 1000, total: 0, comment: "" },
            { id: "logistics-8", name: "Chairs", metric: "per day", quantity: 60, unitPrice: 35, total: 0, comment: "" },
            { id: "logistics-9", name: "Tables", metric: "per day", quantity: 15, unitPrice: 80, total: 0, comment: "" },
            { id: "logistics-10", name: "Mobile Toilets", metric: "per day", quantity: 3, unitPrice: 500, total: 0, comment: "" },
            { id: "logistics-11", name: "Photographer", metric: "per day", quantity: 1, unitPrice: 2500, total: 0, comment: "" },
            { id: "logistics-12", name: "Videographer", metric: "per day", quantity: 1, unitPrice: 2500, total: 0, comment: "" },
        ],
    },
];

const umGidiBudgetData: BudgetCategory[] = [
    {
        id: 'refreshments',
        name: 'Refreshments',
        total: 0,
        order: 1,
        items: [
            { id: 'ref-1', name: 'Brandy', metric: 'per bottle', quantity: 10, unitPrice: 180, total: 0, comment: '' },
            { id: 'ref-2', name: 'Whisky / Gin', metric: 'per bottle', quantity: 5, unitPrice: 200, total: 0, comment: '' },
            { id: 'ref-3', name: 'Umqombothi', metric: '100Ls', quantity: 3, unitPrice: 350, total: 0, comment: '' },
            { id: 'ref-4', name: 'Beer', metric: 'Cases', quantity: 10, unitPrice: 250, total: 0, comment: '' },
            { id: 'ref-5', name: 'Wine', metric: 'per bottle', quantity: 10, unitPrice: 75, total: 0, comment: '' },
            { id: 'ref-6', name: 'Ice', metric: '2kg', quantity: 5, unitPrice: 75, total: 0, comment: '' },
            { id: 'ref-7', name: 'Coffee', metric: '750g', quantity: 3, unitPrice: 120, total: 0, comment: '' },
            { id: 'ref-8', name: 'Teabag', metric: "100's", quantity: 3, unitPrice: 50, total: 0, comment: '' },
            { id: 'ref-9', name: 'Milk', metric: '6x1L', quantity: 10, unitPrice: 125, total: 0, comment: '' },
            { id: 'ref-10', name: 'Sugar', metric: '10kg', quantity: 4, unitPrice: 260, total: 0, comment: '' },
            { id: 'ref-11', name: 'Bottled Water', metric: '24 of 300ml', quantity: 5, unitPrice: 125, total: 0, comment: '' },
            { id: 'ref-12', name: 'Juice', metric: '25 of 300ml', quantity: 4, unitPrice: 200, total: 0, comment: '' },
            { id: 'ref-13', name: 'Fizz Drinks', metric: '2Ls', quantity: 10, unitPrice: 140, total: 0, comment: '' },
        ]
    },
    {
        id: 'meat',
        name: 'Meat',
        total: 0,
        order: 2,
        items: [
            { id: 'meat-u-1', name: 'Sheep', metric: 'per sheep', quantity: 5, unitPrice: 3000, total: 0, comment: '' },
            { id: 'meat-u-2', name: 'Goat', metric: 'per goat', quantity: 1, unitPrice: 4000, total: 0, comment: '' },
            { id: 'meat-u-3', name: 'Cow', metric: 'per cow', quantity: 1, unitPrice: 8500, total: 0, comment: '' },
            { id: 'meat-u-4', name: 'Chicken', metric: '5kg', quantity: 10, unitPrice: 250, total: 0, comment: '' },
        ]
    },
    {
        id: 'starch',
        name: 'Starch',
        total: 0,
        order: 3,
        items: [
            { id: 'starch-u-1', name: 'Bread', metric: 'per loaf', quantity: 40, unitPrice: 20, total: 0, comment: '' },
            { id: 'starch-u-2', name: 'Samp (Umngqusho)', metric: '10kg', quantity: 5, unitPrice: 150, total: 0, comment: '' },
            { id: 'starch-u-3', name: 'Rice', metric: '10 kg', quantity: 5, unitPrice: 175, total: 0, comment: '' },
            { id: 'starch-u-4', name: 'Mealie Meal', metric: '10 kg', quantity: 4, unitPrice: 140, total: 0, comment: '' },
        ]
    },
    {
        id: 'vegetables',
        name: 'Vegetables',
        total: 0,
        order: 4,
        items: [
            { id: 'veg-u-1', name: 'Cabbage', metric: '8 heads', quantity: 4, unitPrice: 200, total: 0, comment: '' },
            { id: 'veg-u-2', name: 'Potatoes', metric: '10kg', quantity: 5, unitPrice: 45, total: 0, comment: '' },
            { id: 'veg-u-3', name: 'Carrot', metric: '10kg', quantity: 4, unitPrice: 85, total: 0, comment: '' },
            { id: 'veg-u-4', name: 'Onion', metric: '10kg', quantity: 4, unitPrice: 175, total: 0, comment: '' },
            { id: 'veg-u-5', name: 'Potatoes (Extra)', metric: '10kg', quantity: 4, unitPrice: 200, total: 0, comment: '' },
        ]
    },
    {
        id: 'fruit',
        name: 'Fruit',
        total: 0,
        order: 5,
        items: [
            { id: 'fruit-u-1', name: 'Apples', metric: 'per box', quantity: 2, unitPrice: 225, total: 0, comment: '' },
            { id: 'fruit-u-2', name: 'Banana', metric: 'per box', quantity: 3, unitPrice: 150, total: 0, comment: '' },
            { id: 'fruit-u-3', name: 'Oranges', metric: '10 kg', quantity: 5, unitPrice: 30, total: 0, comment: '' },
        ]
    },
    {
        id: 'implements',
        name: 'Implements',
        total: 0,
        order: 6,
        items: [
            { id: 'imp-1', name: 'Tent', metric: 'per item', quantity: 1, unitPrice: 1000, total: 0, comment: '' },
            { id: 'imp-2', name: 'Tables', metric: 'per item', quantity: 4, unitPrice: 150, total: 0, comment: '' },
            { id: 'imp-3', name: 'Chairs', metric: 'per item', quantity: 50, unitPrice: 15, total: 0, comment: '' },
            { id: 'imp-4', name: 'Mobile Fridge', metric: 'per item', quantity: 1, unitPrice: 2000, total: 0, comment: '' },
            { id: 'imp-5', name: 'Mobile Toilet', metric: 'per item', quantity: 3, unitPrice: 1000, total: 0, comment: '' },
            { id: 'imp-6', name: 'Gas Stove / Burner', metric: 'per item', quantity: 1, unitPrice: 500, total: 0, comment: '' },
            { id: 'imp-7', name: 'Imbiza / Pots', metric: 'per item', quantity: 6, unitPrice: 100, total: 0, comment: '' },
            { id: 'imp-8', name: 'Plates', metric: 'per item', quantity: 40, unitPrice: 10, total: 0, comment: '' },
            { id: 'imp-9', name: 'Takeaway plate', metric: '75 pcs', quantity: 1, unitPrice: 100, total: 0, comment: '' },
            { id: 'imp-10', name: 'Spoons', metric: '10 pkt', quantity: 10, unitPrice: 20, total: 0, comment: '' },
            { id: 'imp-11', name: 'Coffee Mugs', metric: '12 pack', quantity: 5, unitPrice: 200, total: 0, comment: '' },
            { id: 'imp-12', name: 'Cooler Box', metric: 'per item', quantity: 4, unitPrice: 50, total: 0, comment: '' },
            { id: 'imp-13', name: 'Spit Braai', metric: 'per item', quantity: 2, unitPrice: 1050, total: 0, comment: '' },
        ]
    },
    {
        id: 'clothing',
        name: 'Clothing',
        total: 0,
        order: 7,
        subCategories: [
            {
                id: 'umkhwetha',
                name: 'Umkhwetha (The Boy)',
                total: 0,
                order: 1,
                items: [
                    { id: 'boy-1', name: 'Initiation Certification', metric: 'per event', quantity: 1, unitPrice: 950, total: 0, comment: '' },
                    { id: 'boy-2', name: 'Ingubo yongena', metric: 'per item', quantity: 1, unitPrice: 450, total: 0, comment: '' },
                    { id: 'boy-3', name: 'Ingcibi', metric: 'per event', quantity: 1, unitPrice: 2000, total: 0, comment: '' },
                    { id: 'boy-4', name: 'Ikhankatha', metric: 'per event', quantity: 1, unitPrice: 3000, total: 0, comment: '' },
                    { id: 'boy-5', name: 'Ibhuma', metric: 'per event', quantity: 1, unitPrice: 2000, total: 0, comment: '' },
                ]
            },
            {
                id: 'ikrwala',
                name: 'iKrwala (The New Man)',
                total: 0,
                order: 2,
                items: [
                    { id: 'man-1', name: 'Ingubo Yophuma', metric: 'per item', quantity: 1, unitPrice: 450, total: 0, comment: '' },
                    { id: 'man-2', name: 'Ikhetshemiya', metric: 'per item', quantity: 2, unitPrice: 300, total: 0, comment: '' },
                    { id: 'man-3', name: 'Imbola', metric: 'per item', quantity: 5, unitPrice: 40, total: 0, comment: '' },
                    { id: 'man-4', name: 'Shirts', metric: 'per item', quantity: 3, unitPrice: 350, total: 0, comment: '' },
                    { id: 'man-5', name: 'Trousers/Pants', metric: 'per item', quantity: 2, unitPrice: 750, total: 0, comment: '' },
                    { id: 'man-6', name: 'Shoes', metric: 'per item', quantity: 2, unitPrice: 1500, total: 0, comment: '' },
                    { id: 'man-7', name: 'Socks', metric: 'per item', quantity: 4, unitPrice: 50, total: 0, comment: '' },
                    { id: 'man-8', name: 'Chefu', metric: 'per item', quantity: 3, unitPrice: 75, total: 0, comment: '' },
                    { id: 'man-9', name: 'Cap/Hat', metric: 'per item', quantity: 2, unitPrice: 750, total: 0, comment: '' },
                    { id: 'man-10', name: 'Underwear', metric: 'per item', quantity: 5, unitPrice: 100, total: 0, comment: '' },
                ]
            },
            {
                id: 'izibanzana',
                name: 'Izibanzana',
                total: 0,
                order: 3,
                items: [
                    { id: 'izi-1', name: 'Umbaco', metric: 'per set', quantity: 1, unitPrice: 5000, total: 0, comment: '' },
                    { id: 'izi-2', name: 'Paskot', metric: 'per item', quantity: 1, unitPrice: 500, total: 0, comment: '' },
                    { id: 'izi-3', name: 'Qhiya', metric: 'per item', quantity: 1, unitPrice: 350, total: 0, comment: '' },
                    { id: 'izi-4', name: 'Bead art work', metric: 'per set', quantity: 1, unitPrice: 350, total: 0, comment: '' },
                ]
            },
            {
                id: 'utata',
                name: 'Utata',
                total: 0,
                order: 4,
                items: [
                    { id: 'tata-1', name: 'Head band', metric: 'per item', quantity: 1, unitPrice: 400, total: 0, comment: '' },
                    { id: 'tata-2', name: 'Beaded stick', metric: 'per item', quantity: 1, unitPrice: 400, total: 0, comment: '' },
                    { id: 'tata-3', name: 'Umbaco', metric: 'per set', quantity: 1, unitPrice: 1050, total: 0, comment: '' },
                ]
            }
        ]
    },
    {
        id: 'event-execution',
        name: 'Event Execution',
        total: 0,
        order: 8,
        items: [
            { id: 'exe-1', name: 'Abaxheli / Slaughters', metric: 'per day', quantity: 5, unitPrice: 100, total: 0, comment: '' },
            { id: 'exe-2', name: 'Aboji', metric: 'per day', quantity: 2, unitPrice: 500, total: 0, comment: '' },
            { id: 'exe-3', name: 'Abapheki (ebuhlanti)', metric: 'per day', quantity: 2, unitPrice: 500, total: 0, comment: '' },
            { id: 'exe-4', name: 'Abapheki / Cookers', metric: 'per day', quantity: 1, unitPrice: 2000, total: 0, comment: '' },
            { id: 'exe-5', name: 'Ababhaki', metric: 'per day', quantity: 1, unitPrice: 2000, total: 0, comment: '' },
            { id: 'exe-6', name: 'Bakkie Hire', metric: 'per day', quantity: 1, unitPrice: 650, total: 0, comment: '' },
            { id: 'exe-7', name: 'Video Capturing', metric: 'per day', quantity: 1, unitPrice: 2500, total: 0, comment: '' },
            { id: 'exe-8', name: 'Music / DJ', metric: 'per day', quantity: 1, unitPrice: 2000, total: 0, comment: '' },
            { id: 'exe-9', name: 'Imbongi', metric: 'per day', quantity: 1, unitPrice: 1000, total: 0, comment: '' },
            { id: 'exe-10', name: 'Performers (live band)', metric: 'per day', quantity: 1, unitPrice: 2000, total: 0, comment: '' },
        ]
    }
];

const otherBudgetData: BudgetCategory[] = [
    {
        id: 'general',
        name: 'General',
        total: 0,
        order: 1,
        items: [
            { id: 'gen-1', name: 'New Item', metric: 'item', quantity: 1, unitPrice: 0, total: 0, comment: '' },
        ],
    }
];

export const budgetTemplates = {
    funeral: funeralBudgetData,
    wedding: weddingBudgetData,
    umgidi: umGidiBudgetData,
    other: otherBudgetData
};
