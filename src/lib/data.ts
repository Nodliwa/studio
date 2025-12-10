import type { BudgetCategory } from "./types";
import { UtensilsCrossed, Gift, Music, Clapperboard, Camera, MapPin, PartyPopper } from "lucide-react";

export const initialBudgetData: BudgetCategory[] = [
  {
    id: "cat-1",
    name: "Venue & Services",
    icon: MapPin,
    total: 0,
    items: [
      {
        id: "item-1-1",
        name: "Hall Rental",
        metric: "hours",
        quantity: 4,
        unitPrice: 250,
        total: 1000,
        comment: "Main event space for 4 hours.",
      },
    ],
    subCategories: [
      {
        id: "subcat-1-1",
        name: "Photography",
        icon: Camera,
        total: 0,
        items: [
          {
            id: "item-1-1-1",
            name: "Photographer",
            metric: "hours",
            quantity: 3,
            unitPrice: 150,
            total: 450,
            comment: "Covers key moments of the event.",
          },
        ],
      },
       {
        id: "subcat-1-2",
        name: "Videography",
        icon: Clapperboard,
        total: 0,
        items: [
          {
            id: "item-1-2-1",
            name: "Videographer",
            metric: "hours",
            quantity: 3,
            unitPrice: 200,
            total: 600,
            comment: "3-5 minute highlight reel.",
          },
        ],
      },
    ],
  },
  {
    id: "cat-2",
    name: "Food & Beverage",
    icon: UtensilsCrossed,
    total: 0,
    items: [],
    subCategories: [
      {
        id: "subcat-2-1",
        name: "Catering",
        icon: UtensilsCrossed,
        total: 0,
        items: [
          {
            id: "item-2-1-1",
            name: "Dinner Buffet",
            metric: "guests",
            quantity: 50,
            unitPrice: 45,
            total: 2250,
            comment: "Includes 3 main courses and 2 sides.",
          },
          {
            id: "item-2-1-2",
            name: "Appetizers",
            metric: "platters",
            quantity: 4,
            unitPrice: 75,
            total: 300,
            comment: "Assorted pre-dinner snacks.",
          },
        ],
      },
      {
        id: "subcat-2-2",
        name: "Beverages",
        icon: PartyPopper,
        total: 0,
        items: [
          {
            id: "item-2-2-1",
            name: "Open Bar",
            metric: "guests",
            quantity: 50,
            unitPrice: 30,
            total: 1500,
            comment: "Beer, wine, and soft drinks.",
          },
        ],
      },
    ],
  },
  {
    id: "cat-3",
    name: "Entertainment & Gifts",
    icon: Music,
    total: 0,
    items: [],
    subCategories: [
      {
        id: "subcat-3-1",
        name: "Music",
        icon: Music,
        total: 0,
        items: [
          {
            id: "item-3-1-1",
            name: "DJ",
            metric: "hours",
            quantity: 4,
            unitPrice: 125,
            total: 500,
            comment: "Includes sound system and lighting.",
          },
        ],
      },
      {
        id: "subcat-3-2",
        name: "Gifts",
        icon: Gift,
        total: 0,
        items: [
          {
            id: "item-3-2-1",
            name: "Party Favors",
            metric: "guests",
            quantity: 50,
            unitPrice: 10,
            total: 500,
            comment: "Customized souvenirs for guests.",
          },
        ],
      },
    ],
  },
];
