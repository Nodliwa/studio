"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useUser, useAuth } from "@/firebase";
import { signOutUser } from "@/firebase/auth-operations";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
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
      <div className="w-full flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/brand2.png"
            alt="SimpliPlan Logo"
            width={143}
            height={36}
            className="w-[120px] h-auto md:w-[143px]"
            priority
          />
        </Link>
        <nav className="hidden md:flex items-center justify-center gap-6 text-lg">
          <Link href="/" className={cn("font-bold transition-colors hover:text-foreground/80", pathname === "/" ? "text-foreground" : "text-foreground/60")}>Home</Link>
          <Link href="/my-plans" className={cn("font-bold transition-colors hover:text-foreground/80", pathname === "/my-plans" ? "text-foreground" : "text-foreground/60")}>MyPlans</Link>
          <Link href="/pricing" className={cn("font-bold transition-colors hover:text-foreground/80", pathname === "/pricing" ? "text-foreground" : "text-foreground/60")}>Pricing</Link>
        </nav>
        {!isUserLoading && user && !user.isAnonymous ? (
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/60 transition-all">
                <AvatarImage src={user.photoURL || undefined} alt="Profile" />
                <AvatarFallback className="text-sm font-medium">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Button variant="outline" size="sm" className="text-sm md:text-lg" onClick={handleLogout}>Get Out</Button>
          </div>
        ) : (
          <Button asChild size="sm" className="text-sm md:text-lg">
            <Link href="/auth">Get In</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
