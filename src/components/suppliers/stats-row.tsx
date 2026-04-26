"use client";

import { HelpCircle } from "lucide-react";
import type { Supplier, SupplierOpportunity, SupplierCredit } from "@/lib/supplier-types";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatsRowProps {
  supplier: Supplier & { id: string };
  allOpportunities: (SupplierOpportunity & { id: string })[];
  creditHistory: (SupplierCredit & { id: string })[];
  uid: string;
}

interface StatTileProps {
  label: string;
  tooltip: string;
  value: React.ReactNode;
  sub?: string;
  className?: string;
  children?: React.ReactNode;
}

function StatTile({ label, tooltip, value, sub, className, children }: StatTileProps) {
  return (
    <div className={cn("bg-card rounded-xl p-4 shadow-sm space-y-1", className)}>
      <div className="flex items-center gap-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide leading-none">
          {label}
        </p>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
            >
              <HelpCircle className="h-3 w-3" />
              <span className="sr-only">About {label}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[220px] text-xs leading-snug">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      {children}
    </div>
  );
}

export function StatsRow({ supplier, allOpportunities, creditHistory, uid }: StatsRowProps) {
  const activeOpps = allOpportunities.filter((o) => o.status === "active");
  const newCount = activeOpps.filter((o) => !o.unlockedBy?.[uid]).length;
  const unlockedCount = activeOpps.filter((o) => !!o.unlockedBy?.[uid]).length;

  const successfulLeads = allOpportunities.filter(
    (o) => o.unlockedBy?.[uid]?.feedback?.type === "legit",
  ).length;

  // notified === true means the planner viewed the supplier's profile after unlock
  const profileViews = allOpportunities.filter(
    (o) => o.unlockedBy?.[uid]?.notified === true,
  ).length;

  const totalSpent = creditHistory
    .filter((c) => c.type === "debit")
    .reduce((sum, c) => sum + c.amount, 0);

  const completion = supplier.profileCompletionPct ?? 0;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatTile
          label="New Opportunities"
          tooltip="Leads in your area matching your products that are available to unlock"
          value={newCount}
          sub="ready to unlock"
        />
        <StatTile
          label="Leads Unlocked"
          tooltip="Opportunities you have unlocked to reveal planner contact details"
          value={unlockedCount}
          sub="contact details revealed"
        />
        <StatTile
          label="Credits Balance"
          tooltip="Your available credits. 1 credit = R1. Used to unlock opportunities"
          value={supplier.credits}
          sub={`${totalSpent} spent to date`}
        />
        <StatTile
          label="Successful Leads"
          tooltip="Opportunities you rated as legit after the event date"
          value={successfulLeads}
          sub="marked as legit"
        />
        <StatTile
          label="Profile Views"
          tooltip="How many times a planner has viewed your profile after you unlocked their lead"
          value={profileViews}
          sub="planners who viewed your profile"
        />
        <StatTile
          label="Profile Completion"
          tooltip="How complete your supplier profile is. A fuller profile may attract better opportunities"
          value={`${completion}%`}
          className="space-y-2"
        >
          <Progress value={completion} className="h-1.5" />
        </StatTile>
      </div>
    </TooltipProvider>
  );
}
