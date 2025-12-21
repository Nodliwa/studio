'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const PlannerRedirectClient = dynamic(
  () => import('@/app/planner/planner-redirect-client'),
  { 
    ssr: false,
    loading: () => (
        <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
            <div className="p-8 space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-80" />
            </div>
        </div>
    )
  }
);

export default function PlannerRedirectPage() {
  return <PlannerRedirectClient />;
}
