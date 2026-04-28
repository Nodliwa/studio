"use client";

import { useState } from "react";
import { addDoc, collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { mapItemToCategory } from "@/lib/supplier-category-map";
import type { BudgetItem, Budget } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";

interface FindSupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: BudgetItem;
  itemTotal: number;
  budget: Budget;
  budgetId: string;
  userId: string;
}

export function FindSupplierModal({
  open,
  onOpenChange,
  item,
  itemTotal,
  budget,
  budgetId,
  userId,
}: FindSupplierModalProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const defaultMin = Math.round(itemTotal * 0.75);
  const defaultMax = Math.round(itemTotal * 1.25);

  const [itemName, setItemName] = useState(item.name);
  const [location, setLocation] = useState(budget.eventLocation ?? "");
  const [neededBy, setNeededBy] = useState(budget.eventDate ?? "");
  const [budgetMin, setBudgetMin] = useState(defaultMin);
  const [budgetMax, setBudgetMax] = useState(defaultMax);
  const [notes, setNotes] = useState("");
  const [contactPreference, setContactPreference] = useState<
    "share_details" | "profile_first" | "both"
  >("both");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCount = Object.values(budget.supplierRequests ?? {}).filter(
    (r) => r.status === "open"
  ).length;

  const validate = (): string | null => {
    if (!location.trim()) return "Location is required.";
    if (!neededBy) return "Needed by date is required.";
    if (new Date(neededBy) <= new Date()) return "Needed by date must be in the future.";
    if (budgetMin <= 0 || budgetMax <= 0) return "Budget range must be greater than 0.";
    return null;
  };

  const handleSubmit = async () => {
    setError(null);

    if (openCount >= 3) {
      setError(
        "You've reached the limit of 3 active supplier requests for this plan. Mark one as found to free up a slot."
      );
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const mappedCategory = mapItemToCategory(itemName);
      const now = new Date();
      const expiresAt = neededBy
        ? new Date(neededBy)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const leadData = {
        planId: budgetId,
        plannerId: userId,
        itemId: item.id,
        itemName,
        mappedCategory,
        eventType: budget.eventType ?? "",
        eventDate: neededBy || undefined,
        location: location.trim(),
        budgetMin,
        budgetMax,
        notes: notes.trim(),
        contactPreference,
        status: "open",
        matchedSupplierCount: 0,
        unlockedBy: [],
        createdAt: serverTimestamp(),
        expiresAt,
        requestCount: 0,
      };

      const docRef = await addDoc(
        collection(firestore, "supplier_opportunities"),
        leadData
      );

      const budgetRef = doc(firestore, "users", userId, "budgets", budgetId);
      await setDoc(
        budgetRef,
        {
          supplierRequests: {
            ...(budget.supplierRequests ?? {}),
            [item.id]: { leadId: docRef.id, status: "open", matchedCount: 0 },
          },
        },
        { merge: true }
      );

      toast({
        title: "Request sent!",
        description: "Matched suppliers will be notified.",
      });
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Find a Supplier</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="fs-item-name">Need Suppliers For</Label>
            <Input
              id="fs-item-name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Event Type</Label>
            <Input value={budget.eventType ?? "—"} readOnly className="bg-muted text-muted-foreground" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fs-location">Location</Label>
            <Input
              id="fs-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Cape Town, Western Cape"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fs-needed-by">Needed By</Label>
            <Input
              id="fs-needed-by"
              type="date"
              value={neededBy}
              onChange={(e) => setNeededBy(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Budget Range</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">R</span>
              <Input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(Number(e.target.value))}
                className="w-28"
                min={0}
              />
              <span className="text-sm text-muted-foreground">–</span>
              <span className="text-sm text-muted-foreground shrink-0">R</span>
              <Input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-28"
                min={0}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fs-notes">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              id="fs-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Chocolate preferred, 30 people"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>How would you like to connect?</Label>
            <RadioGroup
              value={contactPreference}
              onValueChange={(v) =>
                setContactPreference(v as typeof contactPreference)
              }
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="share_details" id="fs-share" />
                <Label htmlFor="fs-share" className="font-normal cursor-pointer">
                  Share my contact details with matched suppliers
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="profile_first" id="fs-profile" />
                <Label htmlFor="fs-profile" className="font-normal cursor-pointer">
                  Send me supplier profiles to review first
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="both" id="fs-both" />
                <Label htmlFor="fs-both" className="font-normal cursor-pointer">
                  I&apos;m open to either
                </Label>
              </div>
            </RadioGroup>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
