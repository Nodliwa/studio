"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingHowItWorks } from "@/components/suppliers/landing-how-it-works";
import { LandingWhoCanJoin } from "@/components/suppliers/landing-who-can-join";
import { LandingWhyJoin } from "@/components/suppliers/landing-why-join";
import { LandingOpportunities } from "@/components/suppliers/landing-opportunities";
import { LandingFaq } from "@/components/suppliers/landing-faq";
import { CheckCircle } from "lucide-react";

const TRUST_ITEMS = [
  "Free to join",
  "Built for South Africa",
  "Mobile friendly",
];

export default function SupplierLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center space-y-6">
          <span className="inline-block text-xs font-bold tracking-widest uppercase bg-primary-foreground/10 border border-primary-foreground/20 rounded-full px-4 py-1.5">
            Built for Mzansi
          </span>

          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-shadow">
            Grow Your Event Business with SimpliPlan
          </h1>

          <p className="text-base md:text-lg text-white/95 max-w-2xl mx-auto leading-relaxed">
            Join the SimpliPlan supplier network and connect with people planning
            birthdays, weddings, funerals, uMgidi, uMemulo and other important
            events in your area. Individuals who are able to supply services
            (e.g. Cooking, Slaughtering &amp; Braaiing, etc.) are also welcome
            to join.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              asChild
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold h-12 px-8 text-base"
            >
              <Link href="/suppliers/register">Join Supplier Network</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 h-12 px-8 text-base"
            >
              <a href="#how-it-works">How It Works</a>
            </Button>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item}
                className="flex items-center gap-1.5 text-sm text-primary-foreground/75"
              >
                <CheckCircle className="h-4 w-4 shrink-0" />
                {item}
              </div>
            ))}
          </div>

          <p className="text-xs text-primary-foreground/60">
            Already registered?{" "}
            <Link
              href="/suppliers/login"
              className="underline underline-offset-2 hover:text-primary-foreground transition-colors"
            >
              Log in to your supplier dashboard
            </Link>
          </p>
        </div>
      </section>

      {/* ── Sections ─────────────────────────────────────────────────────── */}
      <LandingHowItWorks />
      <LandingWhoCanJoin />
      <LandingWhyJoin />
      <LandingOpportunities />
      <LandingFaq />

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-primary text-primary-foreground text-center px-4">
        <div className="container mx-auto max-w-xl space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to start receiving opportunities?
          </h2>
          <p className="text-primary-foreground/75 text-sm">
            Registration is free. Your first opportunity is on us.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold h-12 px-8 text-base"
          >
            <Link href="/suppliers/register">Create Your Supplier Profile</Link>
          </Button>
        </div>
      </section>

      {/* ── Minimal footer ───────────────────────────────────────────────── */}
      <footer className="py-6 border-t bg-background text-center">
        <p className="text-xs text-muted-foreground">
          &copy; 2026 SimpliPlan. &nbsp;
          <Link href="/terms" className="hover:text-primary underline">
            Terms
          </Link>{" "}
          &middot;{" "}
          <Link href="/privacy" className="hover:text-primary underline">
            Privacy
          </Link>
        </p>
      </footer>
    </div>
  );
}
