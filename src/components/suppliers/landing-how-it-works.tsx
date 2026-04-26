"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    num: "1",
    title: "Create Your Free Profile",
    body: "List your services, location, and pricing in minutes. No paperwork. No upfront costs.",
  },
  {
    num: "2",
    title: "Get Matched with Planners",
    body: "We surface your profile to event planners in your area who are actively looking for your services.",
  },
  {
    num: "3",
    title: "Unlock Opportunities",
    body: "Review opportunity cards showing what's needed, the budget range, and the event date. Use credits to connect directly with the planner.",
  },
  {
    num: "4",
    title: "Build Your Reputation",
    body: "Track your leads, provide feedback, and grow your local event business over time.",
  },
];

export function LandingHowItWorks() {
  const [open, setOpen] = useState(true);

  return (
    <section id="how-it-works" className="py-10 md:py-14 bg-secondary/50">
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between text-left cursor-pointer"
          aria-expanded={open}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#1D9E75" }}>
              Simple Process
            </p>
            <h2 className="text-2xl md:text-3xl font-bold">How It Works</h2>
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
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="flex gap-4 p-4 rounded-xl bg-background border transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="shrink-0 inline-flex items-center justify-center bg-[#1D9E75] text-white font-bold text-sm px-3 py-1 rounded-full">
                  {step.num}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{step.title}</p>
                  <p className="text-sm text-foreground/80 mt-0.5">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
