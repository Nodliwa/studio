import { SupplierNav } from "@/components/suppliers/supplier-nav";

export default function SuppliersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SupplierNav />
      <main>{children}</main>
    </>
  );
}
