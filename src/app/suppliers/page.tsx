"use client";

import { useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LandingFaq } from "@/components/suppliers/landing-faq";
import {
  User,
  Menu,
  X,
  CheckCircle,
  Smartphone,
  MapPin,
  Users,
  Clock,
  ShieldCheck,
  Cake,
  UtensilsCrossed,
  Sparkles,
  Music,
  Camera,
  Building2,
  Package,
  Beef,
  Shirt,
  ChefHat,
  Car,
  Plus,
  UserCircle,
  Bell,
  Lock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface WhyJoinItem {
  icon: ElementType;
  title: string;
  body: string;
  iconClass: string;
  bgClass: string;
}

interface CategoryItem {
  icon: ElementType;
  label: string;
  bgClass: string;
  iconClass: string;
}

interface HowItWorksStep {
  icon: ElementType;
  title: string;
  desc: string;
}

interface ExampleOpp {
  icon: ElementType;
  title: string;
  location: string;
  detail: string;
  budget: string;
  strength: string;
  strengthColor: string;
  btnBorder: string;
  btnText: string;
  btnHover: string;
  iconBg: string;
  iconColor: string;
  credits: number;
}

interface TrustItem {
  emoji: string;
  title: string;
  sub: string;
}

// ── Static data ───────────────────────────────────────────────────────────────

const WHY_JOIN: WhyJoinItem[] = [
  {
    icon: Users,
    title: "Get More Customers",
    body: "Receive relevant opportunities from people actively planning events in your area.",
    bgClass: "bg-blue-50",
    iconClass: "text-blue-600",
  },
  {
    icon: Clock,
    title: "Save Time",
    body: "Stop chasing leads. Get matched with real demand that fits what you do best.",
    bgClass: "bg-orange-50",
    iconClass: "text-orange-600",
  },
  {
    icon: ShieldCheck,
    title: "Build Trust",
    body: "Create a professional profile, showcase your work and build customer confidence.",
    bgClass: "bg-purple-50",
    iconClass: "text-purple-600",
  },
  {
    icon: MapPin,
    title: "Work Locally",
    body: "We connect you with planners near your business so you can grow in your community.",
    bgClass: "bg-[#1D9E75]/10",
    iconClass: "text-[#1D9E75]",
  },
];

const CATEGORIES: CategoryItem[] = [
  { icon: Cake,            label: "Cakes",                bgClass: "bg-pink-100",   iconClass: "text-pink-600" },
  { icon: UtensilsCrossed, label: "Catering",             bgClass: "bg-orange-100", iconClass: "text-orange-600" },
  { icon: Sparkles,        label: "Decor",                bgClass: "bg-purple-100", iconClass: "text-purple-600" },
  { icon: Music,           label: "DJs & MCs",            bgClass: "bg-blue-100",   iconClass: "text-blue-600" },
  { icon: Camera,          label: "Photography",          bgClass: "bg-yellow-100", iconClass: "text-yellow-600" },
  { icon: Building2,       label: "Venues",               bgClass: "bg-teal-100",   iconClass: "text-teal-600" },
  { icon: Package,         label: "Tent & Chairs",        bgClass: "bg-green-100",  iconClass: "text-green-600" },
  { icon: Beef,            label: "Livestock",            bgClass: "bg-lime-100",   iconClass: "text-lime-600" },
  { icon: Shirt,           label: "Traditional Clothing", bgClass: "bg-amber-100",  iconClass: "text-amber-600" },
  { icon: ChefHat,         label: "Home Cooks",           bgClass: "bg-red-100",    iconClass: "text-red-600" },
  { icon: Car,             label: "Transport",            bgClass: "bg-sky-100",    iconClass: "text-sky-600" },
  { icon: Plus,            label: "And More",             bgClass: "bg-gray-100",   iconClass: "text-gray-500" },
];

const HOW_IT_WORKS: HowItWorksStep[] = [
  { icon: UserCircle, title: "Create Your Profile",  desc: "Sign up and tell us about your business." },
  { icon: Package,    title: "Add What You Offer",   desc: "List your products or services and pricing." },
  { icon: Bell,       title: "Get Matched",          desc: "Receive opportunities that fit your profile." },
  { icon: Lock,       title: "Unlock & Connect",     desc: "Use credits to unlock and send your profile." },
  { icon: TrendingUp, title: "Grow Your Business",   desc: "Win more jobs and build long-term relationships." },
];

const EXAMPLE_OPPS: ExampleOpp[] = [
  {
    icon: Cake,
    title: "Birthday Cake Needed",
    location: "Durban North",
    detail: "Needed in 10 days",
    budget: "R800 – R1,500",
    strength: "High",
    strengthColor: "text-[#1D9E75]",
    btnBorder: "border-[#1D9E75]",
    btnText: "text-[#1D9E75]",
    btnHover: "hover:bg-[#1D9E75]/5",
    iconBg: "bg-[#1D9E75]/10",
    iconColor: "text-[#1D9E75]",
    credits: 1,
  },
  {
    icon: Package,
    title: "Tent Hire",
    location: "Pietermaritzburg",
    detail: "Needed this weekend",
    budget: "R2,000+",
    strength: "Medium",
    strengthColor: "text-orange-500",
    btnBorder: "border-orange-400",
    btnText: "text-orange-500",
    btnHover: "hover:bg-orange-50",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    credits: 2,
  },
  {
    icon: UtensilsCrossed,
    title: "Catering Needed",
    location: "Umlazi",
    detail: "50 guests",
    budget: "R1,500 – R3,500",
    strength: "High",
    strengthColor: "text-[#1D9E75]",
    btnBorder: "border-[#1D9E75]",
    btnText: "text-[#1D9E75]",
    btnHover: "hover:bg-[#1D9E75]/5",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    credits: 1,
  },
];

const TRUST_STRIP: TrustItem[] = [
  { emoji: "👥", title: "Trusted by Planners",       sub: "Used by thousands of event planners" },
  { emoji: "🔒", title: "Secure & Private",           sub: "Your data and business are safe" },
  { emoji: "💬", title: "Support When You Need It",   sub: "We're here to help you succeed" },
  { emoji: "🇿🇦", title: "Proudly South African",     sub: "Built for our people and our culture" },
];

// ── LandingNav ────────────────────────────────────────────────────────────────

function LandingNav() {
  const { toast } = useToast();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleComingSoon = () => {
    setOpen(false);
    toast({ title: "Coming soon", description: "This page is on its way." });
  };

  const linkBase =
    "text-sm font-medium px-3 py-1.5 rounded-md transition-colors";

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between gap-4">

        {/* Logo + tagline */}
        <Link href="/" className="flex flex-col items-start leading-tight shrink-0">
          <Image
            src="/images/brand2.png"
            alt="SimpliPlan"
            width={120}
            height={30}
            className="h-auto"
            priority
          />
          <span className="text-[9px] text-muted-foreground font-medium tracking-widest uppercase mt-0.5">
            Celebrating People
          </span>
        </Link>

        {/* Desktop center links */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          <Link href="/" className={cn(linkBase, "text-foreground/70 hover:text-foreground")}>
            Home
          </Link>
          <a href="#how-it-works" className={cn(linkBase, "text-foreground/70 hover:text-foreground")}>
            How It Works
          </a>
          <Link href="/pricing" className={cn(linkBase, "text-foreground/70 hover:text-foreground")}>
            Pricing
          </Link>
          <Link
            href="/suppliers"
            className={cn(
              linkBase,
              pathname === "/suppliers"
                ? "text-[#1D9E75] font-semibold underline underline-offset-4 decoration-[#1D9E75]/60"
                : "text-foreground/70 hover:text-foreground",
            )}
          >
            Suppliers
          </Link>
          <button
            type="button"
            onClick={handleComingSoon}
            className={cn(linkBase, "text-foreground/70 hover:text-foreground cursor-pointer")}
          >
            About Us
          </button>
          <button
            type="button"
            onClick={handleComingSoon}
            className={cn(linkBase, "text-foreground/70 hover:text-foreground cursor-pointer")}
          >
            Contact
          </button>
        </nav>

        {/* Right: login + hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden md:inline-flex border-[#1D9E75] text-[#1D9E75] hover:bg-[#1D9E75]/5"
          >
            <Link href="/suppliers/login">
              <User className="h-3.5 w-3.5 mr-1.5" />
              Supplier Login
            </Link>
          </Button>
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-foreground/70 hover:bg-muted"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-0.5 shadow-lg">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block text-sm px-3 py-2 rounded-md text-foreground/70 hover:bg-muted"
          >
            Home
          </Link>
          <a
            href="#how-it-works"
            onClick={() => setOpen(false)}
            className="block text-sm px-3 py-2 rounded-md text-foreground/70 hover:bg-muted"
          >
            How It Works
          </a>
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="block text-sm px-3 py-2 rounded-md text-foreground/70 hover:bg-muted"
          >
            Pricing
          </Link>
          <Link
            href="/suppliers"
            onClick={() => setOpen(false)}
            className="block text-sm px-3 py-2 rounded-md font-semibold text-[#1D9E75] bg-[#1D9E75]/5"
          >
            Suppliers
          </Link>
          <button
            type="button"
            onClick={handleComingSoon}
            className="w-full text-left text-sm px-3 py-2 rounded-md text-foreground/70 hover:bg-muted"
          >
            About Us
          </button>
          <button
            type="button"
            onClick={handleComingSoon}
            className="w-full text-left text-sm px-3 py-2 rounded-md text-foreground/70 hover:bg-muted"
          >
            Contact
          </button>
          <div className="pt-2 pb-1">
            <Button
              asChild
              variant="outline"
              className="w-full border-[#1D9E75] text-[#1D9E75] hover:bg-[#1D9E75]/5"
            >
              <Link href="/suppliers/login" onClick={() => setOpen(false)}>
                <User className="h-3.5 w-3.5 mr-1.5" />
                Supplier Login
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

// ── HeroDashboardMockup ───────────────────────────────────────────────────────

function HeroDashboardMockup() {
  return (
    <div className="relative max-w-sm w-full mx-auto lg:mx-0 lg:ml-auto">
      {/* Floating chip */}
      <div className="absolute -top-3 -right-2 z-10 bg-orange-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md rotate-6 select-none">
        3 new leads! 🎉
      </div>

      <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden rotate-1 hover:rotate-0 transition-transform duration-300 ease-out">
        {/* Header bar */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ backgroundColor: "#1D9E75" }}>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-white/20 rounded flex items-center justify-center">
              <div className="h-2.5 w-2.5 bg-white rounded-sm" />
            </div>
            <span className="text-white text-xs font-bold tracking-wide">SimpliPlan</span>
          </div>
          <span className="text-white/60 text-[10px]">Supplier Portal</span>
        </div>

        {/* Greeting */}
        <div className="px-4 py-2.5 border-b bg-gray-50/80">
          <p className="text-sm font-semibold text-gray-900">Welcome back, Thandi! 👋</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Here&apos;s what&apos;s happening with your account.
          </p>
        </div>

        {/* Two-col: mini sidebar + main */}
        <div className="flex">
          {/* Mini sidebar */}
          <div className="w-[96px] border-r bg-gray-50 py-2.5 px-1.5 space-y-0.5 shrink-0">
            {[
              { label: "Dashboard", active: true },
              { label: "Opportunities", active: false },
              { label: "Credits", active: false },
              { label: "Profile", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1.5 rounded-md",
                  item.active ? "text-white" : "text-gray-400",
                )}
                style={item.active ? { backgroundColor: "#1D9E75" } : undefined}
              >
                <div
                  className={cn(
                    "h-2 w-2 rounded-sm shrink-0",
                    item.active ? "bg-white/70" : "bg-gray-200",
                  )}
                />
                <span className="text-[9px] font-medium truncate">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-3 space-y-3 min-w-0">
            {/* Stat tiles */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="bg-orange-50 rounded-lg p-2 text-center">
                <p className="text-base font-bold text-orange-600 leading-none">3</p>
                <p className="text-[8px] text-orange-500/80 mt-0.5 leading-tight">New Opps</p>
              </div>
              <div className="rounded-lg p-2 text-center" style={{ backgroundColor: "rgba(29,158,117,0.1)" }}>
                <p className="text-base font-bold leading-none" style={{ color: "#1D9E75" }}>5</p>
                <p className="text-[8px] mt-0.5 leading-tight" style={{ color: "rgba(29,158,117,0.7)" }}>Credits</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2 text-center">
                <p className="text-base font-bold text-emerald-600 leading-none">80%</p>
                <p className="text-[8px] text-emerald-500/80 mt-0.5 leading-tight">Profile</p>
              </div>
            </div>

            {/* Example opportunity card */}
            <div className="bg-white border border-gray-100 rounded-lg p-2.5 space-y-1.5 shadow-sm">
              <div className="flex items-start justify-between gap-1.5">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-gray-900 leading-tight">
                    Birthday Cake Needed
                  </p>
                  <p className="text-[9px] text-gray-500 mt-0.5">📍 Durban North</p>
                  <p className="text-[9px] text-gray-500">⏱ Needed in 10 days</p>
                  <p className="text-[9px] text-gray-500">💰 R800 – R1,500</p>
                </div>
                <span
                  className="text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0"
                  style={{ color: "#1D9E75", backgroundColor: "rgba(29,158,117,0.1)" }}
                >
                  High Match
                </span>
              </div>
              <div
                className="w-full text-[10px] font-semibold text-white rounded-md py-1.5 text-center"
                style={{ backgroundColor: "#1D9E75" }}
              >
                Unlock for 1 Credit
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SupplierLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      {/* ── Section 1: Hero ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 overflow-hidden bg-white">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
              Grow Your Event Business with{" "}
              <span style={{ color: "#1D9E75" }}>SimpliPlan</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Join a trusted network of suppliers and connect with people planning birthdays,
              weddings, funerals, uMgidi, uMemulo and other important events near you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="h-12 px-6 font-bold text-base text-white"
                style={{ backgroundColor: "#1D9E75" }}
              >
                <Link href="/suppliers/register">
                  Create Supplier Profile
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-6 font-semibold text-base border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <a href="#how-it-works">How It Works ▷</a>
              </Button>
            </div>
            {/* Trust strip */}
            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start pt-1">
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 shrink-0" style={{ color: "#1D9E75" }} />
                Free to join
              </span>
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Smartphone className="h-4 w-4 shrink-0" style={{ color: "#1D9E75" }} />
                Mobile friendly
              </span>
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="h-4 w-4 shrink-0" style={{ color: "#1D9E75" }} />
                Built for South Africa
              </span>
            </div>
          </div>

          {/* Right: dashboard mockup */}
          <div className="flex justify-center lg:justify-end">
            <HeroDashboardMockup />
          </div>
        </div>
      </section>

      {/* ── Section 2: Why Join ──────────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p
              className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: "#1D9E75" }}
            >
              WHY SUPPLIERS JOIN SIMPLIPLAN
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              More Opportunities. More Growth.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_JOIN.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-4"
              >
                <div
                  className={cn(
                    "h-11 w-11 rounded-xl flex items-center justify-center",
                    item.bgClass,
                  )}
                >
                  <item.icon className={cn("h-5 w-5", item.iconClass)} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Real Opportunities ───────────────────────────────── */}
      <section className="py-16 md:py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p
              className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: "#1D9E75" }}
            >
              SEE EXAMPLE OPPORTUNITIES
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Real Opportunities. Real Events.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EXAMPLE_OPPS.map((opp) => (
              <div
                key={opp.title}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                <div
                  className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center",
                    opp.iconBg,
                  )}
                >
                  <opp.icon className={cn("h-6 w-6", opp.iconColor)} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-gray-900">{opp.title}</h3>
                  <p className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {opp.location}
                  </p>
                  <p className="text-sm text-gray-500">{opp.detail}</p>
                  <p className="text-sm text-gray-700 font-medium">Budget: {opp.budget}</p>
                  <p className={cn("text-sm font-semibold", opp.strengthColor)}>
                    Match Strength: {opp.strength}
                  </p>
                </div>
                <button
                  type="button"
                  className={cn(
                    "w-full py-2 px-4 rounded-lg text-sm font-semibold border transition-colors",
                    opp.btnBorder,
                    opp.btnText,
                    opp.btnHover,
                  )}
                >
                  Unlock for {opp.credits} Credit{opp.credits > 1 ? "s" : ""}
                </button>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            Opportunities vary by area and category.
          </p>
        </div>
      </section>

      {/* ── Section 4: Who Can Join ──────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <p
              className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: "#1D9E75" }}
            >
              WHO CAN JOIN
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              If You Provide a Service, You Belong Here.
            </h2>
          </div>

          {/* Mobile: horizontal scroll. Desktop: 6-col grid */}
          <div className="flex md:grid md:grid-cols-6 gap-3 overflow-x-auto pb-2 md:overflow-visible md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.label}
                className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow shrink-0 md:shrink min-w-[80px] md:min-w-0 cursor-default"
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center",
                    cat.bgClass,
                  )}
                >
                  <cat.icon className={cn("h-5 w-5", cat.iconClass)} />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                  {cat.label}
                </span>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-8 max-w-xl mx-auto">
            Formal businesses, small enterprises and independent service providers — everyone is welcome.
          </p>
        </div>
      </section>

      {/* ── Section 5: How It Works ──────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 md:py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <p
              className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: "#1D9E75" }}
            >
              HOW IT WORKS
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Simple Steps to Grow Your Business
            </h2>
          </div>

          {/* Desktop: horizontal with dashed line behind */}
          <div className="hidden md:block relative">
            {/* Single dashed connector line spanning all circles */}
            <div
              className="absolute border-t-2 border-dashed pointer-events-none"
              style={{
                top: "20px",
                left: "10%",
                right: "10%",
                borderColor: "#1D9E75",
                opacity: 0.25,
              }}
            />
            <div className="grid grid-cols-5 gap-4">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.title} className="flex flex-col items-center text-center">
                  {/* Number circle — ring-white masks the dashed line */}
                  <div
                    className="relative z-10 h-10 w-10 rounded-full text-white font-bold text-sm flex items-center justify-center mb-3 shrink-0 ring-4 ring-white"
                    style={{ backgroundColor: "#1D9E75" }}
                  >
                    {i + 1}
                  </div>
                  <step.icon className="h-6 w-6 mb-2" style={{ color: "#1D9E75" }} />
                  <p className="font-semibold text-sm text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-[120px]">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: vertical stack with dashed connector on left */}
          <div className="flex flex-col md:hidden gap-0">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="flex items-start gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="h-9 w-9 rounded-full text-white font-bold text-sm flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#1D9E75" }}
                  >
                    {i + 1}
                  </div>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div
                      className="w-px flex-1 border-l-2 border-dashed mt-1"
                      style={{ minHeight: "40px", borderColor: "#1D9E75", opacity: 0.3 }}
                    />
                  )}
                </div>
                <div className={cn("pt-0.5", i < HOW_IT_WORKS.length - 1 ? "pb-6" : "pb-2")}>
                  <step.icon className="h-5 w-5 mb-1" style={{ color: "#1D9E75" }} />
                  <p className="font-semibold text-sm text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6: Bottom CTA Banner ─────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-16 md:py-20 px-4 text-white"
        style={{ background: "linear-gradient(135deg, #1D9E75 0%, #0e6b4e 100%)" }}
      >
        <div className="container mx-auto max-w-6xl relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Text + buttons */}
          <div className="space-y-5 text-center md:text-left max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold">Ready to Grow Your Business?</h2>
            <p className="text-white/80 text-base leading-relaxed">
              Join thousands of suppliers already building success with SimpliPlan.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Button
                asChild
                size="lg"
                className="h-12 px-6 font-bold text-base bg-white hover:bg-white/90"
                style={{ color: "#1D9E75" }}
              >
                <Link href="/suppliers/register">
                  Create Supplier Profile
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-6 font-semibold text-base border-white/50 text-white hover:bg-white/10"
              >
                <Link href="/suppliers/login">
                  <User className="h-4 w-4 mr-2" />
                  Supplier Login
                </Link>
              </Button>
            </div>
            <p className="text-xs text-white/60">
              It&apos;s free to join. No monthly fees. Pay only when you unlock opportunities.
            </p>
          </div>

          {/* SVG silhouettes */}
          <div className="hidden md:block shrink-0" aria-hidden="true">
            <svg width="220" height="195" viewBox="0 0 220 195" fill="none">
              {/* Three human silhouettes */}
              <ellipse cx="55"  cy="52"  rx="22" ry="24" fill="white" fillOpacity="0.2" />
              <path d="M25 158 C28 115 82 115 85 158 Z" fill="white" fillOpacity="0.2" />

              <ellipse cx="110" cy="43"  rx="20" ry="22" fill="white" fillOpacity="0.25" />
              <path d="M82 156 C85 113 135 113 138 156 Z" fill="white" fillOpacity="0.25" />

              <ellipse cx="165" cy="56"  rx="18" ry="20" fill="white" fillOpacity="0.2" />
              <path d="M139 158 C142 118 188 118 191 158 Z" fill="white" fillOpacity="0.2" />

              {/* Ground */}
              <line x1="15" y1="166" x2="205" y2="166" stroke="white" strokeOpacity="0.2" strokeWidth="1.5" />

              {/* Sparkles */}
              <circle cx="28"  cy="22"  r="3"   fill="white" fillOpacity="0.4" />
              <circle cx="198" cy="30"  r="2.5" fill="white" fillOpacity="0.4" />
              <circle cx="210" cy="95"  r="2"   fill="white" fillOpacity="0.3" />
              <circle cx="18"  cy="135" r="2"   fill="white" fillOpacity="0.3" />
            </svg>
          </div>
        </div>

        {/* Decorative background circles */}
        <svg
          className="absolute right-0 top-0 pointer-events-none"
          width="300"
          height="220"
          viewBox="0 0 300 220"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="270" cy="0"   r="130" fill="white" fillOpacity="0.07" />
          <circle cx="240" cy="220" r="90"  fill="white" fillOpacity="0.07" />
        </svg>
      </section>

      {/* ── Section 7: Footer Trust Strip ────────────────────────────────── */}
      <div className="bg-gray-50 border-t py-10 px-4">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {TRUST_STRIP.map((item) => (
            <div key={item.title} className="space-y-1.5">
              <p className="text-2xl">{item.emoji}</p>
              <p className="font-semibold text-sm text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <LandingFaq />

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-6 border-t bg-white text-center">
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} SimpliPlan. &nbsp;
          <Link href="/terms" className="hover:text-[#1D9E75] underline underline-offset-2">
            Terms
          </Link>{" "}
          &middot;{" "}
          <Link href="/privacy" className="hover:text-[#1D9E75] underline underline-offset-2">
            Privacy
          </Link>
        </p>
      </footer>
    </div>
  );
}
