"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirebase } from "@/firebase";
import {
  useSupplierProfile,
  useAllSupplierOpportunities,
  useSupplierCredits,
  useSupplierNotifications,
} from "@/firebase/supplier-hooks";
import { SupplierSidebar } from "@/components/suppliers/supplier-sidebar";
import { OpportunityCard } from "@/components/suppliers/opportunity-card";
import { FeedbackDialog } from "@/components/suppliers/feedback-dialog";
import { CreditPanel } from "@/components/suppliers/credit-panel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Loader2,
  Inbox,
  FlaskConical,
  Menu,
  Wallet,
  Briefcase,
  CheckCircle2,
  Star,
  Clock,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import { formatDistanceToNow } from "date-fns";
import type { SupplierNotification } from "@/lib/supplier-types";

type ActiveView = "dashboard" | "opportunities" | "history" | "credits" | "coming-soon";

type NotificationWithId = SupplierNotification & { id: string };

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
      {icon}
      <p className="text-sm text-center max-w-xs">{message}</p>
    </div>
  );
}

export default function SupplierDashboardPage() {
  const { user, isUserLoading } = useUser();
  const { firebaseApp } = useFirebase();
  const router = useRouter();

  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [comingSoonLabel, setComingSoonLabel] = useState("");
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

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
  const { data: notifications } = useSupplierNotifications(uid);

  const [pendingFeedbackId, setPendingFeedbackId] = useState<string | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

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
    setPendingFeedbackId(pending?.id ?? null);
  }, [allOpportunities, uid]);

  const isLoading = isUserLoading || supplierLoading || oppsLoading || creditsLoading;

  if (isLoading || !uid) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

  const handleNavigate = (view: string, label?: string) => {
    setActiveView(view as ActiveView);
    if (label) setComingSoonLabel(label);
    setMobileSheetOpen(false);
  };

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

  const sidebarProps = {
    activeView,
    onNavigate: handleNavigate,
    supplier: { ...supplier, id: uid },
    newOppsCount: newOpps.length,
  };

  const VIEW_LABELS: Record<ActiveView, string> = {
    dashboard: "Dashboard",
    opportunities: "Opportunities",
    history: "History",
    credits: "Credits & Billing",
    "coming-soon": comingSoonLabel || "Coming Soon",
  };

  const pendingFeedbackBanner = hasPendingFeedback && pendingFeedbackOpp && (
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
  );

  const renderContent = () => {
    switch (activeView) {

      case "opportunities":
        return (
          <div className="space-y-6">
            {pendingFeedbackBanner}
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
          </div>
        );

      case "history":
        return (
          <div className="space-y-3">
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
          </div>
        );

      case "credits":
        return (
          <CreditPanel
            credits={supplier.credits}
            creditHistory={creditHistory ?? []}
          />
        );

      case "coming-soon":
        return (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{comingSoonLabel}</h2>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
                This feature is in development and will be available soon.
              </p>
            </div>
          </div>
        );

      default: // dashboard overview
        return (
          <div className="space-y-6">

            {/* Greeting row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome back, {supplier.tradingAs}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Here&apos;s what&apos;s happening with your supplier account.
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="opacity-50 cursor-not-allowed pointer-events-none"
                    >
                      View Public Profile
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Coming soon</TooltipContent>
              </Tooltip>
            </div>

            {pendingFeedbackBanner}

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div
                className="rounded-xl p-4 text-white space-y-1.5 col-span-2 sm:col-span-1"
                style={{ background: "linear-gradient(135deg, #1D9E75 0%, #0e6b4e 100%)" }}
              >
                <div className="flex items-center justify-between">
                  <Wallet className="h-5 w-5 opacity-80" />
                  <span className="text-xs font-medium opacity-70">Credits</span>
                </div>
                <p className="text-3xl font-bold tabular-nums">{supplier.credits}</p>
                <p className="text-xs opacity-70">Available balance</p>
              </div>

              <div className="rounded-xl p-4 bg-orange-50 border border-orange-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Briefcase className="h-5 w-5 text-orange-500" />
                  <span className="text-xs font-medium text-orange-500">New</span>
                </div>
                <p className="text-3xl font-bold tabular-nums text-orange-700">{newOpps.length}</p>
                <p className="text-xs text-orange-600/70">Opportunities</p>
              </div>

              <div className="rounded-xl p-4 bg-blue-50 border border-blue-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  <span className="text-xs font-medium text-blue-500">Active</span>
                </div>
                <p className="text-3xl font-bold tabular-nums text-blue-700">{unlockedOpps.length}</p>
                <p className="text-xs text-blue-600/70">Leads Unlocked</p>
              </div>

              <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Star className="h-5 w-5 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-500">Profile</span>
                </div>
                <p className="text-3xl font-bold tabular-nums text-emerald-700">
                  {supplier.profileCompletionPct}%
                </p>
                <p className="text-xs text-emerald-600/70">Completed</p>
              </div>
            </div>

            {/* Market Activity — PHASE 2 PLACEHOLDER */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Market Activity</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Coming soon
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* PHASE 2 PLACEHOLDER — replace with live analytics */}
                {[
                  "Planners searching this week",
                  "Avg. lead cost in your area",
                  "Your category ranking",
                ].map((label) => (
                  <div
                    key={label}
                    className="rounded-xl border border-dashed border-muted-foreground/20 p-4 bg-muted/30 text-center space-y-1"
                  >
                    <p className="text-2xl font-bold text-muted-foreground/30">—</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tips */}
              <div className="rounded-xl border bg-card p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-[#1D9E75]" />
                  <h3 className="text-sm font-semibold">Quick Tips</h3>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#1D9E75] mt-0.5 shrink-0">•</span>
                    Complete your profile to appear in more searches.
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#1D9E75] mt-0.5 shrink-0">•</span>
                    Unlock opportunities early — leads get claimed fast.
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#1D9E75] mt-0.5 shrink-0">•</span>
                    Add photos to your profile (coming soon) to stand out.
                  </li>
                </ul>
              </div>

              {/* Recent Activity */}
              <div className="rounded-xl border bg-card p-4 space-y-3">
                <h3 className="text-sm font-semibold">Recent Activity</h3>
                {(notifications ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No recent activity.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {(notifications as NotificationWithId[] ?? []).slice(0, 4).map((n) => (
                      <li key={n.id} className="flex items-start gap-2 text-xs">
                        <span
                          className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
                            n.read ? "bg-muted-foreground/30" : "bg-[#1D9E75]"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{n.title}</p>
                          <p className="text-muted-foreground">
                            {n.createdAt?.toDate
                              ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true })
                              : "recently"}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* How it Works */}
              <div className="rounded-xl border bg-card p-4 space-y-3">
                <h3 className="text-sm font-semibold">How it Works</h3>
                <ol className="space-y-2.5 text-xs text-muted-foreground">
                  {[
                    "Planners submit event requests on SimpliPlan.",
                    "You receive relevant leads based on your services & location.",
                    "Unlock a lead to reveal client contact details.",
                    "Win the booking and grow your business!",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="h-4 w-4 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Bottom banner */}
            <div
              className="rounded-xl p-5 text-white flex items-center justify-between gap-4 overflow-hidden relative"
              style={{ background: "linear-gradient(135deg, #1D9E75 0%, #0e6b4e 100%)" }}
            >
              <div className="space-y-1 relative z-10">
                <p className="font-bold text-lg">Ready to grow?</p>
                <p className="text-sm opacity-80">
                  New event leads are waiting. Unlock your next opportunity today.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0 relative z-10 bg-white text-[#1D9E75] hover:bg-white/90 font-semibold"
                onClick={() => handleNavigate("opportunities")}
              >
                View Leads
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
              <svg
                className="absolute right-0 top-0 opacity-10 pointer-events-none"
                width="180"
                height="80"
                viewBox="0 0 180 80"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="160" cy="0" r="70" fill="white" />
                <circle cx="130" cy="80" r="45" fill="white" />
              </svg>
            </div>

            {/* Dev seed helper */}
            {process.env.NODE_ENV === "development" && (
              <div className="rounded-xl border border-dashed border-muted-foreground/20 p-3 flex flex-col sm:flex-row items-center justify-between gap-2 bg-muted/20">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FlaskConical className="h-3.5 w-3.5" />
                  <span>Dev: seed 3 test opportunities targeting your account.</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7"
                  disabled={isSeeding || seedDone}
                  onClick={handleSeedTestData}
                >
                  {isSeeding ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : seedDone ? (
                    "Seeded ✓"
                  ) : (
                    "Seed Test Data"
                  )}
                </Button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-[calc(100vh-4rem)] bg-secondary">

        {/* Desktop sidebar — sticky below SupplierNav (top-16) */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r bg-card sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto">
          <SupplierSidebar {...sidebarProps} />
        </aside>

        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Mobile sticky sub-header — sits below SupplierNav (top-16), above content */}
          <div className="lg:hidden sticky top-16 z-30 bg-card border-b px-4 py-2.5 flex items-center gap-3 shadow-sm">
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SupplierSidebar {...sidebarProps} />
              </SheetContent>
            </Sheet>
            <span className="text-sm font-semibold truncate flex-1">
              {VIEW_LABELS[activeView]}
            </span>
            {activeView === "opportunities" && newOpps.length > 0 && (
              <span className="h-5 min-w-[1.25rem] rounded-full bg-[#1D9E75] text-white text-[10px] font-bold flex items-center justify-center px-1">
                {newOpps.length}
              </span>
            )}
          </div>

          {/* Page content */}
          <main className="flex-1 p-4 md:p-8">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Feedback dialog */}
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
    </TooltipProvider>
  );
}
