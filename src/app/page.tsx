
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Cake, Handshake, ShoppingCart } from 'lucide-react';
import PageHeader from '@/components/page-header';

export default function LandingPage() {
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
            <Link href="/planner" className="mt-8 inline-block">
              <Button size="lg" className="font-semibold text-lg py-6 px-8">
                Plan your Event
              </Button>
            </Link>

            <div className="mt-8 w-full max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="overflow-hidden">
                  <Image src="/images/wedding.jpg" alt="Wedding" width={400} height={300} className="object-cover w-full h-48" />
                  <CardHeader className="p-2">
                    <CardTitle className="text-xl font-semibold">Wedding</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="overflow-hidden">
                  <Image src="/images/funeral2.png" alt="Funeral" width={400} height={300} className="object-cover w-full h-48" />
                  <CardHeader className="p-2">
                    <CardTitle className="text-xl font-semibold">Funeral</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="overflow-hidden">
                  <Image src="/images/umemulo.jpg" alt="uMemulo" width={400} height={300} className="object-cover w-full h-48" />
                  <CardHeader className="p-2">
                    <CardTitle className="text-xl font-semibold">uMemulo</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="overflow-hidden">
                  <Image src="/images/umgidi1.jpg" alt="umGidi" width={400} height={300} className="object-cover w-full h-48" />
                  <CardHeader className="p-2">
                    <CardTitle className="text-xl font-semibold">umGidi</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </div>

            <div className="mt-12 w-full max-w-6xl mx-auto">
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
