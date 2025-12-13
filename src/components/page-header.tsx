
'use client';
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export default function PageHeader() {
  const pathname = usePathname();

  return (
    <header className="w-full border-b bg-transparent">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/brand2.png"
              alt="SimpliPlan Logo"
              width={192}
              height={48}
              priority
            />
          </Link>
        </div>
        <nav className="hidden md:flex items-center justify-center gap-4 text-sm absolute left-1/2 -translate-x-1/2">
            <Link href="/" className={cn("transition-colors hover:text-foreground/80", pathname === "/" ? "text-foreground" : "text-foreground/60")}>
              Home
            </Link>
            <Link href="/my-plans" className={cn("transition-colors hover:text-foreground/80", pathname?.startsWith("/my-plans") ? "text-foreground" : "text-foreground/60")}>
              My Plans
            </Link>
        </nav>
        <div className="flex items-center justify-end gap-2">
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
