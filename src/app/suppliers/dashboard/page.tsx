"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirebase } from "@/firebase";
import {
  useSupplierProfile,
  useAllSupplierOpportunities,
  useSupplierCredits,
} from "@/firebase/supplier-hooks";
import { StatsRow } from "@/components/suppliers/stats-row";
import { OpportunityCard } from "@/components/suppliers/opportunity-card";
import { FeedbackDialog } from "@/components/suppliers/feedback-dialog";
import { CreditPanel } from "@/components/suppliers/credit-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Inbox, FlaskConical } from "lucide-react";
import { getAuth } from "firebase/auth";

export default function SupplierDashboardPage() {
  const { user, isUserLoading } = useUser();
  const { firebaseApp } = useFirebase();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (isUserLoading) return;
    if (!user || user.isAnonymous) {
      const timer = setTimeout(() => router.push("/suppliers/login"), 200);
      return () => clearTimeout(timer);
    }
  }, [user, isUserLoading, router]);

  const uid = user && !user.isAnonymous ? user.uid : undefined;

  const { data: supplier, isLoading: supplierLoading } = useSupplierProfile(uid);
  const { data: allOpportunities, isLoading: oppsLoading } = useAllSupplierOpportunities(uid);
  const { data: creditHistory, isLoading: creditsLoading } = useSupplierCredits(uid);

  const [pendingFeedbackId, setPendingFeedbackId] = useState<string | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  // Derive pending feedback: first unlocked + past event + no feedback
  useEffect(() => {
    if (!allOpportunities || !uid) return;
    const now = new Date();
    const pending = allOpportunities.find((o) => {
      const record = o.unlockedBy?.[uid];
      if (!record) return false;
      const eventDate = o.eventDate?.toDate();
      if (!eventDate || eventDate > now) return false;
      return record.feedback === null || record.feedback === undefined;
    });
    if (pending) {
      setPendingFeedbackId(pending.id);
    } else {
      setPendingFeedbackId(null);
    }
  }, [allOpportunities, uid]);

  const isLoading = isUserLoading || supplierLoading || oppsLoading || creditsLoading;

  if (isLoading || !uid) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Supplier not registered — redirect to register
  if (!supplier) {
    router.push("/suppliers/register");
    return null;
  }

  const activeOpps = (allOpportunities ?? []).filter((o) => o.status === "active");
  const expiredOpps = (allOpportunities ?? []).filter((o) => o.status === "expired");
  const newOpps = activeOpps.filter((o) => !o.unlockedBy?.[uid]);
  const unlockedOpps = activeOpps.filter((o) => !!o.unlockedBy?.[uid]);

  const hasPendingFeedback = pendingFeedbackId !== null;
  const pendingFeedbackOpp = hasPendingFeedback
    ? allOpportunities?.find((o) => o.id === pendingFeedbackId)
    : null;

  const handleSeedTestData = async () => {
    setIsSeeding(true);
    try {
      const auth = getAuth(firebaseApp);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      await fetch("/api/dev/seed-opportunities", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
      });
      setSeedDone(true);
    } catch {
      // silent
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary py-8 px-4">
      <div className="container mx-auto max-w-4xl space-y-6">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {supplier.tradingAs}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here&apos;s what&apos;s happening with your supplier account.
          </p>
        </div>

        {/* Pending feedback banner */}
        {hasPendingFeedback && pendingFeedbackOpp && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-800">Feedback required</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Rate the &ldquo;{pendingFeedbackOpp.serviceType}&rdquo; lead before unlocking another opportunity.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-100 shrink-0"
              onClick={() => setFeedbackDialogOpen(true)}
            >
              Submit Feedback
            </Button>
          </div>
        )}

        {/* Stats */}
        <StatsRow
          supplier={supplier}
          allOpportunities={allOpportunities ?? []}
          creditHistory={creditHistory ?? []}
          uid={uid}
        />

        {/* Tabs */}
        <Tabs defaultValue="opportunities">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="opportunities" className="flex-1 sm:flex-none">
              Opportunities
              {newOpps.length > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold px-1">
                  {newOpps.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 sm:flex-none">
              History
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex-1 sm:flex-none">
              Credits &amp; Billing
            </TabsTrigger>
          </TabsList>

          {/* Opportunities tab */}
          <TabsContent value="opportunities" className="mt-4 space-y-6">
            {/* New / available */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                New Opportunities ({newOpps.length})
              </h2>
              {newOpps.length === 0 ? (
                <EmptyState
                  icon={<Inbox className="h-8 w-8" />}
                  message="No new opportunities right now. Check back soon."
                />
              ) : (
                newOpps.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    uid={uid}
                    credits={supplier.credits}
                    hasPendingFeedback={hasPendingFeedback}
                    onCreditDeducted={() => {}}
                    onFeedbackSubmitted={() => setPendingFeedbackId(null)}
                  />
                ))
              )}
            </div>

            {/* Unlocked */}
            {unlockedOpps.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Unlocked Leads ({unlockedOpps.length})
                </h2>
                {unlockedOpps.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    uid={uid}
                    credits={supplier.credits}
                    hasPendingFeedback={hasPendingFeedback}
                    onCreditDeducted={() => {}}
                    onFeedbackSubmitted={() => setPendingFeedbackId(null)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* History tab */}
          <TabsContent value="history" className="mt-4 space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Expired Opportunities ({expiredOpps.length})
            </h2>
            {expiredOpps.length === 0 ? (
              <EmptyState
                icon={<Inbox className="h-8 w-8" />}
                message="No expired opportunities yet."
              />
            ) : (
              expiredOpps.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  uid={uid}
                  credits={supplier.credits}
                  hasPendingFeedback={false}
                  onCreditDeducted={() => {}}
                  onFeedbackSubmitted={() => {}}
                />
              ))
            )}
          </TabsContent>

          {/* Credits tab */}
          <TabsContent value="credits" className="mt-4">
            <CreditPanel
              credits={supplier.credits}
              creditHistory={creditHistory ?? []}
            />
          </TabsContent>
        </Tabs>

        {/* Dev seed helper — development only */}
        {process.env.NODE_ENV === "development" && (
          <div className="rounded-xl border border-dashed border-muted-foreground/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FlaskConical className="h-4 w-4" />
              <span>Dev only: seed 3 test opportunities targeting your account.</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={isSeeding || seedDone}
              onClick={handleSeedTestData}
            >
              {isSeeding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : seedDone ? (
                "Seeded ✓"
              ) : (
                "Seed Test Data"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Global feedback dialog (triggered from the banner) */}
      {pendingFeedbackId && (
        <FeedbackDialog
          open={feedbackDialogOpen}
          onOpenChange={setFeedbackDialogOpen}
          opportunityId={pendingFeedbackId}
          uid={uid}
          onSubmitted={() => {
            setFeedbackDialogOpen(false);
            setPendingFeedbackId(null);
          }}
        />
      )}
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
      {icon}
      <p className="text-sm text-center max-w-xs">{message}</p>
    </div>
  );
}
