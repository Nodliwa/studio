"use client";

import { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useFirebase } from "@/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
  uid: string;
  onSubmitted: () => void;
}

export function FeedbackDialog({
  open,
  onOpenChange,
  opportunityId,
  uid,
  onSubmitted,
}: FeedbackDialogProps) {
  const { firestore } = useFirebase();
  const [feedbackType, setFeedbackType] = useState<"legit" | "junk" | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = feedbackType !== null && rating !== null;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const oppRef = doc(firestore, "supplier_opportunities", opportunityId);
      await updateDoc(oppRef, {
        [`unlockedBy.${uid}.feedback`]: {
          type: feedbackType,
          rating,
          comment: comment.trim() || null,
          submittedAt: serverTimestamp(),
        },
      });
      onSubmitted();
      onOpenChange(false);
    } catch {
      // silent — user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayStars = hovered ?? rating ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How did the opportunity go?</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve lead quality for all suppliers. This
            is required before you can unlock your next opportunity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Legit / Junk */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Was this a genuine lead?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFeedbackType("legit")}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 text-sm font-medium transition-colors",
                  feedbackType === "legit"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/40",
                )}
              >
                <ThumbsUp className="h-5 w-5" />
                Legit
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType("junk")}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 text-sm font-medium transition-colors",
                  feedbackType === "junk"
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-border hover:border-destructive/40",
                )}
              >
                <ThumbsDown className="h-5 w-5" />
                Junk
              </button>
            </div>
          </div>

          {/* Star rating */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Rate the quality of this lead</p>
            <div
              className="flex gap-1"
              onMouseLeave={() => setHovered(null)}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      "h-7 w-7 transition-colors",
                      star <= displayStars
                        ? "fill-amber-400 text-amber-400"
                        : "fill-none text-muted-foreground/40",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Optional comment */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Any additional comments?{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </p>
            <Textarea
              placeholder="Tell us more about this lead…"
              className="resize-none h-20"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Submitting…
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
