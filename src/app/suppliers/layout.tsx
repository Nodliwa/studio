"use client";

import { usePathname } from "next/navigation";
import { SupplierNav } from "@/components/suppliers/supplier-nav";

export default function SuppliersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <>
      {pathname !== "/suppliers" && <SupplierNav />}
      <main>{children}</main>
    </>
  );
}
