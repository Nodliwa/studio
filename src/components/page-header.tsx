
'use client';
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export default function PageHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image
              src="/images/brand2.png"
              alt="SimpliPlan Logo"
              width={150}
              height={37}
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/" className={cn("transition-colors hover:text-foreground/80", pathname === "/" ? "text-foreground" : "text-foreground/60")}>
              Home
            </Link>
            <Link href="/my-plans" className={cn("transition-colors hover:text-foreground/80", pathname?.startsWith("/my-plans") ? "text-foreground" : "text-foreground/60")}>
              My Plans
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
            <Button asChild variant="outline">
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
                <Link href="/register">Sign Up</Link>
            </Button>
        </div>
      </div>
    </header>
  );
}
