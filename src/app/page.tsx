"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/page-header";
import LandingFooter from "@/components/landing-footer";
import { ListChecks, Calendar, Wallet, RefreshCw } from "lucide-react";

const eventCategories = [
  {
    name: "Wedding",
    image: "/images/wedding.jpg",
    eventType: "wedding",
    comingSoon: false,
    backImage: null,
  },
  {
    name: "Funeral",
    image: "/images/funeral2.png",
    eventType: "funeral",
    comingSoon: false,
    backImage: null,
  },
  {
    name: "uMemulo",
    image: "/images/umemulo.jpg",
    eventType: "umemulo",
    comingSoon: true,
    backImage: "/images/girl.jpg",
  },
  {
    name: "uMgidi",
    image: "/images/umgidi1.jpg",
    eventType: "umgidi",
    comingSoon: true,
    backImage: "/images/boy.jpg",
  },
];

const features = [
  {
    icon: ListChecks,
    title: "Don't forget a thing",
    description:
      "We give you a handy list of items to think about for your event, so nothing slips through the cracks.",
  },
  {
    icon: Calendar,
    title: "Planning That Fits Your Life",
    description:
      "Plan anywhere, with anyone, whenever it suits you — simple, flexible, and stress-free.",
  },
  {
    icon: Wallet,
    title: "Effortless Budgeting",
    description:
      "Forget diaries & spreadsheets - Organise your spending and see where your money goes, all in one place",
  },
  {
    icon: RefreshCw,
    title: "Real-Time Updates",
    description:
      "See your grand total update instantly as you adjust quantities and prices. No surprises.",
  },
];

function FlipCard({ cat }: { cat: (typeof eventCategories)[number] }) {
  const [flipped, setFlipped] = useState(false);

  if (cat.comingSoon) {
    return (
      <div
        className="cursor-pointer"
        style={{ height: "220px", perspective: "1000px" }}
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
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 flex items-end justify-center pb-4">
              <span className="text-white font-bold text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
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
              <span className="text-white font-extrabold text-2xl drop-shadow-lg">
                {cat.name}
              </span>
              <span className="text-white/90 font-semibold text-sm mt-1 drop-shadow">
                Stay Tuned!
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/planner/template?eventType=${cat.eventType}`}
      className="relative overflow-hidden rounded-xl shadow-md group cursor-pointer block"
      style={{ height: "220px" }}
    >
      <Image
        src={cat.image}
        alt={cat.name}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
      <div className="absolute inset-0 flex items-end justify-center pb-4">
        <span className="text-white font-bold text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {cat.name}
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-secondary">
      <PageHeader />
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl">
            Celebrate Loved Ones. Plan Smart.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            SimpliPlan helps you budget for life&apos;s most important moments.
            From Weddings to Funerals, plan your celebration with ease and
            confidence.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="px-8">
              <Link href="/register">Plan your Event</Link>
            </Button>
          </div>
        </section>

        {/* Event Category Cards */}
        <section className="px-4 pb-16">
          <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl">
            {eventCategories.map((cat) => (
              <FlipCard key={cat.name} cat={cat} />
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-4xl font-extrabold text-center mb-12">
              Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center">
                  <CardContent className="pt-8 pb-8">
                    <feature.icon className="h-10 w-10 mx-auto text-primary mb-4" />
                    <h3 className="font-bold text-base">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm mt-2">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
