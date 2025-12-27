'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !user.isAnonymous) {
      router.push('/my-plans');
    }
  }, [user, isLoading, router]);

  if (isLoading || (!isLoading && user && !user.isAnonymous)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-background shadow-2xl min-h-full container mx-auto flex flex-col">
        <PageHeader />
        <main className="container mx-auto flex flex-col items-center justify-center px-4 flex-grow text-center my-16">
          <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl">
            Welcome to SimpliPlan
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            The effortless way to plan your events and celebrations. From guest lists to budgets, we've got you covered. Get started today and make your next event unforgettable.
          </p>
          <div className="mt-8 flex gap-4">
            <Button asChild size="lg">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SimpliPlan. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
