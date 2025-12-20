
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, initiateAnonymousSignIn, useAuth } from '@/firebase';

// This line forces the page to be rendered dynamically, which is required
// because we are using the `useSearchParams` hook.
export const dynamic = 'force-dynamic';

export default function PlannerRedirectPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isUserLoading) {
        return; // Wait until user status is resolved
    }

    if (!user) {
        // If there's no user, initiate anonymous sign-in.
        // The onAuthStateChanged listener will trigger a re-render, and this effect will run again.
        initiateAnonymousSignIn(auth);
    } else if (user.isAnonymous) {
        // If user is anonymous, send them to the template editor.
        const eventType = searchParams.get('eventType') || 'other';
        router.replace(`/planner/template?eventType=${eventType}`);
    } else {
        // If user is registered, send them to their personal dashboard.
        router.replace('/my-plans');
    }
  }, [user, isUserLoading, auth, router, searchParams]);

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
        <p>Loading...</p>
    </div>
  );
}
