"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useFirebase, useUser } from "@/firebase";
import { PhoneOtpForm } from "@/components/suppliers/phone-otp-form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";

// KNOWN CONSTRAINT: A single Firebase UID can hold both a users/{uid} doc (planner)
// and a suppliers/{uid} doc (supplier). After OTP, we check both and show a role
// selector if both exist. This will be revisited in a future auth consolidation pass.

function LoginPageInner() {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [isChecking, setIsChecking] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [error, setError] = useState("");

  // Redirect already-authenticated suppliers directly to dashboard
  useEffect(() => {
    if (isUserLoading || !user || user.isAnonymous) return;
    getDoc(doc(firestore, "suppliers", user.uid)).then((snap) => {
      if (snap.exists()) router.push("/suppliers/dashboard");
    });
  }, [isUserLoading, user, firestore, router]);

  const handleVerified = async (_mobileNumber: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    setIsChecking(true);
    setError("");

    try {
      const [supplierSnap, userSnap] = await Promise.all([
        getDoc(doc(firestore, "suppliers", uid)),
        getDoc(doc(firestore, "users", uid)),
      ]);

      const isSupplier = supplierSnap.exists();
      const isPlanner = userSnap.exists();

      if (isSupplier && isPlanner) {
        setShowRoleSelector(true);
      } else if (isSupplier) {
        router.push("/suppliers/dashboard");
      } else {
        // Planner-only account or brand new user → send to register
        router.push("/suppliers/register");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg px-5 py-8 space-y-6">
        {!showRoleSelector ? (
          <>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold">Supplier Login</h1>
              <p className="text-sm text-muted-foreground">
                Enter your registered mobile number to receive a one-time code.
              </p>
            </div>

            <PhoneOtpForm onVerified={handleVerified} />

            {isChecking && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking your account…
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <p className="text-center text-xs text-muted-foreground">
              Not registered yet?{" "}
              <Link
                href="/suppliers/register"
                className="text-primary underline underline-offset-2"
              >
                Create your supplier profile
              </Link>
            </p>
          </>
        ) : (
          /* Role selector — shown when both planner + supplier docs exist */
          <div className="space-y-6 text-center">
            <div>
              <h1 className="text-xl font-bold">How would you like to continue?</h1>
              <p className="text-sm text-muted-foreground mt-1">
                We found both a planner and a supplier profile linked to this number.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full h-12 font-bold"
                onClick={() => router.push("/suppliers/dashboard")}
              >
                Continue as Supplier
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12"
                onClick={() => router.push("/my-plans")}
              >
                Continue as Planner
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SupplierLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
