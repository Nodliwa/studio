
"use client";

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, CheckCircle, Wallet, ListChecks } from "lucide-react";
import React from "react";

interface BudgetSummaryProps {
  grandTotal: number;
  daysLeft: string | null;
  mustDosTotal: number;
  mustDosCompleted: number;
}

export function BudgetSummary({ grandTotal, daysLeft, mustDosTotal, mustDosCompleted }: BudgetSummaryProps) {
  return (
    <Card className="shadow-lg border-border/60">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="font-headline text-2xl">Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid gap-2">
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-primary" />
                <span className="font-semibold text-lg">Grand Total</span>
            </div>
            <span className="font-mono text-xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
                <CalendarClock className="h-6 w-6 text-primary" />
                <span className="font-semibold text-lg">Days Left</span>
            </div>
            <span className="font-semibold text-lg">{daysLeft ?? 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
                <ListChecks className="h-6 w-6 text-primary" />
                <span className="font-semibold text-lg">Must-Dos</span>
            </div>
            <span className="font-semibold text-lg">{`${mustDosCompleted} / ${mustDosTotal}`}</span>
        </div>
      </CardContent>
    </Card>
  );
}
