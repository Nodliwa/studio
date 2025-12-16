
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, CalendarDays, Wallet, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

export default function LandingPage() {
    const { toast } = useToast();
    const [flippedCard, setFlippedCard] = useState<string | null>(null);
    const { user, isUserLoading } = useUser();

    const handleFlip = (cardId: string) => {
        if (flippedCard === cardId) {
            setFlippedCard(null);
        } else {
            setFlippedCard(cardId);
        }
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
            <div className="flex justify-center items-center gap-4">
              <Link href="/planner" className="inline-block">
                <Button size="lg" className="font-semibold text-lg py-4 px-4">
                  Plan your Event
                </Button>
              </Link>
              {!isUserLoading && (!user || user.isAnonymous) && (
                  <Link href="/register" className="inline-block">
                    <Button size="lg" variant="outline" className="font-semibold text-lg py-4 px-4">
                      Sign Up
                    </Button>
                  </Link>
              )}
            </div>

            <div className="w-full mx-auto mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link href="/planner?eventType=wedding" className="group">
                       <Card className="relative overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1 aspect-[4/3]">
                            <Image src="/images/wedding.jpg" alt="Wedding" fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/30" />
                            <div className="absolute inset-0 flex items-end justify-center p-4">
                                <CardTitle className="text-2xl font-semibold flex items-center justify-center text-white">
                                    Wedding
                                </CardTitle>
                            </div>
                        </Card>
                    </Link>
                    <Link href="/planner?eventType=funeral" className="group">
                        <Card className="relative overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1 aspect-[4/3]">
                            <Image src="/images/funeral2.png" alt="Funeral" fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/30" />
                            <div className="absolute inset-0 flex items-end justify-center p-4">
                                <CardTitle className="text-2xl font-semibold flex items-center justify-center text-white">
                                    Funeral
                                </CardTitle>
                            </div>
                        </Card>
                    </Link>
                    <div className="flip-card aspect-[4/3]" onClick={() => handleFlip('umemulo')}>
                        <div className={cn("flip-card-inner", { 'is-flipped': flippedCard === 'umemulo' })}>
                            <div className="flip-card-front">
                                <Card className="relative overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1 aspect-[4/3] h-full">
                                    <Image src="/images/umemulo.jpg" alt="uMemulo" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/30" />
                                    <div className="absolute inset-0 flex items-end justify-center p-4">
                                      <CardTitle className="text-2xl font-semibold text-white">
                                          uMemulo
                                      </CardTitle>
                                    </div>
                                </Card>
                            </div>
                            <div className="flip-card-back relative">
                                <Image src="/images/girl.jpg" alt="uMemulo Coming Soon" fill className="object-cover rounded-lg" />
                                <div className="absolute inset-0 bg-black/50 rounded-lg" />
                                <div className="relative z-10 text-2xl font-bold text-center">
                                    <p>Iyeza,</p>
                                    <p>ay'kaka'fiki.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flip-card aspect-[4/3]" onClick={() => handleFlip('umgidi')}>
                        <div className={cn("flip-card-inner", { 'is-flipped': flippedCard === 'umgidi' })}>
                            <div className="flip-card-front">
                                <Card className="relative overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1 aspect-[4/3] h-full">
                                    <Image src="/images/umgidi1.jpg" alt="uMgidi" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/30" />
                                    <div className="absolute inset-0 flex items-end justify-center p-4">
                                      <CardTitle className="text-2xl font-semibold text-white">
                                          uMgidi
                                      </CardTitle>
                                    </div>
                                </Card>
                            </div>
                            <div className="flip-card-back relative">
                                <Image src="/images/boy.jpg" alt="uMgidi Coming Soon" fill className="object-cover rounded-lg" />
                                <div className="absolute inset-0 bg-black/50 rounded-lg" />
                                <div className="relative z-10 text-2xl font-bold text-center">
                                    <p>Iyeza,</p>
                                    <p>ay'kaka'fiki.</p>
                                </div>
                            </div>
                        </div>
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
