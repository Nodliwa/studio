
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

// This is a temporary redirect page.
// If a user lands on /planner without a budgetId, we redirect them to the /my-plans page.
export default function PlannerRedirectPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading) {
        router.replace('/my-plans');
    }
  }, [isUserLoading, router]);

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
        <p>Loading...</p>
    </div>
  );
}
