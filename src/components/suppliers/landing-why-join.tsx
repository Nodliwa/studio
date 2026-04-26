"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const POINTS = [
  {
    icon: "🎯",
    title: "Reach Planners Who Need You",
    body: "Connect with local event planners actively budgeting for exactly the services you offer.",
  },
  {
    icon: "💸",
    title: "Free to Join",
    body: "No subscription. No upfront fees. Create your profile and start receiving opportunities at no cost.",
  },
  {
    icon: "🔓",
    title: "Pay Only for Real Connections",
    body: "Only spend credits when you choose to unlock a specific opportunity. No wasted spend.",
  },
  {
    icon: "🇿🇦",
    title: "Built for the South African Market",
    body: "From Zulu traditional ceremonies to Cape Town weddings — we understand the full spectrum of South African events.",
  },
  {
    icon: "📱",
    title: "Manage from Your Phone",
    body: "Everything works on mobile. View opportunities, manage your profile, and track your leads on the go.",
  },
];

export function LandingWhyJoin() {
  const [open, setOpen] = useState(false);

  return (
    <section className="py-10 md:py-14 bg-secondary/50">
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between text-left cursor-pointer"
          aria-expanded={open}
        >
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
              Supplier Benefits
            </p>
            <h2 className="text-2xl md:text-3xl font-bold">Why Suppliers Join</h2>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform shrink-0",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <div className="space-y-4 pt-4 pb-2">
            {POINTS.map((point, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="text-2xl shrink-0">{point.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-foreground">{point.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{point.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
