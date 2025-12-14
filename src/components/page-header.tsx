'use client';
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useUser } from "@/firebase/provider";
import { getAuth, signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User as UserIcon, LogOut } from 'lucide-react';


export default function PageHeader() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = getAuth();

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm px-[30px] py-3 shadow-sm">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/brand2.png"
              alt="SimpliPlan Logo"
              width={250}
              height={63}
              priority
            />
          </Link>
        </div>
        <nav className="hidden md:flex items-center justify-center gap-6 text-lg absolute left-1/2 -translate-x-1/2">
            <Link href="/" className={cn("font-bold transition-colors hover:text-foreground/80", pathname === "/" ? "text-foreground" : "text-foreground/60")}>
              Home
            </Link>
            <Link href="/my-plans" className={cn("font-bold transition-colors hover:text-foreground/80", pathname?.startsWith("/my-plans") || pathname?.startsWith("/planner") ? "text-foreground" : "text-foreground/60")}>
              MyPlans
            </Link>
        </nav>
        <div className="flex items-center justify-end gap-2">
          {isUserLoading ? (
            <div className="w-24 h-10 bg-muted rounded-md animate-pulse" />
          ) : user && !user.isAnonymous ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span>{user.displayName || 'My Account'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="outline">
                  <Link href="/login" className="text-lg">Login</Link>
              </Button>
              <Button asChild>
                  <Link href="/register" className="text-lg">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
