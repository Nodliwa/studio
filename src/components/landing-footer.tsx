'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Facebook, Instagram } from 'lucide-react';
import Link from 'next/link';

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 8.25c-1.42 0-2.73.55-3.75 1.55v7.65a3.5 3.5 0 0 1-3.5 3.5h-1a3.5 3.5 0 0 1-3.5-3.5V5.5A3.5 3.5 0 0 1 9.75 2a3.5 3.5 0 0 1 3.5 3.5v9.1c0 .28.22.5.5.5s.5-.22.5-.5V8.25C14.25 4.79 11.46 2 8.25 2S2.25 4.79 2.25 8.25s2.79 6.25 6 6.25v-2.5c-2.07 0-3.75-1.68-3.75-3.75S4.18 4.5 6.25 4.5s3.75 1.68 3.75 3.75v.5h2.5V8.25c0-1.42.55-2.73 1.55-3.75C15.27 3.55 16.58 3 18 3c1.66 0 3 1.34 3 3v2.25Z" />
    </svg>
);


export default function LandingFooter() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would handle form submission here.
    // For now, it just prevents the default form action.
  };
  
  return (
    <footer className="w-full mt-24 py-8 bg-secondary border-t">
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                <div>
                     <Card>
                        <CardHeader className="text-center">
                            <CardTitle as="h2">Suggestions / Comments / Queries</CardTitle>
                            <CardDescription>We'd love to hear from you. Drop us a message below.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" placeholder="Your Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" placeholder="Your Email" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea id="message" placeholder="Your message..." />
                                </div>
                                <Button type="submit" className="w-full">Send Message</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-headline font-bold">Connect with Us</h3>
                    <p className="text-muted-foreground mt-2">Follow us on social media to stay updated.</p>
                    <div className="flex justify-center md:justify-start items-center gap-4 mt-4">
                        <Link href="#" className="text-muted-foreground hover:text-primary">
                            <Facebook className="h-6 w-6" />
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary">
                            <XIcon className="h-6 w-6" />
                        </Link>
                         <Link href="#" className="text-muted-foreground hover:text-primary">
                            <Instagram className="h-6 w-6" />
                        </Link>
                         <Link href="#" className="text-muted-foreground hover:text-primary">
                            <TikTokIcon className="h-6 w-6" />
                        </Link>
                    </div>
                </div>
            </div>
            <div className="mt-12 text-center text-muted-foreground text-sm">
                <p>&copy; {new Date().getFullYear()} SimpliPlan. All rights reserved.</p>
            </div>
        </div>
    </footer>
  );
}
