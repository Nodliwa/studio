
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

/**
 * Landing page for invitation links that only have a userId.
 * This standardizes the dynamic slug name to 'userId' to avoid Next.js routing conflicts.
 * Typically redirects or shows an error as we need both userId AND budgetId for a specific RSVP.
 */
export default function RsvpUserLanding({ params: { userId } }: { params: { userId: string } }) {
  const router = useRouter();

  useEffect(() => {
    // If we only have a userId, we can't show a specific form.
    // In a future update, this could list public events for this user.
    // For now, we redirect to home.
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

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
