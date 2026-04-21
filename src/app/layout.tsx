import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import GlobalFooter from "@/components/global-footer";

const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

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
    <html lang="en" className="h-full">
      <body className={`${ptSans.className} h-full flex flex-col`}>
        {/* Google Tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17873532827"
          strategy="afterInteractive"
        />
        <Script id="google-tags-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17873532827');
            gtag('config', 'G-5957KHVRVQ');
          `}
        </Script>
        
        <FirebaseClientProvider>
          <div className="flex flex-col min-h-screen flex-grow">
            <div className="flex-grow">
              {children}
            </div>
            <GlobalFooter />
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
