"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  {
    heading: "Food & Catering",
    items: [
      "Caterers & Cooks (professional and home-based)",
      "Slaughterers & Braai Masters",
      "Bakers & Cake Makers",
      "Traditional Food Specialists",
    ],
  },
  {
    heading: "Photography & Media",
    items: ["Photographers", "Videographers"],
  },
  {
    heading: "Music & Entertainment",
    items: [
      "DJs & Music Providers",
      "Live Bands & Performers",
      "Praise Singers (Imbongi)",
      "Face Painters & Entertainers",
      "MCs & Event Hosts",
    ],
  },
  {
    heading: "Logistics & Equipment",
    items: [
      "Tent, Table & Chair Hire",
      "Transport & Shuttle Services",
      "Bakkie & Vehicle Hire",
      "Mobile Toilet Hire",
    ],
  },
  {
    heading: "Attire & Décor",
    items: [
      "Traditional Attire & Beadwork",
      "Florists & Event Decorators",
      "Costume & Dress Hire",
    ],
  },
  {
    heading: "Event Services",
    items: [
      "Event Coordinators",
      "Venue Owners & Hall Hire",
      "Waiters & Event Staff",
      "Security Personnel",
    ],
  },
  {
    heading: "Ceremony Specialists",
    items: [
      "Traditional Ceremony Facilitators",
      "Funeral Service Providers",
      "Religious Officiants & Pastors",
      "Church Choirs",
    ],
  },
  {
    heading: "Individual Skills Welcome",
    items: [
      "Anyone who cooks, bakes, or braais for events",
      "Drivers & helpers",
      "Cleaners & setup crew",
      "Any skill that supports an event",
    ],
  },
];

export function LandingWhoCanJoin() {
  const [open, setOpen] = useState(false);

  return (
    <section className="py-10 md:py-14 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between text-left cursor-pointer gap-4"
          aria-expanded={open}
        >
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
              Open to All
            </p>
            <h2 className="text-2xl md:text-3xl font-bold">
              Open to All — Individuals, Informal Traders &amp; Businesses
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Whether you cook or sew from home or run a registered business — if you can help
              people with their celebrations,{" "}
              <strong className="text-foreground font-semibold">you belong here</strong>.
            </p>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform shrink-0",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 pb-2">
            {CATEGORIES.map((cat) => (
              <div key={cat.heading} className="space-y-1.5">
                <p className="text-sm font-semibold text-primary">{cat.heading}</p>
                <ul className="space-y-1">
                  {cat.items.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
