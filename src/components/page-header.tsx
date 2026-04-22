"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useUser, useAuth } from "@/firebase";
import { signOutUser } from "@/firebase/auth-operations";
export default function PageHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const handleLogout = async () => {
    if (!auth) return;
    await signOutUser(auth);
    router.push("/auth");
  };
  return (
    <header className="sticky top-0 z-50 w-full bg-[hsl(210,55%,93%)] shadow-md">
      <div className="container flex h-16 md:h-20 items-center justify-between mx-auto px-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/brand2.png"
              alt="SimpliPlan Logo"
              width={110}
              height={28}
              className="w-[90px] h-auto md:w-[143px]"
              priority
            />
          </Link>
        </div>
        {/* Nav — desktop only */}
        <nav className="hidden md:flex items-center justify-center gap-6 text-lg">
          <Link
            href="/"
            className={cn(
              "font-bold transition-colors hover:text-foreground/80",
              pathname === "/" ? "text-foreground" : "text-foreground/60",
            )}
          >
            Home
          </Link>
          <Link
            href="/my-plans"
            className={cn(
              "font-bold transition-colors hover:text-foreground/80",
              pathname === "/my-plans" ? "text-foreground" : "text-foreground/60",
            )}
          >
            MyPlans
          </Link>
          <Link
            href="/pricing"
            className={cn(
              "font-bold transition-colors hover:text-foreground/80",
              pathname === "/pricing" ? "text-foreground" : "text-foreground/60",
            )}
          >
            Pricing
          </Link>
        </nav>
        {/* CTA */}
        <div className="flex items-center">
          {!isUserLoading && user && !user.isAnonymous ? (
            <Button
              variant="outline"
              size="sm"
              className="text-sm md:text-lg"
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            <Button asChild size="sm" className="text-sm md:text-lg">
              <Link href="/auth">Get Started</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}