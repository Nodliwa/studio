"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Clock,
  User,
  Package,
  Wallet,
  Star,
  Settings,
  HelpCircle,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Supplier } from "@/lib/supplier-types";

interface NavItem {
  label: string;
  icon: React.ElementType;
  view?: string;
  href?: string;
  badge?: number;
  comingSoon?: boolean;
}

export interface SupplierSidebarProps {
  activeView: string;
  onNavigate: (view: string, label?: string) => void;
  supplier: Supplier & { id: string };
  newOppsCount: number;
}

export function SupplierSidebar({
  activeView,
  onNavigate,
  supplier,
  newOppsCount,
}: SupplierSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: "Dashboard",            icon: LayoutDashboard, view: "dashboard" },
    { label: "Opportunities",        icon: Briefcase,       view: "opportunities", badge: newOppsCount },
    { label: "History",              icon: Clock,           view: "history" },
    { label: "Profile",              icon: User,            href: "/suppliers/profile" },
    { label: "Products & Services",  icon: Package,         href: "/suppliers/products" },
    { label: "Credits & Billing",    icon: Wallet,          view: "credits" },
    { label: "Reviews & Feedback",   icon: Star,            view: "coming-soon", comingSoon: true },
    { label: "Settings",             icon: Settings,        view: "coming-soon", comingSoon: true },
    { label: "Help & Support",       icon: HelpCircle,      view: "coming-soon", comingSoon: true },
  ];

  const handleItemClick = (item: NavItem) => {
    if (item.href) {
      router.push(item.href);
    } else if (item.view) {
      onNavigate(item.view, item.comingSoon ? item.label : undefined);
    }
  };

  return (
    <div className="flex flex-col h-full py-5">
      {/* Logo */}
      <div className="px-4 mb-6 shrink-0">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/images/brand2.png"
            alt="SimpliPlan"
            width={100}
            height={25}
            className="h-auto"
            priority
          />
        </Link>
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1.5 pl-0.5">
          Supplier Portal
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            (!!item.view && item.view === activeView && !item.href) ||
            (!!item.href && pathname === item.href);
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleItemClick(item)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                isActive
                  ? "bg-[#1D9E75] text-white shadow-sm"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={cn(
                    "h-5 min-w-[1.25rem] rounded-full text-[10px] font-bold flex items-center justify-center px-1 leading-none",
                    isActive ? "bg-white/30 text-white" : "bg-[#1D9E75] text-white",
                  )}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
              {item.comingSoon && (
                <span
                  className={cn(
                    "text-[9px] font-semibold uppercase tracking-wide rounded px-1 py-0.5",
                    isActive
                      ? "bg-white/20 text-white/80"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 mt-4 space-y-3 shrink-0">
        {/* Profile completion card */}
        <div
          className="rounded-xl p-4 text-white space-y-3"
          style={{ background: "linear-gradient(135deg, #1D9E75 0%, #0e6b4e 100%)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold leading-tight">Profile Complete</p>
            <span className="text-base font-bold tabular-nums">
              {supplier.profileCompletionPct}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-white/30 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${supplier.profileCompletionPct}%` }}
            />
          </div>
          <Link
            href="/suppliers/profile"
            className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            Complete Profile <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Help box */}
        {/* PHASE 2 PLACEHOLDER — replace href with actual WhatsApp business number */}
        <div className="bg-muted/60 rounded-xl p-3 space-y-2">
          <p className="text-xs font-semibold text-foreground">Need help?</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Get support from our team.
          </p>
          <a href="mailto:hello@simpliplan.co.za">
            <span className="w-full mt-0.5 border border-border bg-background hover:bg-muted text-foreground text-xs font-medium py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" />
              Contact Us
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
