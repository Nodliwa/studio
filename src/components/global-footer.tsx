
"use client";

import Link from "next/link";

export default function GlobalFooter() {
  return (
    <footer className="w-full pt-8 pb-20 md:pb-8 mt-auto border-t bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-2 text-center text-sm text-muted-foreground">
          <p className="font-medium">&copy; 2026 SimpliPlan. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-primary underline transition-colors">
              Terms of Service
            </Link>
            <span className="text-muted-foreground/30">•</span>
            <Link href="/privacy" className="hover:text-primary underline transition-colors">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground/30">•</span>
            <Link href="/suppliers" className="hover:text-primary underline transition-colors">
              Suppliers
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
