
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

export function BudgetSummary({ grandTotal, daysLeft, mustDosTotal, mustDosCompleted, budgetId, isTemplateMode }: BudgetSummaryProps) {
  const MustDoWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isTemplateMode) {
      return <div className="flex items-center justify-between p-2 rounded-lg bg-black/5">{children}</div>;
    }
    return (
      <Link href={`/planner/${budgetId}/must-dos`} className="flex items-center justify-between p-2 rounded-lg bg-black/5 hover:bg-black/10 transition-colors">
        {children}
      </Link>
    );
  };
  
  return (
    <Card className="shadow-lg h-full card-glass">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="font-headline text-base font-semibold">Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="p-3 grid gap-1">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-black/5">
            <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Grand Total</span>
            </div>
            <span className="font-mono text-sm font-semibold">{formatCurrency(grandTotal)}</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-black/5">
            <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Days Left</span>
            </div>
            <span className="text-sm font-semibold">{daysLeft ?? 'N/A'}</span>
        </div>
        <MustDoWrapper>
            <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Must-Do's</span>
            </div>
            <span className="text-sm font-semibold">{`${mustDosCompleted} / ${mustDosTotal}`}</span>
        </MustDoWrapper>
      </CardContent>
    </Card>
  );
}

    