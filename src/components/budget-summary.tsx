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
    <Card className="h-full">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="font-headline text-2xl">Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid gap-1">
        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary">
            <div className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-primary" />
                <span className="font-semibold">Grand Total</span>
            </div>
            <span className="font-mono text-lg font-bold">{formatCurrency(grandTotal)}</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary">
            <div className="flex items-center gap-3">
                <CalendarClock className="h-6 w-6 text-primary" />
                <span className="font-semibold">Days Left</span>
            </div>
            <span className="font-semibold">{daysLeft ?? 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary">
            <div className="flex items-center gap-3">
                <ListChecks className="h-6 w-6 text-primary" />
                <span className="font-semibold">Must-Dos</span>
            </div>
            <span className="font-semibold">{`${mustDosCompleted} / ${mustDosTotal}`}</span>
        </div>
      </CardContent>
    </Card>
  );
}
