
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import PageHeader from "@/components/page-header";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SimpliPlan",
  description: "Event planning made simple.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FirebaseClientProvider>
          <div className="min-h-screen bg-secondary">
            <div className="bg-background shadow-2xl min-h-full container mx-auto flex flex-col">
              <PageHeader />
              <main className="flex-grow">
                {children}
              </main>
            </div>
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
