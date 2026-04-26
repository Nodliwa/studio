"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How much does it cost to join?",
    a: "Joining SimpliPlan as a supplier is completely free. You only spend credits when you choose to unlock a specific opportunity. Your first opportunity is on us — 1 free credit is awarded when you register.",
  },
  {
    q: "What are credits?",
    a: "Credits are the currency used to unlock opportunities. 1 credit = R1. Opportunities cost from 20 credits (R20). Top-up options will be available soon.",
  },
  {
    q: "Will planners see my full profile before I unlock?",
    a: "No. Your profile details are only shared with a planner after you choose to unlock that specific opportunity. Planners cannot browse your profile without your consent.",
  },
  {
    q: "What kinds of events can I get work from?",
    a: "Birthdays, weddings, funerals, uMgidi, uMemulo, and any other family or community events. SimpliPlan covers the full range of South African events — traditional and modern.",
  },
  {
    q: "Can I be both a planner and a supplier on SimpliPlan?",
    a: "Yes. The same mobile number works for both a planner account and a supplier profile. We will ask which role you would like to continue as when you log in.",
  },
  {
    q: "What is an opportunity strength rating?",
    a: "Opportunity Strength (High / Medium / Low) is a quality signal based on how complete and specific the planner's requirements are. High strength opportunities have a clear budget, event date, and service need.",
  },
  {
    q: "Can I pass on an opportunity I am not interested in?",
    a: "Yes. Passing on an opportunity is free and does not cost any credits. You only pay when you actively choose to unlock and connect.",
  },
  {
    q: "Is SimpliPlan a marketplace?",
    a: "No. SimpliPlan is not a marketplace, booking platform, or payment gateway. We connect suppliers with planners. All pricing, payment, and arrangements are agreed directly between you and the planner.",
  },
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-10 md:py-14 bg-secondary/50">
      <div className="container mx-auto px-4 max-w-3xl">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
          Questions
        </p>
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="border rounded-lg bg-background overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left cursor-pointer gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-foreground">{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground border-t pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
