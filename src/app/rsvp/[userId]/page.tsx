"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

/**
 * Standardized RSVP landing page.
 * Uses 'userId' as the primary dynamic segment to resolve Next.js routing conflicts.
 */
export default function RsvpLanding({ params }: { params: { userId: string } }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary p-4 text-center">
      <RefreshCw className="h-12 w-12 animate-spin text-primary mb-4" />
      <h1 className="text-2xl font-headline font-bold">Accessing Invitation...</h1>
      <p className="text-muted-foreground mt-2 max-w-xs">
        Checking your celebration details. If you're seeing this for too long, please ensure your invitation link is complete.
      </p>
    </div>
  );
}
