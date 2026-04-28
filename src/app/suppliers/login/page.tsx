"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useFirebase, useUser } from "@/firebase";
import { PhoneOtpForm } from "@/components/suppliers/phone-otp-form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// KNOWN CONSTRAINT: A single Firebase UID can hold both a users/{uid} doc (planner)
// and a suppliers/{uid} doc (supplier). After OTP, we check both and show a role
// selector if both exist. This will be revisited in a future auth consolidation pass.

function LoginPageInner() {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [isChecking, setIsChecking] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [error, setError] = useState("");

  // Redirect already-authenticated suppliers directly to dashboard
  useEffect(() => {
    if (isUserLoading || !user || user.isAnonymous) return;
    getDoc(doc(firestore, "suppliers", user.uid)).then((snap) => {
      if (snap.exists()) router.push("/suppliers/dashboard");
    });
  }, [isUserLoading, user, firestore, router]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const snap = await getDoc(doc(firestore, "suppliers", result.user.uid));
      if (snap.exists()) {
        router.push("/suppliers/dashboard");
      } else {
        router.push("/suppliers/register");
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

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

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-2.5 h-10 rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs text-muted-foreground">
                <span className="bg-card px-3">— or continue with phone —</span>
              </div>
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
