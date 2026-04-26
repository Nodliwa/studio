"use client";

import { useState } from "react";
import { doc, collection, writeBatch, serverTimestamp, increment } from "firebase/firestore";
import { useFirebase } from "@/firebase";
import { differenceInDays, format } from "date-fns";
import type { SupplierOpportunity } from "@/lib/supplier-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeedbackDialog } from "@/components/suppliers/feedback-dialog";
import {
  CalendarDays,
  MapPin,
  Coins,
  Phone,
  User,
  Unlock,
  Lock,
  MessageSquare,
  Loader2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OpportunityCardProps {
  opportunity: SupplierOpportunity & { id: string };
  uid: string;
  credits: number;
  hasPendingFeedback: boolean;
  onCreditDeducted: () => void;
  onFeedbackSubmitted: () => void;
}

const STRENGTH_STYLES: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-gray-100 text-gray-600 border-gray-200",
};

const STRENGTH_LABEL: Record<string, string> = {
  high: "High Match",
  medium: "Good Match",
  low: "Possible Match",
};

function formatRand(n: number) {
  return `R ${n.toLocaleString("en-ZA")}`;
}

export function OpportunityCard({
  opportunity,
  uid,
  credits,
  hasPendingFeedback,
  onCreditDeducted,
  onFeedbackSubmitted,
}: OpportunityCardProps) {
  const { firestore } = useFirebase();
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [passed, setPassed] = useState(false);

  if (passed) return null;

  const unlockRecord = opportunity.unlockedBy?.[uid];
  const isUnlocked = !!unlockRecord;

  const eventDate = opportunity.eventDate?.toDate();
  const daysUntil = eventDate ? differenceInDays(eventDate, new Date()) : null;
  const isPastEvent = daysUntil !== null && daysUntil < 0;
  const needsFeedback = isUnlocked && isPastEvent && !unlockRecord?.feedback;

  const strengthStyle = STRENGTH_STYLES[opportunity.opportunityStrength] ?? STRENGTH_STYLES.low;
  const strengthLabel = STRENGTH_LABEL[opportunity.opportunityStrength] ?? "Match";

  const handleUnlock = async () => {
    if (hasPendingFeedback) return;
    if (credits < opportunity.creditCost) return;

    setIsUnlocking(true);
    try {
      const batch = writeBatch(firestore);

      batch.update(doc(firestore, "suppliers", uid), {
        credits: increment(-opportunity.creditCost),
      });

      batch.update(doc(firestore, "supplier_opportunities", opportunity.id), {
        [`unlockedBy.${uid}`]: {
          unlockedAt: serverTimestamp(),
          creditsUsed: opportunity.creditCost,
          notified: false,
          feedback: null,
        },
      });

      const creditRef = doc(collection(firestore, "supplier_credits"));
      batch.set(creditRef, {
        supplierId: uid,
        type: "debit",
        amount: opportunity.creditCost,
        reason: "opportunity_unlock",
        opportunityId: opportunity.id,
        description: `Unlocked lead: ${opportunity.serviceType} in ${opportunity.city}`,
        balanceBefore: credits,
        balanceAfter: credits - opportunity.creditCost,
        createdAt: serverTimestamp(),
      });

      await batch.commit();
      onCreditDeducted();
    } catch {
      // silent — user can retry
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <>
      <div className={cn(
        "bg-card rounded-xl shadow-sm border overflow-hidden",
        isUnlocked && "border-primary/30",
      )}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4 pb-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn("border text-xs font-semibold", strengthStyle)}>
                {strengthLabel}
              </Badge>
              {isUnlocked && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Unlock className="h-3 w-3" />
                  Unlocked
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-base leading-tight">{opportunity.serviceType}</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Coins className="h-3.5 w-3.5" />
            {opportunity.creditCost} credit{opportunity.creditCost !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Details */}
        <div className="px-4 pb-4 space-y-2.5">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{isUnlocked ? opportunity.location : opportunity.city}</span>
          </div>

          {eventDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span>
                {format(eventDate, "d MMM yyyy")}
                {daysUntil !== null && (
                  <span className={cn("ml-1.5 font-medium", isPastEvent ? "text-destructive" : "text-primary")}>
                    {isPastEvent
                      ? `(${Math.abs(daysUntil)} days ago)`
                      : daysUntil === 0
                        ? "(today)"
                        : `(in ${daysUntil} days)`}
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Budget */}
          <div className="text-sm font-medium">
            {isUnlocked ? (
              <span className="text-foreground">
                {formatRand(opportunity.budgetMin)} – {formatRand(opportunity.budgetMax)}
              </span>
            ) : (
              <span className="text-muted-foreground/50 select-none tracking-widest">
                R ●,●●● – R ●●,●●●
              </span>
            )}
          </div>

          {/* Planner contact — only when unlocked */}
          {isUnlocked && (
            <div className="rounded-lg bg-primary/5 border border-primary/15 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-primary" />
                {opportunity.plannerName ?? "Planner"}
              </div>
              {opportunity.plannerPhone && (
                <a
                  href={`tel:${opportunity.plannerPhone}`}
                  className="flex items-center gap-2 text-sm text-primary font-medium"
                >
                  <Phone className="h-4 w-4" />
                  {opportunity.plannerPhone}
                </a>
              )}
              {/* Profile view indicator — notified === true means planner viewed supplier profile after unlock */}
              {unlockRecord?.notified && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                    <Eye className="h-3 w-3" />
                    Planner viewed your profile
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {!isUnlocked ? (
              <>
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={isUnlocking || credits < opportunity.creditCost || hasPendingFeedback}
                  onClick={handleUnlock}
                  title={
                    hasPendingFeedback
                      ? "Submit feedback on your previous lead first"
                      : credits < opportunity.creditCost
                        ? "Not enough credits"
                        : undefined
                  }
                >
                  {isUnlocking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-1.5" />
                      Unlock Lead
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => setPassed(true)}
                >
                  Pass
                </Button>
              </>
            ) : needsFeedback ? (
              <Button
                size="sm"
                variant="outline"
                className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={() => setFeedbackOpen(true)}
              >
                <MessageSquare className="h-4 w-4 mr-1.5" />
                Submit Feedback to Unlock Next Lead
              </Button>
            ) : null}
          </div>

          {hasPendingFeedback && !isUnlocked && (
            <p className="text-xs text-amber-600 text-center">
              Submit feedback on your previous lead before unlocking a new one.
            </p>
          )}
        </div>
      </div>

      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        opportunityId={opportunity.id}
        uid={uid}
        onSubmitted={onFeedbackSubmitted}
      />
    </>
  );
}
