
import { Suspense } from 'react';

function Loading() {
    return (
        <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
            <p>Loading...</p>
        </div>
    );
}

export default function PlannerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <Suspense fallback={<Loading />}>{children}</Suspense>;
}
