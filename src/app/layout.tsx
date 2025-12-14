import type { Metadata } from 'next';
import { PT_Sans, Merriweather } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { PlacesAutocompleteProvider } from '@/components/places-autocomplete-provider';
import LandingFooter from '@/components/landing-footer';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-headline',
});


export const metadata: Metadata = {
  title: 'SimpliPlan - Celebrating People',
  description: 'A simple budgeting tool for planning your celebrations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-secondary font-body antialiased flex flex-col",
          ptSans.variable,
          merriweather.variable
        )}
      >
        <PlacesAutocompleteProvider>
          <FirebaseClientProvider>
            <main className="flex-grow">{children}</main>
            <LandingFooter />
          </FirebaseClientProvider>
        </PlacesAutocompleteProvider>
        <Toaster />
      </body>
    </html>
  );
}
