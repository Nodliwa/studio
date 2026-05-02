"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";

export default function SupplierSuccessPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) return;
    if (!user || user.isAnonymous) {
      const timer = setTimeout(() => router.push("/suppliers/register"), 200);
      return () => clearTimeout(timer);
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user || user.isAnonymous) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg px-5 py-10 space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-14 w-14 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Thank You for Registering</h1>
        </div>

        <div className="text-sm text-muted-foreground leading-relaxed space-y-3 text-left">
          <p>Your supplier profile has been created successfully!</p>
          <p>Your mobile number has been verified.</p>
          <p>
            Keep your profile updated and check your dashboard for new supplier
            opportunities in your area.
          </p>
          <p className="font-medium text-foreground">
            You have been awarded 1 free credit to unlock your first opportunity.
          </p>
        </div>

        <p className="text-sm font-medium">Regards, SimpliTeam</p>

        <Button asChild size="lg" className="w-full h-12 font-bold">
          <Link href="/suppliers/dashboard">Go to Supplier Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
