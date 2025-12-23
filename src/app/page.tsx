
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">
        Welcome to SimpliPlan
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        Your new foundation for building an amazing event planning application. Let's get started!
      </p>
      <div className="flex justify-center gap-4">
        <Button asChild>
          <Link href="/login">Get Started</Link>
        </Button>
      </div>
    </div>
  );
}

    