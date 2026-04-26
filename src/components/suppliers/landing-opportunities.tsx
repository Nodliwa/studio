"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const POINTS = [
  "Planners using SimpliPlan create event budgets and flag their service needs.",
  "You receive opportunity cards matched to your services and area.",
  "Each card shows the service needed, budget range, location, and days until the event.",
  "Review the Opportunity Strength indicator — High, Medium, or Low — before deciding.",
  'Click "Unlock" to use a credit and connect. Your supplier profile is shared with the planner.',
  "Your first opportunity is completely free. 1 credit is awarded on registration.",
  "After the event, share feedback on whether the lead was genuine. This helps everyone.",
  "Consistent, honest feedback improves matching quality over time for all suppliers.",
];

export function LandingOpportunities() {
  const [open, setOpen] = useState(false);

  return (
    <section className="py-10 md:py-14 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between text-left cursor-pointer"
          aria-expanded={open}
        >
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
              The Lead System
            </p>
            <h2 className="text-2xl md:text-3xl font-bold">How Opportunities Work</h2>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform shrink-0",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <ol className="space-y-3 pt-4 pb-2 list-none">
            {POINTS.map((point, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-muted-foreground pt-0.5">{point}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
