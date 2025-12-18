
import PageHeader from '@/components/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'Free',
    price: 'Free',
    priceSuffix: '(Sign-Up)',
    description: '1 plan • Full editing • Draft only • No final outputs.',
    features: [
      'Manage 1 full celebration plan',
      'Full editing and budgeting tools',
      'Access to all budget templates',
      'Save your plan automatically',
    ],
    cta: 'Sign Up for Free',
    href: '/register',
    isMostPopular: true,
  },
  {
    name: 'Basic',
    price: 'R99',
    priceSuffix: '/ plan',
    description: '1 plan • Finalize & lock • Export/share • Tasks & attendance “official”.',
    features: [
      'All features from the Free plan',
      'Finalize and lock your budget',
      'Export and share your plan',
      'Official task and RSVP attendance tracking',
    ],
    cta: 'Get Started',
    href: '/register',
    isMostPopular: false,
  },
  {
    name: 'Standard',
    price: 'R250',
    priceSuffix: '/ month',
    description: '4 plans • All Basic features • Multi-event management.',
    features: [
      'All features from the Basic plan',
      'Manage up to 4 plans simultaneously',
      'Priority support',
      'Advanced multi-event management tools',
    ],
    cta: 'Go Standard',
    href: '/register',
    isMostPopular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-background shadow-2xl min-h-full container mx-auto flex flex-col">
        <PageHeader />
        <main className="container mx-auto px-4 flex-grow my-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold font-headline text-foreground/90">
              Choose the Right Plan for Your Celebration
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              From a quick look to detailed planning for multiple events, we have a plan that fits your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 items-stretch justify-center">
            {tiers.map((tier) => (
              <Card key={tier.name} className={cn("flex flex-col relative overflow-hidden", tier.isMostPopular ? "border-primary shadow-lg" : "")}>
                {(tier.name === 'Basic' || tier.name === 'Standard') && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full bg-primary text-primary-foreground p-2 text-center text-xs font-semibold z-10">
                    <Star className="h-4 w-4 inline-block mr-1" />
                    1st 100 subscribers keep their 1st event for life!
                  </div>
                )}
                <CardHeader className={cn("text-center", (tier.name === 'Basic' || tier.name === 'Standard') && 'pt-12')}>
                  <CardTitle className="text-2xl font-headline">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.priceSuffix && <span className="text-muted-foreground">{tier.priceSuffix}</span>}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant={tier.isMostPopular ? 'default' : 'outline'}>
                    <Link href={tier.href}>{tier.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
