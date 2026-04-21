
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
  const userId = params.userId;

  useEffect(() => {
    // Redirect to home if no secondary ID is provided, 
    // or handle single-ID lookup logic here.
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router, userId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary p-4 text-center">
      <RefreshCw className="h-12 w-12 animate-spin text-primary mb-4" />
      <h1 className="text-2xl font-headline font-bold">Loading Invitation...</h1>
      <p className="text-muted-foreground mt-2 max-w-xs">
        We're looking for your celebration details. If this takes too long, please check the link provided by your host.
      </p>
    </div>
  );
}
