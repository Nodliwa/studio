"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/page-header";
import LandingFooter from "@/components/landing-footer";
import { ListChecks, Wallet, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const eventCategories = [
  {
    name: "Birthday",
    image: "/images/birthday.pic.jpg",
    eventType: "birthday",
    comingSoon: false,
    backImage: null,
    gradient: null,
  },
  {
    name: "Wedding",
    image: "/images/wedding.jpg",
    eventType: "wedding",
    comingSoon: false,
    backImage: null,
    gradient: null,
  },
  {
    name: "Funeral",
    image: "/images/funeral2.jpg",
    eventType: "funeral",
    comingSoon: false,
    backImage: null,
    gradient: null,
  },
  {
    name: "uMgidi",
    image: "/images/umgidi1.jpg",
    eventType: "umgidi",
    comingSoon: false,
    backImage: "/images/boy.jpg",
    gradient: null,
  },
  {
    name: "uMemulo",
    image: "/images/umemulo.jpg",
    eventType: "umemulo",
    comingSoon: false,
    backImage: "/images/girl.jpg",
    gradient: null,
  },
];

const benefits = [
  {
    icon: ListChecks,
    title: "Stay Organised",
    description: "Never miss event items, tasks, bookings or deadlines.",
  },
  {
    icon: Wallet,
    title: "Control Your Budget",
    description: "Track every cost in one place.",
  },
  {
    icon: Users,
    title: "Plan Together",
    description: "Share plans with family or friends and plan together.",
  },
  {
    icon: Zap,
    title: "Move Fast",
    description: "Create a birthday plan in seconds.",
  },
];

function FlipCard({ cat }: { cat: (typeof eventCategories)[number] }) {
  const [flipped, setFlipped] = useState(false);

  if (cat.comingSoon) {
    return (
      <div
        className="cursor-pointer h-64"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative w-full h-full transition-transform duration-700"
          style={{
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden shadow-md"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <Image
              src={cat.image ?? ""}
              alt={cat.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 80vw, 20vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-0 flex items-end justify-center pb-4">
              <span className="text-white font-bold text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {cat.name}
              </span>
            </div>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden shadow-md"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              backgroundImage: `url(${cat.backImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center px-3 text-center">
              <span className="text-white font-extrabold text-2xl drop-shadow-lg">{cat.name}</span>
              <span className="text-white/90 font-semibold text-sm mt-1 drop-shadow">Stay Tuned!</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/planner/template?eventType=${cat.eventType}`}
      className="relative overflow-hidden rounded-xl shadow-md group cursor-pointer block h-64"
    >
      {cat.image !== null ? (
        <Image
          src={cat.image}
          alt={cat.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 80vw, 20vw"
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} transition-transform duration-500 group-hover:scale-110`}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute top-2 right-2 z-10 bg-teal-600/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
        Click to plan
      </div>
      <div className="absolute inset-0 flex items-end justify-center pb-4">
        <span className="text-white font-bold text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          {cat.name}
        </span>
      </div>
    </Link>
  );
}

function EventCarousel() {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const count = eventCategories.length;

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % count);
    }, 2000);
  }, [count]);

  useEffect(() => {
    startTimer();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startTimer]);

  const goTo = useCallback((index: number) => {
    setCurrent((index + count) % count);
    startTimer();
  }, [count, startTimer]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(current + (diff > 0 ? 1 : -1));
    }
  };

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {eventCategories.map((cat) => (
            <div key={cat.name} className="w-full flex-shrink-0">
              <FlipCard cat={cat} />
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-3">
        {eventCategories.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === current ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-secondary">
      <PageHeader />
      <main>

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="pt-4 pb-8 md:pt-10 md:pb-10 px-4 text-center">
          <div className="flex justify-center mb-4">
            <span className="bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full tracking-wide">
              Built for Mzansi
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl max-w-3xl mx-auto leading-tight">
            Plan Weddings, Birthdays &amp; Ceremonies Without Stress
          </h1>

          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Budgets, checklists, guest planning and smart tools for Weddings,
            Birthdays, Funerals and Traditional Ceremonies.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="px-8 h-12 text-base font-bold w-full sm:w-auto">
              <Link href="#categories">Plan Event 👇🏾</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 text-base font-bold border-teal-500 text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:border-teal-400 dark:hover:bg-teal-950 w-full sm:w-auto"
            >
              <Link href="/my-plans">
                <Zap className="mr-2 h-4 w-4 fill-yellow-500 text-yellow-500" />
                Plan a Birthday in 10 Seconds
              </Link>
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>✓ Free to start</span>
            <span>✓ Built for South Africa</span>
            <span>✓ Mobile friendly</span>
          </div>
        </section>

        {/* ── Event Type Cards ──────────────────────────────── */}
        <section id="categories" className="px-4 pb-10 md:pb-14">
          <div className="container mx-auto max-w-6xl">

            {/* Mobile: auto-sliding carousel */}
            <div className="md:hidden">
              <EventCarousel />
            </div>

            {/* Desktop: 5-column grid */}
            <div className="hidden md:grid md:grid-cols-5 gap-4">
              {eventCategories.map((cat) => (
                <FlipCard key={cat.name} cat={cat} />
              ))}
            </div>

          </div>
        </section>

        {/* ── Why SimpliPlan ────────────────────────────────── */}
        <section className="py-12 md:py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-extrabold text-center mb-10">
              Why people use SimpliPlan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {benefits.map((b) => (
                <Card key={b.title} className="text-center">
                  <CardContent className="pt-8 pb-8">
                    <b.icon className="h-10 w-10 mx-auto text-primary mb-4" />
                    <h3 className="font-bold text-base mb-2">{b.title}</h3>
                    <p className="text-muted-foreground text-sm">{b.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mid-page CTA ──────────────────────────────────── */}
        <section className="py-14 px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-6">
            Ready to plan something important?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="px-8 h-12 text-base font-bold w-full sm:w-auto">
              <Link href="/my-plans">Create Free Plan</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 text-base font-bold border-teal-500 text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:border-teal-400 dark:hover:bg-teal-950 w-full sm:w-auto"
            >
              <Link href="/my-plans">
                <Zap className="mr-2 h-4 w-4 fill-yellow-500 text-yellow-500" />
                Try Birthday Quick Start
              </Link>
            </Button>
          </div>
        </section>

      </main>
      <LandingFooter />
    </div>
  );
}
