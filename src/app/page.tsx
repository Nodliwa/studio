
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Cake, Handshake, ShoppingCart } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const [isUmemuloFlipped, setIsUmemuloFlipped] = useState(false);
  const [isUmgidiFlipped, setIsUmgidiFlipped] = useState(false);

  return (
    <div className="min-h-screen w-full bg-secondary font-sans text-foreground p-4">
      <main className="container mx-auto">
        <div className="bg-background rounded-lg shadow-lg">
          <PageHeader />
          <div className="p-2 md:p-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground/90 mt-4">
              Celebrate Life, Simplified
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              SimpliPlan helps you budget for life's most important moments. From weddings to birthdays, plan your celebration with ease and confidence.
            </p>
            <Link href="/planner" className="inline-block">
              <Button size="lg" className="font-semibold text-lg py-6 px-8">
                Plan your Event
              </Button>
            </Link>

            <div className="w-full max-w-6xl mx-auto mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/planner?eventType=wedding" className="group">
                  <Card className="overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                    <Image src="/images/wedding.jpg" alt="Wedding" width={400} height={300} className="object-cover w-full h-48" />
                    <CardHeader className="p-1">
                      <CardTitle className="text-xl font-semibold">Wedding</CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
                <Link href="/planner?eventType=funeral" className="group">
                  <Card className="overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                    <Image src="/images/funeral2.png" alt="Funeral" width={400} height={300} className="object-cover w-full h-48" />
                    <CardHeader className="p-1">
                      <CardTitle className="text-xl font-semibold">Funeral</CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
                
                {/* uMemulo Flip Card */}
                <div className="flip-card group" onClick={() => setIsUmemuloFlipped(!isUmemuloFlipped)}>
                  <div className={cn("flip-card-inner", { 'is-flipped': isUmemuloFlipped })}>
                    <div className="flip-card-front">
                      <Card className="overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1 w-full h-full flex flex-col items-center justify-center">
                         <Image src="/images/umemulo.jpg" alt="uMemulo" width={400} height={300} className="object-cover w-full h-48" />
                        <CardHeader className="p-1">
                          <CardTitle className="text-xl font-semibold">uMemulo</CardTitle>
                        </CardHeader>
                      </Card>
                    </div>
                    <div className="flip-card-back flex items-center justify-center p-0 overflow-hidden">
                       <Image src="/images/girl.jpg" alt="uMemulo Background" fill className="object-cover" />
                       <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center text-white p-4">
                                <h3 className="text-2xl font-bold">Sisakhula phoo!</h3>
                                <p className="text-lg">Coming Soon!</p>
                            </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* umGidi Flip Card */}
                <div className="flip-card group" onClick={() => setIsUmgidiFlipped(!isUmgidiFlipped)}>
                  <div className={cn("flip-card-inner", { 'is-flipped': isUmgidiFlipped })}>
                    <div className="flip-card-front">
                      <Card className="overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1 w-full h-full flex flex-col items-center justify-center">
                         <Image src="/images/umgidi1.jpg" alt="umGidi" width={400} height={300} className="object-cover w-full h-48" />
                        <CardHeader className="p-1">
                          <CardTitle className="text-xl font-semibold">umGidi</CardTitle>
                        </CardHeader>
                      </Card>
                    </div>
                     <div className="flip-card-back flex items-center justify-center p-0 overflow-hidden">
                       <Image src="/images/boy.jpg" alt="umGidi Background" fill className="object-cover" />
                       <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center text-white p-4">
                                <h3 className="text-2xl font-bold">Ndisakhula!</h3>
                                <p className="text-lg">Coming Soon!</p>
                            </div>
                       </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-8 w-full max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold font-headline">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="flex flex-col items-center gap-2 text-base font-semibold">
                      <UtensilsCrossed className="h-6 w-6 text-primary" />
                      <span>Effortless Budgeting</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">Organize your expenses by category and track every detail with our intuitive interface.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="flex flex-col items-center gap-2 text-base font-semibold">
                      <Cake className="h-6 w-6 text-primary" />
                      <span>Plan Any Event</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">Whether it's a wedding, funeral, or birthday, our flexible tool adapts to your needs.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="flex flex-col items-center gap-2 text-base font-semibold">
                      <Handshake className="h-6 w-6 text-primary" />
                      <span>Real-Time Updates</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">See your grand total update instantly as you adjust quantities and prices. No surprises.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="flex flex-col items-center gap-2 text-base font-semibold">
                      <ShoppingCart className="h-6 w-6 text-primary" />
                      <span>Shopping List Ready</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">Your budget automatically becomes your shopping list, making your store trips a breeze.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <footer className="mt-24 text-muted-foreground text-sm">
              <p>&copy; {new Date().getFullYear()} SimpliPlan. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
