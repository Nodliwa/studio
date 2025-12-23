
'use client';
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export default function PageHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm shadow-sm">
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
            <Link href="/" className={cn("font-bold transition-colors hover:text-foreground/80", pathname === "/" ? "text-foreground" : "text-foreground/60")}>
            Home
            </Link>
        </nav>

        <div className="flex items-center justify-end flex-1 mr-4">
          <div className="flex items-center gap-2">
              <Button asChild variant="ghost" className="hidden md:inline-flex text-base md:text-lg mr-[5px]">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="text-base md:text-lg mr-4">
                <Link href="/register">Sign Up</Link>
              </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
