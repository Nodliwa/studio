"use client";

import { usePathname } from "next/navigation";
import GlobalFooter from "./global-footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/suppliers")) return null;
  return <GlobalFooter />;
}
