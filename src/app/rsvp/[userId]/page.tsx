
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

/**
 * Landing page for invitation links that only have a single ID.
 * Standardized slug name to 'userId' to resolve Next.js routing conflicts.
 * This page handles legacy links where the ID might be a budgetId or a userId.
 */
export default function RsvpLanding({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const id = params.userId;

  useEffect(() => {
    // If we only have one ID, we try to redirect or show a generic message.
    // In a future update, this could list public events for this ID.
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router, id]);

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
