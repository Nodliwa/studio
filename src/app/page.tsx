
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Cake, Handshake } from 'lucide-react';
import PageHeader from '@/components/page-header';

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-background font-sans text-foreground">
      <PageHeader />
      <main className="container mx-auto flex flex-col items-center justify-center text-center p-4 md:p-8">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground/90 mt-4">
          Celebrate Life, Simplified
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          SimpliPlan helps you budget for life's most important moments. From weddings to birthdays, plan your celebration with ease and confidence.
        </p>
        <Link href="/planner" className="mt-8">
          <Button size="lg" className="font-semibold text-lg py-6 px-8">
            Get Started for Free
          </Button>
        </Link>
        
        <div className="mt-24 w-full max-w-5xl">
          <h2 className="text-3xl font-bold font-headline">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col items-center gap-2">
                  <UtensilsCrossed className="h-8 w-8 text-primary" />
                  <span>Effortless Budgeting</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Organize your expenses by category and track every detail with our intuitive interface.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col items-center gap-2">
                  <Cake className="h-8 w-8 text-primary" />
                  <span>Plan Any Event</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Whether it's a wedding, funeral, or birthday, our flexible tool adapts to your needs.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col items-center gap-2">
                  <Handshake className="h-8 w-8 text-primary" />
                  <span>Real-Time Updates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>See your grand total update instantly as you adjust quantities and prices. No surprises.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="mt-24 text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} SimpliPlan. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
