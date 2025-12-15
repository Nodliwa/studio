
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, CalendarDays, Wallet, RefreshCw, Star, Gift, Utensils, Ribbon } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function LandingPage() {
    const { toast } = useToast();

    const handleComingSoon = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        toast({
            title: "Coming Soon!",
            description: "This event type is not available yet, but we're working on it.",
        });
    };


  return (
    <div className="min-h-screen w-full bg-secondary">
      <div className="bg-background shadow-2xl min-h-full container mx-auto flex flex-col">
          <PageHeader />
          <main className="mx-auto px-4 flex-grow flex flex-col mb-16">
          <div className="p-2 md:p-4 text-center mt-6 flex-grow">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground/90">
              Celebrate Loved Ones. Plan Smart.            </h1>
            <p className="mt-4 mb-8 max-w-2xl mx-auto text-lg text-muted-foreground">
              SimpliPlan helps you budget for life's most important moments. From Weddings to Funerals, plan your celebration with ease and confidence.
            </p>
            <Link href="/planner" className="inline-block">
              <Button size="lg" className="font-semibold text-lg py-4 px-4">
                Plan your Event
              </Button>
            </Link>

            <div className="w-full max-w-4xl mx-auto mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link href="/planner?eventType=wedding" className="group">
                        <Card className="overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1 h-full">
                            <Image src="/images/wedding.jpg" alt="Wedding" width={400} height={300} className="object-cover w-full h-40" />
                            <CardHeader className="p-2 text-center">
                                <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2">
                                    <Ribbon className="h-5 w-5" /> Wedding
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                    <Link href="/planner?eventType=funeral" className="group">
                        <Card className="overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1 h-full">
                            <Image src="/images/funeral2.png" alt="Funeral" width={400} height={300} className="object-cover w-full h-40" />
                            <CardHeader className="p-2 text-center">
                                <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2">
                                    <Utensils className="h-5 w-5" /> Funeral
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                    <div onClick={handleComingSoon} className="group cursor-pointer">
                        <Card className="overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1 h-full relative">
                            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">Coming Soon</span>
                            </div>
                            <Image src="/images/umemulo.jpg" alt="uMemulo" width={400} height={300} className="object-cover w-full h-40 filter grayscale" />
                            <CardHeader className="p-2 text-center">
                                <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2">
                                    <Star className="h-5 w-5" /> uMemulo
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                    <div onClick={handleComingSoon} className="group cursor-pointer">
                        <Card className="overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1 h-full relative">
                            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">Coming Soon</span>
                            </div>
                            <Image src="/images/umgidi.jpg" alt="uMgidi" width={400} height={300} className="object-cover w-full h-40 filter grayscale" />
                             <CardHeader className="p-2 text-center">
                                <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2">
                                    <Gift className="h-5 w-5" /> uMgidi
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="mt-12 w-full max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold font-headline text-center">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="flex flex-col items-center gap-2 text-base font-semibold">
                      <ListChecks className="h-6 w-6 text-primary" />
                      <span>Don’t forget a thing</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground text-center">We give you a handy list of items to think about for your event, so nothing slips through the cracks.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="flex flex-col items-center gap-2 text-base font-semibold">
                      <CalendarDays className="h-6 w-6 text-primary" />
                      <span>Planning That Fits Your Life</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground text-center">Plan anywhere, with anyone, whenever it suits you — simple, flexible, and stress-free.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="flex flex-col items-center gap-2 text-base font-semibold">
                      <Wallet className="h-6 w-6 text-primary" />
                      <span>Effortless Budgeting</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground text-center">Forget diaries & spreadsheets - Organise your spending and see where your money goes, all in one place</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="flex flex-col items-center gap-2 text-base font-semibold">
                      <RefreshCw className="h-6 w-6 text-primary" />
                      <span>Real-Time Updates</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground text-center">See your grand total update instantly as you adjust quantities and prices. No surprises.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
