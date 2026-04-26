"use client";

import { format } from "date-fns";
import type { SupplierCredit } from "@/lib/supplier-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Coins, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditPanelProps {
  credits: number;
  creditHistory: (SupplierCredit & { id: string })[];
}

const REASON_LABELS: Record<string, string> = {
  signup_bonus: "Signup bonus",
  opportunity_unlock: "Opportunity unlock",
  top_up: "Credit top-up",
  admin_adjustment: "Admin adjustment",
};

export function CreditPanel({ credits, creditHistory }: CreditPanelProps) {
  const sorted = Array.from(creditHistory).sort((a, b) => {
    const aMs = a.createdAt?.toMillis() ?? 0;
    const bMs = b.createdAt?.toMillis() ?? 0;
    return bMs - aMs;
  });

  return (
    <div className="space-y-6">
      {/* Balance card */}
      <div className="bg-card rounded-xl shadow-sm border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Coins className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Credits Balance</p>
            <p className="text-4xl font-bold tabular-nums">{credits}</p>
            <p className="text-xs text-muted-foreground mt-0.5">1 credit = 1 lead unlock</p>
          </div>
        </div>
        <Button disabled variant="outline" className="w-full sm:w-auto opacity-60 cursor-not-allowed">
          Add Credits — Coming Soon
        </Button>
      </div>

      {/* Pricing info */}
      <div className="bg-muted/40 rounded-xl border border-dashed p-4 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">How credits work</p>
        <p>Each credit unlocks one opportunity and reveals the planner&apos;s contact details.</p>
        <p>You received 1 free credit when you registered. Paid top-ups are coming soon.</p>
      </div>

      {/* Transaction history */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Transaction History
        </h3>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No transactions yet.</p>
        ) : (
          <div className="bg-card rounded-xl shadow-sm border divide-y">
            {sorted.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                    tx.type === "credit" ? "bg-emerald-100" : "bg-rose-100",
                  )}>
                    {tx.type === "credit" ? (
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-rose-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.createdAt ? format(tx.createdAt.toDate(), "d MMM yyyy, HH:mm") : "—"}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge
                    className={cn(
                      "font-mono text-xs",
                      tx.type === "credit"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-rose-100 text-rose-700 border-rose-200",
                    )}
                    variant="outline"
                  >
                    {tx.type === "credit" ? "+" : "−"}{tx.amount}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    bal: {tx.balanceAfter}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <p className="text-xs text-muted-foreground text-center">
        Need more credits or have a billing question?{" "}
        <a href="mailto:hello@simpliplan.co.za" className="text-primary underline underline-offset-2">
          Contact us
        </a>
      </p>
    </div>
  );
}
