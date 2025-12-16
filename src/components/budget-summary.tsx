
"use client";

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, CheckCircle, Wallet, ListChecks } from "lucide-react";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BudgetSummaryProps {
  grandTotal: number;
  daysLeft: string | null;
  mustDosTotal: number;
  mustDosCompleted: number;
  budgetId?: string;
  isTemplateMode?: boolean;
  eventType?: string;
}

export function BudgetSummary({ grandTotal, daysLeft, mustDosTotal, mustDosCompleted, budgetId, isTemplateMode, eventType }: BudgetSummaryProps) {
  const MustDoWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isTemplateMode) {
      return <div className="flex items-center justify-between p-2 rounded-lg bg-secondary">{children}</div>;
    }
    return (
      <Link href={`/planner/${budgetId}/must-dos`} className="flex items-center justify-between p-2 rounded-lg bg-secondary hover:bg-accent transition-colors">
        {children}
      </Link>
    );
  };
  
  const cardClasses = cn("h-full", {
    "event-card-wedding text-white": eventType === 'wedding',
    "event-card-funeral text-white": eventType === 'funeral',
  });

  const summaryItemClasses = cn("flex items-center justify-between p-2 rounded-lg", {
      "bg-black/20 backdrop-blur-sm": eventType === 'wedding' || eventType === 'funeral',
      "bg-secondary": !eventType || (eventType !== 'wedding' && eventType !== 'funeral')
  });

  const iconClasses = cn({
      "text-white": eventType === 'wedding' || eventType === 'funeral',
      "text-primary": !eventType || (eventType !== 'wedding' && eventType !== 'funeral')
  });

  return (
    <Card className={cardClasses}>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="font-headline text-2xl">Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid gap-1">
        <div className={summaryItemClasses}>
            <div className="flex items-center gap-3">
                <Wallet className={cn("h-6 w-6", iconClasses)} />
                <span className="font-semibold">Grand Total</span>
            </div>
            <span className="font-mono text-lg font-bold">{formatCurrency(grandTotal)}</span>
        </div>
        <div className={summaryItemClasses}>
            <div className="flex items-center gap-3">
                <CalendarClock className={cn("h-6 w-6", iconClasses)} />
                <span className="font-semibold">Days Left</span>
            </div>
            <span className="font-semibold">{daysLeft ?? 'N/A'}</span>
        </div>
        <MustDoWrapper>
            <div className="flex items-center gap-3">
                <ListChecks className={cn("h-6 w-6", iconClasses)} />
                <span className="font-semibold">Must-Do's</span>
            </div>
            <span className="font-semibold">{`${mustDosCompleted} / ${mustDosTotal}`}</span>
        </MustDoWrapper>
      </CardContent>
    </Card>
  );
}

    