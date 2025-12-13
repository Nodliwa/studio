
'use client';
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export default function PageHeader() {
  const pathname = usePathname();

  return (
    <header className="container mx-auto px-4 py-4 md:px-8">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Image
            src="/images/brand2.png"
            alt="SimpliPlan Logo"
            width={200}
            height={50}
            priority
          />
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/" className={cn("text-lg font-medium", pathname === "/" ? "text-primary" : "text-foreground/80 hover:text-foreground")}>
            Home
          </Link>
          <Link href="/my-plans" className={cn("text-lg font-medium", pathname === "/my-plans" ? "text-primary" : "text-foreground/80 hover:text-foreground")}>
            My Plans
          </Link>
        </nav>
        <div className="flex items-center gap-2">
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
