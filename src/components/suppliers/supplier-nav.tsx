"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser, useAuth } from "@/firebase";
import { signOutUser } from "@/firebase/auth-operations";
import { Home } from "lucide-react";

export function SupplierNav() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const isLoggedIn = !isUserLoading && !!user && !user.isAnonymous;

  const handleLogout = async () => {
    await signOutUser(auth);
    router.push("/suppliers");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b shadow-sm">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between gap-3">

        {/* Left — home icon + logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Back to SimpliPlan"
            className="text-primary hover:text-primary/80 transition-colors shrink-0"
          >
            <Home className="h-5 w-5" />
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/brand2.png"
              alt="SimpliPlan"
              width={120}
              height={30}
              className="h-auto"
              priority
            />
            <span className="hidden md:inline text-xs text-muted-foreground border-l pl-2 ml-1">
              Supplier Portal
            </span>
          </Link>
        </div>

        {/* Right — auth-aware buttons, no spinner */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/suppliers/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/suppliers/login">Log In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/suppliers/register">Join Free</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
