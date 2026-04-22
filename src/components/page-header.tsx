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
      <div className="container flex h-20 items-center justify-between mx-auto">
        <div className="flex items-center justify-start flex-1">
          <Link href="/" className="flex items-center space-x-2 ml-[20px]">
            <Image
              src="/images/brand2.png"
              alt="SimpliPlan Logo"
              width={143}
              height={36}
              priority
            />
          </Link>
        </div>
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
              pathname === "/my-plans"
                ? "text-foreground"
                : "text-foreground/60",
            )}
          >
            MyPlans
          </Link>
          <Link
            href="/pricing"
            className={cn(
              "font-bold transition-colors hover:text-foreground/80",
              pathname === "/pricing"
                ? "text-foreground"
                : "text-foreground/60",
            )}
          >
            Pricing
          </Link>
        </nav>
        <div className="flex items-center justify-end flex-1 mr-4">
          <div className="flex items-center gap-2">
            {!isUserLoading && user && !user.isAnonymous ? (
              <Button
                variant="outline"
                size="sm"
                className="text-base md:text-lg mr-4"
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <Button asChild size="sm" className="text-base md:text-lg mr-4">
                <Link href="/auth">Get Started</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}