
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, initiateAnonymousSignIn, useAuth } from '@/firebase';

export default function PlannerRedirectPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        initiateAnonymousSignIn(auth);
        // After anonymous sign-in, the auth state will change, and this effect will re-run.
      } else if (user.isAnonymous) {
        const eventType = searchParams.get('eventType') || 'other';
        router.replace(`/planner/template?eventType=${eventType}`);
      } else {
        router.replace('/my-plans');
      }
    }
  }, [user, isUserLoading, auth, router, searchParams]);

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
        <p>Loading...</p>
    </div>
  );
}
